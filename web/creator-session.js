/* Autosave independente do rascunho. O save V56 continua válido. */
import {OPTIONS,DEFAULT_APPEARANCE,SCENES,CUSTOM_PARTS,PART_PALETTE,MIN_PART_SCALE,MAX_PART_SCALE} from './core.js?v=58';
export function creatorKey(saveKey){return `${saveKey}.criacao`;}
export function saveCreatorSession(storage,key,draft,step,creatingNew){
 const payload={version:3,draft,step,creatingNew:!!creatingNew};
 storage.setItem(key,JSON.stringify(payload));return payload;
}
export function loadCreatorSession(storage,key){
 let payload;try{payload=JSON.parse(storage.getItem(key)||'null');}catch{return null;}
 if(!payload||![1,2,3].includes(payload.version)||typeof payload.draft!=='object'||Array.isArray(payload.draft))return null;
 const draft={...DEFAULT_APPEARANCE,scene:'garden'};
 for(const [k,choices] of Object.entries(OPTIONS)){
  if(choices.includes(payload.draft[k]))draft[k]=payload.draft[k];
 }
 if(SCENES.includes(payload.draft.scene))draft.scene=payload.draft.scene;
 for(const keyName of ['partSizes','partColors'])if(payload.draft[keyName]&&typeof payload.draft[keyName]==='object'&&!Array.isArray(payload.draft[keyName])){
  const source=payload.draft[keyName],accepted={};
  for(const key of CUSTOM_PARTS){
   const value=source[key];
   if(keyName==='partSizes'&&typeof value==='number'&&value>=MIN_PART_SCALE&&value<=MAX_PART_SCALE)accepted[key]=value;
   if(keyName==='partColors'&&Object.hasOwn(PART_PALETTE,value))accepted[key]=value;
  }
  draft[keyName]=accepted;
 }
 // A altura vertical é opcional: rascunhos antigos permanecem no centro.
 const offset=payload.draft.mouthOffset;
 if(Number.isInteger(offset)&&offset>=-8&&offset<=8)draft.mouthOffset=offset;
 // Reordenação V68: etapa salva nas V57–V67 aponta para a mesma ABA,
 // não para a posição numérica antiga. O rascunho e as escolhas são preservados.
 const lastStep=payload.version===3?16:15;
 const oldStep=Number.isInteger(payload.step)&&payload.step>=0&&payload.step<=lastStep?payload.step:0;
 const previousOrder=['scene','body','head','color','ears','eyes','snout','mouth','markings','hair','feet','tail','wings','accessory','outfit','shoes'];
 const currentOrder=['scene','color','mouth','body','head','ears','eyes','snout','markings','hair','feet','tail','wings','accessory','outfit','shoes'];
 const priorIndex=payload.version===1?(oldStep===15?0:oldStep+1):oldStep;
 const step=payload.version===3?oldStep:currentOrder.indexOf(previousOrder[priorIndex]);
 return {draft,step:Math.max(0,step),creatingNew:!!payload.creatingNew};
}
export function clearCreatorSession(storage,key){storage.removeItem(key);}
