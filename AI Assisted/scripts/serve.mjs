/** Static files only: no upload endpoint, inference, persistence or user data logs. */
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('../app/build',import.meta.url));
const port=Number(process.env.PORT??4318),host=process.env.HOST??'127.0.0.1';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff','.wasm':'application/wasm','.gz':'application/gzip','.mp4':'video/mp4','.srt':'text/plain; charset=utf-8'};
const basePolicy="default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; connect-src 'self'; worker-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";
const server=http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end('Only static resource requests are accepted.');return;}
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+'/')){res.writeHead(403);res.end();return;}
  if((await stat(file)).isDirectory())file=resolve(file,'index.html');
  const data=await readFile(file);let payload=data,encoding,policy=basePolicy;
  if((req.headers['accept-encoding']??'').includes('br')){try{payload=await readFile(file+'.br');encoding='br';}catch{/* Uncompressed asset is a valid fallback. */}}
  if(extname(file)==='.html'){
   const meta=data.toString().match(/http-equiv="content-security-policy" content="([^"]+)"/i);
   if(meta)policy=meta[1].replaceAll('&amp;','&').replaceAll('&#39;',"'")+"; frame-ancestors 'none'";
  }
  const headers={...(encoding?{'Content-Encoding':encoding}:{}),'Vary':'Accept-Encoding','Content-Length':payload.length,'Content-Type':types[extname(file)]??'application/octet-stream','Content-Security-Policy':policy,'Connection-Allowlist':'(response-origin)','Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Embedder-Policy':'require-corp','Cross-Origin-Resource-Policy':'same-origin','Referrer-Policy':'no-referrer','Permissions-Policy':'geolocation=(), microphone=()','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'};
  // Range requests permit seeking in the public demonstration video.
  if(extname(file)==='.mp4'&&req.headers.range){
   const range=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   let start=range?.[1]?Number(range[1]):0,end=range?.[2]?Math.min(Number(range[2]),data.length-1):data.length-1;
   if(range&&!range[1]&&range[2]){start=Math.max(0,data.length-Number(range[2]));end=data.length-1;}
   if(!range||start>end||start>=data.length){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}
   res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${data.length}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});res.end(req.method==='HEAD'?undefined:data.subarray(start,end+1));return;
  }
  res.writeHead(200,headers);res.end(req.method==='HEAD'?undefined:payload);
 }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
});
server.listen(port,host,()=>console.log(`Smudge static preview: http://${host}:${port}`));
