import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {creatorKey,loadCreatorSession,saveCreatorSession} from '../web/creator-session.js';
import {DEFAULT_APPEARANCE} from '../web/core.js';
const read=name=>readFile(new URL('../web/'+name,import.meta.url),'utf8');
const storage=()=>{const m=new Map();return {setItem:(k,v)=>m.set(k,String(v)),getItem:k=>m.get(k)||null,removeItem:k=>m.delete(k)}};
test('V68 ordem de criacao: cenário, cores e boca',async()=>{
 const app=await read('app.js'); const m=app.match(/const categories=([^\n]+);/);assert.ok(m);
 const keys=[...m[1].matchAll(/\{key:'([^']+)'/g)].map(([,key])=>key);
 assert.deepEqual(keys.slice(0,5),['scene','color','mouth','hands','body']);
});
test('V68 cílios maiores, visíveis e independentes do movimento da pupila',async()=>{
 const pix=await read('pixel-pet.js');const c=pix.match(/if\(k==='lashes'\)\{([\s\S]*?)\n  \}/);
 assert.ok(c); assert.match(c[1],/r\(x\+5,70,2,4,mid\)/);
 assert.match(c[1],/r\(x-3,73,2,4,mid\)/);
 assert.match(c[1],/r\(x\+15,73,2,4,mid\)/);
 assert.ok(!c[1].includes('gaze('));
});
test('V68 migração rascunho V66/67 para aba correta',()=>{
 const db=storage(),key=creatorKey('pet'),draft={...DEFAULT_APPEARANCE,scene:'beach',mouth:'heart',eyes:'lashes'};
 for(const [oldStep,newStep] of [[0,0],[1,4],[2,5],[3,1],[4,6],[5,7],[6,8],[7,2],[8,9],[15,16]]){
  db.setItem(key,JSON.stringify({version:2,draft,step:oldStep,creatingNew:false}));
  const got=loadCreatorSession(db,key);assert.equal(got.step,newStep);assert.equal(got.draft.mouth,'heart');assert.equal(got.draft.scene,'beach');
 }
 for(const [oldStep,newStep] of [[3,4],[15,16],[16,3]]){
  db.setItem(key,JSON.stringify({version:3,draft,step:oldStep}));
  assert.equal(loadCreatorSession(db,key).step,newStep);
 }
 const hands={hands:'dragon',handPosition:{x:4,y:-6}};
 saveCreatorSession(db,key,{...draft,...hands},3,false);
 const saved=JSON.parse(db.getItem(key));assert.equal(saved.version,4);
 const got=loadCreatorSession(db,key);assert.equal(got.step,3);
 assert.equal(got.draft.hands,hands.hands);
 assert.deepEqual(got.draft.handPosition,hands.handPosition);
});
test('V68 cache-bust CSS/JS e HTML jogável',async()=>{
 const [html,sw]=await Promise.all([read('index.html'),read('sw.js')]);
 assert.match(html,/app\.js\?v=(?:70|74|75|77|80)/);assert.match(sw,/meu-pequeno-pet-v(?:74|75|77|80)/);
 assert.match(sw,/pixel-pet\.js\?v=69/);assert.match(sw,/creator-session\.js\?v=69/);
});
