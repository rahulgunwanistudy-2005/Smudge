import { loadCore, luminance, crop } from '../../../../engine/src/core';
import { featherMask, validateRegions, PROVISIONAL_THRESHOLD } from '../../../../engine/src/scoring';
import type { WorkerRequest, WorkerReply, PrintAnalysis, PrintResult, AttackResult, Report, Scan, Minutia } from '../../../../engine/src/types';
const send=(value:WorkerReply,transfer:Transferable[]=[])=>self.postMessage(value,{transfer});
let running=false;
self.onmessage=async(event:MessageEvent<WorkerRequest>)=>{
 const req=event.data;if(running){send({id:req.id,type:'error',message:'A scan is already running.'});return;}running=true;
 const progress=(message:string,n:number)=>send({id:req.id,type:'progress',message,progress:n});
 try{
  const start=performance.now();validateRegions(req.regions,req.width,req.height);
  if(req.width*req.height>24000000||req.pixels.length!==req.width*req.height*4)throw new Error('This image is too large. Use a photo up to 24 megapixels.');
  progress('Loading the on-device fingerprint engine',.05);const core=await loadCore();
  const original=luminance(req.pixels);let ref:PrintAnalysis|undefined;
  if(req.reference){const {pixels,width,height}=req.reference;ref=core.analyze(luminance(pixels),width,height,{id:'reference',x:0,y:0,w:width,h:height,label:'Enrolled reference',source:'manual'});if(ref.highQuality<6)throw new Error('The reference has fewer than 6 reliable ridge points. Choose a clearer close-up of the same finger.');}
  const referenceKind:Scan['referenceKind']=ref?'enrolled':req.sameImage?'same-image':'none';
  const prints:PrintAnalysis[]=[];
  for(let i=0;i<req.regions.length;i++){
   progress(`Analysing print ${i+1} of ${req.regions.length}`,.1+.3*i/req.regions.length);
   const region=req.regions[i],a=core.analyze(crop(original,req.width,region),region.w,region.h,region);
   if(ref||req.sameImage)a.score=core.match(a.minutiae,ref?.minutiae??a.minutiae);prints.push(a);
  }
  if(req.type==='scan'){send({id:req.id,type:'scan',scan:{prints,elapsedMs:performance.now()-start,reference:!!ref,referenceKind,threshold:PROVISIONAL_THRESHOLD,synthetic:!!req.synthetic}});return;}
  const result=new Uint8ClampedArray(req.pixels),results:PrintResult[]=[],galleries:Minutia[][]=[];
  for(let i=0;i<prints.length;i++){
   const before=prints[i],r=before.region,gray=crop(original,req.width,r),mask=featherMask(r.w,r.h),gallery=ref?.minutiae??before.minutiae;
   let after=before,attacks:AttackResult[]=[],treated=gray,strength=.4,passes=0,passed=false;
   for(const s of [.4,.7,1]){
    strength=s;passes++;progress(`Smudging print ${i+1} · verification pass ${passes}`,.4+.5*(i+(passes-1)/3)/prints.length);
    treated=core.smudge(gray,r.w,r.h,mask,s);after=core.analyze(treated,r.w,r.h,r);after.score=referenceKind==='none'?null:core.match(after.minutiae,gallery);
    const variants:{name:string;image:Uint8Array;w:number;h:number}[]=[{name:'Plain enhancement',image:treated,w:r.w,h:r.h},{name:'Re-sharpened',image:core.unsharp(treated,r.w,r.h),w:r.w,h:r.h}];
    for(const scale of [2,4]){const f=Math.min(scale,1024/Math.max(r.w,r.h)),w=Math.round(r.w*f),h=Math.round(r.h*f);variants.push({name:`${scale}× Lanczos`,image:core.resize(treated,r.w,r.h,w,h),w,h});}
    for(const quality of [.6,.8,.95]){
     const canvas=new OffscreenCanvas(r.w,r.h),ctx=canvas.getContext('2d')!;const image=new ImageData(r.w,r.h);for(let p=0;p<treated.length;p++){image.data[p*4]=image.data[p*4+1]=image.data[p*4+2]=treated[p];image.data[p*4+3]=255;}ctx.putImageData(image,0,0);
     const blob=await canvas.convertToBlob({type:'image/jpeg',quality});const bitmap=await createImageBitmap(blob);ctx.drawImage(bitmap,0,0);bitmap.close();variants.push({name:`JPEG ${Math.round(quality*100)}`,image:luminance(ctx.getImageData(0,0,r.w,r.h).data),w:r.w,h:r.h});
    }
    attacks=variants.map(v=>{const a=core.analyze(v.image,v.w,v.h,{...r,w:v.w,h:v.h});return{name:v.name,score:core.match(a.minutiae,gallery),highQuality:a.highQuality};});
    const residualPass=attacks.every(a=>a.score<PROVISIONAL_THRESHOLD&&a.highQuality<6);
    passed=referenceKind!=='none'&&(before.score??0)>=PROVISIONAL_THRESHOLD&&residualPass;
    if(residualPass)break;
   }
   for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++){
    const k=y*r.w+x;if(mask[k]===0)continue;const p=((r.y+y)*req.width+r.x+x)*4,delta=treated[k]-gray[k];
    result[p]=req.pixels[p]+delta;result[p+1]=req.pixels[p+1]+delta;result[p+2]=req.pixels[p+2]+delta;
   }
   results.push({before,after,attacks,passed,strength,passes});galleries.push(gallery);
  }
  progress('Checking the exact exported JPEG',.94);
  for(const box of req.identifierMasks??[]){
   if(![box.x,box.y,box.w,box.h].every(Number.isFinite))continue;
   for(let y=Math.max(0,Math.floor(box.y));y<Math.min(req.height,Math.ceil(box.y+box.h));y++)for(let x=Math.max(0,Math.floor(box.x));x<Math.min(req.width,Math.ceil(box.x+box.w));x++){const p=(y*req.width+x)*4;result[p]=result[p+1]=result[p+2]=24;}
  }
  const canvas=new OffscreenCanvas(req.width,req.height),ctx=canvas.getContext('2d')!;
  ctx.putImageData(new ImageData(result,req.width,req.height),0,0);
  const blob=await canvas.convertToBlob({type:'image/jpeg',quality:.95}),bitmap=await createImageBitmap(blob);ctx.drawImage(bitmap,0,0);bitmap.close();
  const exported=ctx.getImageData(0,0,req.width,req.height).data,afterY=luminance(exported);
  for(let i=0;i<results.length;i++){
   const r=results[i].before.region,a=core.analyze(crop(afterY,req.width,r),r.w,r.h,r),score=core.match(a.minutiae,galleries[i]);a.score=referenceKind==='none'?null:score;
   results[i].after=a;results[i].attacks.push({name:'Exact exported JPEG',score,highQuality:a.highQuality});results[i].passed=results[i].passed&&score<PROVISIONAL_THRESHOLD&&a.highQuality<6;
  }
  progress('Measuring the exported photo',.98);const ssim=core.ssim(original,afterY,req.width,req.height);let mse=0;for(let i=0;i<original.length;i++)mse+=(original[i]-afterY[i])**2;mse/=original.length;
  const report:Report={schema:'smudge-report/1',createdAt:new Date().toISOString(),synthetic:!!req.synthetic,engine:'NBIS mindtct + Bozorth3 · smudge-core 1.0',width:req.width,height:req.height,referenceKind,threshold:PROVISIONAL_THRESHOLD,thresholdCalibrated:false,prints:results,ssim,psnr:mse?10*Math.log10(65025/mse):null,elapsedMs:performance.now()-start,metadata:'Original metadata discarded during fresh canvas encoding; export is re-encoded as JPEG.',limitations:['Threshold 40 is provisional; no human FMR calibration.','NFIQ-style grade is a heuristic, not trained NFIQ.','SourceAFIS and learned ESPCN4x tests cover synthetic lab textures only. No human validation.','Only selected regions are processed; automatic detection can miss fingertips.','Same-image matching, when selected, is a diagnostic, not independent identity verification.','SSIM and PSNR measure the exact exported JPEG. JPEG recompression changes pixels outside the mask.']};
  report.maskedIdentifiers=req.identifierMasks?.length??0;send({id:req.id,type:'smudge',blob,report});
 }catch(e){send({id:req.id,type:'error',message:e instanceof Error?e.message:'Processing failed. Try a smaller image.'});}finally{running=false;}
};
