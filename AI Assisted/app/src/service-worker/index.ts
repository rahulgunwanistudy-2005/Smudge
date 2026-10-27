/// <reference lib="webworker" />
import {immutable,assets as staticAssets,prerendered} from '$app/manifest';
import {version} from '$app/env';
const sw=self as unknown as ServiceWorkerGlobalScope;
const CACHE='smudge-static-'+version;
const assets=[...new Set(['/',...immutable.map(a=>a.path),...staticAssets.map(a=>a.path),...prerendered.map(a=>a.path)])];
async function notify(type:string){for(const client of await sw.clients.matchAll({includeUncontrolled:true}))client.postMessage({type});}
sw.addEventListener('install',event=>{event.waitUntil((async()=>{try{const cache=await caches.open(CACHE);for(let i=0;i<assets.length;i+=6)await Promise.all(assets.slice(i,i+6).map(async url=>{const r=await fetch(url,{cache:'reload'});if(!r.ok)throw new Error('Asset unavailable');await cache.put(url,r);}));await cache.put('/offline-ready',new Response('ready'));await sw.skipWaiting();await notify('CACHE_READY');}catch{await notify('CACHE_ERROR');throw new Error('Offline installation incomplete');}})());});
sw.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const name of await caches.keys())if(name.startsWith('smudge-static-')&&name!==CACHE)await caches.delete(name);await sw.clients.claim();await notify('CACHE_READY');})());});
sw.addEventListener('message',event=>{if(event.data?.type==='CACHE_STATUS')event.waitUntil((async()=>{const ready=await(await caches.open(CACHE)).match('/offline-ready');if(ready)event.source?.postMessage({type:'CACHE_READY'});})());});
sw.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(url.origin!==sw.location.origin){event.respondWith(new Response('External requests blocked by Smudge service worker',{status:403}));return;}
 if(url.pathname==='/share'&&request.method==='POST'){
  event.respondWith((async()=>{const form=await request.formData(),file=form.get('image');if(file instanceof File&&file.size<=45*1024*1024){const cache=await caches.open('smudge-share');await cache.put('/shared-image',new Response(file,{headers:{'content-type':file.type,'x-filename':encodeURIComponent(file.name)}}));return Response.redirect('/?shared=1',303);}return new Response('Choose a supported file smaller than 45 MB.',{status:400});})());return;
 }
 if(request.method!=='GET')return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE),cached=await cache.match(request,{ignoreSearch:true});if(cached)return cached;try{return await fetch(request);}catch{if(request.mode==='navigate')return (await cache.match('/'))??new Response('Offline. Open Smudge once with a connection.',{status:503});return new Response('Asset not cached',{status:503});}})());
});
