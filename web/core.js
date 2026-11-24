export const VERSION=1;
export const NEEDS=['food','water','clean','potty','energy','affection','fun','health'];
export const NEED_DECAY_PER_SECOND=Object.freeze({food:.11,water:.12,clean:.075,potty:.09,energy:.095,affection:.08,fun:.11});
// O ritmo dos cuidados é independente da perda passiva de saúde.
export const NEED_DECAY_MULTIPLIER=2;
// Energia tem piso de 20% no desgaste, portanto exigir 30% permite bloqueio real.
export const MIN_ENERGY_TO_PLAY=30;
export const CARE={
  food:{need:'food',gain:26,side:{potty:-12}},
  water:{need:'water',gain:27,side:{potty:-8}},
  bath:{need:'clean',gain:32},
  potty:{need:'potty',gain:32},
  sleep:{need:'energy',gain:30},
  love:{need:'affection',gain:25},
  play:{need:'fun',gain:27,side:{energy:-10,water:-5,clean:-10}},
  injection:{need:'health',gain:38}
};
export const OPTIONS={
  shoes:['none','shoes','sneakers','heels','boots','slippers','sandals','rainboots','rollers','highTops','ballet','flipflops','loafers','snowboots'],
  outfit:['none','dress','overalls','vest','cardigan','sailor','pajamas','hoodie','raincoat','kimono','princess','superhero','pirate','astronaut','bee','wizardrobe','winter','chef','sport','flower','dinosaur'],
  color:['pink','blue','green','yellow','purple','orange','red','mint','white'],
  tail:['cat','dog','pompom','dragon','fish','fox','peacock','flame','leaf','none'],
  wings:['dragon','angel','fairy','bat','phoenix','tiny','butterfly','fin','none'],
  body:['egg','round','slim','chubby','tall','short','pear','drop'],
  feet:['round','claws','hooves','duck','boots','flipper','paws','bird'],
  hands:['drop','bear','star','fan','shell','fist','heart','dragon'],
  ears:['cat','dog','bunny','bear','horns','unicorn','antlers','elf','bat','mouse','antenna','ram','fox','floppy','spiky','deer','none'],
  head:['round','wide','tall','square','cheeks','heart','fox','mini'],
  markings:['blush','spots','stripes','freckles','forehead','swirl','brows','tuxedo','bolt','confetti','whiskers','bandage','plain'],
  hair:['mane','tuft','curls','bangs','spikes','leaf','pigtails','plumes','none'],
  eyes:['big','dots','cat','sleepy','happy','star','heart','angry','wink','wide','sparkle','oval','square','diamond','crescent','lashes','shy','robot','rainbow','galaxy','teary','tiny','tall','sleepywide','gem'],
  snout:['button','cat','dog','beak','dragon','pig','grin','bunny','mouse','trunk','cat3','tongue','short','long','wide','heart','whiskers','whiskerslong','whiskerscurled','whiskersdots','foxy','bunnywhiskers'],
  mouth:['smile','open','cat','heart','surprised','teeth','tongue','serious','grin','smirk','kiss','wave','tiny','fangs','laugh','pout','soft','none'],
  accessory:['star','crown','halo','bow','party','glasses','flower','bell','sunglasses','none']
};
export const DEFAULT_APPEARANCE={color:'pink',outfit:'none',shoes:'none',tail:'dragon',wings:'none',body:'round',hands:'shell',feet:'claws',ears:'horns',head:'round',markings:'plain',hair:'none',eyes:'big',snout:'dragon',mouth:'smile',accessory:'star'};
export const SCENES=['garden','sunset','night','beach','desert','clouds','forest','snow','space','sea','halloween','christmas'];
export const ROOM_OPTIONS={bed:['cloud','leaf','moon'],rug:['sun','flower','rainbow'],toy:['ball','bubbles','kite','drum','car','rattle','book','plush','surprise','instrument'],wall:['lavender','mint','peach']};
export const MOMENTS=['birth','food','water','bath','play','young','adult','bedroom','kitchen','butterfly','ball','bubbles','decor','kite','drum','car','rattle','book','plush','surprise','instrument','flowers','stars','sequence','dance','paint','tidy','race','faces','rain','rainbow','night','snow','gift','party','costume'];
export const DISCOVERIES=['leafBed','flowerRug','youngPlay','adultGreeting','youngToys','adultToys','newRoom'];
export const AREAS=['garden','bedroom','kitchen'];
export const TOYS=['ball','bubbles','kite','drum','car','rattle','book','plush','surprise','instrument'];
export const TOY_STAGE={ball:'baby',bubbles:'baby',kite:'baby',drum:'baby',car:'baby',rattle:'baby',book:'young',plush:'young',surprise:'adult',instrument:'adult'};
export const ACTIVITIES=['adventure','peek','flowers','stars','sequence','dance','paint','tidy','race','faces'];
export const EVENTS=['rain','rainbow','night','snow','gift','party','costume'];
export const ACTIVITY_STAGE={adventure:'baby',peek:'baby',flowers:'baby',stars:'baby',dance:'baby',paint:'baby',sequence:'young',tidy:'young',race:'young',faces:'adult',rain:'baby',rainbow:'baby',night:'baby',snow:'young',gift:'young',party:'adult',costume:'adult'};
const LEGACY={eyes:['shades'],color:['snow','lilac','peach','sky'],ears:['round','leaf','pointed'],wings:['feather','petal'],tail:['curl','tuft'],markings:['dots','waves']};
const clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,n));
export function createSave(now=Date.now(),appearance=DEFAULT_APPEARANCE){
  return {version:VERSION,createdAt:now,updatedAt:now,phase:'egg',scene:'garden',area:'garden',room:{bed:'cloud',rug:'sun',toy:'ball',wall:'lavender'},moments:[],discoveries:[],name:'',appearance:{...appearance},needs:{...Object.fromEntries(NEEDS.map(n=>[n,80])),health:100},activeMs:0,careKinds:[],actionCount:0,lastActionAt:{},lastInteractionAt:now,milestones:[]};
}
export function canPlay(s){return Boolean(s&&s.phase!=='egg'&&!s.sleeping&&Number(s.needs?.energy)>=MIN_ENERGY_TO_PLAY);}
export const CUSTOM_PARTS=['tail','wings','ears','eyes','snout','mouth','accessory','hands'];
export const PART_PALETTE={base:null,pink:'#ff8fa8',blue:'#7fd3ff',mint:'#6fe0cf',gold:'#ffcf40',purple:'#c9a7ff',cream:'#fff4c9',brown:'#a8714a'};
export const MIN_PART_SCALE=.85,MAX_PART_SCALE=1.20;
// Posição vertical opcional da boca, em unidades do desenho SVG. Saves antigos: zero.
export const MIN_MOUTH_OFFSET=-8,MAX_MOUTH_OFFSET=8;
export function mouthOffset(value){return typeof value==='number'&&Number.isFinite(value)?Math.max(MIN_MOUTH_OFFSET,Math.min(MAX_MOUTH_OFFSET,Math.round(value))):0;}
export const HAND_POSITION_LIMITS={x:5,y:10};
export function handPosition(value){
 const position=(axis)=>Number.isFinite(value?.[axis])?clamp(Math.round(value[axis]),-HAND_POSITION_LIMITS[axis],HAND_POSITION_LIMITS[axis]):0;
 return {x:position('x'),y:position('y')};
}
export function validAppearance(a){
 if(!a||!Object.entries(OPTIONS).every(([key,values])=>a[key]===undefined?!['color','tail','wings','ears','markings','accessory'].includes(key):values.includes(a[key])||LEGACY[key]?.includes(a[key])))return false;
 if(a.partSizes!==undefined&&(!a.partSizes||typeof a.partSizes!=='object'||Array.isArray(a.partSizes)||Object.entries(a.partSizes).some(([k,v])=>!CUSTOM_PARTS.includes(k)||typeof v!=='number'||!Number.isFinite(v)||v<MIN_PART_SCALE||v>MAX_PART_SCALE)))return false;
 if(a.partColors!==undefined&&(!a.partColors||typeof a.partColors!=='object'||Array.isArray(a.partColors)||Object.entries(a.partColors).some(([k,v])=>!CUSTOM_PARTS.includes(k)||!Object.hasOwn(PART_PALETTE,v))))return false;
 if(a.mouthOffset!==undefined&&(!Number.isInteger(a.mouthOffset)||a.mouthOffset<MIN_MOUTH_OFFSET||a.mouthOffset>MAX_MOUTH_OFFSET))return false;
 if(a.handPosition!==undefined){
  const {x,y}=handPosition(a.handPosition);
  if(a.handPosition?.x!==x||a.handPosition?.y!==y)return false;
 }
 return true;
}
export function validateSave(s){
  if(!s||s.version!==VERSION||!['egg','baby','young','adult'].includes(s.phase)||!validAppearance(s.appearance))return false;
  if(s.scene!==undefined&&!SCENES.includes(s.scene))return false;
  if(s.area!==undefined&&!AREAS.includes(s.area))return false;
  if(s.decorations!==undefined&&(!Array.isArray(s.decorations)||s.decorations.length>20||!s.decorations.every(d=>d&&MOMENTS.includes(d.kind)&&AREAS.includes(d.area)&&Number.isFinite(d.x)&&d.x>=8&&d.x<=92&&Number.isFinite(d.y)&&d.y>=20&&d.y<=88)||MOMENTS.some(k=>s.decorations.filter(d=>d.kind===k).length>2)))return false;
  if(s.playToy!==undefined&&!TOYS.includes(s.playToy))return false;
  if(s.drawingColor!==undefined&&!OPTIONS.color.includes(s.drawingColor))return false;
  if(s.room!==undefined&&(!s.room||!['bed','rug','toy'].every(key=>ROOM_OPTIONS[key].includes(s.room[key]))||(s.room.wall!==undefined&&!ROOM_OPTIONS.wall.includes(s.room.wall))))return false;
  if(s.moments!==undefined&&(!Array.isArray(s.moments)||!s.moments.every(m=>MOMENTS.includes(m))||new Set(s.moments).size!==s.moments.length))return false;
  if(s.discoveries!==undefined&&(!Array.isArray(s.discoveries)||!s.discoveries.every(d=>DISCOVERIES.includes(d))||new Set(s.discoveries).size!==s.discoveries.length))return false;
  if(typeof s.name!=='string'||s.name.length>24)return false;
  if(!s.needs||!NEEDS.every(k=>k==='health'&&s.needs[k]===undefined||Number.isFinite(s.needs[k])&&s.needs[k]>=0&&s.needs[k]<=100))return false;
  if(!Number.isFinite(s.activeMs)||s.activeMs<0||!Number.isFinite(s.updatedAt)||!Number.isFinite(s.createdAt))return false;
  if(s.youngAtActiveMs!==undefined&&(!Number.isFinite(s.youngAtActiveMs)||s.youngAtActiveMs<0||s.youngAtActiveMs>s.activeMs))return false;
  if(s.sleeping!==undefined&&(typeof s.sleeping!=='boolean'||(s.sleeping&&s.phase==='egg')))return false;
  if(!Array.isArray(s.careKinds)||!s.careKinds.every(x=>Object.hasOwn(CARE,x))||!Array.isArray(s.milestones))return false;
  if(!Number.isInteger(s.actionCount)||s.actionCount<0||!s.lastActionAt||typeof s.lastActionAt!=='object')return false;
  if(!Number.isFinite(s.lastInteractionAt)||!Object.entries(s.lastActionAt).every(([key,value])=>Object.hasOwn(CARE,key)&&Number.isFinite(value)))return false;
  const allowedMilestones=['baby','young','adult'];
  if(!s.milestones.every(x=>allowedMilestones.includes(x))||new Set(s.milestones).size!==s.milestones.length)return false;
  const expected={egg:[],baby:['baby'],young:['baby','young'],adult:['baby','young','adult']}[s.phase];
  return expected.length===s.milestones.length&&expected.every((value,index)=>s.milestones[index]===value);
}
export function hatch(s,now=Date.now()){
  if(s.phase!=='egg')return {save:s,changed:false};
  return {save:{...s,phase:'baby',milestones:['baby'],moments:[...new Set([...(s.moments||[]),'birth'])],updatedAt:now,lastInteractionAt:now},changed:true};
}
export function advance(s,deltaMs,now=Date.now(),evolve=true){
  if(s.phase==='egg'||!Number.isFinite(deltaMs)||deltaMs<=0)return {save:s,evolved:false};
  // Credit only short intervals after a real interaction. Closing the page calls no advance.
  if(deltaMs>60_000)return {save:s,evolved:false};
  const elapsed=deltaMs;
  if(now<s.updatedAt)return {save:s,evolved:false};
  // V73: necessidades perceptíveis e independentes, em tempo ATIVO (não durante a minimização).
  const needs={...s.needs};
  for(const key of NEEDS){
    const current=needs[key]??100;
    // Saúde cai lentamente e piora se o pet estiver mal cuidado.
    const bad=['food','water','clean','energy'].some(need=>(s.needs[need]??100)<30);
    const perSecond=key==='health'?(bad?.06075:.0135):NEED_DECAY_PER_SECOND[key]*NEED_DECAY_MULTIPLIER;
    needs[key]=clamp(current-perSecond*elapsed/1000,key==='health'?0:20,100);
  }
  const next={...s,needs,activeMs:s.activeMs+elapsed,updatedAt:now};
  return evolve?maybeEvolve(next,now):{save:next,evolved:false};
}
export function applyCare(s,type,now=Date.now(),authorizedPlay=false){
  if(s.phase==='egg'||!Object.hasOwn(CARE,type))return {save:s,changed:false,evolved:false,reason:'unavailable'};
  if(type==='play'&&!authorizedPlay&&!canPlay(s))return {save:s,changed:false,evolved:false,reason:'low-energy'};
  const last=s.lastActionAt[type]??-Infinity;
  if(now>=last&&now-last<3_000)return {save:s,changed:false,evolved:false,reason:'cooldown'};
  const spec=CARE[type],needs={health:100,...s.needs};
  if((type==='food'||type==='water')&&needs[spec.need]>=90){
    const excess=needs[spec.need]-89;
    needs.health=clamp(needs.health-Math.max(8,Math.ceil(excess*.8)),20,100);
  }
  needs[spec.need]=clamp(needs[spec.need]+spec.gain);
  for(const [key,delta] of Object.entries(spec.side??{}))needs[key]=clamp(needs[key]+delta,20,100);
  const moment={food:'food',water:'water',bath:'bath',play:'play'}[type]||null;
  const next={...s,needs,moments:moment?[...new Set([...(s.moments||[]),moment])]:s.moments||[],careKinds:[...new Set([...s.careKinds,type])],actionCount:s.actionCount+1,lastActionAt:{...s.lastActionAt,[type]:now},lastInteractionAt:now,updatedAt:now};
  const result=maybeEvolve(next,now);
  return {...result,changed:true};
}
export function noteInteraction(s,now=Date.now()){return {...s,lastInteractionAt:now,updatedAt:now};}
export function beginSleep(s,now=Date.now()){
  if(s.phase==='egg'||s.sleeping)return s;
  return {...s,sleeping:true,careKinds:[...new Set([...s.careKinds,'sleep'])],actionCount:s.actionCount+1,lastActionAt:{...s.lastActionAt,sleep:now},lastInteractionAt:now,updatedAt:now};
}
export function restSleep(s,deltaMs,now=Date.now()){
  if(!s.sleeping||!Number.isFinite(deltaMs)||deltaMs<=0||deltaMs>5000||now<s.updatedAt)return s;
  return {...s,needs:{...s.needs,energy:clamp(s.needs.energy+(deltaMs/1000)*1.3)},updatedAt:now};
}
export function endSleep(s,now=Date.now()){
  return s.sleeping?{...s,sleeping:false,updatedAt:Math.max(s.updatedAt,now)}:s;
}
export function nextDiscovery(s){
  const seen=s.discoveries||[],kinds=s.careKinds.length;
  if(kinds>=3&&!seen.includes('leafBed'))return 'leafBed';
  if(kinds>=5&&!seen.includes('flowerRug'))return 'flowerRug';
  if(['young','adult'].includes(s.phase)&&!seen.includes('youngPlay'))return 'youngPlay';
  if(s.phase==='adult'&&!seen.includes('adultGreeting'))return 'adultGreeting';
  if(['young','adult'].includes(s.phase)&&!seen.includes('youngToys'))return 'youngToys';
  if(s.phase==='adult'&&!seen.includes('adultToys'))return 'adultToys';
  if(s.careKinds.length>=4&&!seen.includes('newRoom'))return 'newRoom';
  return null;
}
export function noteMoment(s,moment){
  if(!MOMENTS.includes(moment)||(s.moments||[]).includes(moment))return s;
  return {...s,moments:[...(s.moments||[]),moment]};
}
export function toyAvailable(toy,phase){
  const ranks={egg:0,baby:1,young:2,adult:3};
  return !!TOY_STAGE[toy]&&ranks[phase]>=ranks[TOY_STAGE[toy]];
}
export function activityAvailable(key,phase){
  const ranks={egg:0,baby:1,young:2,adult:3};
  return !!ACTIVITY_STAGE[key]&&ranks[phase]>=ranks[ACTIVITY_STAGE[key]];
}
export function renamePet(s,name,now=Date.now()){return {...s,name:String(name).trim().slice(0,24),updatedAt:now};}
export function maybeEvolve(s,now=Date.now()){
  let target=null;
  if(s.phase==='baby'&&s.activeMs>=5*60_000)target='young';
  else if(s.phase==='young'&&s.activeMs-(s.youngAtActiveMs??5*60_000)>=10*60_000)target='adult';
  if(!target||s.milestones.includes(target))return {save:s,evolved:false};
  return {save:{...s,...(target==='young'?{youngAtActiveMs:s.activeMs}:{}),phase:target,milestones:[...s.milestones,target],moments:[...new Set([...(s.moments||[]),target])],updatedAt:now},evolved:true};
}
export function lowestNeed(s){return NEEDS.reduce((best,key)=>(s.needs[key]??100)<(s.needs[best]??100)?key:best,NEEDS[0]);}
// Filled shapes and faces communicate the level even without color or text.
export function needStatus(value){
  const level=value>70?3:value>=45?2:1;
  return {level,request:level<3,description:level===3?'bem cuidado':level===2?'pode receber cuidado':'pedindo cuidado'};
}
