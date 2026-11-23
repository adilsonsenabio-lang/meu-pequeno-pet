import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {OPTIONS,DEFAULT_APPEARANCE,createSave,validateSave,PART_PALETTE} from '../web/core.js';
import {fromSave,KEYS} from '../web/atelier.js';
import {pixelPet} from '../web/pixel-pet.js';
import {creatorKey,saveCreatorSession,loadCreatorSession,clearCreatorSession} from '../web/creator-session.js';
import {loadSave,exportBackup,importBackup,SAVE_KEY} from '../web/storage.js';
const ROOT=resolve(import.meta.dirname,'..');
const WEB=join(ROOT,'web');
const DIR=join(WEB,'assets/sprites/v57');
const c={p:'#f977bc',s:'#ffbed8',a:'#ffdd4e'};
const pet=(a={})=>{const b={...DEFAULT_APPEARANCE,...a};return pixelPet(fromSave(b).sel,c,{stage:'baby',mood:'happy',partSizes:b.partSizes,partColors:b.partColors});};
const store=()=>{let values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};};
const group=(art,g)=>art.match(new RegExp(`<g class="${g}"[^>]*>([\\s\\S]*?)<\\/g>`))?.[1]||'';
const pngMeta=async file=>{const data=await readFile(file);assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a');return [data.readUInt32BE(16),data.readUInt32BE(20)];};
test('V57: edição começa por corpo e cabeça e mantém boca no fluxo',()=>{
 assert.deepEqual(KEYS.slice(0,2),['body','head']);
 assert.equal(OPTIONS.mouth.length,18);
 assert.deepEqual(OPTIONS.mouth.slice(0,8),['smile','open','cat','heart','surprised','teeth','tongue','serious']);
 assert.ok(OPTIONS.mouth.includes('none'));
});
test('V57: 8 bocas possuem desenhos independentes e aceitam escala e tonalidade',()=>{
 const drawings=OPTIONS.mouth.map(mouth=>group(pet({mouth}),'atelier-mouth'));
 assert.ok(drawings.every(Boolean));assert.equal(new Set(drawings).size,18);
 for(const mouth of OPTIONS.mouth.filter(x=>x!=='none')){
  const base=group(pet({mouth}),'atelier-mouth');
  const recolored=group(pet({mouth,partColors:{mouth:'mint'}}),'atelier-mouth');
  assert.notEqual(base,recolored,mouth);
  assert.match(recolored,/#(?:2e9f8e|44b5a4|6fe0cf|9fffff)/i);
 }
 assert.match(group(pet({mouth:'tongue',partSizes:{mouth:1.2}}),'atelier-mouth'),/scale\(1\.2\)/);
});
test('V57: todas as cores dos olhos alteram áreas perceptíveis, inclusive galáxia e formatos pequenos',()=>{
 for(const eyes of OPTIONS.eyes){
  const base=group(pet({eyes}),'atelier-eyes');
  const mint=group(pet({eyes,partColors:{eyes:'mint'}}),'atelier-eyes');
  assert.notEqual(base,mint,eyes);
  assert.match(mint,/#[0-9a-f]{6}/i);
  const mintCount=(mint.match(/#(?:2e9f8e|4fc0af|6fe0cf|9fffff)/gi)||[]).length;
  assert.ok(mintCount>=1,`${eyes}: alteração de cor ausente`);
 }
});
test('V57: 13 marcas distintas incluindo sem marcas, sem undefined',()=>{
 assert.equal(OPTIONS.markings.length,13);
 const marks=OPTIONS.markings.map(markings=>group(pet({markings}),'atelier-markings'));
 assert.equal(new Set(marks).size,13);
 assert.ok(marks.every(m=>!m.includes('undefined')));
});
test('V57: orelhas de raposa usam duas metades; peças possuem conexões de âncora',()=>{
 const ears=group(pet({ears:'fox',partSizes:{ears:1.2}}),'atelier-ears');
 assert.ok(pet({ears:'fox',partSizes:{ears:1.2}}).includes('fox-ear-left')&&pet({ears:'fox',partSizes:{ears:1.2}}).includes('fox-ear-right'));
 assert.match(ears,/scale\(1\.2\)/);
 assert.ok(group(pet({wings:'angel',tail:'fox'}),'atelier-tail'));
 assert.ok(group(pet({wings:'angel',tail:'fox'}),'atelier-wings'));
});
test('V57: restaura rascunho, tamanho e cor de edição após fechar/reabrir HTML',()=>{
 const storage=store(),key=creatorKey(SAVE_KEY);
 const draft={...DEFAULT_APPEARANCE,head:'fox',eyes:'galaxy',mouth:'tongue',partSizes:{mouth:1.2,ears:1.15},partColors:{eyes:'mint',mouth:'purple'},scene:'garden'};
 saveCreatorSession(storage,key,draft,7,false);
 const restored=loadCreatorSession(storage,key);
 assert.equal(restored.step,7);
 assert.equal(restored.draft.mouth,'tongue');
 assert.equal(restored.draft.partSizes.ears,1.15);
 assert.equal(restored.draft.partColors.eyes,'mint');
 clearCreatorSession(storage,key);assert.equal(loadCreatorSession(storage,key),null);
});
test('V57: valida dados da criação antes de recuperar e limita tamanho ao máximo seguro',()=>{
 const s=store(),key=creatorKey(SAVE_KEY);
 saveCreatorSession(s,key,{...DEFAULT_APPEARANCE,mouth:'<script>',partColors:{eyes:'invalid'},partSizes:{mouth:50},scene:'invalid'},200,false);
 const r=loadCreatorSession(s,key);
 assert.equal(r.draft.mouth,'smile');assert.equal(r.draft.partColors.eyes,undefined);
 assert.equal(r.draft.partSizes.mouth,undefined);assert.equal(r.draft.scene,'garden');assert.equal(r.step,0);
});
test('V57: salvamentos da V56 sem o campo boca mantêm necessidades e evolução',()=>{
 const oldAppearance={...DEFAULT_APPEARANCE};delete oldAppearance.mouth;
 const save={...createSave(1000,oldAppearance),phase:'baby',milestones:['baby'],activeMs:110000,needs:{...createSave(1000).needs,food:37,water:51},viewX:68};
 assert.ok(validateSave(save));
 const storage=store();storage.setItem(SAVE_KEY,JSON.stringify(save));
 const restored=loadSave(storage,120000,SAVE_KEY);
 assert.equal(restored.save.needs.food,37);assert.equal(restored.save.activeMs,110000);
 assert.equal(restored.save.viewX,68);assert.equal(restored.recovered,false);
 assert.deepEqual(importBackup(exportBackup(save)).needs,save.needs);
});
test('V57: 113 sprites de peça em 8 atlases, incluindo bocas e marcas',async()=>{
 const manifest=JSON.parse(await readFile(join(DIR,'sprites-manifest.json')));
 let total=0;
 for(const [kind,entry] of Object.entries(manifest.sprites)){
  assert.equal(entry.count,({eyes:26,snout:16,mouth:8,markings:13,ears:17,tail:10,wings:9,shoes:14})[kind],kind);
  for(const id of Object.keys(entry.items)){const part=entry.items[id];assert.ok(part,kind+' '+id);assert.deepEqual(await pngMeta(join(DIR,part.file)),[128,128]);total++;}
  const [w,h]=await pngMeta(join(DIR,entry.atlas));assert.equal(w,768);assert.ok(h>=128);
 }
 assert.equal(Object.keys(manifest.sprites).length,8);
 assert.equal(total,113);
});
test('V57: 45 spritesheets animados com 10 quadros por fase',async()=>{
 const manifest=JSON.parse(await readFile(join(DIR,'sprites-manifest.json')));
 assert.equal(Object.keys(manifest.sheets).length,45);
 for(const [id,sheet] of Object.entries(manifest.sheets)){
  assert.equal(sheet.frames,10,id);assert.equal(sheet.fps,10,id);assert.deepEqual(sheet.anchor,[100,185]);
  assert.deepEqual(await pngMeta(join(DIR,sheet.file)),[1000,400]);
 }
});
test('V57: CSS ancora pet no chão e ciclo de vida salva ao minimizar',async()=>{
 const [css,app,sw,html]=await Promise.all(['v57-ajustes.css','app.js','sw.js','index.html'].map(k=>readFile(join(WEB,k),'utf8')));
 assert.match(css,/bottom:var\(--pet-floor\)/);assert.match(css,/animation:none!important/);
 assert.match(app,/window\.addEventListener\('pagehide',checkpoint\)/);
 assert.match(app,/document\.addEventListener\('visibilitychange'/);
 assert.match(app,/document\.addEventListener\('freeze',checkpoint\)/);
 assert.match(app,/function saveDraft\(\)/);
 assert.match(sw,/meu-pequeno-pet-v(?:59|60|64|65|66|68|69|70|73|74|75|77|80)/);assert.match(html,/v57-ajustes\.css/);
});
test('V57: caminhos de cache são válidos no próprio projeto',async()=>{
 const sw=await readFile(join(WEB,'sw.js'),'utf8');const arr=JSON.parse(sw.match(/const ASSETS=(\[[\s\S]*?\]);/)[1]);
 for(const s of arr){const v=s.replace(/^\.\//,'').split('?')[0];if(!v)continue;await access(join(WEB,v));}
});
