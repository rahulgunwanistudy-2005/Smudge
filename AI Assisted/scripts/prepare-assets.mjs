import { cp, mkdir, writeFile, readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url)),deps=path.resolve(root,'../node_modules'),dest=path.join(root,'app/static/models');process.chdir(root);await mkdir(dest,{recursive:true});
await cp(deps+'/@mediapipe/tasks-vision/wasm',dest+'/vision',{recursive:true});
await cp(deps+'/tesseract.js/dist/worker.min.js',dest+'/ocr-worker.js');
await mkdir(dest+'/ocr-core',{recursive:true});
for(const name of ['tesseract-core-lstm.wasm.js','tesseract-core-simd-lstm.wasm.js','LICENSE'])await cp(deps+'/tesseract.js-core/'+name,dest+'/ocr-core/'+name);
await cp(deps+'/pdfjs-dist/build/pdf.worker.min.mjs',dest+'/pdf.worker.min.mjs');
const downloads=[['hand_landmarker.task','https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'],['eng.traineddata.gz','https://tessdata.projectnaptha.com/4.0.0/eng.traineddata.gz']];
for(const [file,url] of downloads){try{await readFile(dest+'/'+file);continue;}catch{}const r=await fetch(url);if(!r.ok)throw new Error(`${url}: ${r.status}`);await writeFile(dest+'/'+file,new Uint8Array(await r.arrayBuffer()));console.log('Downloaded '+file);}
async function files(dir){let out=[];for(const e of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())out.push(...await files(p));else out.push(p);}return out;}
const manifest=[];for(const p of await files(dest)){const b=await readFile(p);manifest.push({path:path.relative(root+'/app/static',p),bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')});}
await writeFile('docs/asset-manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log(`Self-hosted ${manifest.length} assets, ${(manifest.reduce((s,x)=>s+x.bytes,0)/1048576).toFixed(1)} MiB`);
