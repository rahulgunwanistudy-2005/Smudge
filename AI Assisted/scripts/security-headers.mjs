import {readFile,writeFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';
const dir=fileURLToPath(new URL('../app/build/',import.meta.url));
const html=await readFile(dir+'index.html','utf8'),meta=html.match(/http-equiv="content-security-policy" content="([^"]+)"/i);
if(!meta)throw new Error('Production HTML has no CSP.');
const policy=meta[1].replaceAll('&amp;','&').replaceAll('&#39;',"'")+"; frame-ancestors 'none'";
const headers={'Connection-Allowlist':'(response-origin)','Content-Security-Policy':policy,'Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Embedder-Policy':'require-corp','Cross-Origin-Resource-Policy':'same-origin','Referrer-Policy':'no-referrer','Permissions-Policy':'geolocation=(), microphone=()','X-Content-Type-Options':'nosniff'};
await writeFile(dir+'_headers','/*\n'+Object.entries(headers).map(([k,v])=>'  '+k+': '+v).join('\n')+'\n');
await writeFile(dir+'vercel.json',JSON.stringify({headers:[{source:'/(.*)',headers:Object.entries(headers).map(([key,value])=>({key,value}))}]},null,2)+'\n');
console.log('Generated response policy with SvelteKit bootstrap hashes.');
