import {createSave,validateSave,VERSION} from './core.js?v=58';
import {mirrorNativeValue,removeNativeValue} from './native-storage.js?v=58';
export const SAVE_KEY='meu-pequeno-pet.save.v1';
const withHealth=save=>save?.needs&&save.needs.health===undefined?{...save,needs:{...save.needs,health:100}}:save;
export function loadSave(storage=localStorage,now=Date.now(),key=SAVE_KEY){
  const raw=storage.getItem(key);
  if(!raw)return {save:null,recovered:false};
  try{const parsed=withHealth(JSON.parse(raw));if(validateSave(parsed))return {save:parsed,recovered:false};}catch{}
  try{storage.setItem(`${key}.invalid.${now}`,raw);}catch{}
  storage.removeItem(key);
  return {save:null,recovered:true};
}
export function persist(save,storage=localStorage,key=SAVE_KEY){
  if(!validateSave(save))throw new Error('Estado inválido: salvamento cancelado');
  const value=JSON.stringify(save);storage.setItem(key,value);void mirrorNativeValue(key,value);
}
export function exportBackup(save){
  if(!validateSave(save))throw new Error('Estado inválido');
  return JSON.stringify({format:'meu-pequeno-pet-backup',version:VERSION,exportedAt:new Date().toISOString(),save},null,2);
}
export function importBackup(text){
  const data=JSON.parse(text);
  const save=withHealth(data?.save);
  if(data?.format!=='meu-pequeno-pet-backup'||data.version!==VERSION||!validateSave(save))throw new Error('Arquivo de backup inválido ou incompatível');
  return save;
}
export function resetSave(storage=localStorage,key=SAVE_KEY){storage.removeItem(key);void removeNativeValue(key);return createSave();}
