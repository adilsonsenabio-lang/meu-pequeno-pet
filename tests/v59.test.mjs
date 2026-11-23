import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {OPTIONS,DEFAULT_APPEARANCE,CUSTOM_PARTS,PART_PALETTE,validAppearance,createSave,validateSave} from '../web/core.js';
import {IDS,fromSave} from '../web/atelier.js';
import {pixelPet} from '../web/pixel-pet.js';
import {exportBackup,importBackup} from '../web/storage.js';
import {saveCreatorSession,loadCreatorSession,creatorKey} from '../web/creator-session.js';
const W=resolve(import.meta.dirname,'../web');
const color={p:'#5ccf8a',s:'#dff7e8',a:'#ffd84a'};
const render=(a={},stage='baby',mood='happy')=>{
 const appearance={...DEFAULT_APPEARANCE,...a};
 return pixelPet(fromSave(appearance).sel,color,{stage,mood,outfit:appearance.outfit,shoes:appearance.shoes,partSizes:appearance.partSizes,partColors:appearance.partColors});
};
const extract=(art,cls)=>{const i=art.indexOf(`class="${cls}"`);assert.ok(i>=0,cls);return art.slice(i,i+1800);};
test('V59: olhos escuros saem do editor e óculos vão aos acessórios, com legado preservado',()=>{
 assert.equal(OPTIONS.eyes.length,25);assert.ok(!OPTIONS.eyes.includes('shades'));
 assert.ok(OPTIONS.accessory.includes('sunglasses'));
 assert.ok(IDS.eyes.includes('shades'));assert.ok(validAppearance({...DEFAULT_APPEARANCE,eyes:'shades'}));
 assert.match(extract(render({accessory:'sunglasses'}),'atelier-accessory'),/\<rect/);
});
test('V59: acessórios aceitam cor e tamanho, persistindo em backups',()=>{
 assert.ok(CUSTOM_PARTS.includes('accessory'));
 const a={...DEFAULT_APPEARANCE,accessory:'sunglasses',partColors:{accessory:'mint'},partSizes:{accessory:1.15}};
 assert.ok(validAppearance(a));const s=createSave(5000,a);assert.ok(validateSave(s));
 const restored=importBackup(exportBackup(s));assert.deepEqual(restored.appearance.partColors,a.partColors);
 assert.deepEqual(restored.appearance.partSizes,a.partSizes);
 const base=extract(render({accessory:'sunglasses'}),'atelier-accessory');
 const tinted=extract(render(a),'atelier-accessory');assert.notEqual(base,tinted);assert.match(tinted,/scale\(1\.15\)/);assert.ok(tinted.includes(PART_PALETTE.mint));
});
test('V59: 18 bocas novas/antigas incluindo vazio explícito (independente do humor)',()=>{
 assert.equal(OPTIONS.mouth.length,18);
 for(const mood of ['happy','sad','sleepy','hungry']){
  const empty=extract(render({mouth:'none'},'baby',mood),'atelier-mouth');
  assert.ok(empty.includes('translate(100 125) scale(1)'));
  const after=empty.split('class="atelier-eating-mouth"')[0];
  assert.ok(!after.includes('<rect')&&!after.includes('<path'),mood);
 }
 const drawings=OPTIONS.mouth.filter(k=>k!=='none').map(mouth=>extract(render({mouth}),'atelier-mouth'));
 assert.equal(new Set(drawings).size,17);
 assert.match(extract(render({mouth:'heart'}),'atelier-mouth'),/x="92" y="117"/);
 assert.match(extract(render({mouth:'heart'}),'atelier-mouth'),/x="102" y="117"/);
});
test('V59: focinhos e bigodes centrados, novos IDs mapeados e sem SVG inválido',()=>{
 assert.equal(OPTIONS.snout.length,22);
 for(const id of ['whiskers','whiskerslong','whiskerscurled','whiskersdots','foxy','bunnywhiskers']){
  assert.ok(OPTIONS.snout.includes(id));assert.ok(IDS.snout.includes(id));
  const html=extract(render({snout:id}),'atelier-snout');
  assert.match(html,/translate\(100 108\) scale\(\.78\)/);
  assert.ok(!/NaN|undefined/.test(html));
 }
});
test('V68: cílios maiores e sem óculos como olhos',()=>{
 const lashes=extract(render({eyes:'lashes'}),'atelier-eyes');
 assert.match(lashes,/x="81" y="70" width="2" height="4"/);
 assert.ok(!OPTIONS.eyes.includes('shades'));
});
test('V59: contorno do corpo escuro consistente nas três fases',()=>{
 for(const stage of ['baby','child','adult']){
  const art=extract(render({body:'slim'},stage),'atelier-body');
  assert.match(art,/stroke="#12171d"/);assert.ok(!art.includes('NaN'));
 }
});
test('V59: modelagens variam com corpo, preservando as 21 roupas',()=>{
 assert.equal(OPTIONS.outfit.length,21);
 for(const stage of ['baby','child','adult']){
  for(const outfit of ['dress','raincoat','hoodie','astronaut','princess']){
   const slim=extract(render({body:'slim',outfit},stage),'pixel-outfit');
   const wide=extract(render({body:'chubby',outfit},stage),'pixel-outfit');
   const extractScale=t=>Number(t.match(/class="outfit-fit" transform="translate\(100 0\) scale\(([\d.]+) 1\)/)?.[1]);
   assert.ok(extractScale(slim)<extractScale(wide),`${stage}:${outfit}`);
   assert.ok(extractScale(slim)>=.55&&extractScale(wide)<=1.28);
  }
 }
});
test('V59: criação nova conserva escolhas com salvamento e sem alterar evolução',()=>{
 const a={...DEFAULT_APPEARANCE,mouth:'none',snout:'whiskerscurled',accessory:'sunglasses',body:'slim',outfit:'astronaut',partColors:{accessory:'blue'},partSizes:{accessory:1.1}};
 const s=createSave(1000,a);assert.ok(validateSave(s));
 const copy=importBackup(exportBackup(s));assert.deepEqual(copy.appearance,a);assert.deepEqual(copy.needs,s.needs);
 const map=new Map(),store={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};
 const key=creatorKey('meu-pequeno-pet.save.v1');saveCreatorSession(store,key,a,12,false);
 assert.equal(loadCreatorSession(store,key).draft.snout,'whiskerscurled');
});
test('V59: PNG/atlas 159 e 45 folhas animadas de 10 quadros',async()=>{
 const S=join(W,'assets/sprites/v59'),m=JSON.parse(await readFile(join(S,'sprites-manifest.json')));
 assert.equal(m.version,59);assert.equal(Object.keys(m.sprites).length,10);
 assert.equal(Object.values(m.sprites).reduce((sum,c)=>sum+c.count,0),159);
 assert.equal(m.sprites.mouth.count,18);assert.equal(m.sprites.snout.count,22);assert.equal(m.sprites.accessory.count,10);
 assert.equal(Object.keys(m.sheets).length,45);
 for(const entry of Object.values(m.sheets))assert.equal(entry.frames,10);
 await access(join(S,m.sprites.mouth.items.none.file));
});
test('V59: cache offline aponta só para recursos existentes',async()=>{
 const sw=await readFile(join(W,'sw.js'),'utf8');const items=JSON.parse(sw.match(/const ASSETS=(\[[\s\S]*?\]);/)[1]);
 for(const file of items){const target=file.replace(/^\.\//,'').split('?')[0];if(target)await access(join(W,target));}
 assert.ok(items.some(k=>k.includes('atlas-accessory.png')));
});
