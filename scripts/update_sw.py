#!/usr/bin/env python3
"""Regenerate hash-addressed SW pre-cache; unchanged media survive future releases."""
from pathlib import Path
import json,hashlib
WEB=Path(__file__).resolve().parents[1]/'web'
assets=[]
for f in sorted(WEB.rglob('*')):
 if not f.is_file():continue
 rel=f.relative_to(WEB).as_posix()
 if rel=='sw.js' or rel.startswith(('assets/sprites/v56/','assets/sprites/v57/','assets/sprites/v58/')) or f.name=='CREDITOS.txt' or f.name.startswith('.'):
  continue
 content=f.read_bytes()
 assets.append(['./'+rel,hashlib.sha256(content).hexdigest()[:16]])
TEMPLATE=r'''/* Meu Pequeno Pet — PWA incremental. Saves/localStorage não são apagados. */
const CACHE='meu-pequeno-pet-assets-v1';
const LEGACY_PREFIXES=['meu-pequeno-pet-v','meu-pequeno-pet-pages-v84-'];
const FILES=__FILES__;
const URLS=new Map(FILES.map(([relative,hash])=>{
  const absolute=new URL(relative,self.registration.scope);
  const hashed=new URL(absolute);
  hashed.searchParams.set('__mpp_hash',hash);
  return [absolute.pathname,{source:absolute.href, key:hashed.href}];
}));
async function populate(){
  const cache=await caches.open(CACHE);
  const pending=[...URLS.values()];
  // Keeps immutable cached files across worker versions. Only modified hashes fetch again.
  async function worker(){
    while(pending.length){
      const {source,key}=pending.shift();
      if(await cache.match(key))continue;
      const response=await fetch(source,{cache:'no-cache'});
      if(!response.ok)throw new Error('Falha no download offline: '+source+' '+response.status);
      await cache.put(key,response);
    }
  }
  await Promise.all(Array.from({length:8},()=>worker()));
}
self.addEventListener('install',event=>{
  event.waitUntil(populate().then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const old=await caches.keys();
    await Promise.all(old.filter(name=>name!==CACHE&&LEGACY_PREFIXES.some(prefix=>name.startsWith(prefix))).map(name=>caches.delete(name)));
    const cache=await caches.open(CACHE);
    const keep=new Set([...URLS.values()].map(x=>x.key));
    for(const request of await cache.keys()){
      if(!keep.has(request.url))await cache.delete(request);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const index=URLS.get(new URL('./index.html',self.registration.scope).pathname);
    const destination=URLS.get(url.pathname) || (event.request.mode==='navigate'?index:null);
    if(event.request.mode==='navigate'){
      try{
        const response=await fetch(event.request,{cache:'no-store'});
        if(response.ok && destination) await cache.put(destination.key,response.clone());
        return response;
      }catch{
        return (destination && await cache.match(destination.key)) || Response.error();
      }
    }
    if(destination){
      const hit=await cache.match(destination.key);
      if(hit)return hit;
      try{
        const response=await fetch(event.request);
        if(response.ok)await cache.put(destination.key,response.clone());
        return response;
      }catch{return Response.error();}
    }
    return fetch(event.request);
  })());
});
'''
(WEB/'sw.js').write_text(TEMPLATE.replace('__FILES__',json.dumps(assets,ensure_ascii=False,separators=(',',':')))+'\n',encoding='utf-8')
print('SW incremental:',len(assets),'assets / hash version')
