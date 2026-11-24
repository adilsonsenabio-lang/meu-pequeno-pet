import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {creatorKey,saveCreatorSession,loadCreatorSession} from '../web/creator-session.js';
import {DEFAULT_APPEARANCE} from '../web/core.js';
import {ACTION_GROUPS} from '../web/interactions.js';
const read=file=>readFile(new URL('../web/'+file,import.meta.url),'utf8');
const store=()=>{const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)};};
test('V66: escolha de Cenário em primeiro lugar, prévia correta e animada',async()=>{
 const [app,renderer]=await Promise.all([read('app.js'),read('scene-v63-player.js')]);
 assert.match(app,/const categories=\[\{key:'scene',title:'Cenário'/);
 assert.match(app,/sceneMarkup\(value,'preview'\)/);
 assert.match(app,/sceneMarkup\(draft.scene,'creator'\)/);
 assert.match(renderer,/const picture=animated==='preview'\?media.preview/);
 assert.match(renderer,/loading="\$\{animated==='preview'\?'lazy':'eager'\}"/);
});
test('V66: cada um dos onze cenários usa um arquivo GIF próprio e nenhum aparece trocado',async()=>{
 const html=await read('index.html');
 const raw=html.match(/<script id="v64-scene-media" type="application\/json">(.*?)<\/script>/s)?.[1];
 assert.ok(raw,'mídia embutida ausente');
 const data=JSON.parse(raw);
 assert.equal(Object.keys(data).length,13);
 const ids=['garden','sunset','night','beach','desert','forest','snow','space','sea','halloween','christmas'];
 const hashes=new Set();
 for(const id of ids){
  assert.ok(data[id],id);
  assert.match(data[id].preview,/^data:image\/gif;base64,/);
  assert.match(data[id].gif,/^data:image\/gif;base64,/);
  const bytes=Buffer.from(data[id].preview.split(',')[1],'base64');
  assert.equal(bytes.subarray(0,6).toString(),'GIF89a',id);
  assert.ok(bytes.length>1500,id);
  hashes.add(createHash('sha256').update(bytes).digest('hex'));
 }
 assert.equal(hashes.size,ids.length);
});
test('V66: etapa antiga de criação migra para nova posição sem apagar escolha',()=>{
 const storage=store(),key=creatorKey('teste'),draft={...DEFAULT_APPEARANCE,scene:'beach'};
 storage.setItem(key,JSON.stringify({version:1,draft,step:15,creatingNew:false}));
 let recovered=loadCreatorSession(storage,key);
 assert.equal(recovered.step,0);assert.equal(recovered.draft.scene,'beach');
 storage.setItem(key,JSON.stringify({version:1,draft,step:5,creatingNew:false}));
 recovered=loadCreatorSession(storage,key);assert.equal(recovered.step,8);
 saveCreatorSession(storage,key,draft,0,false);
 recovered=loadCreatorSession(storage,key);assert.equal(recovered.step,0);
});
test('V66: Diversão única e com estrela, preservando brinquedos e atividades',async()=>{
 const [app,css]=await Promise.all([read('app.js'),read('v66-ajustes.css')]);
 const fun=ACTION_GROUPS.find(g=>g.id==='fun');
 assert.equal(fun.label,'Diversão');assert.equal(fun.icon,'star');
 assert.match(app,/function diversaoPages\(\)/);
 assert.match(app,/function openDiversao\(\)/);
 assert.match(app,/TOYS\.filter\(key=>toyAvailable/);
 assert.match(app,/const option=event\.target\.closest\('\[data-toy\],\[data-activity\],\[data-event\]'\)/);
 assert.match(app,/need-indicator-readonly/);
 assert.match(css,/need-indicator-readonly/);
});
test('V66: offline atualizado com novos recursos',async()=>{
 const [html,sw]=await Promise.all([read('index.html'),read('sw.js')]);
 assert.match(html,/app\.js\?v=(?:70|74|75|77|80)/);assert.match(html,/v66-ajustes\.css\?v=66/);
 assert.match(sw,/meu-pequeno-pet-v(?:74|75|77|80)/);assert.match(sw,/v66-ajustes\.css\?v=66/);
});
