import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join,dirname} from 'node:path';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const read=async(path)=>readFile(join(root,path),'utf8');
const bytes=async(path)=>readFile(join(root,path));
test('V84.4 - approved Snow and Space are embedded without other remakes',async()=>{
 const html=await read('web/index.html');
 const m=html.match(/<script id="v64-scene-media" type="application\/json">([\s\S]*?)<\/script>/);
 assert.ok(m,'v64 media');
 const scenes=JSON.parse(m[1]);
 assert.equal(Object.keys(scenes).length,13);
 for(const key of ['snow','space','christmas']){
  assert.ok(scenes[key]?.gif.startsWith('data:image/gif;base64,'));
  const gif=Buffer.from(scenes[key].gif.split(',')[1],'base64');
  assert.equal(gif.subarray(0,3).toString('ascii'),'GIF');
  assert.equal(gif.readUInt16LE(6),320);
  assert.equal(gif.readUInt16LE(8),320);
 }
});
test('V84.4 - original approved illustrations and original sprite frames are included',async()=>{
 for(const name of ['neve_aprovada_1448x1086.png','espaco_aprovado_1448x1086.png']){
   const data=await bytes(`assets-src/v84_4_aprovados/${name}`);
   assert.ok(data.length>400000);
 }
 for(const sprite of ['snow__snowman_spritesheet_v84_4.png','snow__pine_spritesheet_v84_4.png']){
   const data=await bytes(`assets-src/v63/objetos/${sprite}`);
   assert.equal(data.subarray(1,4).toString('ascii'),'PNG');
   assert.equal(data.readUInt32BE(16),640);
   assert.equal(data.readUInt32BE(20),288);
 }
});
test('V84.4 - Space rings and meteor cycle have no baked duplicate assets',async()=>{
 const js=await read('web/scene-v63-player.js');const css=await read('web/scene-v64.css');
 assert.match(js,/scene==='space'\?SPACE_NODES/);
 assert.match(js,/class="v77-orbit-planet"/);
 assert.match(js,/v77-orbit-comet-a/);
 assert.match(js,/v77-orbit-comet-b/);
 assert.match(css,/v77-comet-a 60s linear infinite/);
 assert.match(css,/v77-comet-b 60s linear infinite/);
 assert.match(js,/25800\/1\.4/);
});
test('V84.4 - Christmas sleigh uses independent action GIF and 30 seconds off screen',async()=>{
 const js=await read('web/scene-v63-player.js'); const html=await read('web/index.html');const css=await read('web/scene-v64.css');
 assert.match(html,/id="v844-sleigh"/);
 assert.match(js,/scene==='christmas'\?SLEIGH_NODES/);
 assert.match(css,/\.v844-sleigh\{[^}]*v844-sleigh-trip 60s/);
 assert.match(css,/15%,64%\{left:110%;top:9%;transform:scaleX\(1\);opacity:0\}/);
 assert.match(css,/65%\{left:110%;top:9%;transform:scaleX\(-1\);opacity:1\}/);
 const gif=await bytes('assets-src/v84_remakes/christmas_sleigh_v84_4.gif');assert.ok(gif.length>1000);
});
