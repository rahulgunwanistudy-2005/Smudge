import type { Minutia, PrintAnalysis, Region } from './types';
import { exposureScore, exposureTier } from './scoring';
type Module = { HEAPU8: Uint8Array; HEAP32: Int32Array; HEAPF32: Float32Array; _malloc: (n:number)=>number; _free:(p:number)=>void; [key:string]: any };
let loading: Promise<Core> | undefined;
export function loadCore(): Promise<Core> { return loading ??= (async()=>{ const url='/core/smudge-core.js'; const {default:create}=await import(/* @vite-ignore */url);return new Core(await create({locateFile:(name:string)=>'/core/'+name})); })(); }
export class Core {
 constructor(private m:Module){}
 private bytes(bytes:Uint8Array):number{const p=this.m._malloc(bytes.length);if(!p)throw new Error('Not enough memory for this image. Try a smaller region.');this.m.HEAPU8.set(bytes,p);return p;}
 analyze(gray:Uint8Array,w:number,h:number,region:Region):PrintAnalysis {
  const m=this.m,input=this.bytes(gray),out=m._malloc(400*m._sm_sizeof_minutia()),info=m._malloc(m._sm_sizeof_info());
  try{
   const count=m._sm_analyze(input,w,h,500,out,400,info);if(count<0)throw new Error('The fingerprint engine could not analyse this region. Select a clear, larger fingertip.');
   const minutiae:Minutia[]=[];const stride=m._sm_sizeof_minutia();
   for(let i=0;i<count;i++){let p=(out+i*stride)/4;minutiae.push({x:m.HEAPF32[p],y:m.HEAPF32[p+1],nx:m.HEAP32[p+2],ny:m.HEAP32[p+3],nt:m.HEAP32[p+4],reliability:m.HEAPF32[p+5],type:m.HEAP32[p+6],angle:m.HEAPF32[p+7]});}
   const q=info/4,highQuality=m.HEAP32[q+1],coherence=m.HEAPF32[q+6],period=m.HEAPF32[q+8],qualityGrade=m.HEAP32[q+9];
   const exposure=exposureScore(highQuality,coherence,qualityGrade);
   return {region,minutiae,highQuality,coherence,period,qualityGrade,exposure,tier:exposureTier(exposure),score:null};
  }finally{m._free(input);m._free(out);m._free(info);}
 }
 match(a:Minutia[],b:Minutia[]):number {
  const pack=(v:Minutia[])=>Int32Array.from(v.slice(0,400).flatMap(m=>[m.nx,m.ny,m.nt,Math.round(m.reliability*100)]));
  const aa=pack(a),bb=pack(b);if(!aa.length||!bb.length)return 0;
  const p=this.bytes(new Uint8Array(aa.buffer)),q=this.bytes(new Uint8Array(bb.buffer));
  try{return this.m._sm_bozorth(p,aa.length/4,q,bb.length/4);}finally{this.m._free(p);this.m._free(q);}
 }
 smudge(gray:Uint8Array,w:number,h:number,mask:Uint8Array,strength:number):Uint8Array {
  const m=this.m,p=this.bytes(gray),a=this.bytes(mask),out=m._malloc(gray.length);
  try{m._sm_smudge(p,w,h,a,strength,3,16,.5,137,out);return m.HEAPU8.slice(out,out+gray.length);}finally{m._free(p);m._free(a);m._free(out);}
 }
 unsharp(gray:Uint8Array,w:number,h:number):Uint8Array {
  const m=this.m,p=this.bytes(gray),o=m._malloc(gray.length);try{m._sm_unsharp(p,w,h,1.3,2,o);return m.HEAPU8.slice(o,o+gray.length);}finally{m._free(p);m._free(o);}
 }
 resize(gray:Uint8Array,w:number,h:number,ow:number,oh:number):Uint8Array {
  const m=this.m,p=this.bytes(gray),o=m._malloc(ow*oh);try{m._sm_resize(p,w,h,o,ow,oh);return m.HEAPU8.slice(o,o+ow*oh);}finally{m._free(p);m._free(o);}
 }
 ssim(a:Uint8Array,b:Uint8Array,w:number,h:number):number {
  const p=this.bytes(a),q=this.bytes(b);try{return this.m._sm_ssim(p,q,w,h);}finally{this.m._free(p);this.m._free(q);}
 }
}
export function luminance(pixels:Uint8ClampedArray):Uint8Array {
 const y=new Uint8Array(pixels.length/4);for(let i=0;i<y.length;i++)y[i]=Math.round(.299*pixels[i*4]+.587*pixels[i*4+1]+.114*pixels[i*4+2]);return y;
}
export function crop(gray:Uint8Array,width:number,r:Region):Uint8Array {
 const out=new Uint8Array(r.w*r.h);for(let y=0;y<r.h;y++)out.set(gray.subarray((r.y+y)*width+r.x,(r.y+y)*width+r.x+r.w),y*r.w);return out;
}
