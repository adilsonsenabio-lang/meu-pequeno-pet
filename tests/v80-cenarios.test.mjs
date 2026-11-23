import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {join} from 'node:path';
const R=process.cwd();
const A=join(R,'assets-src/v63');
const W=join(R,'web');
const read=(p)=>readFile(join(R,p),'utf8');
const pngSize=async(p)=>{const b=await readFile(p);assert.equal(b.subarray(1,4).toString(),'PNG');return [b.readUInt32BE(16),b.readUInt32BE(20)];};
const manifest=JSON.parse(await read('assets-src/v63/manifesto.json'));
test('V80: os quatro remakes animados estão no catálogo em spritesheets de 10 quadros',async()=>{
 for(const name of ['beach__palm','beach__gull','sunset__windmill','sunset__birds']){
  const x=manifest.objects[name];assert.equal(x.frames,10,name);assert.ok(x.different_frames>=8,name);
  assert.deepEqual(await pngSize(join(A,'objetos',name+'_spritesheet.png')),[640,288]);
  for(let i=0;i<10;i++)await access(join(A,'quadros',name,String(i).padStart(2,'0')+'.png'));
 }
});
test('V80: boneco de neve novo continua imóvel, com neve caindo no cenário',async()=>{
 assert.equal(manifest.objects['snow__snowman'].frames,1);
 assert.equal(manifest.objects['snow__snowman'].animated,false);
 assert.deepEqual(await pngSize(join(A,'objetos','snow__snowman_ESTATICO.png')),[128,144]);
 await access(join(A,'animacoes','snow_sem_pet.gif'));
});
test('V80: abóbora 25% menor conserva a âncora do chão',()=>{
 const p=manifest.objects['halloween__pumpkin'];
 assert.deepEqual(p.scene_size,[48,54]);
 assert.equal(p.scene_position[1]+p.scene_size[1],314);
});
test('V80: fantasma tem uma animação independente do fade lento',async()=>{
 const code=await read('web/scene-v63-player.js'),css=await read('web/scene-v64.css');
 const img=join(A,'animacoes/halloween__fantasma_10poses_v80.gif');
 const b=await readFile(img);assert.equal(b.subarray(0,3).toString(),'GIF');
 assert.match(code,/class="v64-scene-overlay v64-overlay-ghost" src="data:image\/gif;base64/);
 assert.match(css,/v64-ghost-minute 15s/);
 assert.equal(manifest.objects['halloween__ghost'].different_frames,10);
});
test('V80: cometa é 40% mais rápido sem encurtar o ciclo completo de um minuto',async()=>{
 const [c,j]=await Promise.all([read('web/scene-v64.css'),read('web/scene-v63-player.js')]);
 assert.match(c,/v77-comet-a 60s linear infinite/);
 assert.match(c,/v77-comet-b 60s linear infinite/);
 assert.match(c,/30\.72%,100%/);
 assert.match(c,/80\.72%,100%/);
 assert.match(j,/const travel=25800\/1\.4/);
 assert.match(j,/elapsed%60000/);
});
test('V80: os quatro cenários receberam mídia inline e meta para o olhar automático',async()=>{
 const html=await read('web/index.html');
 const obj=JSON.parse(html.match(/<script id="v64-scene-media" type="application\/json">([\s\S]*?)<\/script>/)[1]);
 for(const scene of ['snow','beach','sunset','halloween']){
  assert.match(obj[scene].gif,/^data:image\/gif;base64,/);
  assert.match(obj[scene].preview,/^data:image\/gif;base64,/);
  await access(join(A,'cenarios',scene+'_sem_pet.png'));
 }
 assert.match(html,/app\.js\?v=80/);
 const sw=await read('web/sw.js');assert.match(sw,/meu-pequeno-pet-v80/);
});
