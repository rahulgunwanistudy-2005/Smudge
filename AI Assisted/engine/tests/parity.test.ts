import {it,expect} from 'vitest';import {readFileSync} from 'node:fs';import {resolve} from 'node:path';import {pathToFileURL,fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../',import.meta.url));
it('WASM and native return identical minutiae and match scores for every committed fixture',async()=>{
 const base=resolve(root,'app/static/core');const moduleUrl=pathToFileURL(base+'/smudge-core.js').href;
 const {default:create}=await import(/* @vite-ignore */moduleUrl);const m=await create({locateFile:(file:string)=>base+'/'+file});
 const fixtures=JSON.parse(readFileSync(resolve(root,'lab/results/parity-fixtures.json'),'utf8'));
 expect(fixtures.length).toBeGreaterThanOrEqual(50);
 for(const f of fixtures){
  const bytes=f.pixels?Uint8Array.from(f.pixels):new Uint8Array(Buffer.from(f.pixelsBase64,'base64')),image=m._malloc(bytes.length),out=m._malloc(400*m._sm_sizeof_minutia()),info=m._malloc(m._sm_sizeof_info());
  try{m.HEAPU8.set(bytes,image);const n=m._sm_analyze(image,f.width,f.height,500,out,400,info);expect(n,`seed ${f.seed} count`).toBe(f.xytq.length);
   const xytq:number[][]=[];for(let i=0;i<n;i++){const p=(out+i*m._sm_sizeof_minutia())/4;xytq.push([m.HEAP32[p+2],m.HEAP32[p+3],m.HEAP32[p+4],Math.round(m.HEAPF32[p+5]*100)]);}expect(xytq,`seed ${f.seed} exact XYT and reliability`).toEqual(f.xytq);
   const packed=Int32Array.from(xytq.flat()),p=m._malloc(packed.byteLength);m.HEAP32.set(packed,p/4);try{expect(m._sm_bozorth(p,n,p,n),`seed ${f.seed} score`).toBe(f.selfScore);}finally{m._free(p);}
  }finally{m._free(image);m._free(out);m._free(info);}
 }
},120000);
