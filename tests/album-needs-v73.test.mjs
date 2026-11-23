import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createSave,hatch,advance,beginSleep,restSleep,validateSave,NEEDS,NEED_DECAY_PER_SECOND} from '../web/core.js';
import {TOY_ART,OBJECT_ART} from '../web/world.js';
import {ALBUM_LABELS,albumSprite} from '../web/album-v73.js';
const read=async name=>readFile(new URL('../web/'+name,import.meta.url),'utf8');
const base=()=>hatch(createSave(100000),100000).save;
test('V73: todas as sete necessidades comuns caem enquanto o pet esta acordado',()=>{
 const state=base(), next=advance(state,4000,104000,false).save;
 for(const key of Object.keys(NEED_DECAY_PER_SECOND))assert.ok(next.needs[key]<state.needs[key],key);
 assert.ok(next.needs.health<state.needs.health,'saúde é mais lenta');
 assert.equal(validateSave(next),true);
});
test('V73: nenhuma necessidade sai dos limites e os efeitos de cuidado permanecem',()=>{
 const s={...base(),needs:{...base().needs,food:20,health:1}};
 const next=advance(s,20000,120000,false).save;
 assert.equal(next.needs.food,20);assert.ok(next.needs.health>=0);
 for(const k of NEEDS)assert.ok(next.needs[k]>=0&&next.needs[k]<=100);
});
test('V73: suspender por mais de um minuto nao desgasta as necessidades nem pula crescimento',()=>{
 const state=base(), next=advance(state,10*60_000,700000).save;
 assert.equal(next,state);
});
test('V73: sono continua 30% mais rápido',()=>{
 const s={...base(),needs:{...base().needs,energy:35}};
 const sleeping=beginSleep(s,101000);
 assert.equal(restSleep(sleeping,1000,102000).needs.energy,36.3);
});
test('V73: album tem 14 colecionaveis novos com dez quadros PNG e nomes em português',()=>{
 assert.equal(Object.keys(ALBUM_LABELS).length,14);
 assert.equal(new Set(Object.values(ALBUM_LABELS)).size,14);
 for(const id of Object.keys(ALBUM_LABELS)){
  const html=albumSprite(id);
  assert.match(html,/album-v73-sprite/);assert.match(html,/data:image\/png;base64/);
  assert.ok(!html.includes('undefined'));
 }
 assert.equal(albumSprite('butterfly'),'');
});
test('V73: brinquedos originais preservados fora do álbum e borboleta não alterada',()=>{
 assert.ok(TOY_ART.ball.includes('pixel-item'));
 assert.ok(OBJECT_ART.butterfly.includes('butterfly-wing'));
});
test('V73: controles de Diversão realmente desabilitados ao dormir',async()=>{
 const s=await read('app.js');
 assert.match(s,/button\.disabled=!available\|\|save\?\.phase==='egg'/);
 assert.match(s,/funNeed\.classList\.toggle\('is-unavailable'/);
 assert.match(s,/if\(group==='fun'\)\{if\(\['ready','ambient'\]/);
});
test('V73: as bolhas estão dentro do pet e não na tela',async()=>{
 const [app,css]=await Promise.all([read('app.js'),read('v73-correcao.css')]);
 assert.match(app,/\$\('#pet-wrap'\)\.insertAdjacentHTML\('beforeend'/);
 assert.match(app,/dataset\.bathing=String\(motion==='bath-sponge'/);
 assert.match(css,/#pet-wrap\[data-bathing="true"\] #pet-bath-bubbles/);
 assert.match(css,/#care-layer \.care-water,#care-layer \.care-foam\{display:none!important\}/);
});
test('V73: o temporizador visual atualiza a cada 4 segundos',async()=>{
 const s=await read('app.js');assert.match(s,/\},4_000\);/);
});
