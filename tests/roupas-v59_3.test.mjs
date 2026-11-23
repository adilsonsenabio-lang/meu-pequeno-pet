import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_APPEARANCE,OPTIONS,createSave,validateSave} from '../web/core.js';
import {fromSave} from '../web/atelier.js';
import {pixelPet} from '../web/pixel-pet.js';
const colors={p:'#ed62ac',s:'#f6bddb',a:'#ffcf40'};
const render=(body,outfit,stage)=>{
 const a={...DEFAULT_APPEARANCE,body,outfit};
 return pixelPet(fromSave(a).sel,colors,{stage,outfit});
};
const allBody=OPTIONS.body;
const outfits=OPTIONS.outfit.filter(x=>x!=='none');
const stages=['baby','child','adult'];
function getMetrics(svg){
 const part=svg.match(/<g class="outfit-fit"[^>]+>/)?.[0];
 assert.ok(part,'molde da roupa existe');
 return Object.fromEntries(['torso-top','roupa-top','roupa-bottom','body-width','fit-width'].map(k=>{
  const value=part.match(new RegExp(`data-${k}="([0-9.]+)"`));
  assert.ok(value,k);return [k,Number(value[1])];
 }));
}
test('V59.3: TODAS as 20 roupas vestem o tronco inteiro em 8 corpos e 3 estágios',()=>{
 assert.equal(outfits.length,20);
 assert.equal(allBody.length,8);
 let total=0;
 for(const stage of stages) for(const body of allBody) for(const outfit of outfits){
  const art=render(body,outfit,stage);const fit=getMetrics(art);total++;
  assert.equal(fit['roupa-top'],fit['torso-top']+3,`${stage}, ${body}, ${outfit}: ombros`);
  assert.equal(fit['roupa-bottom'],174,`${stage}, ${body}, ${outfit}: cintura`);
  const height=176-fit['torso-top'];
  assert.ok((fit['roupa-bottom']-fit['roupa-top'])/height>=.86,`${stage}/${outfit} altura`);
  const ratio=fit['fit-width']/fit['body-width'];
  assert.ok(ratio>=.74&&ratio<=.93,`${body}/${outfit} largura ${ratio}`);
  assert.ok(!/undefined|NaN/.test(art),`${body}/${outfit}`);
 }
 assert.equal(total,480);
});
test('V59.3: pescoço fica atrás da roupa; a roupa acompanha a animação do tronco',()=>{
 const art=render('chubby','hoodie','adult');
 assert.ok(art.indexOf('class="atelier-neck"')<art.indexOf('class="atelier-body"'));
 assert.ok(art.includes('class="pixel-outfit"'));
 assert.ok(art.includes('class="outfit-fit"'));
});
test('V59.3: bodies magros e largos geram tamanhos diferentes para todas as roupas',()=>{
 for(const stage of stages)for(const outfit of outfits){
  const small=getMetrics(render('slim',outfit,stage));
  const large=getMetrics(render('chubby',outfit,stage));
  assert.ok(small['fit-width']<large['fit-width'],`${stage}/${outfit}`);
 }
});
test('V59.3: roupas permanecem no salvamento sem migração dos dados',()=>{
 for(const outfit of OPTIONS.outfit){
  const a={...DEFAULT_APPEARANCE,body:'slim',outfit};
  const saved=createSave(1234,a);
  assert.ok(validateSave(saved));assert.equal(saved.appearance.outfit,outfit);
 }
});
