import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const read=async p=>readFile(path.join(root,p));
const text=async p=>(await read(p)).toString();
const html=await text('web/index.html');
const media=JSON.parse(html.match(/<script id="v64-scene-media" type="application\/json">(.*?)<\/script>/s)[1]);
const pngSize=b=>[b.readUInt32BE(16),b.readUInt32BE(20)];
const digest=v=>createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(v).sort()))).digest('hex');
test('V84.3: os demais 11 cenários mantêm a mídia idêntica à V84.2',async()=>{
 assert.equal(Object.keys(media).length,13);
 const expected=JSON.parse(await text('assets-src/v84_3_baseline_scene_hashes.json'));
 assert.equal(Object.keys(expected).length,11);
 for(const [name,sha] of Object.entries(expected))assert.equal(digest(media[name]),sha,name);
});
test('V84.3: praia e deserto têm novas imagens e GIFs completos',async()=>{
 for(const scene of ['beach','desert']){
  for(const k of ['gif','preview'])assert.match(media[scene][k],/^data:image\/gif;base64,/);
  assert.match(media[scene].still,/^data:image\/png;base64,/);
  const png=Buffer.from(media[scene].still.split(',')[1],'base64');
  assert.equal(png.subarray(1,4).toString(),'PNG');
  assert.deepEqual(pngSize(png),[320,320]);
  const gif=Buffer.from(media[scene].gif.split(',')[1],'base64');
  assert.match(gif.subarray(0,6).toString(),/^GIF89a$/);
  assert.ok(gif.length>10000);
  for(let frame=0;frame<40;frame++){
   const f=String(frame).padStart(2,'0');
   await access(path.join(root,'assets-src/v63/quadros',scene,`${f}.png`));
   await access(path.join(root,'assets-src/v63/quadros',scene,`${f}_pet.png`));
  }
 }
});
test('V84.3: coqueiro, gaivota, caranguejo, calango, cacto e planta mantêm spritesheets',async()=>{
 for(const name of ['beach__palm','beach__gull','beach__crab','desert__cactus','desert__lizard','desert__tumbleweed']){
  const png=await read(`assets-src/v63/objetos/${name}_spritesheet.png`);
  assert.deepEqual(pngSize(png),[640,288],name);
 }
});
test('V84.3: imports, título e cache atualizados; cuidado e salvamento presentes',async()=>{
 assert.match(html,/Meu Pequeno Pet V84\.3/);
 assert.match(html,/app\.js\?v=84\.3/);
 const app=await text('web/app.js');
 assert.match(app,/scene-v63-player\.js\?v=84\.3/);
 assert.match(app,/doCare/);
 const player=await text('web/scene-v63-player.js');
 assert.match(player,/scene-v63-data\.js\?v=84\.3/);
 assert.match(player,/scene-assets-v63\.js\?v=84\.3/);
 const sw=await text('web/sw.js');
 assert.match(sw,/meu-pequeno-pet-v84-3/);
});
