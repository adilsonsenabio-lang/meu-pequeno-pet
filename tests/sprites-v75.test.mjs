import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const ROOT=resolve(import.meta.dirname,'..');
const SRC=join(ROOT,'assets-src/v63');
const seven={
  'halloween__ghost':'halloween',
  'halloween__pumpkin':'halloween',
  'sea__fish':'sea',
  'sea__jelly':'sea',
  'space__planet':'space',
  'space__comet':'space',
  'desert__lizard':'desert'
};
const parseMedia=async()=>{
 const html=await readFile(join(ROOT,'web/index.html'),'utf8');
 const m=html.match(/<script id="v64-scene-media" type="application\/json">(.*?)<\/script>/s);
 assert.ok(m,'mídia interna de cenários');
 return JSON.parse(m[1]);
};
const headerSize=(bytes)=>[bytes.readUInt32BE(16),bytes.readUInt32BE(20)];
test('V75: sete remakes estão em spritesheets PNG RGBA de 10 quadros e mantêm as cenas originais',async()=>{
 const m=JSON.parse(await readFile(join(SRC,'manifesto.json'),'utf8'));
 assert.equal(Object.keys(m.scenes).length,13);
 assert.equal(Object.keys(m.objects).length,38);
 assert.equal(Object.keys(m.approved_remakes).length,7);
 assert.equal(m.integrated_into_game,true);
 for(const [key,scene] of Object.entries(seven)){
  const o=m.objects[key]; assert.equal(o.scene,scene);
  assert.equal(o.frames,10);assert.equal(o.different_frames,10); // V80: fantasma agora possui 10 poses animadas
  assert.ok(m.scenes[scene].objects.includes(key));
  const png=await readFile(join(SRC,o.sheet));
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a',key);
  assert.deepEqual(headerSize(png),[640,288],key);
  const thumb=await readFile(join(SRC,'objetos',key+'.png'));
  assert.deepEqual(headerSize(thumb),[128,144],key);
 }
});
test('V75: todos quatro cenários usam GIF animado + imagem estática + miniatura animada no HTML do jogo',async()=>{
 const data=await parseMedia();
 assert.equal(Object.keys(data).length,13);
 for(const scene of ['halloween','sea','space','desert']){
  const item=data[scene];
  for(const type of ['gif','still','preview']){
   assert.match(item[type],new RegExp('^data:image/'+(type==='still'?'png':'gif')+';base64,'));
   const bytes=Buffer.from(item[type].split(',')[1],'base64');
   if(type==='still') assert.deepEqual(headerSize(bytes),[320,320],scene);
   else assert.deepEqual([bytes.readUInt16LE(6),bytes.readUInt16LE(8)],type==='gif'?[320,320]:[120,120],scene);
   assert.ok(bytes.length>(scene==='space'&&type==='still'?2000:3500),scene+' '+type);
  }
  await access(join(SRC,'animacoes',scene+'_sem_pet.gif'));
 }
});
test('V75: trajetórias do peixe e meteoro conferem com os alvos de olhar e preservam salvamento',async()=>{
 const metaSource=await readFile(join(ROOT,'web/scene-v63-data.js'),'utf8');
 const meta=JSON.parse(metaSource.replace(/^export const V63_SCENE_META=/,'').replace(/;\s*$/,''));
 const manifest=JSON.parse(await readFile(join(SRC,'manifesto.json'),'utf8'));
 for(const [scene,key] of [['space','space__comet'],['sea','sea__fish']]){
  const obj=meta[scene].objects.find(x=>x.key===key);
  if(scene==='space'){assert.equal(obj.trajectory,null);const player=await readFile(join(ROOT,'web/scene-v63-player.js'),'utf8');assert.match(player,/cometCycle/);}else assert.deepEqual(obj.trajectory,manifest.objects[key].trajectory,key);
 }
 const core=await readFile(join(ROOT,'web/storage.js'),'utf8');
 assert.match(core,/meu-pequeno-pet\.save\.v1/);
 const sw=await readFile(join(ROOT,'web/sw.js'),'utf8');
 assert.match(sw,/meu-pequeno-pet-v(?:75|77|80)/);
 assert.match(sw,/\.\/app\.js\?v=(?:75|77|80)/);
});
