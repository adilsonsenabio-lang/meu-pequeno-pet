import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {CUSTOM_PARTS,PART_PALETTE,MIN_PART_SCALE,MAX_PART_SCALE,OPTIONS,DEFAULT_APPEARANCE,createSave,validateSave,validAppearance} from '../web/core.js';
import {IDS,PARTS,COLORS,fromSave} from '../web/atelier.js';
import {pixelPet,partScale} from '../web/pixel-pet.js';
import {nextAirStep,petCanFly} from '../web/interactions.js';
import {exportBackup,importBackup} from '../web/storage.js';
const WEB=resolve(import.meta.dirname,'../web');
const color={p:COLORS.pink[0],s:COLORS.pink[1],a:COLORS.pink[2]};
const render=(appearance={})=>{
 const a={...DEFAULT_APPEARANCE,...appearance},sel=fromSave(a).sel;
 return pixelPet(sel,color,{stage:'baby',mood:'happy',shoes:a.shoes,partSizes:a.partSizes,partColors:a.partColors});
};
const group=(art,category,next)=>art.split(new RegExp(`<g class="${category}"[^>]*>`))[1]?.split(next)[0];
test('V59: o catálogo preserva V56 e adiciona bigodes, sem óculos na aba olhos',()=>{
 assert.equal(OPTIONS.eyes.length,25);assert.ok(!OPTIONS.eyes.includes('shades'));
 assert.equal(OPTIONS.snout.length,22);assert.equal(OPTIONS.ears.length,17);
 for(const key of ['eyes','snout','ears']){
  assert.ok(OPTIONS[key].every(x=>x==='none'||IDS[key].includes(x)),key);
  assert.ok(OPTIONS[key].every(x=>x==='none'||PARTS[key].some(p=>p.n)||IDS[key].includes(x)),key);
 }
 assert.ok(OPTIONS.snout.includes('whiskerscurled'));
});
test('V56: todos os focinhos e orelhas renderizam sem erros',()=>{
 for(const key of ['snout','ears']){
  for(const id of OPTIONS[key]){
   const art=render({[key]:id});
   assert.ok(!/undefined|NaN/.test(art),`${key}/${id}`);
   assert.ok(art.includes('atelier-'+key),`${key}/${id}`);
  }
 }
});
test('V56: focinhos diferem visualmente nos desenhos pixelados',()=>{
 const draws=OPTIONS.snout.map(snout=>{
  const art=render({snout});return group(art,'atelier-snout','</g><g class="atelier-eating-mouth">');
 });
 assert.ok(draws.every(Boolean));assert.equal(new Set(draws).size,draws.length);
});
test('V56: escala tem limites entre 85% e 120%',()=>{
 assert.equal(MIN_PART_SCALE,.85);assert.equal(MAX_PART_SCALE,1.2);
 assert.equal(partScale({eyes:99},'eyes'),1.2);
 assert.equal(partScale({eyes:.4},'eyes'),.85);
 assert.equal(partScale({eyes:1.15},'eyes'),1.15);
 assert.equal(partScale({},'eyes'),1);
 const base=render(),changed=render({partSizes:{eyes:1.2,wings:1.15,tail:.85,snout:1.05,ears:1.2}});
 assert.notEqual(changed,base);
 assert.ok(changed.includes('scale(1.2)'));
});
test('V56: cores de cinco categorias mudam a arte e não recolorem o corpo inteiro',()=>{
 for(const key of CUSTOM_PARTS){
  const part={...(key==='wings'?{wings:'fairy'}:{})};
  const base=render(part);
  const withColor=render({...part,partColors:{[key]:'mint'}});
  assert.notEqual(withColor,base,key);
  assert.ok(withColor.includes(PART_PALETTE.mint),key);
 }
});
test('V56: backup mantém tamanhos, cores e opções novas e importa V55',()=>{
 const appearance={...DEFAULT_APPEARANCE,eyes:'gem',snout:'long',ears:'fox',partSizes:{eyes:1.2,snout:.85,wings:1.15},partColors:{eyes:'mint',tail:'purple',snout:'gold'}};
 const save=createSave(2000,appearance);assert.ok(validateSave(save));
 const restored=importBackup(exportBackup(save));assert.deepEqual(restored.appearance,appearance);
 const oldSave=createSave(2000);assert.ok(validateSave(oldSave));
});
test('V56: rejeita tamanhos e cores adulterados em backups',()=>{
 assert.ok(!validAppearance({...DEFAULT_APPEARANCE,partSizes:{eyes:9}}));
 assert.ok(!validAppearance({...DEFAULT_APPEARANCE,partSizes:{eyes:NaN}}));
 assert.ok(!validAppearance({...DEFAULT_APPEARANCE,partColors:{ears:'url(https://example.com)'}}));
 assert.ok(!validAppearance({...DEFAULT_APPEARANCE,partColors:{shirt:'mint'}}));
 assert.ok(validAppearance({...DEFAULT_APPEARANCE,partColors:{eyes:'base'}}));
});
test('V56: quatro subidas com ou sem asas, quinta limitada a quatro',()=>{
 for(let winged of [true,false]){
  const appearance={wings:winged?'fairy':'none'};
  assert.equal(petCanFly(appearance),winged);
  let level=0;for(let i=1;i<=6;i++){
   level=nextAirStep(level,4);assert.equal(level,Math.min(i,4));
  }
 }
});
test('V56: CSS, SW e HTML incluem ajuste de chão, animações e controles',async()=>{
 const css=await readFile(join(WEB,'v56-personalizacao.css'),'utf8');
 const html=await readFile(join(WEB,'index.html'),'utf8');
 const sw=await readFile(join(WEB,'sw.js'),'utf8');
 assert.match(css,/#create-screen .create-art\{position:absolute/);
 assert.match(css,/#pet-wrap.pet-wrap.airborne\.flying .pixel-wing-pose/);
 assert.match(css,/@keyframes pixel-dust/);
 assert.match(html,/id="part-size"/);assert.match(html,/id="part-colors"/);
 assert.match(sw,/v56-personalizacao.css\?v=59/);
});
