import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import vm from 'node:vm';
import test from 'node:test';

const script=await readFile(resolve(import.meta.dirname,'../web/sw.js'),'utf8');

function memoryCache(){
  const map=new Map();
  const str=x=>typeof x==='string'?x:x.url;
  return {
    async match(k){return map.get(str(k))||null;},
    async put(k,v){map.set(str(k),v);},
    async delete(k){return map.delete(str(k));},
    async keys(){return [...map.keys()].map(url=>({url}));}
  };
}

test('PWA caches for offline and reuses unchanged files on later releases', async()=>{
  const store=new Map([['meu-pequeno-pet-v84-22',memoryCache()]]);
  const caches={
    async open(key){if(!store.has(key))store.set(key,memoryCache());return store.get(key);},
    async keys(){return [...store.keys()];},
    async delete(key){return store.delete(key)}
  };
  let networkCalls=0, online=true;
  const fakeFetch=async()=>{
    if(!online)throw new Error('sem rede');
    networkCalls++;
    return new Response('cached',{status:200,headers:{'Content-Type':'text/plain'}});
  };
  function instance(source){
    const handlers={};
    const self={
      addEventListener(name,fn){handlers[name]=fn;},
      async skipWaiting(){},
      clients:{async claim(){}},
      registration:{scope:'https://example.test/meu-pequeno-pet/'},
      location:{origin:'https://example.test'}
    };
    vm.runInNewContext(source,{self,caches,Response,URL,Promise,console,fetch:fakeFetch},{filename:'sw.js'});
    return async (name,request)=>{
      let pending,response;
      handlers[name]({request,waitUntil(p){pending=p},respondWith(p){response=p}});
      if(pending)await pending;
      return response && await response;
    };
  }
  const run=instance(script);
  await run('install');
  assert(networkCalls>=300,`first install should preload files; got ${networkCalls}`);
  await run('activate');
  assert(!(await caches.keys()).includes('meu-pequeno-pet-v84-22'));
  assert((await caches.keys()).includes('meu-pequeno-pet-assets-v1'));
  const initial=networkCalls;
  await run('install');
  assert.equal(networkCalls,initial,'reinstall unchanged SW does not redownload');
  online=false;
  const cached=await run('fetch',{method:'GET',mode:'navigate',url:'https://example.test/meu-pequeno-pet/'});
  assert.equal(await cached.text(),'cached','offline navigation uses cache');
  // Changing just one asset hash should redownload that one asset only.
  online=true;
  const changed=script.replace(/(\.\/index\.html","|\.\/index\.html",\")([a-f0-9]{16})/,(_,prefix)=>prefix+'0000000000000000');
  assert.notEqual(changed,script,'index.html hash changed in generated worker');
  const runNew=instance(changed);
  await runNew('install');
  assert.equal(networkCalls,initial+1,'only changed asset downloaded');
});
