import {readdir,readFile,writeFile} from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {brotliCompressSync,constants} from 'node:zlib';
const root=fileURLToPath(new URL('../app/build',import.meta.url));let count=0;
async function walk(dir){for(const f of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,f.name);if(f.isDirectory())await walk(p);else if(/\.(html|js|mjs|css|svg|json|webmanifest|wasm)$/.test(f.name)){const raw=await readFile(p);if(raw.length<1024)continue;const compressed=brotliCompressSync(raw,{params:{[constants.BROTLI_PARAM_QUALITY]:5}});if(compressed.length<raw.length*.95){await writeFile(p+'.br',compressed);count++;}}}}
await walk(root);console.log(`Prepared ${count} compressed static representations.`);
