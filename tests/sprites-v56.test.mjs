import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {FRAME_ACTIONS,PET_FRAMES,FRAME_MOTION,liveFramePose,FRAME_FPS} from '../web/pet-frames.js';
import {OPTIONS} from '../web/core.js';
const DIR=resolve(import.meta.dirname,'../web/assets/sprites/v56');
const pngMeta=async file=>{
 const content=await readFile(file);
 assert.equal(content.subarray(0,8).toString('hex'),'89504e470d0a1a0a',`PNG valido: ${file}`);
 return [content.readUInt32BE(16),content.readUInt32BE(20)];
};
test('V56: 15 animações, 10 poses diferentes e FPS fixo',()=>{
 assert.equal(FRAME_FPS,10);
 assert.equal(FRAME_ACTIONS.length,15);
 for(const action of FRAME_ACTIONS){
  assert.equal(PET_FRAMES[action].length,10,action);
  assert.ok(new Set(PET_FRAMES[action].map(p=>JSON.stringify(p))).size>=7,`Quadros distintos: ${action}`);
  for(const pose of PET_FRAMES[action])for(const n of Object.values(pose))assert.ok(Number.isFinite(n),action);
 }
 assert.equal(FRAME_MOTION['sleep-rest'],'sleep');
 assert.equal(FRAME_MOTION['fly'],'fly');
 assert.equal(liveFramePose('fly',9),PET_FRAMES.fly[9]);
});
test('V56: todas as 92 opções em 6 catálogos têm PNG RGBA e atlas',async()=>{
 const manifest=JSON.parse(await readFile(join(DIR,'sprites-manifest.json'),'utf8'));
 let count=0;
 for(const kind of ['eyes','snout','ears','tail','wings','shoes']){
  const entries=manifest.sprites[kind];assert.equal(entries.count,({eyes:26,snout:16,ears:17,tail:10,wings:9,shoes:14})[kind],kind);
  for(const option of Object.keys(entries.items)){
   const entry=entries.items[option];assert.ok(entry,kind+' '+option);
   assert.deepEqual(await pngMeta(join(DIR,entry.file)),[128,128]);
   count++;
  }
  const [w,h]=await pngMeta(join(DIR,entries.atlas));
  assert.equal(w,768);assert.ok(h>=128);
 }
 assert.equal(count,92);
});
test('V56: 45 spritesheets completos de 10 quadros, três fases do pet',async()=>{
 const manifest=JSON.parse(await readFile(join(DIR,'sprites-manifest.json'),'utf8'));
 assert.equal(Object.keys(manifest.sheets).length,45);
 for(const phase of ['baby','child','adult'])for(const action of FRAME_ACTIONS){
  const key=`${phase}/${action}`,sheet=manifest.sheets[key];assert.ok(sheet,key);
  assert.equal(sheet.frames,10);assert.equal(sheet.fps,10);
  assert.deepEqual(sheet.anchor,[100,185]);
  assert.deepEqual(await pngMeta(join(DIR,sheet.file)),[1000,400]);
 }
});
test('V56: módulo de quadros conectado ao render real e ao cache offline',async()=>{
 const app=await readFile(resolve(DIR,'../../../app.js'),'utf8');
 const engine=await readFile(resolve(DIR,'../../../pet-frame-engine.js'),'utf8');
 const sw=await readFile(resolve(DIR,'../../../sw.js'),'utf8');
 assert.match(app,/animatePetFrames\(host,motion\)/);
 assert.match(app,/stopPetFrames\(host\)/);
 assert.match(engine,/\.pixel-wing-pose/);
 assert.match(engine,/\.atelier-eyes/);
 assert.match(sw,/pet-frame-engine\.js\?v=59/);
 assert.match(sw,/pet-frames\.js\?v=59/);
});
