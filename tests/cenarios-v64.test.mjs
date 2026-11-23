import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {SCENES,createSave,validateSave} from '../web/core.js';
const ROOT=resolve(import.meta.dirname,'..');
const S=join(ROOT,'assets-src/v63');
const meta=JSON.parse(await readFile(join(S,'manifesto.json'),'utf8'));
const PLAYABLE=['garden','sunset','night','beach','desert','forest','snow','space','sea','halloween','christmas'];
test('V64: 11 cenários selecionáveis mais quarto e cozinha, nuvens antiga preservada para migração',async()=>{
 for(const key of PLAYABLE) assert.ok(SCENES.includes(key),key);
 assert.ok(SCENES.includes('clouds'));
 assert.equal(Object.keys(meta.scenes).length,13);
 for(const key of [...PLAYABLE,'bedroom','kitchen'])assert.equal(meta.scenes[key].frames,40,key);
 const app=await readFile(join(ROOT,'web/app.js'),'utf8');
 assert.match(app,/SCENE_KEYS:OPTIONS\[c.key\]/);
 assert.match(app,/if\(save\?\.scene==='clouds'\)/);
});
test('V64: objetos animados aprovados têm spritesheet de dez poses, 1 estático, 40 quadros de paisagem',async()=>{
 const objects=Object.values(meta.objects);
 assert.equal(objects.length,38);
 assert.equal(objects.filter(x=>x.animated).length,37);
 for(const o of objects){
  assert.equal(o.frames,o.animated?10:1);
  if(o.animated)assert.ok(o.different_frames>=5&&o.different_frames<=10); // V80: ghost has 10 poses; four-blade rotor cycles may share symmetry
  await access(join(S,o.sheet));
 }
 for(const k of PLAYABLE)await access(join(S,'animacoes',k+'_sem_pet.gif'));
});
test('V64: objetos da V63 só recebem marcadores invisíveis, sem clique exigido',async()=>{
 const source=await readFile(join(ROOT,'web/scene-v63-player.js'),'utf8');
 const css=await readFile(join(ROOT,'web/scene-v64.css'),'utf8');
 assert.match(source,/data-v64-object/);
 assert.match(css,/\.v64-gaze-marker\{[^}]*pointer-events:none/);
 assert.doesNotMatch(source,/\sonclick\s*=|addEventListener\(['"]click/);
});
test('V64: pet olha espontaneamente com olhos e cabeça e pausa durante os cuidados',async()=>{
 const app=await readFile(join(ROOT,'web/app.js'),'utf8');
 assert.match(app,/startSceneGazeLoop\(\)/);
 assert.match(app,/aimPetAt\(rect.left\+rect.width\/2,rect.top\+rect.height\/2,false\)/);
 assert.match(app,/status!=='ready'/);
 assert.match(app,/setMotion\(playArt,'look-target'\)/);
 assert.match(app,/if\(sceneLookMarker\)/);
});
test('V64: novas paisagens e salvamentos antigos permanecem válidos',()=>{
 for(const name of ['garden','desert','beach','halloween','christmas','clouds']){
  const save={...createSave(100),scene:name};
  assert.equal(validateSave(save),true,name);
 }
});
test('V64: HTML offline inclui artes locais e todos os scripts novos',async()=>{
 const index=await readFile(join(ROOT,'web/index.html'),'utf8');
 assert.match(index,/id="v64-scene-media"/);
 assert.match(index,/scene-v64\.css/);
 assert.match(index,/app\.js\?v=(?:64|65|66|68|69|70|74|75|77|80)/);
 const content=JSON.parse(index.match(/<script id="v64-scene-media" type="application\/json">(.*?)<\/script>/s)[1]);
 assert.equal(Object.keys(content).length,13);
 for(const v of Object.values(content)){
  assert.match(v.gif,/^data:image\/gif;base64,/);
  assert.match(v.still,/^data:image\/png;base64,/);
 }
});
