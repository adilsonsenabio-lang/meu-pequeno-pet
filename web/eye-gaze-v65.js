// V65: filtro exponencial estável, mantém pupila dentro do contorno da íris.
export const EYE_RANGE=Object.freeze({x:2.4,y:1.7});
export const clampGaze=(x,y)=>({x:Math.max(-EYE_RANGE.x,Math.min(EYE_RANGE.x,Number(x)||0)),y:Math.max(-EYE_RANGE.y,Math.min(EYE_RANGE.y,Number(y)||0))});
export function easeGaze(state,target,elapsedMs){
 const point=clampGaze(target?.x,target?.y);
 const t=Math.min(200,Math.max(0,Number(elapsedMs)||0));
 const factor=1-Math.exp(-t/130);
 return {x:state.x+(point.x-state.x)*factor,y:state.y+(point.y-state.y)*factor};
}
