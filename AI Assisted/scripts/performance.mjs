import {readFile,readdir,stat,writeFile} from 'node:fs/promises';import {gzipSync} from 'node:zlib';import {fileURLToPath} from 'node:url';import path from 'node:path';
const root=fileURLToPath(new URL('..',import.meta.url)),dir=root+'/app/build',html=await readFile(dir+'/index.html','utf8');
const manifest=JSON.parse(await readFile(root+'/app/.svelte-kit/output/client/.vite/manifest.json','utf8')),selected=new Set();
function add(key){const e=manifest[key];if(!e||selected.has(e.file))return;selected.add(e.file);for(const i of e.imports??[])add(i);}
for(const [key,e] of Object.entries(manifest))if(e.isEntry||key.includes('nodes/0')||key.includes('nodes/2')||key.endsWith('+page.svelte')||key.endsWith('+layout.svelte'))add(key);
let gzip=0;for(const file of selected)if(file.endsWith('.js'))gzip+=gzipSync(await readFile(dir+'/'+file)).length;
async function total(dir){let n=0;for(const f of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,f.name);n+=f.isDirectory()?await total(p):(await stat(p)).size;}return n;}
const result={schema:'smudge-budget/1',initialJavaScriptGzipBytes:gzip,budgetBytes:150*1024,passed:gzip<=150*1024,method:'Vite entry and initial route dependency closure; excludes lazy PDF/OCR/model assets and service-worker prefetch.',allStaticBytes:await total(dir),modelsBytes:await total(dir+'/models'),wasmCoreBytes:(await stat(dir+'/core/smudge-core.wasm')).size,realDeviceLatency:'Unmeasured; target budgets are not claimed.'};
await writeFile(root+'/lab/results/bundle-budget.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));if(!result.passed)process.exit(1);
