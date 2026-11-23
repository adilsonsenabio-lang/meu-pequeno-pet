export const ACTION_GROUPS=[
  {id:'care',label:'Cuidados',icon:'food',actions:['food','water','bath','potty','injection']},
  {id:'comfort',label:'Bem-estar',icon:'sleep',actions:['sleep','love']},
  {id:'fun',label:'Diversão',icon:'star',actions:['play','activity-open']},
  {id:'style',label:'Visual',icon:'style',actions:['outfit-open','shoes-open','album-open']}
];

export function groupForAction(action){
  return ACTION_GROUPS.find(group=>group.actions.includes(action))?.id||null;
}

export function petCanFly(appearance){
  return Boolean(appearance?.wings&&appearance.wings!=='none');
}

export function nextAirStep(current,max=4){
  return Math.min(max,Math.max(0,Number(current)||0)+1);
}
