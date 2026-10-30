const CACHE='ingles-v26';
const VOZ='voz-ingles-1'; /* gravações (vz/ e aud/): nunca mudam, ficam guardadas entre versões */
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>(k.startsWith('ingles-')&&k!==CACHE)||(k.startsWith('voz-ingles-')&&k!==VOZ)).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin===location.origin&&/\/(vz|aud)\/[^/]+\.mp3$|\/aud\/c\/[^/]+\.mp3$/.test(url.pathname)&&!e.request.headers.has('range')){
    // gravação: primeiro o que já está guardado, senão baixa e guarda
    e.respondWith(caches.open(VOZ).then(c=>c.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok&&res.status===200)c.put(e.request,res.clone());return res}))));
  }else if(url.origin===location.origin){
    // rede primeiro (pega atualizações), cache se estiver sem internet
    e.respondWith(fetch(e.request).then(r=>{if(r.status===200){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c)).catch(()=>{})}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));
  }else if(url.hostname.includes('fonts.g')){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return res})));
  }
});
