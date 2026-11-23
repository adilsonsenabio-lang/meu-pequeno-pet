import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {SCENES,SCENE_NAMES} from '../web/atelier.js';
import {SCENE_DETAILS,EXTRA_ROOM_DETAILS,TOY_DETAIL} from '../web/scene-details-v60.js';
import {AREA_SCENES,TOY_ART,OBJECT_ART} from '../web/world.js';
import {SCENES as SCENE_KEYS,TOYS,createSave,validateSave} from '../web/core.js';
import {exportBackup,importBackup,persist,loadSave} from '../web/storage.js';
import {SCENE_LIFE} from '../web/scene-gaze.js';
const ROOT=resolve(import.meta.dirname,'..');
const OLD=['garden','sunset','night','beach','clouds','forest','snow','space','sea'];
const ALL=[...OLD,'halloween','christmas'];
test('V60: nove cenários antigos e dois novos disponíveis no editor',()=>{
 assert.deepEqual(SCENE_KEYS.filter(key=>key!=='desert'),ALL);assert.ok(SCENE_KEYS.includes('desert'));
 assert.deepEqual(Object.keys(SCENES),ALL);
 for(const key of ALL)assert.ok(SCENE_NAMES[key]&&SCENES[key].length>3500,key);
});
test('V60: todos os 11 cenários têm mais de 25 detalhes pixelados e vida animada',()=>{
 for(const key of ALL){
  const s=SCENES[key];
  assert.ok((s.match(/<rect /g)||[]).length>=27,`${key} blocos insuficientes`);
  assert.match(s,/<animate(?:Transform)?\b/,`${key} sem animação`);
  assert.match(SCENE_DETAILS[key],/rect|path/,`${key} sem detalhes adicionais`);
  assert.ok(SCENE_LIFE[key],`interação de ambiente ausente ${key}`);
 }
});
test('V60: identidade de Halloween e Natal distinta com objetos temáticos animados',()=>{
 assert.match(SCENE_DETAILS.halloween,/Halloween original/);
 assert.match(SCENE_DETAILS.halloween,/#85c6a2/);
 assert.match(SCENE_DETAILS.christmas,/Natal original/);
 assert.match(SCENE_DETAILS.christmas,/#527c65/);
 assert.notEqual(SCENE_DETAILS.halloween,SCENE_DETAILS.christmas);
});
test('V60: cenário da praia possui ondas, areia, guarda-sol, caranguejo e movimento',()=>{
 assert.match(SCENES.beach,/shoreline|scene-focus-crab/);
 assert.match(SCENE_DETAILS.beach,/praia: areia granulada/);
 assert.ok((SCENES.beach.match(/<animateTransform /g)||[]).length>=8);
});
test('V60: quarto e cozinha enriquecidos sem remover suas cenas e luz',()=>{
 for(const key of ['bedroom','kitchen']){
  assert.ok(EXTRA_ROOM_DETAILS[key].length>1200);
  assert.ok((AREA_SCENES[key].match(/<rect /g)||[]).length>=30);
  assert.match(AREA_SCENES[key],/animateTransform/);
 }
});
test('V60: dez brinquedos e três objetos interativos possuem novos detalhes',()=>{
 assert.deepEqual(Object.keys(TOY_DETAIL).sort(),TOYS.slice().sort());
 for(const k of TOYS)assert.ok(TOY_ART[k].includes(TOY_DETAIL[k]),`${k} sem refinamento`);
 for(const k of ['lamp','food','water'])assert.ok((OBJECT_ART[k].match(/<rect /g)||[]).length>=3,k);
});
test('V60: saves antigos válidos e novos temas sobrevivem backup e reinício',()=>{
 const old=createSave(123456);assert.ok(validateSave(old));
 class Store{constructor(){this.m=new Map();}getItem(k){return this.m.get(k)??null;}setItem(k,v){this.m.set(k,v);}removeItem(k){this.m.delete(k);}}
 for(const scene of ['garden','beach','halloween','christmas']){
  const s={...old,scene};assert.equal(validateSave(s),true);
  const st=new Store();persist(s,st);assert.equal(loadSave(st).save.scene,scene);
  assert.equal(importBackup(exportBackup(s)).scene,scene);
 }
});
test('V60: a galeria é autônoma e lista os 13 cenários e cômodos',async()=>{
 const t=await readFile(join(ROOT,'GALERIA_CENARIOS_V60.html'),'utf8');
 assert.ok(t.length>25000);
 for(const key of [...ALL,'bedroom','kitchen'])assert.ok(t.includes(`id="${key}"`),key);
});
test('V60: cache offline inclui módulo novo e arquivos válidos',async()=>{
 const sw=await readFile(join(ROOT,'web/sw.js'),'utf8');
 assert.match(sw,/meu-pequeno-pet-v(?:60|64|65|66|68|69|70|73|74|75|77|80)/);
 const arr=JSON.parse(sw.match(/const ASSETS=(\[[\s\S]*?\]);/)[1]);
 assert.ok(arr.includes('./scene-details-v60.js'));
 for(const entry of arr){
  const file=entry.replace(/^\.\//,'').split('?')[0];if(file)await access(join(ROOT,'web',file));
 }
});
