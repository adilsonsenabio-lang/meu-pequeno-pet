import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createSave,hatch,advance,applyCare,restSleep,beginSleep,validateSave,NEEDS,NEED_DECAY_PER_SECOND,NEED_DECAY_MULTIPLIER,MIN_ENERGY_TO_PLAY,canPlay} from '../web/core.js';
const b=()=>hatch(createSave(100000),100000).save;
const approx=(a,b)=>assert.ok(Math.abs(a-b)<0.000001,`${a} != ${b}`);
const source=name=>readFile(new URL('../web/'+name,import.meta.url),'utf8');
test('V74: desgaste das sete necessidades é exatamente 35% maior que V73, mais saúde',()=>{
 assert.equal(NEED_DECAY_MULTIPLIER,1.35);
 const start=b(),duration=10000;const next=advance(start,duration,110000,false).save;
 for(const [key,rate] of Object.entries(NEED_DECAY_PER_SECOND))approx(start.needs[key]-next.needs[key],rate*1.35*10);
 approx(start.needs.health-next.needs.health,.010*1.35*10);
 const unhealthy={...start,needs:{...start.needs,energy:25,health:90}};
 const worsened=advance(unhealthy,duration,110000,false).save;
 approx(unhealthy.needs.health-worsened.needs.health,.045*1.35*10);
 assert.equal(validateSave(next),true);
});
test('V74: só pode brincar a partir de 30% de energia e sem dormir',()=>{
 assert.equal(MIN_ENERGY_TO_PLAY,30);
 for(const e of [0,20,29,29.99]){
  const save={...b(),needs:{...b().needs,energy:e}};
  assert.equal(canPlay(save),false);
  const result=applyCare(save,'play',105000);
  assert.equal(result.changed,false);assert.equal(result.reason,'low-energy');assert.equal(result.save,save);
 }
 const enough={...b(),needs:{...b().needs,energy:30}};
 assert.equal(canPlay(enough),true);
 const result=applyCare(enough,'play',105000);
 assert.equal(result.changed,true);assert.equal(result.save.needs.fun,100);
 assert.equal(result.save.needs.energy,20);
 assert.equal(canPlay(result.save),false,'energy drains when playing');
 const finished=applyCare({...enough,needs:{...enough.needs,energy:29}},'play',105000,true);
 assert.equal(finished.changed,true,'play started with enough energy can finish even if energy fell during activity');
 const sleeping=beginSleep(enough,101000);
 assert.equal(canPlay(sleeping),false);
});
test('V74: a disponibilidade é recalculada ao cair a energia e depois de acordar',()=>{
 const ready={...b(),needs:{...b().needs,energy:30.5}};
 assert.equal(canPlay(ready),true);
 const after=advance(ready,10000,110000,false).save;
 assert.equal(canPlay(after),false);
 const sleeping=beginSleep(after,111000);
 const rested=restSleep(sleeping,10000,121000); // intervalos acima de 5s não acumulam por design
 assert.equal(rested,sleeping);
 const resting=restSleep(sleeping,5000,116000);
 assert.equal(resting.needs.energy>after.needs.energy,true);
 assert.equal(canPlay({...resting,sleeping:false,needs:{...resting.needs,energy:35}}),true);
});
test('V74: os oito indicadores continuam com limites, sem desgaste ao minimizar',()=>{
 const s=b();assert.equal(advance(s,5*60*1000,400000,false).save,s);
 const next=advance(s,20000,120000,false).save;
 for(const key of NEEDS)assert.ok(next.needs[key]>=0&&next.needs[key]<=100);
});
test('V74: interface bloqueia botão Diversão, brinquedos e atividades com pouca energia',async()=>{
 const s=await source('app.js');
 assert.match(s,/function updatePlayAvailability/);
 assert.match(s,/\[data-action-group="fun"\],#activity-open/);
 assert.match(s,/function openDiversao\(\)[\s\S]*?if\(!canPlay\(save\)\)/);
 assert.match(s,/async function launchActivity\(key\)[\s\S]*?if\(!canPlay\(save\)\)/);
 assert.match(s,/async function doCare\(type\)[\s\S]*?type==='play'&&!canPlay\(save\)/);
 assert.match(s,/function drawNeeds\(\)[\s\S]*?updatePlayAvailability\(\)/);
});
