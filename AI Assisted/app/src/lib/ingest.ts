export type Decoded = {pixels:Uint8ClampedArray;width:number;height:number;url:string;name:string};
export async function decode(file:File, page=1):Promise<Decoded&{pages?:number}> {
 if(file.size>45*1024*1024)throw new Error('Use a file smaller than 45 MB.');
 let bitmap:ImageBitmap,pages:number|undefined;
 if(file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf')){
  const pdfjs=await import('pdfjs-dist');pdfjs.GlobalWorkerOptions.workerSrc='/models/pdf.worker.min.mjs';
  const task=pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),useSystemFonts:true,disableFontFace:true});const doc=await task.promise;
  pages=doc.numPages;const p=await doc.getPage(page);let vp=p.getViewport({scale:1.6});if(vp.width*vp.height>16000000)vp=p.getViewport({scale:1.6*Math.sqrt(16000000/(vp.width*vp.height))});
  const canvas=document.createElement('canvas');canvas.width=Math.ceil(vp.width);canvas.height=Math.ceil(vp.height);await p.render({canvas,viewport:vp}).promise;bitmap=await createImageBitmap(canvas);await task.destroy();
 }else{
  try{bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});}catch{throw new Error('This browser could not decode the image. Use JPEG, PNG, WebP, or a PDF. For HEIC, export a JPEG from your photo app first.');}
 }
 if(bitmap.width*bitmap.height>24000000){bitmap.close();throw new Error('Use an image up to 24 megapixels.');}
 const c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;const ctx=c.getContext('2d',{willReadFrequently:true})!;ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(bitmap,0,0);bitmap.close();
 const pixels=ctx.getImageData(0,0,c.width,c.height).data,blob=await new Promise<Blob>((resolve,reject)=>c.toBlob(v=>v?resolve(v):reject(new Error('Could not decode image.')),'image/png'));
 return{pixels,width:c.width,height:c.height,url:URL.createObjectURL(blob),name:file.name,pages};
}
export async function encode(pixels:Uint8ClampedArray,w:number,h:number):Promise<Blob>{
 const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d')!;ctx.putImageData(new ImageData(new Uint8ClampedArray(pixels),w,h),0,0);
 return new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('Photo export failed.')),'image/jpeg',.95));
}
export function download(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
