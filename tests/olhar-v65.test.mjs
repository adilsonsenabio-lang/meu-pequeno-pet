import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pixelPet} from '../web/pixel-pet.js';
import {OPTIONS} from '../web/core.js';
import {easeGaze,clampGaze,EYE_RANGE} from '../web/eye-gaze-v65.js';
const c={p:'#5ecb83',s:'#a5ebc2',a:'#f2bf75'};
const base={ears:0,head:0,eyes:0,snout:0,mouth:0,markings:-1,hair:-1,feet:0,tail:-1,wings:-1,accessory:-1,body:0};
test('V65: pupilas móveis estão dentro dos dois olhos na maior parte das opções abertas',()=>{
 let withPupils=0;
 OPTIONS.eyes.forEach((name,i)=>{
  const art=pixelPet({...base,eyes:i},c,{stage:'baby',mood:'happy'});
  const count=(art.match(/class="pixel-pupil"/g)||[]).length;
  assert.ok([0,2].includes(count),name+' '+count);
  if(count===2) {assert.match(art,/data-eye="left"/);assert.match(art,/data-eye="right"/);withPupils++;}
 });
 assert.ok(withPupils>=21,'móveis: '+withPupils);
});
test('V65: dormir mantém pálpebras fechadas, sem pupilas deslocando',()=>{
 const art=pixelPet({...base,eyes:0},c,{mood:'sleepy'});
 assert.doesNotMatch(art,/class="pixel-pupil"/);
});
test('V65: interpolação suave é gradual, limitada e converge para o alvo',()=>{
 let p={x:0,y:0};const target=clampGaze(99,-99);
 assert.deepEqual(target,{x:EYE_RANGE.x,y:-EYE_RANGE.y});
 p=easeGaze(p,target,50);
 assert.ok(p.x>0&&p.x<target.x);
 assert.ok(p.y<0&&p.y>target.y);
 for(let i=0;i<30;i++)p=easeGaze(p,target,80);
 assert.ok(Math.abs(p.x-target.x)<0.01);
 assert.ok(Math.abs(p.y-target.y)<0.01);
});
test('V65: CSS move apenas a pupila com transição; a cabeça tem transição própria',async()=>{
 const css=await readFile(new URL('../web/v65-olhos.css',import.meta.url),'utf8');
 const app=await readFile(new URL('../web/app.js',import.meta.url),'utf8');
 assert.match(css,/\.atelier-eyes \.pixel-pupil/);
 assert.match(css,/transition:transform \.25s/);
 assert.match(css,/\.atelier-head \{transition:transform \.32s/);
 assert.match(app,/eyeGaze=easeGaze/);
 assert.match(app,/startSceneGazeLoop\(\)/);
 assert.match(app,/status!=='ready'/);
});
