import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {OPTIONS,DEFAULT_APPEARANCE,createSave,validAppearance,validateSave} from '../web/core.js';
import {fromSave} from '../web/atelier.js';
import {pixelPet} from '../web/pixel-pet.js';
const ROOT=resolve(import.meta.dirname,'..');const W=join(ROOT,'web');
const c={p:'#ff5fa2',s:'#ffd1e6',a:'#ffc43d'};
function render(a={},stage='baby'){
 let appearance={...DEFAULT_APPEARANCE,...a},sel=fromSave(appearance).sel;
 return pixelPet(sel,c,{stage,outfit:appearance.outfit,shoes:appearance.shoes,partColors:appearance.partColors,partSizes:appearance.partSizes});
}
function group(text,name){const x=text.indexOf(`class="${name}"`);assert.ok(x>=0,name);return text.slice(x,x+1300);}
test('V58: 14 estilos novos, todos válidos no criador e no save',()=>{
 assert.equal(OPTIONS.outfit.length,21);assert.equal(new Set(OPTIONS.outfit).size,21);
 for(const outfit of OPTIONS.outfit){const a={...DEFAULT_APPEARANCE,outfit};assert.ok(validAppearance(a),outfit);assert.ok(validateSave(createSave(1000,a)),outfit);}
});
test('V58: cada roupa tem arte própria e acompanha 3 estágios do pet',()=>{
 for(const stage of ['baby','child','adult']){
  const items=OPTIONS.outfit.map(outfit=>group(render({outfit},stage),'pixel-outfit'));
  assert.equal(new Set(items).size,items.length,stage);
  for(const item of items){assert.ok(!item.includes('undefined'),stage);assert.ok(!item.includes('NaN'),stage);}
 }
});
test('V58: boca de coração é simétrica, com curva pixelada, brilho e tom personalizável',()=>{
 let m=group(render({mouth:'heart'}),'atelier-mouth');
 assert.match(m,/x="92" y="117" width="6" height="4"/);
 assert.match(m,/x="102" y="117" width="6" height="4"/);
 assert.match(m,/<rect/); // blocos de brilho pixelados dentro do coração
 let colored=group(render({mouth:'heart',partColors:{mouth:'blue'}}),'atelier-mouth');
 assert.notEqual(m,colored);
});
test('V58: junção cabeça/tronco, pernas curtas e acessórios continuam conectados',()=>{
 for(const stage of ['baby','child','adult']){
  const p=render({outfit:'astronaut',shoes:'boots',ears:'fox',wings:'fairy',tail:'fox'},stage);
  assert.ok(p.includes('class="pixel-neck"'));assert.ok(p.includes('class="pixel-foot-left"'));assert.ok(p.includes('class="pixel-foot-right"'));assert.ok(p.includes('class="pixel-shoes"'));
  assert.match(p,/translate\(0 -(?:14|17|21)\)/);assert.ok(!p.includes('NaN'));}
});
test('V58: aumento de altura só mexe no eixo vertical do palco, com pet ancorado no chão',async()=>{
 const css=await readFile(join(W,'v58-ajustes.css'),'utf8');const html=await readFile(join(W,'index.html'),'utf8');
 assert.match(css,/#world\.world\{height:clamp\(390px,68dvh,635px\)/);
 assert.match(css,/#create-screen \.create-preview\{height:clamp\(300px,44dvh,455px\)/);
 assert.match(css,/bottom:calc\(var\(--pet-floor\) - 12px\)/);
 assert.match(css,/\.pet-pose\{animation:none!important;transform:none!important;/);
 assert.match(html,/v58-ajustes\.css\?v=59/);
});
test('V58: 134 PNGs independentes com roupas e 45 spritesheets de 10 quadros',async()=>{
 const man=JSON.parse(await readFile(join(W,'assets/sprites/v58/sprites-manifest.json')));
 const count=Object.values(man.sprites).reduce((n,c)=>n+c.count,0);
 assert.equal(count,134);assert.equal(man.sprites.outfit.count,21);assert.equal(Object.keys(man.sheets).length,45);
 for(const seq of Object.values(man.sheets))assert.equal(seq.frames,10);
});
