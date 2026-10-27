import { findIdentifiers } from '../../../engine/src/verhoeff';
export type IdentifierBox={x:number;y:number;w:number;h:number;last4:string};
export async function detectIdentifiers(pixels:Uint8ClampedArray,width:number,height:number,progress:(s:string)=>void):Promise<IdentifierBox[]>{
 const {createWorker,PSM}=await import('tesseract.js');
 const worker=await createWorker('eng',1,{workerPath:'/models/ocr-worker.js',corePath:'/models/ocr-core',langPath:'/models',workerBlobURL:false,logger:m=>{if(m.status==='recognizing text')progress(`Reading document text · ${Math.round(m.progress*100)}%`);}});
 try{
  await worker.setParameters({tessedit_pageseg_mode:PSM.AUTO});
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;canvas.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(pixels),width,height),0,0);
  const result=await worker.recognize(canvas,{}, {blocks:true,text:true});const boxes:IdentifierBox[]=[];
  for(const block of result.data.blocks??[])for(const paragraph of block.paragraphs)for(const line of paragraph.lines){
   const hits=findIdentifiers(line.text);for(const hit of hits){
    const chars=line.words.flatMap(w=>w.symbols).filter(s=>/\d/.test(s.text));
    const digits=hit.raw.replace(/\D/g,'');const stream=chars.map(s=>s.text).join(''),index=stream.indexOf(digits);
    if(index>=0){const first=chars.slice(index,index+8);if(first.length===8){const x=Math.min(...first.map(c=>c.bbox.x0)),y=Math.min(...first.map(c=>c.bbox.y0)),x1=Math.max(...first.map(c=>c.bbox.x1)),y1=Math.max(...first.map(c=>c.bbox.y1));boxes.push({x:x-2,y:y-2,w:x1-x+4,h:y1-y+4,last4:digits.slice(-4)});}}
   }
  }return boxes;
 }finally{await worker.terminate();}
}
