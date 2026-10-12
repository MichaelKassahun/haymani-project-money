const CACHE='haymani-os-v5';
const CORE=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./haymani-logo.png','./icon-180.png','./icon-512.png'];
const DOCS=['./master-plan.docx','./control-workbook.xlsx'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(async c=>{await c.addAll(CORE);await Promise.all(DOCS.map(u=>c.add(u).catch(()=>{})))}).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// Open instantly from cache, refresh the cache in the background when online (new versions appear on the next open).
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r&&r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return r}).catch(()=>hit||caches.match('./index.html'));
    return hit||net;
  }));
});
