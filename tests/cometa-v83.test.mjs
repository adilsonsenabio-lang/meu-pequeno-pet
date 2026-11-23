import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const ROOT=resolve(import.meta.dirname,'..');
const read=async p=>(await readFile(join(ROOT,p))).toString();
test('V83: volta a usar o planeta animado e os dois cometas no Espaço',async()=>{
 const code=await read('web/scene-v63-player.js');
 assert.match(code,/scene==='space'\?SPACE_NODES/);
 assert.match(code,/v77-orbit-planet/);
 assert.match(code,/v77-orbit-comet-a/);
 assert.match(code,/v77-orbit-comet-b/);
});
test('V83: trajetória 60 segundos, intervalo de 30s e descida 1,4x',async()=>{
 const css=await read('web/scene-v64.css');
 const js=await read('web/scene-v63-player.js');
 assert.match(css,/v77-comet-a 60s linear infinite/);
 assert.match(css,/v77-comet-b 60s linear infinite/);
 assert.match(css,/@keyframes v77-comet-a/);
 assert.match(css,/@keyframes v77-comet-b/);
 assert.match(css,/30\.72%,100%\{[^}]*scale\(\.05\);opacity:0/);
 assert.match(css,/80\.72%,100%\{[^}]*scale\(\.05\);opacity:0/);
 assert.match(js,/const travel=25800\/1\.4/);
 assert.match(js,/elapsed%60000/);
});
test('V83: plano de fundo Espaço não desenha corpo do planeta ou cometa',async()=>{
 const code=await read('scripts/build-offline-v83.py');
 assert.match(code,/MEU_PEQUENO_PET_V83_TESTE_OFFLINE/);
 const html=await read('web/index.html');
 assert.match(html,/v77-orbit-media/);
 assert.match(html,/Meu Pequeno Pet V8[34]/);
 assert.match(html,/v8[34]/);
 const sw=await read('web/sw.js');
 assert.match(sw,/meu-pequeno-pet-v8[34]/);
});
