export const NEED_VOICE_THRESHOLD=70;
export const NEED_VOICE_SECOND_DELAY_MS=5_000;
export const NEED_VOICE_REPEAT_MS=15_000;

const NEED_ORDER=['food','water','clean','potty','energy','affection','fun'];

export function voiceNeed(needs){
  if(!needs)return null;
  return NEED_ORDER
    .filter(key=>Number.isFinite(needs[key])&&needs[key]<=NEED_VOICE_THRESHOLD)
    .reduce((lowest,key)=>lowest===null||needs[key]<needs[lowest]?key:lowest,null);
}

export function emptyVoiceSchedule(){return {need:null,cycleAt:0,take:0};}

// Retorna no máximo uma fala por verificação. Isso impede vozes sobrepostas
// quando mais de uma necessidade estiver baixa.
export function nextNeedVoice(schedule,needs,now){
  const need=voiceNeed(needs);
  if(!need)return {schedule:emptyVoiceSchedule(),event:null};
  if(schedule.need!==need)return {schedule:{need,cycleAt:now,take:1},event:{need,take:1}};
  if(now>=schedule.cycleAt+NEED_VOICE_REPEAT_MS){
    return {schedule:{need,cycleAt:now,take:1},event:{need,take:1}};
  }
  if(schedule.take===1&&now>=schedule.cycleAt+NEED_VOICE_SECOND_DELAY_MS){
    return {schedule:{...schedule,take:2},event:{need,take:2}};
  }
  return {schedule,event:null};
}
