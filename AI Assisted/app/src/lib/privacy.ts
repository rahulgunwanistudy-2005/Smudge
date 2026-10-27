import { writable, get } from 'svelte/store';
export const privacy=writable({external:0,blocked:0,offline:false,headers:{} as Record<string,string>,cacheReady:false,cacheError:'',requests:0,serviceWorker:false});
let start=false;
export async function observePrivacy(){
 if(start)return;start=true;
 privacy.update(p=>({...p,offline:!navigator.onLine}));
 window.addEventListener('online',()=>privacy.update(p=>({...p,offline:false})));window.addEventListener('offline',()=>privacy.update(p=>({...p,offline:true})));
 const record=(e:PerformanceResourceTiming)=>{if(!/^https?:/.test(e.name))return;privacy.update(p=>({...p,requests:p.requests+1,external:p.external+Number(new URL(e.name).origin!==location.origin)}));};
 performance.getEntriesByType('resource').forEach(e=>record(e as PerformanceResourceTiming));
 new PerformanceObserver(list=>list.getEntries().forEach(e=>record(e as PerformanceResourceTiming))).observe({type:'resource',buffered:false});
 window.addEventListener('securitypolicyviolation',()=>privacy.update(p=>({...p,blocked:p.blocked+1})));
 try{const response=await fetch(location.pathname,{method:'HEAD',cache:'no-store'});const headers:Record<string,string>={};for(const key of ['content-security-policy','connection-allowlist','cross-origin-opener-policy','cross-origin-embedder-policy','referrer-policy','permissions-policy'])headers[key]=response.headers.get(key)??'Not delivered';privacy.update(p=>({...p,headers}));}catch{/* Keep header state unknown offline. */}
 if('serviceWorker'in navigator){
  navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='CACHE_READY')privacy.update(p=>({...p,cacheReady:true,cacheError:''}));if(event.data?.type==='CACHE_ERROR')privacy.update(p=>({...p,cacheError:'Offline download did not finish. Reconnect and reload to retry.'}));});
  try{const reg=await navigator.serviceWorker.ready;privacy.update(p=>({...p,serviceWorker:true}));(reg.active??navigator.serviceWorker.controller)?.postMessage({type:'CACHE_STATUS'});}catch{/* Browser can refuse workers in a private session. */}
 }
}
export function privacySnapshot(){const p=get(privacy);return{observedExternalRequests:p.external,headers:p.headers,offline:p.offline};}
