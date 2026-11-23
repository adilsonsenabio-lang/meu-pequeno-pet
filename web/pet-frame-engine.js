/** V56: aplica os 10 quadros do Pixel Art Studio às camadas reais do pet.
 * Mantém o SVG modular: novas cores, tamanhos, olhos, chifres, caudas e asas
 * continuam ligados à mesma cabeça/corpo durante as animações.
 */
import {PET_FRAMES,FRAME_MOTION,FRAME_FPS} from './pet-frames.js?v=58';
const instances=new WeakMap();
const controlled=['.pet-pose','.atelier-head','.atelier-tail','.pixel-wing-pose','.atelier-eyes','.atelier-eyes-shut','.atelier-eating-mouth'];
const loops=new Set(['idle','fly','sleep-rest','food-chew','drink','bath','play']);
const directions={fly:1,jump:1,land:1};
function reset(host){
 const old=instances.get(host);if(old){clearInterval(old.timer);instances.delete(host);}
 host.classList.remove('frame-animated');host.removeAttribute('data-sprite-frame');
 for(const selector of controlled){for(const node of host.querySelectorAll(selector)){
  for(const prop of ['transform','transform-origin','animation','opacity'])node.style.removeProperty(prop);
 }}
}
function apply(host,pose,motion,frame){
 const body=host.querySelector('.pet-pose');if(!body)return;
 host.dataset.spriteFrame=String(frame);host.classList.add('frame-animated');
 body.style.animation='none';body.style.transformOrigin='100px 185px';
 body.style.transform=`translateY(${pose.dy}px) scale(${pose.sx},${pose.sy})`;
 const head=host.querySelector('.atelier-head');if(head){head.style.animation='none';head.style.transformOrigin='100px 113px';head.style.transform=`rotate(${pose.head}deg)`;}
 const tail=host.querySelector('.atelier-tail');if(tail){tail.style.animation='none';tail.style.transformOrigin='133px 150px';tail.style.transform=`rotate(${pose.tail}deg)`;}
 for(const wing of host.querySelectorAll('.pixel-wing-pose')){wing.style.animation='none';wing.style.transformOrigin='55px 128px';wing.style.transform=`rotate(${pose.wing}deg)`;}
 if(['idle','sleep-rest','fly','jump','land'].includes(motion)){
  for(const eye of host.querySelectorAll('.atelier-eyes'))eye.style.opacity=pose.blink?'0':'1';
  for(const closed of host.querySelectorAll('.atelier-eyes-shut'))closed.style.opacity=pose.blink?'1':'0';
 }
 if(['food-bite','food-chew','eat','drink'].includes(motion)){
   for(const mouth of host.querySelectorAll('.atelier-eating-mouth'))mouth.style.opacity=pose.mouth?'1':'0';
 }
}
export function animatePetFrames(host,motion){
 if(!host)return;
 reset(host);
 const action=FRAME_MOTION[motion],frames=PET_FRAMES[action];if(!frames)return;
 let frame=0;
 apply(host,frames[0],motion,0);
 const loop=loops.has(motion),timer=setInterval(()=>{
  if(document.hidden||!host.isConnected)return;
  frame=loop?(frame+1)%10:Math.min(9,frame+1);
  apply(host,frames[frame],motion,frame);
 },1000/FRAME_FPS);
 instances.set(host,{timer,motion});
}
export function stopPetFrames(host){if(host)reset(host);}
