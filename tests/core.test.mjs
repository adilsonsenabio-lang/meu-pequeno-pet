import test from 'node:test';
import assert from 'node:assert/strict';
import {createSave,validateSave,hatch,advance,applyCare,beginSleep,restSleep,endSleep,maybeEvolve,NEEDS,needStatus} from '../web/core.js';
import {exportBackup,importBackup,persist,loadSave} from '../web/storage.js';
const START=100000;
const baby=()=>hatch(createSave(START),START).save;
class MemoryStorage{
  constructor(){this.data=new Map();}
  getItem(k){return this.data.get(k)??null;}
  setItem(k,v){this.data.set(k,String(v));}
  removeItem(k){this.data.delete(k);}
}
test('o estado inicial e o nascimento sao validos',()=>{
 const egg=createSave(START);assert.equal(egg.phase,'egg');assert.equal(validateSave(egg),true);
 const born=hatch(egg,START);assert.equal(born.changed,true);assert.equal(born.save.phase,'baby');assert.equal(validateSave(born.save),true);
});
test('as oito necessidades estao presentes e limitadas a 0..100',()=>{
 const s=baby();assert.equal(NEEDS.length,8);for(const key of NEEDS)assert.ok(s.needs[key]>=0&&s.needs[key]<=100);
});
test('alimentar no estado atual enche a barra em ate 100',()=>{
 const s=baby();const out=applyCare(s,'food',START+3001);assert.equal(out.save.needs.food,100);
 assert.equal(out.changed,true);assert.equal(validateSave(out.save),true);
});
test('a v54 permite alimentar de novo com comida alta e penaliza saude: comportamento original',()=>{
 const s={...baby(),needs:{...baby().needs,food:95,health:100}};
 const out=applyCare(s,'food',START+3001);assert.equal(out.changed,true);
 assert.equal(out.save.needs.food,100);assert.ok(out.save.needs.health<100);
});
test('V73: tempo ativo reduz todas as necessidades com taxas próprias',()=>{
 const s=baby();const out=advance(s,20000,START+20000,false);
 assert.ok(out.save.needs.food<78);assert.ok(out.save.needs.health<100);
});
test('o declinio das necessidades tem piso em 20 na v54',()=>{
 const s={...baby(),needs:{...baby().needs,food:20}};
 const out=advance(s,20000,START+20000,false);assert.equal(out.save.needs.food,20);
});
test('dormir recupera energia e acordar desliga o sono',()=>{
 const s={...baby(),needs:{...baby().needs,energy:38}};
 const asleep=beginSleep(s,START+3000);assert.equal(asleep.sleeping,true);
 const rested=restSleep(asleep,1000,START+4000);assert.equal(rested.needs.energy,39.3);
 assert.equal(endSleep(rested,START+4500).sleeping,false);
});
test('injeção recupera saude mesmo sem doenca: comportamento original',()=>{
 const s={...baby(),needs:{...baby().needs,health:36}};
 const out=applyCare(s,'injection',START+3001);assert.equal(out.save.needs.health,74);
});
test('evolucao ocorre a 5 minutos ativos e depois de mais 10',()=>{
 let s={...baby(),activeMs:5*60000};let result=maybeEvolve(s,START+500000);
 assert.equal(result.save.phase,'young');s={...result.save,activeMs:15*60000};result=maybeEvolve(s,START+1000000);assert.equal(result.save.phase,'adult');
});
test('backup e salvamento sao recuperaveis com validacao',()=>{
 const s=baby();const storage=new MemoryStorage();persist(s,storage);
 assert.equal(loadSave(storage).save.phase,'baby');const restored=importBackup(exportBackup(s));assert.deepEqual(restored,s);
});
test('relatorio da necessidade oferece 3 niveis',()=>{
 assert.equal(needStatus(80).level,3);assert.equal(needStatus(50).level,2);assert.equal(needStatus(20).level,1);
});
