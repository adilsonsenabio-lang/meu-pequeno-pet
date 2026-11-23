import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const file=async p=>fs.readFile(path.join(root,p));
const text=async p=>(await file(p)).toString();
const html=await text('web/index.html');
const embedded=JSON.parse(html.match(/<script id="v64-scene-media" type="application\/json">(.*?)<\/script>/s)[1]);
const wh=b=>[b.readUInt32BE(16),b.readUInt32BE(20)];
test('V84.2: manter 13 cenários e trocar apenas Entardecer, Praia e Noite',async()=>{
 assert.equal(Object.keys(embedded).length,13);
 const base=JSON.parse(await text('assets-src/v84_1_garden_sunset_snow/base_v84_other_scenes_hashes.json'));
 for (const [scene,hash] of Object.entries(base)){
  if(scene==='beach'||scene==='night')continue;
  const digest=createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(embedded[scene]).sort()))).digest('hex');
  assert.equal(digest,hash,scene);
 }
 for(const scene of ['sunset','beach','night']){
  assert.match(embedded[scene].gif,/^data:image\/gif;base64,/);
  assert.match(embedded[scene].preview,/^data:image\/gif;base64,/);
  assert.match(embedded[scene].still,/^data:image\/png;base64,/);
 }
});
test('V84.2: moinho é animado em spritesheet 10 poses 5×2',async()=>{
 assert.deepEqual(wh(await file('assets-src/v63/objetos/sunset__windmill_spritesheet.png')),[640,288]);
 const m=JSON.parse(await text('assets-src/v63/manifesto.json'));
 assert.equal(m.objects['sunset__windmill'].different_frames,10);
 assert.match(m.objects['sunset__windmill'].motion,/rotor/);
});
test('V84.2: coqueiro com quatro poses aprovadas e transparência',async()=>{
 assert.deepEqual(wh(await file('assets-src/v63/objetos/beach__palm_spritesheet.png')),[640,288]);
 const m=JSON.parse(await text('assets-src/v63/manifesto.json'));
 assert.equal(m.objects['beach__palm'].frames,10);
 assert.equal(m.objects['beach__palm'].different_frames,4);
});
test('V84.2: fundo Noite limpo, coruja animada e sem duplicatas',async()=>{
 const s=await text('web/scene-v63-data.js');
 const p=await text('web/scene-v63-player.js');
 assert.match(s,/night__owl/);
 assert.match(p,/night__owl/);
 const m=JSON.parse(await text('assets-src/v63/manifesto.json'));
 assert.ok(m.scenes.night.objects.includes('night__owl'));
});
test('V84.2: cache e imports atualizados',async()=>{
 assert.match(await text('web/sw.js'),/meu-pequeno-pet-v84-2/);
 assert.match(await text('web/app.js'),/scene-v63-player.js\?v=84\.2/);
 assert.match(await text('web/scene-v63-player.js'),/scene-assets-v63.js\?v=84\.2/);
 assert.match(html,/app.js\?v=84\.2/);
});
