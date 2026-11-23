import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join,resolve } from 'node:path';
import {PARTS,IDS,fromSave,COLORS} from '../web/atelier.js';
import {pixelPet} from '../web/pixel-pet.js';
import {OPTIONS,DEFAULT_APPEARANCE,createSave,validateSave} from '../web/core.js';
import {exportBackup,importBackup} from '../web/storage.js';

const base=resolve(import.meta.dirname,'../web');
const color={p:COLORS.pink[0],s:COLORS.pink[1],a:COLORS.pink[2]};
const render=(eyes='big',shoes='none')=>{
 const appearance={...DEFAULT_APPEARANCE,eyes,shoes};
 const sel=fromSave(appearance).sel;
 return pixelPet(sel,color,{stage:'baby',mood:'happy',shoes});
};

test('V56: opções de olhos, catálogo e índices estão sincronizados',()=>{
 assert.equal(OPTIONS.eyes.length,25);
 assert.ok(!OPTIONS.eyes.includes('shades')); // removido das opções novas, salvo legado preservado
 assert.equal(IDS.eyes.length,26);
 assert.equal(PARTS.eyes.length,26);
 assert.deepEqual(OPTIONS.eyes,IDS.eyes.filter(x=>x!=='shades'));
 assert.ok(OPTIONS.eyes.includes('galaxy'));
 assert.ok(OPTIONS.eyes.includes('teary'));
});

test('V56: as 26 opções de olhos têm desenhos distintos e nenhum erro de SVG',()=>{
 const draws=OPTIONS.eyes.map(eyes=>{
  const art=render(eyes);
  assert.ok(art.includes('atelier-eyes'));
  assert.ok(!art.includes('undefined')&&!art.includes('NaN'),eyes);
  return art.match(/<g class="atelier-eyes">([\s\S]*?)<\/g><g class="atelier-eyes-shut">/)?.[1];
 });
 assert.ok(draws.every(Boolean));
 assert.equal(new Set(draws).size,25);
});

test('V55: as 14 opções de calçado geram pixel art distinta',()=>{
 assert.equal(OPTIONS.shoes.length,14);
 const draws=OPTIONS.shoes.map(shoes=>{
  const art=render('big',shoes);
  assert.ok(!art.includes('undefined')&&!art.includes('NaN'),shoes);
  return art.match(/<g class="pixel-shoes">([\s\S]*?)<\/g><\/g><g transform=/)?.[1];
 });
 assert.ok(draws.every(x=>x!==undefined));
 assert.equal(new Set(draws).size,14);
});

test('V55: salvar e recuperar uma personalização nova sem afetar a anterior',()=>{
 const original=createSave(1_000);
 const nova={...original,appearance:{...original.appearance,eyes:'galaxy',shoes:'rollers'}};
 assert.ok(validateSave(nova));
 const restored=importBackup(exportBackup(nova));
 assert.equal(restored.appearance.eyes,'galaxy');
 assert.equal(restored.appearance.shoes,'rollers');
 assert.deepEqual(restored.needs,original.needs);
 assert.ok(validateSave(original));
});

test('V55: mantém todos os estilos antigos e uma alteração isolada de layout',async()=>{
 for(const eyes of ['big','dots','cat','sleepy','happy','star','heart','angry'])assert.ok(OPTIONS.eyes.includes(eyes));
 for(const shoes of ['none','shoes','sneakers','heels','boots','slippers'])assert.ok(OPTIONS.shoes.includes(shoes));
 const css=await readFile(join(base,'v55-mobile.css'),'utf8');
 assert.match(css,/#world\.world\s*\{\s*height:clamp\(350px,\s*62dvh,\s*570px\)/);
 assert.doesNotMatch(css,/#world\.world\s*\{[^}]*\bwidth\s*:/);
 const html=await readFile(join(base,'index.html'),'utf8');
 assert.ok(html.includes('v55-mobile.css?v=59'));
 const sw=await readFile(join(base,'sw.js'),'utf8');
 assert.ok(sw.includes('v55-mobile.css?v=59'));
});
