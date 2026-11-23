import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const read = name=>readFile(new URL('../web/'+name,import.meta.url),'utf8');
test('V66: Dashboard tem sete cuidados acionáveis e diversão apenas informativa',async()=>{
 const app=await read('app.js');
 assert.match(app,/need-indicator-readonly/);
 assert.match(app,/type==='play'\?'div'/);
 assert.match(app,/openDiversao/);
 assert.match(app,/button type="button"/);
 assert.match(app,/\$\('#needs-dashboard'\)\.addEventListener\('click'/);
 assert.match(app,/void doCare\(type\)/);
});
test('V59.2: Menu inferior só desenha Diversão e Visual',async()=>{
 const app=await read('app.js');
 assert.match(app,/ACTION_GROUPS\.filter\(group=>\['fun','style'\]\.includes\(group\.id\)\)/);
 assert.match(app,/function syncNeedButtons\(\)/);
});
test('V59.2: Indicadores são quatro por linha, grandes e não transbordam',async()=>{
 const css=await read('retro.css');
 assert.match(css,/#needs-dashboard\.needs-dashboard\{grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);
 assert.match(css,/#action-groups\.action-groups\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/#needs-dashboard \.need-indicator\{[^}]*min-height:82px/);
});
test('V59.2: botão Sono vira Acordar e as ações são bloqueadas enquanto o pet está ocupado',async()=>{
 const app=await read('app.js');
 assert.match(app,/sleeping\?'#i-wake':'#i-sleep'/);
 assert.match(app,/button\.disabled=Boolean\(save\?\.phase==='egg'/);
 assert.match(app,/if\(type==='sleep'&&status==='sleeping'\)/);
});
