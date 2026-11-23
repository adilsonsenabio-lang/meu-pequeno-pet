// Alvos pequenos e visíveis para o olhar espontâneo do pet. Um por cenário.
const bird='<path d="M3 15h5v-4h5V8h6v3h6v3h6v-3h6V8h5v3h5v4h-6v3h-7v-3h-8v5h-6v-5h-8v3H9v-3Z" fill="#314b69"/><path class="life-wing" d="M10 11V5h6v6m17 0V5h6v6" fill="#8bb6ca"/><rect x="25" y="12" width="2" height="2" fill="#fff"/>';
const fish='<path d="M9 17 3 9v16l6-8Zm0-7h22l8 7-8 7H9l-5-7Z" fill="#f7b878" stroke="#375b7d" stroke-width="3"/><rect x="27" y="14" width="3" height="3" fill="#263c5a"/><path class="life-fin" d="M14 9 21 3l7 7" fill="#f290a0" stroke="#375b7d" stroke-width="2"/>';
const butterfly='<path class="life-wing" d="M23 17Q6 -1 4 13q-2 12 18 10Q9 37 6 28q-2-10 17-11Z" fill="#f3a8ce" stroke="#655080" stroke-width="2"/><path class="life-wing" d="M25 17Q42 -1 44 13q2 12-18 10 13 14 16 5 2-10-17-11Z" fill="#f3a8ce" stroke="#655080" stroke-width="2"/><rect x="23" y="13" width="3" height="18" fill="#4b496a"/>';
const sparkle='<path d="M23 3h3v12h11v3H26v12h-3V18H12v-3h11Z" fill="#fff2aa"/><rect x="5" y="6" width="3" height="3" fill="#fff"/><rect x="39" y="30" width="3" height="3" fill="#fff"/>';
const snow='<path d="M23 4h3v28h-3ZM10 17h29v3H10Zm4-10 21 21-2 2L12 9Zm20 0L13 30l-2-2L32 7Z" fill="#f4fbff" stroke="#80a6c2" stroke-width="1"/>';
const bat='<path d="M4 20h7v-5h7l6 8 6-8h7v5h7v6h-9v-4h-7l-4 4-4-4h-7v4H4Z" fill="#7b698d" stroke="#34324c" stroke-width="2"/>';
const steam='<path d="M13 33v-6h4v-7h-4v-6h4V7m13 26v-6h4v-7h-4v-6h4V7" fill="none" stroke="#f9f5db" stroke-width="4"/>';
export const SCENE_LIFE={garden:{kind:'bird',art:bird},sunset:{kind:'bird',art:bird},night:{kind:'star',art:sparkle},beach:{kind:'crab',native:true},clouds:{kind:'bird',art:bird},forest:{kind:'butterfly',art:butterfly},snow:{kind:'snow',art:snow},space:{kind:'star',art:sparkle},sea:{kind:'fish',art:fish},halloween:{kind:'bird',art:bat},christmas:{kind:'snow',art:snow},bedroom:{kind:'butterfly',art:butterfly},kitchen:{kind:'steam',art:steam}};
export function sceneLifeMarkup(scene){const life=SCENE_LIFE[scene]||SCENE_LIFE.garden;if(life.native)return '';return `<span class="scene-life scene-life-${life.kind}" aria-hidden="true"><svg viewBox="0 0 48 40" shape-rendering="crispEdges">${life.art}</svg></span>`;}
export function gazeOffset(targetX,targetY,petX,worldWidth,worldTop,worldHeight){
 const horizontal=Math.max(-1,Math.min(1,(targetX-petX)/(worldWidth*.32)));
 const vertical=Math.max(-1,Math.min(1,(targetY-(worldTop+worldHeight*.65))/(worldHeight*.4)));
 return {eyeX:Math.round(horizontal*3),eyeY:Math.round(vertical*2),headAngle:Math.round(horizontal*8),headLift:vertical<-.25?-4:vertical>.65?3:0};
}
