import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CUSTOM_PARTS,OPTIONS} from '../web/core.js';
const read=name=>readFile(new URL('../web/'+name,import.meta.url),'utf8');
test('V70: somente categorias com ajustes recebem 2 fileiras internas',async()=>{
 const [app,css]=await Promise.all([read('app.js'),read('v70-criacao-compacta.css')]);
 assert.deepEqual([...CUSTOM_PARTS].sort(),['accessory','ears','eyes','mouth','snout','tail','wings'].sort());
 assert.match(app,/list\.classList\.toggle\('two-row-options',CUSTOM_PARTS\.includes\(c\.key\)\)/);
 assert.match(css,/#create-screen #choice-list\.two-row-options/);
 assert.match(css,/max-height:calc\(var\(--row-height\)\*2 \+ var\(--row-gap\)\)/);
 assert.match(css,/overflow-y:auto/);
 assert.match(css,/overscroll-behavior-y:contain/);
 assert.match(css,/#create-screen \.creator-adjust/);
 assert.match(css,/\.game-root:has\(#create-screen:not\(\[hidden\]\)\)/);
});
test('V70: escolhas mantêm o scroll da lista e sliders mantêm seus limites originais',async()=>{
 const [app,html]=await Promise.all([read('app.js'),read('index.html')]);
 assert.match(app,/const previousScroll=list\.dataset\.category===c\.key\?list\.scrollTop:0/);
 assert.match(app,/list\.scrollTop=previousScroll/);
 assert.match(html,/id="part-size"[^>]*min="0\.85" max="1\.2" step="0\.05"/);
 assert.match(html,/id="mouth-height"[^>]*min="-8" max="8" step="2"/);
 assert.ok(OPTIONS.eyes.length>8&&OPTIONS.mouth.length>8);
});
test('V70: CSS compacto é último, atualiza cache e deixa miniaturas de cenário animadas',async()=>{
 const [html,sw]=await Promise.all([read('index.html'),read('sw.js')]);
 assert.match(html,/v69-boca\.css\?v=69"[^]*v70-criacao-compacta\.css\?v=70/);
 assert.match(html,/app\.js\?v=(?:70|74|75|77|80)/);
 assert.match(sw,/meu-pequeno-pet-v(?:74|75|77|80)/);assert.match(html,/v73-correcao\.css\?v=73/);
 const assets=JSON.parse(sw.match(/const ASSETS=(\[[\s\S]*?\]);/)[1]);
 assert.ok(assets.includes('./v70-criacao-compacta.css?v=70'));
 assert.ok(assets.includes('./app.js?v=80'));
 assert.match(html,/id="v64-scene-media"/);
});
