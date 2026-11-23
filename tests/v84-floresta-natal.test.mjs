import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const R=resolve(import.meta.dirname,'..');
const read=async p=>readFile(join(R,p),'utf8');
const b=async p=>readFile(join(R,p));
const meta=JSON.parse((await read('web/scene-v63-data.js')).match(/=({.*});/s)[1]);
test('V84: apenas esquilo e trenó são focos nos cenários aprovados',()=>{
 assert.deepEqual(meta.forest.objects.map(o=>o.key),['forest__squirrel']);
 assert.deepEqual(meta.christmas.objects.map(o=>o.key),['christmas__sleigh']);
 assert.equal(Object.keys(meta).length,13);
});
test('V84: dois remakes têm assets e spritesheets de 3 linhas por 10 quadros',async()=>{
 const targets={forest:[640,192],christmas:[1180,204]};
 for(const scene of Object.keys(targets)){
  const path=`assets-src/v84_remakes/${scene}_spritesheet_30_quadros.png`;
  const bytes=await b(path);
  assert.equal(bytes.subarray(1,4).toString(),'PNG');
  assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],targets[scene]);
  for(const path of [`${scene}_40_quadros.gif`,`${scene}_miniatura_animada.gif`,`${scene}_foto.png`])assert.ok((await b('assets-src/v84_remakes/'+path)).length>1000,path);
 }
});
test('V84: GIFs estão integrados ao HTML com as prévias correspondentes',async()=>{
 const html=await read('web/index.html');
 const match=html.match(/<script id="v64-scene-media" type="application\/json">([\s\S]*?)<\/script>/);
 assert.ok(match);
 const media=JSON.parse(match[1]);assert.equal(Object.keys(media).length,13);
 for(const name of ['forest','christmas']){
  assert.match(media[name].gif,/^data:image\/gif;base64,/);
  assert.match(media[name].preview,/^data:image\/gif;base64,/);
  assert.match(media[name].still,/^data:image\/png;base64,/);
 }
});
test('V84: remove overlay do Papai Noel antigo, preserva a mecânica do cometa',async()=>{
 const p=await read('web/scene-v63-player.js');
 assert.match(p,/scene==='christmas'\?'':/);
 assert.match(p,/scene==='space'\?SPACE_NODES/);
 assert.match(p,/scene==='forest'|forest__squirrel/);
 assert.match(p,/christmas__sleigh/);
 assert.match(p,/Math\.floor\(Math\.max\(0,elapsed\)\/260\)%40/);
});
test('V84: cache diferenciado, sem trocar as necessidades nem o salvamento',async()=>{
 const sw=await read('web/sw.js');
 assert.match(sw,/meu-pequeno-pet-v84/);
 assert.match(sw,/scene-v63-player\.js\?v=84/);
 assert.match((await read('web/index.html')),/Meu Pequeno Pet V84/);
 assert.match((await read('web/app.js')),/scene-v63-player\.js\?v=84/);
});
