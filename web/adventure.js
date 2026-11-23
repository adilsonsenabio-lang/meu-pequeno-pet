// A aventura mantém apenas estado temporário; interromper não altera o progresso.
export function adventureStep(state,action){
 if(state==='path'&&['left','right'].includes(action))return 'water';
 if(state==='water'&&action==='water')return 'flower';
 if(state==='flower'&&action==='flower')return 'match';
 if(state==='match'&&action==='star')return 'celebrate';
 return state;
}
