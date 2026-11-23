import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const ROOT=path.resolve(import.meta.dirname,'..');
const read=async p=>await readFile(path.join(ROOT,p));
const text=async p=>(await read(p)).toString();
const widthHeight=buf=>[buf.readUInt32BE(16),buf.readUInt32BE(20)];
const html=await text('web/index.html');
const media=JSON.parse(html.match(/<script id="v64-scene-media" type="application\/json">(.*?)<\/script>/s)[1]);
test('V84.1: cenário Jardim, Entardecer e Neve têm GIF e miniaturas animadas embutidos',()=>{
 for (const scene of ['garden','sunset','snow']){
  assert.match(media[scene].gif,/^data:image\/gif;base64,/);
  assert.match(media[scene].preview,/^data:image\/gif;base64,/);
  assert.match(media[scene].still,/^data:image\/png;base64,/);
  assert.equal(Buffer.from(media[scene].gif.split(',')[1],'base64').subarray(0,6).toString(),'GIF89a');
 }
});
test('V84.1: spritesheet do boneco original com 10 poses e enquadramento 5x2',async()=>{
 const sheet=await read('assets-src/v63/objetos/snow__snowman_spritesheet.png');
 assert.equal(sheet.subarray(1,4).toString(),'PNG');
 assert.deepEqual(widthHeight(sheet),[640,288]);
 const source=await read('assets-src/v63/objetos/snow__snowman_ESTATICO.png');
 assert.deepEqual(widthHeight(source),[128,144]);
 const m=JSON.parse(await text('assets-src/v63/manifesto.json'));
 assert.equal(m.objects['snow__snowman'].frames,10);
 assert.equal(m.objects['snow__snowman'].animated,true);
 assert.equal(m.objects['snow__snowman'].different_frames,10);
});
test('V84.1: spritesheets do moinho, borboleta e pássaros permanecem separadas',async()=>{
 for(const key of ['garden__tree','garden__flower','garden__butterfly','sunset__windmill','sunset__lantern','sunset__birds']){
  const image=await read('assets-src/v63/objetos/'+key+'_spritesheet.png');
  assert.deepEqual(widthHeight(image),[640,288],key);
 }
});
test('V84.1: segue em cima da V84, sem mudar os outros 10 cenários',async()=>{
 const oldHashes=JSON.parse(await text('assets-src/v84_1_garden_sunset_snow/base_v84_other_scenes_hashes.json'));
 const {createHash}=await import('node:crypto');
 for(const [scene,hash] of Object.entries(oldHashes)){
  const digest=createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(media[scene]).sort()))).digest('hex');
  assert.equal(digest,hash,scene);
 }
});
test('V84.1: SW e fonte HTML não possuem import de V85',async()=>{
 const sw=await text('web/sw.js');
 assert.match(sw,/meu-pequeno-pet-v84-1/);
 assert.match(html,/app\.js\?v=84\.1/);
 assert.doesNotMatch(html.slice(0,2500),/(?:v85|V85)/);
});
