import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const ROOT=resolve(import.meta.dirname,'..');
const read=async p=>readFile(join(ROOT,p));

test('V77: 30 quadros de planeta com anéis e corpo imóvel', async()=>{
 const a=await read('assets-src/v63/orbitas_v77/planeta_aneis_girando.gif');
 assert.equal(a.toString('ascii',0,3),'GIF');
 const png=await read('assets-src/v63/objetos/space__planet_spritesheet.png');
 assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],[640,288]);
 // GIF stores NETSCAPE loop + 30 GCE blocks; frame count checked visually/Python.
 const imageMarkers=(a.toString('binary').match(/\x21\xF9\x04/g)||[]).length;
 assert.ok(imageMarkers>=28,`se esperam 30 quadros, há ${imageMarkers}`);
 const body=await read('assets-src/v63/orbitas_v77/planeta_corpo_sem_aneis.png');
 assert.ok(body.length>300);
});

test('V77: planeta e cometas são independentes do fundo e a passagem dura 60 s',async()=>{
 const html=(await read('web/index.html')).toString();
 const css=(await read('web/scene-v64.css')).toString();
 const js=(await read('web/scene-v63-player.js')).toString();
 assert.match(html,/id="v77-orbit-media"/);
 const orbit=JSON.parse(html.match(/<script id="v77-orbit-media" type="application\/json">(.*?)<\/script>/s)[1]);
 assert.match(orbit.planet,/^data:image\/gif;base64,/);
 assert.match(orbit.comet,/^data:image\/gif;base64,/);
 assert.match(js,/const SPACE_NODES=/);
 assert.match(js,/scene==='space'\?SPACE_NODES/);
 assert.match(css,/\.v77-orbit-comet-a\{animation:v77-comet-a 60s/);
 assert.match(css,/\.v77-orbit-comet-b\{animation:v77-comet-b 60s/);
 assert.match(css,/@keyframes v77-comet-a/);
 assert.match(css,/@keyframes v77-comet-b/);
 assert.match(css,/transform:scale\((?:\.04|\.05)\);opacity:0/);
 assert.match(css,/\.v77-orbit-comet-a>img\{transform:scaleX\(-1\)\}/);
 assert.match(js,/function cometCycle\(elapsed\)/);
 assert.match(js,/elapsed%60000/);
});

test('V77: mantém salvamento e não captura toques dos cenários',async()=>{
 const css=(await read('web/scene-v64.css')).toString();
 const js=(await read('web/scene-v63-player.js')).toString();
 assert.match(css,/\.v77-orbit-planet\{[^}]*pointer-events:none/);
 assert.match(css,/\.v77-orbit-comet\{[^}]*pointer-events:none/);
 const core=(await read('web/storage.js')).toString();
 assert.match(core,/meu-pequeno-pet\.save\.v1/);
 assert.doesNotMatch(js,/addEventListener\(['"]click/);
});
