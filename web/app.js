import {ALBUM_LABELS,albumSprite} from './album-v73.js?v=73';
import {sceneMarkup,sceneFill,updateSceneMarkers,prioritySceneMarkers,SCENE_KEYS,SCENE_LABELS} from './scene-v63-player.js?v=84.29';
import {sceneTallExtension} from './scene-details-v60.js';
import {CUSTOM_PARTS,PART_PALETTE,MIN_PART_SCALE,MAX_PART_SCALE,MIN_MOUTH_OFFSET,MAX_MOUTH_OFFSET,mouthOffset,handPosition,partPosition,PART_POSITION_LIMITS,CARE,canPlay,MIN_ENERGY_TO_PLAY,OPTIONS,DEFAULT_APPEARANCE,ROOM_OPTIONS,MOMENTS,TOYS,AREAS,ACTIVITIES,EVENTS,nextDiscovery,noteMoment,toyAvailable,activityAvailable,createSave,hatch,advance,applyCare,beginSleep,restSleep,endSleep,noteInteraction,renamePet,lowestNeed,maybeEvolve,needStatus} from './core.js?v=74';
import {SAVE_KEY,loadSave,persist,exportBackup,importBackup,resetSave} from './storage.js?v=59';
import {creatorKey,saveCreatorSession,loadCreatorSession,clearCreatorSession} from './creator-session.js?v=69';
import {PARTS,KEYS,LAB,IDS,COLORS,SCENES,item,svg,fromSave,toSave,moodFromNeeds,PET_CSS,SCENE_NAMES,fx,SFX,Ambient,ACT,AU} from './atelier.js?v=59';
import {AREA_SCENES,OBJECT_ART,TOY_ART,ROOM_WALL_COLORS,ACTIVITY_ART,EVENT_ART} from './world.js?v=59';
import {retroScene,retroRoom} from './retro.js?v=59';
import {adventureStep} from './adventure.js?v=59';
import {pixelPet} from './pixel-pet.js?v=69';
import {animatePetFrames,stopPetFrames} from './pet-frame-engine.js?v=59';
import {registerOfflineWorker} from './pwa.js?v=59';
import {ACTION_GROUPS,groupForAction,petCanFly,nextAirStep} from './interactions.js?v=59';
import {sceneLifeMarkup,gazeOffset} from './scene-gaze.js?v=59';
import {easeGaze,clampGaze} from './eye-gaze-v65.js?v=65';
import {hydrateNativeStorage,mirrorNativeValue,shareNativeBackup} from './native-storage.js?v=59';

const $=selector=>document.querySelector(selector);
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const icon=id=>`<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
// Cenários ganham céu acima e chão abaixo em vez de esticar sol, flores e bichinhos.
// A paisagem conserva os pixels quadrados mesmo numa tela alta de celular.
const SCENE_BASE={garden:['#cdeafc','#79bd92'],sunset:['#ff9f7a','#7d6aa8'],night:['#16224f','#244a58'],beach:['#b8e6ff','#ecd08c'],clouds:['#a6d8ff','#ffffff'],forest:['#2d5a52','#3f8f6a'],snow:['#9fb8e8','#dfe9fb'],space:['#0b0f2e','#7f86b3'],sea:['#7fd3ff','#f0d9a0'],halloween:['#242b51','#4f5b55'],christmas:['#46647b','#e5f1e9']};
function sceneSVG(art,vb='0 0 200 200',host=null,key='garden'){
 if(vb!=='0 0 200 200'||!host)return svg(art,vb).replace('<svg ','<svg preserveAspectRatio="none" ');
 const box=host.getBoundingClientRect();
 const ratio=box.width>0&&box.height>0?box.height/box.width:1.45;
 const extra=Math.max(0,Math.min(180,Math.round(200*(ratio-1))));
 const up=Math.round(extra*.50),down=extra-up;
 const [sky,ground]=SCENE_BASE[key]||SCENE_BASE.garden;
 const background=`<rect x="0" y="${-up}" width="200" height="${up+1}" fill="${sky}"/>`;
 const foreground=`<rect x="0" y="199" width="200" height="${down+1}" fill="${ground}"/>`;
 const extraDetail=sceneTallExtension(key,up,down);
 return svg(background+extraDetail.above+art+foreground+extraDetail.below,`0 ${-up} 200 ${200+extra}`);
}
const categories=[{key:'scene',title:'Cenário',icon:'star'},{key:'color',title:'Cores do pet',icon:'star'},{key:'mouth',title:'Boca',icon:'star'},{key:'body',title:'Corpo',icon:'star'},{key:'head',title:'Cabeça',icon:'star'},...['ears','eyes','snout','markings','hair','feet','tail','wings','hands','accessory'].map(key=>({key,title:key==='hands'?'Mãozinhas':LAB[key],icon:({tail:'tail',wings:'wing',hands:'love',ears:'ear',markings:'mark'})[key]||'star'})),{key:'outfit',title:'Roupinhas',icon:'star'},{key:'shoes',title:'Sapatinhos',icon:'star'}];
const HAND_LABELS={drop:'Gotinha',bear:'Patinha de urso',star:'Luva de estrela',fan:'Mão em leque',shell:'Conchinha',fist:'Punhinho',heart:'Palma-coração',dragon:'Garra de dragão'};
const V59_LABELS={none:'Sem',whiskers:'Bigodes finos',whiskerslong:'Bigodes longos',whiskerscurled:'Bigodes curvos',whiskersdots:'Pintinhas e bigodes',foxy:'Raposa',bunnywhiskers:'Coelhinho',grin:'Sorrisão',smirk:'Sorriso de lado',kiss:'Beijinho',wave:'Ondinha',tiny:'Boquinha',fangs:'Vampirinho',laugh:'Risada',pout:'Biinho',soft:'Sorriso suave',sunglasses:'Óculos escuros'};
const sceneNames={...SCENE_LABELS};
const stageOf=phase=>phase==='young'?'child':phase==='adult'?'adult':'baby';
const selectionOf=appearance=>fromSave(appearance);
function drawPet(host,appearance,phase,mood='happy'){
  const {sel,col}=selectionOf(appearance);
  stopPetFrames(host);
  host.innerHTML=svg(`<g class="pet-pose pet m-${mood}">${pixelPet(sel,col,{stage:stageOf(phase),mood,outfit:appearance.outfit,shoes:appearance.shoes,partSizes:appearance.partSizes,partColors:appearance.partColors,mouthOffset:appearance.mouthOffset,hands:appearance.hands,handPosition:appearance.handPosition,partPositions:appearance.partPositions})}</g><g id="fx"></g>`);
  host.querySelector('svg').setAttribute('aria-hidden','true');
}
function setMotion(host,motion){
  const airWrap=document.querySelector('#pet-wrap');
  // Animações antigas de olhar/crescimento não podem interromper um voo ou salto em andamento.
  if(host===playArt&&airWrap?.classList.contains('airborne')&&!airWrap.classList.contains('air-landing')&&!['fly','jump','land'].includes(motion))return;
  host.dataset.motion=motion;host.classList.toggle('performing',motion!=='idle');
  animatePetFrames(host,motion);
  host.querySelectorAll('svg').forEach(svg=>{if(document.hidden)svg.pauseAnimations?.();});
  const closed=['bath-rinse','sleep-rest','sleep-settle','love-blink','satisfied'].includes(motion);
  host.classList.toggle('eyes-closed',closed);
}
const careUI={
  food:{label:'Comeu com alegria!',icon:'food',motion:'eat',x:70},
  water:{label:'Bebeu água fresquinha!',icon:'water',motion:'drink',x:30},
  bath:{label:'Banho gostoso!',icon:'bath',motion:'bath',x:70},
  potty:{label:'Tudo limpinho!',icon:'potty',motion:'potty',x:30},
  sleep:{label:'Uma soneca tranquila.',icon:'sleep',motion:'sleep',x:50},
  love:{label:'Adorou o carinho!',icon:'love',motion:'happy',x:null},
  play:{label:'Que brincadeira boa!',icon:'play',motion:'play',x:30},
  injection:{label:'Saúde recuperada!',icon:'injection',motion:'happy',x:null}
};
const needIcon={food:'food',water:'water',clean:'bath',potty:'potty',energy:'sleep',affection:'love',fun:'play',health:'injection'};
const NEED_TITLES={food:'Comida',water:'Água',bath:'Banho',potty:'Banheiro',sleep:'Sono',love:'Carinho',play:'Diversão',injection:'Saúde'};
const phaseLabel={egg:'Ovo',baby:'Bebê',young:'Jovem',adult:'Adulto'};
const growthCharm=phase=>{
  const art={
    egg:'<ellipse class="charm-soil" cx="32" cy="48" rx="19" ry="6"/><path class="charm-seed" d="M25 39q7-13 14 0-7 8-14 0Z"/>',
    baby:'<ellipse class="charm-soil" cx="32" cy="49" rx="19" ry="6"/><path class="charm-stem" d="M32 47V26"/><path class="charm-leaf" d="M31 35Q17 22 15 34q8 8 16 1Zm2-5q13-13 16-1-7 7-16 2Z"/>',
    young:'<ellipse class="charm-soil" cx="32" cy="50" rx="19" ry="5"/><path class="charm-stem" d="M32 48V29"/><path class="charm-leaf" d="M31 39Q18 28 17 39q7 7 14 1Z"/><g class="charm-bloom"><circle cx="32" cy="22" r="7"/><circle cx="32" cy="11" r="7"/><circle cx="43" cy="22" r="7"/><circle cx="32" cy="33" r="7"/><circle cx="21" cy="22" r="7"/><circle class="charm-center" cx="32" cy="22" r="6"/></g>',
    adult:'<path class="charm-stem" d="M32 50V33"/><path class="charm-leaf" d="M31 42Q17 31 16 43q8 7 15 0Zm2-5q13-11 16 0-7 7-16 2Z"/><g class="charm-star"><path d="m32 5 6 12 14 2-10 10 3 14-13-7-13 7 3-14-10-10 14-2Z"/><circle class="charm-center" cx="32" cy="24" r="6"/></g>'
  }[phase]||'';
  return `<span class="growth-charm growth-${phase}" aria-label="Símbolo de crescimento: ${phaseLabel[phase]}"><svg viewBox="0 0 64 60" aria-hidden="true">${art}</svg></span>`;
};
const ALBUM_OBJECTS=['butterfly','ball','bubbles','kite','drum','car','rattle','book','plush','instrument','flowers','stars','rainbow','snow','gift'];
const colorHex=Object.fromEntries(Object.entries(COLORS).map(([key,colors])=>[key,colors[0]]));
const TEST_MODE=new URLSearchParams(location.search).get('teste')==='1';
let creatingNew=new URLSearchParams(location.search).get('criar')==='1';
const ACTIVE_SAVE_KEY=TEST_MODE?`${SAVE_KEY}.test`:SAVE_KEY;
const DRAFT_KEY=creatorKey(ACTIVE_SAVE_KEY);
let save=null,draft={...DEFAULT_APPEARANCE,scene:'garden'},step=0,previewArt,playArt,scene='garden';
let status='loading',flow=0,currentX=50,lastTick=Date.now(),tickTimer=null,sleepTimer=null,lastSleepTick=0,audioContext=null,returnStatus='ready';
let ambientTimer=null,ambientIndex=0,committedFlow=-1;
let sceneClock=0,sceneWatchIndex=0,sceneLookUntil=0,sceneLookMarker=null,sceneGazeLast=0,sceneGazeLoopStarted=false;
let chosenToy='ball',authorizedPlayToken=-1;
let area='garden',lampOn=true;
let roomCategory='bed',toyPhase='';
let activityPage=0,eventHintTimer=null;
let chosenDecoration=null;
let albumDrag=null,suppressAlbumClick=false;
let selectedDecoration=null,decorationDrag=null,suppressDecorationClick=false;
let actionGroup=null,airTimer=null,lookTimer=null,gazeFrame=null,gazeIndex=0,flightLevel=0,jumpStreak=0;
await hydrateNativeStorage(localStorage,[SAVE_KEY,`${SAVE_KEY}.test`,'meu-pequeno-pet.sound']);
let soundEnabled=localStorage.getItem('meu-pequeno-pet.sound')!=='off';
const loaded=loadSave(localStorage,Date.now(),ACTIVE_SAVE_KEY);
save=loaded.save;
// Salvamentos antigos com Nuvens continuam válidos, mas abrem no Deserto.
if(save?.scene==='clouds')save={...save,scene:'desert'};
const draftSession=loadCreatorSession(localStorage,DRAFT_KEY);
if(draftSession&&(!save||creatingNew||draftSession.creatingNew)){draft=draftSession.draft; if(draft.scene==='clouds')draft.scene='desert';step=Math.min(categories.length-1,draftSession.step);if(save&&draftSession.creatingNew)creatingNew=true;}
currentX=Math.max(20,Math.min(80,Number.isFinite(save?.viewX)?save.viewX:50));
chosenToy=TOYS.includes(save?.playToy)?save.playToy:'ball';
area=AREAS.includes(save?.area)?save.area:'garden';

function sound(notes=[520]){
  if(!soundEnabled)return;
  try{
    audioContext??=new (window.AudioContext||window.webkitAudioContext)();
    if(audioContext.state==='suspended')audioContext.resume();
    notes.forEach((freq,i)=>{
      const start=audioContext.currentTime+i*.11,osc=audioContext.createOscillator(),gain=audioContext.createGain();
      osc.type='sine';osc.frequency.setValueAtTime(freq,start);gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.045,start+.015);gain.gain.exponentialRampToValueAtTime(.0001,start+.19);osc.connect(gain).connect(audioContext.destination);osc.start(start);osc.stop(start+.2);
    });
  }catch{}
}
function write(){if(save)try{persist(save,localStorage,ACTIVE_SAVE_KEY);}catch(e){const el=$('#parent-message');if(el)el.textContent='Não foi possível salvar neste aparelho. Faça um backup.';}}
function saveDraft(){if(!save||creatingNew)try{saveCreatorSession(localStorage,DRAFT_KEY,draft,step,creatingNew);}catch(e){console.warn('Não foi possível salvar criação',e);}}
/* Salva a última fração de tempo ativo antes de suspender. Tempo minimizado NÃO envelhece o pet. */
function checkpoint(){
 const now=Date.now();saveDraft();
 if(!save||creatingNew)return;
 if(save.sleeping){const delta=now-lastSleepTick;if(Number.isFinite(delta)&&delta>0&&delta<=5000)save=restSleep(save,delta,now);lastSleepTick=now;}
 else if(!document.querySelector('#play-screen')?.hidden&&['ready','ambient','moving','perceiving','preparing','acting','reacting','minigame','event'].includes(status)){
  const delta=now-lastTick;
  if(Number.isFinite(delta)&&delta>0&&delta<=60_000)save=advance(save,delta,now,status==='ready').save;
 }
 lastTick=now;
 const world=$('#world'),wrap=$('#pet-wrap');
 if(world&&wrap&&world.clientWidth&&save.phase!=='egg'){
  const cssLeft=parseFloat(getComputedStyle(wrap).left);if(Number.isFinite(cssLeft))currentX=Math.max(20,Math.min(80,cssLeft/world.clientWidth*100));
 }
 save={...save,viewX:currentX};write();
}
function explainLowEnergy(){
 say(`O pet precisa de pelo menos ${MIN_ENERGY_TO_PLAY}% de energia para brincar. Hora de dormir! 🌙`);
}
// Recalcular quando a barra de energia cai sem mudar a tela/status.
function updatePlayAvailability(){
 const active=['ready','ambient'].includes(status),playable=canPlay(save),locked=!active||!playable;
 for(const button of document.querySelectorAll('[data-action-group="fun"],#activity-open')){
  button.disabled=locked;
  button.setAttribute('aria-disabled',String(locked));
  button.title=playable?'Brincar e se divertir':`Precisa de ${MIN_ENERGY_TO_PLAY}% de energia para brincar. Durma primeiro!`;
 }
 const funNeed=document.querySelector('[data-need-indicator="play"]');
 if(funNeed){funNeed.classList.toggle('is-unavailable',locked);funNeed.setAttribute('aria-disabled',String(locked));
  funNeed.title=playable?'Diversão':`Energia baixa! Durma até ${MIN_ENERGY_TO_PLAY}% para brincar.`;}
 const legacyPlay=document.querySelector('#care-grid [data-care="play"]');
 if(legacyPlay)legacyPlay.disabled=locked;
}
function syncNeedButtons(){
  const available=['ready','ambient'].includes(status),sleeping=status==='sleeping';
  document.querySelectorAll('#needs-dashboard .need-indicator').forEach(button=>{
    const type=button.dataset.needIndicator;
    button.disabled=Boolean(save?.phase==='egg'||(!available&&!(sleeping&&type==='sleep')));
    button.setAttribute('aria-pressed','false');
    if(type==='sleep'){
      button.querySelector('use')?.setAttribute('href',sleeping?'#i-wake':'#i-sleep');
      const title=button.querySelector('.need-name');if(title)title.textContent=sleeping?'Acordar':'Sono';
      button.setAttribute('aria-label',sleeping?'Acordar o pet':'Dormir: '+(button.dataset.needDescription||'energia'));
    }
  });
}
function setStatus(next){
  status=next;const available=['ready','ambient'].includes(next);
  $('#world').dataset.state=next;
  $('#care-grid').querySelectorAll('button').forEach(b=>b.disabled=(!available&&!(next==='sleeping'&&(b.dataset.care==='sleep'||b.id==='action-back')))||save?.phase==='egg');
  $('#parents-open').disabled=!available&&next!=='creating'&&next!=='sleeping';
  const sb=document.querySelector('[data-care="sleep"]');if(sb){
    const label=[...sb.children].find(child=>child.tagName==='SPAN'&&!child.classList.contains('need-face')&&!child.classList.contains('need-meter'));
    if(label)label.textContent=next==='sleeping'?'Acordar':'Sono';
    sb.setAttribute('aria-pressed',String(next==='sleeping'));
    const symbol=sb.querySelector('use');
    if(symbol)symbol.setAttribute('href',next==='sleeping'?'#i-wake':'#i-sleep');
  }
  $('#need-cue').classList.toggle('quiet',!available);
  syncNeedButtons();
  if($('#area-open'))$('#area-open').disabled=!available;
  if($('#activity-open'))$('#activity-open').disabled=!available;
  for(const id of ['outfit-open','shoes-open'])if($('#'+id))$('#'+id).disabled=!available||save?.phase==='egg';
  // Diversão e Visual obedecem ao MESMO bloqueio dos cuidados durante o sono.
  $('#action-groups')?.querySelectorAll('button').forEach(button=>{
    button.disabled=!available||save?.phase==='egg';
    button.setAttribute('aria-disabled',String(button.disabled));
  });
  const funNeed=document.querySelector('[data-need-indicator="play"]');
  if(funNeed){funNeed.classList.toggle('is-unavailable',!available||save?.phase==='egg');funNeed.setAttribute('aria-disabled',String(!available||save?.phase==='egg'));}
  updatePlayAvailability();
}

function renderActionGroups(){
  const groups=$('#action-groups'),grid=$('#care-grid');if(!groups||!grid)return;
  groups.hidden=Boolean(actionGroup);grid.hidden=!actionGroup;
  groups.querySelectorAll('[data-action-group]').forEach(button=>button.setAttribute('aria-expanded',String(button.dataset.actionGroup===actionGroup)));
  grid.querySelectorAll(':scope > button').forEach(button=>{
    button.hidden=button.id!=='action-back'&&button.dataset.actionGroup!==actionGroup;
  });
}
function openActionGroup(group){
  if(group==='fun'){if(['ready','ambient'].includes(status)&&save?.phase!=='egg')openDiversao();return;}
  if(!['fun','style'].includes(group)||!['ready','ambient'].includes(status)||save?.phase==='egg')return;
  if(status==='ambient')cancelAmbient();actionGroup=group;renderActionGroups();
}
function closeActionGroup(){actionGroup=null;renderActionGroups();}
function drawNeeds(){
  for(const button of document.querySelectorAll('#care-grid button[data-care]')){
    const type=button.dataset.care,value=save.needs[CARE[type].need],info=needStatus(value);
    button.dataset.level=info.level;
    button.classList.toggle('needy',info.request&&save.phase!=='egg');
    button.setAttribute('aria-label',`${type==='sleep'&&save.sleeping?'Acordar':type==='food'?'Comida':type==='water'?'Água':type==='bath'?'Banho':type==='potty'?'Banheiro':type==='sleep'?'Sono':type==='love'?'Carinho':type==='injection'?'Saúde':'Diversão'}: ${info.description}`);
    const indicator=document.querySelector(`[data-need-indicator="${type}"]`);
    indicator.dataset.level=info.level;indicator.dataset.needDescription=info.description;indicator.setAttribute('aria-label',type==='sleep'&&save.sleeping?'Acordar o pet':button.getAttribute('aria-label'));
    indicator.title=indicator.getAttribute('aria-label');
    indicator.querySelector('.need-meter').innerHTML=`<i class="filled" style="width:${Math.max(0,Math.min(100,value))}%"></i>`;
    indicator.querySelector('.need-face').innerHTML=`<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 8v1m8-1v1M7 14${info.level===3?'q5 6 10 0':info.level===2?'h10':'q5-3 10 0'}"/></svg>`;
  }
  syncNeedButtons();
  updatePlayAvailability();
}
function say(message){$('#care-message').textContent=message;}
function clearEffect(){const el=$('#world-effect');el.classList.remove('show');el.innerHTML='';}
function renderGrowth(){
  if(!save)return;
  const room=save.room||{bed:'cloud',rug:'sun',toy:save.playToy||'ball'};
  $('#bed').dataset.style=room.bed;$('#room-rug').dataset.style=room.rug;
  $('#room-toy').dataset.style=room.toy;
  $('#room-toy').innerHTML=TOY_ART[room.toy]||TOY_ART.ball;
  renderRoomChoices();renderToyChoices();
  scene=save.scene||'garden';renderArea();
  $('#phase-name').textContent=save.name?`${save.name} · ${phaseLabel[save.phase]}`:phaseLabel[save.phase];
  $('#growth-dots').innerHTML=growthCharm(save.phase);
  $('#egg').hidden=save.phase!=='egg';$('#pet-wrap').hidden=save.phase==='egg';
  $('#pet-wrap').dataset.phase=save.phase;
  $('#egg').style.setProperty('--egg-color',colorHex[save.appearance.color]);
  const mark=selectionOf(save.appearance).col.a;
  $('#egg').style.setProperty('--egg-mark',mark);
  $('#egg').dataset.markings=save.appearance.markings;
  drawPet(playArt,save.appearance,save.phase,moodFromNeeds(save.needs));
  constrainPosition();
  if(save.phase!=='egg'){
    const need=lowestNeed(save),low=needStatus(save.needs[need]).request;
    $('#need-cue').hidden=!low;
    $('#need-cue').innerHTML=item(needIcon[need]);
    playArt.dataset.request=need;
    drawNeeds();
  }else $('#need-cue').hidden=true;
  setStatus(status);
}
function renderToyChoices(){
  if(toyPhase===save.phase)return;
  toyPhase=save.phase;
  const names={ball:'Bola',bubbles:'Bolhas',kite:'Pipa',drum:'Tambor',car:'Carrinho',rattle:'Chocalho',book:'Livro de figuras',plush:'Pelúcia',surprise:'Caixa surpresa',instrument:'Instrumento'};
  $('#toy-picker').innerHTML=TOYS.filter(toy=>toyAvailable(toy,save.phase)).map(toy=>`<button type="button" data-toy="${toy}" data-decoration-kind="${toy}" aria-label="${names[toy]}">${TOY_ART[toy]}</button>`).join('')+'<button id="toy-close" type="button" aria-label="Fechar brinquedos">×</button>';
}
function roomOptionArt(key,value){
  if(key==='toy')return TOY_ART[value];
  if(key==='wall')return `<span class="room-swatch" style="background:${ROOM_WALL_COLORS[value]}"></span>`;
  if(key==='bed')return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M5 35q27-22 54 0v18H5Z" fill="${value==='leaf'?'#99d7ad':value==='moon'?'#a8baf4':'#d9baf3'}" stroke="#2d5282" stroke-width="4"/><path d="M6 35q26 18 52 0" fill="none" stroke="#fff" stroke-width="3"/></svg>`;
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="38" rx="26" ry="15" fill="${value==='flower'?'#f5bddb':value==='rainbow'?'#a8d9f6':'#ffdfa0'}" stroke="#2d5282" stroke-width="3"/><circle cx="32" cy="37" r="6" fill="#fff"/></svg>`;
}
function roomOptionAvailable(key,value){
  if(key==='bed'&&value==='leaf')return save.careKinds.length>=3;
  if(key==='rug'&&value==='flower')return save.careKinds.length>=5;
  if(key==='bed'&&value==='moon')return ['young','adult'].includes(save.phase);
  if(key==='rug'&&value==='rainbow')return save.phase==='adult';
  if(key==='toy')return toyAvailable(value,save.phase);
  return true;
}
function renderRoomChoices(){
  const host=$('#room-options');if(!host)return;
  const selected=save.room||{bed:'cloud',rug:'sun',toy:'ball',wall:'lavender'};
  host.innerHTML=ROOM_OPTIONS[roomCategory].filter(value=>roomOptionAvailable(roomCategory,value)).map(value=>`<button type="button" data-room="${roomCategory}" data-value="${value}" aria-label="${value}" aria-pressed="${selected[roomCategory]===value}">${roomOptionArt(roomCategory,value)}</button>`).join('');
  $('#room-picker').querySelectorAll('[data-room-tab]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.roomTab===roomCategory));
}
function renderArea(){
  area=AREAS.includes(save?.area)?save.area:'garden';
  const art=area==='garden'?(SCENES[scene]||SCENES.garden):AREA_SCENES[area];
  const shown=area==='garden'?scene:area;
  const stage=$('#scene-art');
  stage.style.setProperty('--v64-scene-sky',sceneFill(shown));
  stage.innerHTML=sceneMarkup(shown,true);
  sceneClock=performance.now();sceneWatchIndex=0;sceneLookUntil=0;
  resetGaze();
  $('#scene-life').innerHTML=''; // Os objetos V63 já estão nos 40 quadros: não duplicar pássaros/borboletas.
  $('#world').dataset.area=area;
  if(area!=='garden')$('#event-hint').hidden=true;
  $('#world').style.setProperty('--room-wall',ROOM_WALL_COLORS[save?.room?.wall]||ROOM_WALL_COLORS.lavender);
  $('#bed').hidden=save?.phase==='egg'||area!=='bedroom';
  $('#room-rug').hidden=save?.phase==='egg'||area!=='bedroom';
  $('#room-toy').hidden=save?.phase==='egg'||area!=='bedroom';
  $('#area-objects').innerHTML=save?.phase==='egg'?'':area==='garden'?'':area==='bedroom'?`<button type="button" data-object="lamp" aria-label="Acender ou apagar o abajur" aria-pressed="${lampOn}">${OBJECT_ART.lamp}</button>`:`<button type="button" data-object="food" aria-label="Alimentar o pet">${OBJECT_ART.food}</button><button type="button" data-object="water" aria-label="Dar água ao pet">${OBJECT_ART.water}</button>`;
  renderDecorations();
  $('#world').classList.toggle('lamp-off',area==='bedroom'&&!lampOn);
  $('#area-map').querySelectorAll('[data-area]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.area===area));
}
async function changeArea(next){
  if(!AREAS.includes(next)||!['ready','ambient'].includes(status)||next===area)return;
  selectedDecoration=null;
  if(status==='ambient')cancelAmbient();
  const token=++flow;setStatus('moving');$('#area-map').hidden=true;clearEffect();
  if(save.phase!=='egg'&&!await moveTo(72,token))return;
  if(token!==flow)return;
  save=noteMoment({...save,area:next},next==='bedroom'?'bedroom':next==='kitchen'?'kitchen':'');write();renderArea();
  const wrap=$('#pet-wrap');wrap.classList.remove('moving');wrap.classList.remove('turn-left');
  currentX=30;wrap.style.transition='none';wrap.style.left='30%';void wrap.offsetWidth;wrap.style.transition='';
  if(save.phase!=='egg'&&!await moveTo(50,token))return;
  setMotion(playArt,'idle');setStatus('ready');
}
function showScreen(){
  stopSleepTimer();
  stopAirMotion(false);actionGroup=null;renderActionGroups();
  window.scrollTo(0,0);
  $('#extras-shade').hidden=true;for(const id of ['room-picker','album','discovery','activity-panel','wardrobe-panel'])$(`#${id}`).hidden=true;
  $('#create-screen').hidden=!!save&&!creatingNew;
  $('#play-screen').hidden=!save||creatingNew;
  $('#creation-cancel').hidden=!(save&&creatingNew);
  if(save&&!creatingNew){renderGrowth();if(save.sleeping){setStatus('sleeping');setMotion(playArt,'sleep-rest');startSleepTimer();}else setStatus('ready');}
  else {setStatus('creating');renderCreator();}
}
function drawAlbum(){
  const labels={butterfly:'Borboleta',...ALBUM_LABELS};
  const found=save.moments||[],alwaysAvailable=new Set(['butterfly','ball','bubbles']);
  $('#album-grid').innerHTML=ALBUM_OBJECTS.map(moment=>{
    const available=true;
    return `<button type="button" class="album-card ${available?'found':'locked'}" data-album-moment="${moment}" aria-label="${labels[moment]}" ${available?'':'disabled'}><span class="album-object" data-decoration-kind="${moment}">${decorationArt(moment)}</span></button>`;
  }).join('');
}
function decorationArt(kind){if(['birth','young','adult'].includes(kind)){const {sel,col}=selectionOf(save.appearance);return svg(pixelPet(sel,col,{stage:stageOf(kind==='birth'?'baby':kind),mood:'happy',outfit:save.appearance.outfit,shoes:save.appearance.shoes,partSizes:save.appearance.partSizes,partColors:save.appearance.partColors,mouthOffset:save.appearance.mouthOffset,hands:save.appearance.hands,handPosition:save.appearance.handPosition,partPositions:save.appearance.partPositions}));}return albumSprite(kind)||TOY_ART[kind]||ACTIVITY_ART[kind]||EVENT_ART[kind]||({butterfly:OBJECT_ART.butterfly,bedroom:OBJECT_ART.lamp,kitchen:OBJECT_ART.food,decor:roomOptionArt('bed',save.room?.bed||'cloud')})[kind]||item(({food:'food',water:'water',bath:'bath',play:'play'})[kind]||'play');}
function renderDecorations(){const layer=$('#decorations');if(!layer)return;layer.innerHTML=(save?.decorations||[]).map((d,index)=>d.area===area?`<button type="button" class="scene-decoration ${selectedDecoration===index?'selected':''}" data-decoration-index="${index}" data-decoration-kind="${d.kind}" aria-label="Selecionar lembrança" aria-pressed="${selectedDecoration===index}" style="left:${d.x}%;top:${d.y}%"><span class="decoration-art">${decorationArt(d.kind)}</span></button>`:'').join('');const hidden=selectedDecoration===null||!save?.decorations?.[selectedDecoration]||save.decorations[selectedDecoration].area!==area;for(const id of ['decoration-remove','decoration-use']){const button=$('#'+id);if(button)button.hidden=hidden;}const cancel=$('#decoration-cancel');if(cancel)cancel.hidden=hidden&&!chosenDecoration;}
function updateDecoration(index,x,y,remove=false){
 if(!save?.decorations?.[index]||save.decorations[index].area!==area)return false;
 const decorations=save.decorations.map(d=>({...d}));if(remove)decorations.splice(index,1);else Object.assign(decorations[index],{x:Math.max(8,Math.min(92,x)),y:Math.max(20,Math.min(88,y))});
 const next={...save,decorations};try{persist(next,localStorage,ACTIVE_SAVE_KEY);}catch(error){say('Não foi possível salvar neste aparelho.');return false;}
 save=next;selectedDecoration=null;renderDecorations();return true;
}
async function interactDecoration(index){
 if(!save?.decorations?.[index]||status!=='ready')return;
 const object=save.decorations[index];if(object.area!==area)return;
 selectedDecoration=null;renderDecorations();const token=++flow;setStatus('moving');
 if(!await moveTo(object.x,token))return;
 const target=$(`#decorations [data-decoration-index="${index}"]`);
 if(target){const box=target.getBoundingClientRect();aimPetAt(box.left+box.width/2,box.top+box.height/2,false);target.classList.add('interacting');}
 setStatus('acting');setMotion(playArt,'curious');if(!await hold(550,token))return;
 const motion=({food:'food-ready',water:'water-sip',bath:'bath-sponge',play:'play-reach',butterfly:'butterfly-reach',ball:'car-push',bubbles:'butterfly-reach',kite:'kite-reach',drum:'drum-beat',car:'car-push',rattle:'rattle-shake',book:'book-page',plush:'plush-hug',instrument:'instrument-play',flowers:'flower-water',stars:'star-find',rainbow:'look-up',snow:'curious',gift:'surprise-open',surprise:'surprise-open',bedroom:'settle',decor:'settle'})[object.kind]||'look';
 setMotion(playArt,motion);if(!await hold(1100,token))return;setMotion(playArt,'happy');sound([480,570]);
 if(!await hold(700,token))return;target?.classList.remove('interacting');resetGaze();setMotion(playArt,'idle');setStatus('ready');scheduleAmbient();
}
function placeDecoration(kind,x,y){
 const available=ALBUM_OBJECTS.includes(kind);
 if(!save||!ALBUM_OBJECTS.includes(kind)||!available||(save.decorations||[]).length>=20||(save.decorations||[]).filter(d=>d.kind===kind).length>=2)return false;
 const next={...save,decorations:[...(save.decorations||[]),{kind,area,x:Math.max(8,Math.min(92,x)),y:Math.max(20,Math.min(88,y))}]};
 try{persist(next,localStorage,ACTIVE_SAVE_KEY);}catch(error){say('Não foi possível salvar neste aparelho.');return false;}
 save=next;renderDecorations();const items=$('#decorations').querySelectorAll('.scene-decoration');items[items.length-1]?.classList.add('just-placed');say('');return true;
}
function cancelAlbumDrag(restore=true){
 if(!albumDrag)return;albumDrag.ghost?.remove();albumDrag=null;$('#album').style.opacity='';
 if(restore&&status==='album'){$('#album').hidden=false;$('#extras-shade').hidden=false;}
}
function activityPages(){
  const first=['adventure','peek','flowers','stars','dance','paint'].filter(key=>activityAvailable(key,save.phase));
  const next=['sequence','tidy','race','faces'].filter(key=>activityAvailable(key,save.phase));
  const events=EVENTS.filter(key=>activityAvailable(key,save.phase));
  return [first,...(next.length?[next]:[]),events];
}
function diversaoPages(){return [TOYS.filter(key=>toyAvailable(key,save?.phase)),...activityPages()];}
function renderActivityPanel(){
  const pages=diversaoPages();activityPage=Math.min(activityPage,pages.length-1);
  const current=pages[activityPage],isToys=activityPage===0,isEvent=!isToys&&current.every(key=>EVENTS.includes(key));
  $('#activity-panel').dataset.kind=isToys?'toys':isEvent?'events':'activities';
  const title=isToys?'Brinquedos':isEvent?'Surpresas':'Atividades';
  $('#activity-panel').innerHTML=`<button id="activity-close" class="extra-close" type="button" aria-label="Voltar">×</button><div class="v66-fun-heading">★ Diversão · ${title}</div><div class="activity-options">${current.map(key=>`<button type="button" data-${isToys?'toy':isEvent?'event':'activity'}="${key}" data-decoration-kind="${key}" aria-label="${isToys?'Brincar com ':''}${key}">${isToys?TOY_ART[key]:isEvent?EVENT_ART[key]:ACTIVITY_ART[key]}</button>`).join('')}</div><div class="activity-nav"><button id="activity-prev" type="button" aria-label="Página anterior" ${activityPage===0?'disabled':''}>←</button><span class="activity-dots" aria-hidden="true">${pages.map((_,index)=>`<i class="${index===activityPage?'selected':''}"></i>`).join('')}</span><button id="activity-next" type="button" aria-label="Próxima página" ${activityPage===pages.length-1?'disabled':''}>→</button></div>`;
}
function openDiversao(){
 if(status==='ambient')cancelAmbient();
 if(status!=='ready'||!save||save.phase==='egg')return;
 if(!canPlay(save)){explainLowEnergy();updatePlayAvailability();return;}
 activityPage=0;renderActivityPanel();$('#extras-shade').hidden=false;$('#activity-panel').hidden=false;setStatus('activities');
}
function closeActivityPanel(){
  $('#activity-panel').hidden=true;$('#extras-shade').hidden=true;setStatus('ready');
}
async function launchActivity(key){
  if(!activityAvailable(key,save.phase)||status!=='ready')return;
  if(!canPlay(save)){explainLowEnergy();updatePlayAvailability();return;}
  const destination=['adventure','flowers','stars','race'].includes(key)||EVENTS.includes(key)?'garden':key==='tidy'?'bedroom':area;
  if(area!==destination){await changeArea(destination);if(status!=='ready'||area!==destination||document.hidden)return;}
  save=noteInteraction(save);write();const token=++flow;authorizedPlayToken=token;
  if(EVENTS.includes(key)){startEvent(key,token);return;}
  if(key==='adventure'){startGardenAdventure(token);return;}
  if(key==='peek'){startPeek(token);return;}
  if(key==='sequence'){startSequence(token);return;}
  if(key==='dance'){startDance(token);return;}
  if(key==='paint'){startPainting(token);return;}
  startMiniGame(token,key);
}
function recordDiscovery(){
  const found=nextDiscovery(save);if(!found||status==='creating')return;
  save={...save,discoveries:[...(save.discoveries||[]),found]};write();
}
function miniArt(key,value){
  if(key==='scene')return `<span class="choice-pet v64-scene-choice v66-scene-choice">${sceneMarkup(value,'preview')}</span>`;
  if(key==='color')return `<span class="choice-art swatch-art" style="background:${colorHex[value]}"></span>`;
  const candidate={...draft,[key]:value};
  const {sel,col}=selectionOf(candidate);
  const crop=key==='eyes'?'65 57 70 52':key==='snout'?'63 74 74 50':key==='mouth'?'73 82 54 43':key==='markings'?'53 45 94 66':key==='ears'?'38 20 124 94':key==='shoes'?'56 158 88 38':key==='outfit'?'51 108 98 75':key==='hands'?'39 126 122 43':null;
  return `<span class="choice-pet" aria-hidden="true">${svg(pixelPet(sel,col,{stage:'baby',outfit:candidate.outfit,shoes:candidate.shoes,partSizes:candidate.partSizes,partColors:candidate.partColors,mouthOffset:candidate.mouthOffset,hands:candidate.hands,handPosition:candidate.handPosition,partPositions:candidate.partPositions}),crop||'0 0 200 200')}</span>`;
}
const draftPartPosition=key=>partPosition(key,key==='hands'?draft.handPosition:draft.partPositions?.[key]);
function renderPartPosition(key){
  const {x,y}=draftPartPosition(key);
  for(const axis of ['x','y']){
    const input=$('#hand-position-'+axis);
    [input.min,input.max]=PART_POSITION_LIMITS[key][axis];
  }
  $('#hand-position-x').value=String(x);
  $('#hand-position-y').value=String(y);
  $('#hand-position-x-label').textContent=x<0?`\u2192\u2190 ${-x} px`:x>0?`\u2190\u2192 ${x} px`:'Centro';
  $('#hand-position-y-label').textContent=y<0?`\u2191 ${-y} px`:y>0?`\u2193 ${y} px`:'Centro';
}
function renderCreator(){
  $('#create-scene-art').style.setProperty('--v64-scene-sky',sceneFill(draft.scene));
  $('#create-scene-art').innerHTML=sceneMarkup(draft.scene,'creator');
  drawPet(previewArt,draft,'baby');setMotion(previewArt,'idle');stopPetFrames(previewArt);
  saveDraft();
  const c=categories[step];const list=$('#choice-list');const previousScroll=list.dataset.category===c.key?list.scrollTop:0;list.classList.toggle('two-row-options',CUSTOM_PARTS.includes(c.key));list.dataset.category=c.key;$('#category-title').textContent=c.title;$('#category-icon use').setAttribute('href',`#i-${c.icon}`);$('#step-count').textContent=`${step+1} / ${categories.length}`;
  $('#choice-list').innerHTML=(c.key==='scene'?SCENE_KEYS:OPTIONS[c.key]).map((value,i)=>{
    const label=c.key==='scene'?SCENE_LABELS[value]:c.key==='hands'?HAND_LABELS[value]:c.key==='shoes'?({none:'Sem sapatos',shoes:'Sapatinhos',sneakers:'Tênis',heels:'Saltinhos',boots:'Botinhas',slippers:'Pantufas',sandals:'Sandálias',rainboots:'Galochas',rollers:'Patins',highTops:'Tênis altos',ballet:'Balé',flipflops:'Chinelos',loafers:'Sociais',snowboots:'Botas de neve'})[value]:c.key==='outfit'?({none:'Sem roupa',dress:'Vestido',overalls:'Jardineira',vest:'Colete',cardigan:'Casaquinho',sailor:'Marinheiro',pajamas:'Pijama',hoodie:'Moletom',raincoat:'Capa de chuva',kimono:'Quimono',princess:'Princesa',superhero:'Super-herói',pirate:'Pirata',astronaut:'Astronauta',bee:'Abelhinha',wizardrobe:'Mago',winter:'Casaco de inverno',chef:'Chef',sport:'Esportiva',flower:'Floral',dinosaur:'Dinossauro'})[value]:c.key==='color'?({pink:'Rosa',blue:'Azul',green:'Verde',yellow:'Amarelo',purple:'Lilás',orange:'Laranja',red:'Vermelho',mint:'Menta',white:'Neve'})[value]:PARTS[c.key]?.[IDS[c.key]?.indexOf(value)]?.n||V59_LABELS[value]||'Sem';
    return `<button type="button" class="choice ${draft[c.key]===value?'selected':''}" data-choice="${value}" aria-label="${label}" aria-pressed="${draft[c.key]===value}">${miniArt(c.key,value)}<span>${label}</span></button>`;
  }).join('');
  list.scrollTop=previousScroll; // Não perde a posição das escolhas ao alterar o visual da peça.
  // Escolhas por ícones: as crianças não precisam ler para ajustar o visual.
  const sizeAdjust=CUSTOM_PARTS.includes(c.key)&&draft[c.key]!=='none';
  const positionAdjust=Object.hasOwn(PART_POSITION_LIMITS,c.key)&&draft[c.key]!=='none';
  const adjust=$('#creator-adjust');adjust.hidden=!sizeAdjust&&!positionAdjust;
  $('#part-size-adjust').hidden=!sizeAdjust;
  // V84.17: Boca usa apenas as cores originais da sprite; tamanho e altura permanecem configuráveis.
  const showColors=sizeAdjust&&c.key!=='mouth';
  adjust.querySelector('.colors-head').hidden=!showColors;
  $('#part-colors').hidden=!showColors;
  const mouthAdjust=$('#mouth-height-adjust');mouthAdjust.hidden=c.key!=='mouth'||draft.mouth==='none';
  if(!mouthAdjust.hidden){const value=mouthOffset(draft.mouthOffset);$('#mouth-height').value=String(value);$('#mouth-height-label').textContent=value<0?`↑ ${Math.abs(value)} px`:value>0?`↓ ${value} px`:'Centro';}
  $('#hand-position-adjust').hidden=!positionAdjust;
  if(positionAdjust)renderPartPosition(c.key);
  if(sizeAdjust){
    const value=draft.partSizes?.[c.key]??1;
    $('#part-size').value=String(value);
    $('#part-size-label').textContent=`${Math.round(value*100)}%`;
    const colors=$('#part-colors');colors.innerHTML=!showColors?'':Object.entries(PART_PALETTE).map(([name,hex])=>`<button type="button" class="part-color ${name==='base'?'part-default':''}" data-part-color="${name}" style="${hex?`--part-swatch:${hex}`:''}" title="${({base:'Original',pink:'Rosa',blue:'Azul',mint:'Menta',gold:'Dourado',purple:'Lilás',cream:'Creme',brown:'Marrom'})[name]}" aria-label="${name==='base'?'Cor original':name}" aria-pressed="${(draft.partColors?.[c.key]||'base')===name}">${name==='base'?'↩':''}</button>`).join('');
  }
  $('#create-back').disabled=step===0;
  $('#create-next use').setAttribute('href',step===categories.length-1?'#i-check':'#i-next');
  $('#create-next').setAttribute('aria-label',step===categories.length-1?'Terminar criação':'Próximo');
}
function finishCreation(){
  const commit=()=>{
    clearCreatorSession(localStorage,DRAFT_KEY);
    const converted=toSave(selectionOf(draft).sel,selectionOf(draft).col,'baby',draft.scene||'garden');save={...createSave(Date.now(),{...converted.appearance,outfit:draft.outfit||'none',shoes:draft.shoes||'none',hands:draft.hands,handPosition:handPosition(draft.handPosition),partPositions:{...draft.partPositions},partSizes:{...(draft.partSizes||{})},partColors:{...(draft.partColors||{})},mouthOffset:mouthOffset(draft.mouthOffset)}),scene:converted.scene};creatingNew=false;
    const url=new URL(location.href);url.searchParams.delete('criar');history.replaceState(null,'',url);
    write();setStatus('ready');showScreen();say('Toque no ovo para conhecer seu amigo!');sound([440,590]);
  };
  if(save&&creatingNew)askConfirm('Criar outro pet?','O progresso do pet atual será substituído. Faça um backup antes se quiser guardá-lo.',commit);
  else commit();
}
function effect(type){
  const el=$('#world-effect');el.style.left=`${currentX}%`;el.innerHTML=item(type==='bath'?'water':type==='potty'?'play':type);
  el.classList.remove('show');void el.offsetWidth;el.classList.add('show');
}
function sceneObject(type,x){
  const el=$('#scene-object');el.style.left=`${type==='food'?75:x<50?12:88}%`;el.innerHTML=item(type);el.dataset.eaten='0';el.dataset.kind=type;el.classList.add('visible');
}
function constrainPosition(){
  if(!save||$('#play-screen').hidden)return;
  const wrap=$('#pet-wrap'),world=$('#world');
  const margin=Math.max(28,(wrap.clientWidth*(save.phase==='adult'?.6:.52)+8)/world.clientWidth*100);
  currentX=Math.max(margin,Math.min(100-margin,currentX));wrap.style.left=`${currentX}%`;
}
async function moveTo(x,token){
  const wrap=$('#pet-wrap');
  const margin=Math.max(28,(wrap.clientWidth*(save.phase==='adult'?.6:.52)+8)/$('#world').clientWidth*100);
  const target=Math.max(margin,Math.min(100-margin,x));
  if(Math.abs(currentX-target)<2)return true;
wrap.classList.toggle('turn-left',target<currentX);wrap.classList.add('moving');
  setMotion(playArt,'walk');wrap.style.left=`${target}%`;currentX=target;
  await sleep(1220);
  if(token!==flow)return false;
  wrap.classList.remove('moving');setMotion(playArt,'idle');
  return true;
}
let eyeGaze={x:0,y:0},lastEyeGazeAt=0;
function aimPetAt(clientX,clientY,brief=true){
  if(!save||save.phase==='egg'||!playArt)return;
  if(brief&&status==='ambient')cancelAmbient();
  const world=$('#world'),rect=world.getBoundingClientRect();
  const petX=rect.left+rect.width*currentX/100;
  const aim=gazeOffset(clientX,clientY,petX,rect.width,rect.top,rect.height);
  playArt.style.setProperty('--look-direction',`${aim.headAngle}deg`);
  playArt.style.setProperty('--look-lift',`${aim.headLift}px`);
  // Pupilas têm sua própria inércia. Cabeça acompanha suavemente, sem saltos.
  const flip=$('#pet-wrap').classList.contains('turn-left')?-1:1;
  const desired=clampGaze(aim.eyeX*flip*.9,aim.eyeY*.88);
  const now=performance.now();
  eyeGaze=easeGaze(eyeGaze,desired,lastEyeGazeAt?now-lastEyeGazeAt:80);
  lastEyeGazeAt=now;
  playArt.style.setProperty('--eye-x',`${Math.round(eyeGaze.x*20)/20}px`);
  playArt.style.setProperty('--eye-y',`${Math.round(eyeGaze.y*20)/20}px`);
  if(!brief||!['ready','ambient'].includes(status))return;
  setMotion(playArt,'look-target');clearTimeout(lookTimer);
  lookTimer=setTimeout(()=>{if(status==='ready'&&!$('#pet-wrap').classList.contains('flying')&&!$('#pet-wrap').classList.contains('jumping'))setMotion(playArt,'idle');resetGaze();},850);
}
function resetGaze(){
  if(!playArt)return;
  eyeGaze={x:0,y:0};lastEyeGazeAt=0;
  playArt.style.setProperty('--eye-x','0px');playArt.style.setProperty('--eye-y','0px');
  playArt.style.setProperty('--look-direction','0deg');playArt.style.setProperty('--look-lift','0px');
}

function stopGaze(){sceneLookMarker=null;sceneLookUntil=0;resetGaze();}
function gazeTargets(){
  const world=$('#world').getBoundingClientRect();
  const visible=element=>{if(!element||element.hidden||!element.getClientRects().length||Number(getComputedStyle(element).opacity)<.08)return false;const box=element.getBoundingClientRect();const x=box.left+box.width/2,y=box.top+box.height/2;return x>world.left+8&&x<world.right-8&&y>world.top+8&&y<world.bottom-8;};
  return [...document.querySelectorAll('#decorations .scene-decoration,#area-objects button,#room-toy,#bed,#scene-object.visible,#scene-life .scene-life,#scene-art .scene-focus')].filter(visible);
}
async function watchVisibleTarget(token,mode,chosen=null){
  const targets=gazeTargets();if(!targets.length)return null;
  // A escolha percorre objetos existentes: o olhar nunca aponta para um ponto vazio.
  const target=chosen||targets[gazeIndex++%targets.length];
  const started=performance.now();setMotion(playArt,'look-target');
  await new Promise(resolve=>{
    const follow=now=>{
      if(token!==flow||status!=='ambient'||document.hidden||!target.isConnected||now-started>=2300){gazeFrame=null;resolve();return;}
      const box=target.getBoundingClientRect();
      aimPetAt(box.left+box.width/2,box.top+box.height/2,false);
      gazeFrame=requestAnimationFrame(follow);
    };
    gazeFrame=requestAnimationFrame(follow);
  });
  if(token!==flow)return null;
  resetGaze();
  return target;
}
// Seguimento espontâneo dos alvos V63. Não depende de cliques nos objetos.
function startSceneGazeLoop(){
 if(sceneGazeLoopStarted)return;sceneGazeLoopStarted=true;
 const frame=now=>{
  requestAnimationFrame(frame);
  if(document.hidden||!save||creatingNew||save.phase==='egg'||!$('#play-screen')||$('#play-screen').hidden)return;
  if(now-sceneGazeLast<95)return;sceneGazeLast=now;
  const stage=$('#scene-art .v64-scene-stage');if(!stage)return;
  updateSceneMarkers(stage,now-sceneClock);
  if(status!=='ready'||$('#pet-wrap')?.classList.contains('airborne')||$('#pet-wrap')?.classList.contains('moving')){
    if(sceneLookMarker){sceneLookMarker=null;sceneLookUntil=0;resetGaze();}
    return;
  }
  // Breve pausa entre olhares para o pet continuar respirando e piscando.
  if(!sceneLookMarker){
   if(now<sceneLookUntil)return;
   const markers=prioritySceneMarkers(stage);if(!markers.length)return;
   sceneLookMarker=markers[sceneWatchIndex++%markers.length];
   sceneLookUntil=now+3000+(sceneWatchIndex%2)*350;
   setMotion(playArt,'look-target');
  }
  if(!sceneLookMarker?.isConnected||now>=sceneLookUntil){
   sceneLookMarker=null;sceneLookUntil=now+1000;resetGaze();setMotion(playArt,'idle');return;
  }
  // Outras animações legadas podem solicitar idle enquanto observamos;
  // reativar o giro da cabeça sem interromper os cuidados (só em ready).
  if(playArt.dataset.motion!=='look-target')setMotion(playArt,'look-target');
  const rect=sceneLookMarker.getBoundingClientRect();
  aimPetAt(rect.left+rect.width/2,rect.top+rect.height/2,false);
 };
 requestAnimationFrame(frame);
}
let airLandingTimer=null;
const MAX_AIR_STEPS=4;
function stopAirMotion(returnIdle=true){
 clearTimeout(airTimer);clearTimeout(airLandingTimer);airTimer=null;airLandingTimer=null;flightLevel=0;jumpStreak=0;
 const wrap=$('#pet-wrap');if(wrap){wrap.classList.remove('flying','fly-pulse','jumping','airborne','air-landing','air-impulse');wrap.style.removeProperty('--air-height');wrap.style.removeProperty('--flight-height');wrap.style.removeProperty('--jump-height');}
 if(returnIdle&&playArt&&status==='ready')setMotion(playArt,'idle');
}
function airLanding(){
 const wrap=$('#pet-wrap');if(!wrap||(!flightLevel&&!jumpStreak)||status!=='ready')return;
 clearTimeout(airTimer);airTimer=null;
 const winged=petCanFly(save.appearance);
 wrap.classList.remove('air-impulse');wrap.classList.add('air-landing');
 wrap.style.setProperty('--air-height','0px');
 if(winged)setMotion(playArt,'fly');
 airLandingTimer=setTimeout(()=>{
   if(status!=='ready')return;
   wrap.classList.remove('airborne','flying','jumping','air-landing');wrap.classList.add('landing-impact');
   setMotion(playArt,'land');sound([260,380]);
   setTimeout(()=>wrap.classList.remove('landing-impact'),460);
   flightLevel=0;jumpStreak=0;airLandingTimer=setTimeout(()=>{if(status==='ready'){setMotion(playArt,'idle');scheduleAmbient();}},460);
 },620);
}
function reactToUpperTap(x){
 if(!save||save.phase==='egg'||status!=='ready')return;
 const wrap=$('#pet-wrap'),world=$('#world');
 const winged=petCanFly(save.appearance);
 if(wrap.classList.contains('air-landing')){
   // Evita voltar bruscamente ao topo durante a descida: termina o pouso antes de iniciar outra sequência.
   return;
 }
 clearTimeout(airTimer);clearTimeout(airLandingTimer);airTimer=null;airLandingTimer=null;
 clearTimeout(ambientTimer);ambientTimer=null;
 const margin=Math.max(28,(wrap.clientWidth*(save.phase==='adult'?.6:.52)+8)/world.clientWidth*100);
 const target=Math.max(margin,Math.min(100-margin,x));currentX=currentX+(target-currentX)*.28;wrap.style.left=`${currentX}%`;
 const level=winged?(flightLevel=nextAirStep(flightLevel,MAX_AIR_STEPS)):(jumpStreak=nextAirStep(jumpStreak,MAX_AIR_STEPS));
 if(winged)jumpStreak=0;else flightLevel=0;
 // A altura é limitada ao espaço livre para que a cabeça nunca corte o teto do mundo.
 const cap=Math.max(34,world.clientHeight-wrap.clientHeight-(parseFloat(getComputedStyle(wrap).bottom)||35)-22);
 const height=Math.round(Math.min(cap,level*(winged?29:28)));
 wrap.classList.toggle('flying',winged);wrap.classList.toggle('jumping',!winged);
 wrap.classList.add('airborne');wrap.classList.remove('air-impulse');void wrap.offsetWidth;wrap.classList.add('air-impulse');
 wrap.style.setProperty('--air-height',`${height}px`);
 setMotion(playArt,winged?'fly':'jump');sound([440+level*55,560+level*45]);
 airTimer=setTimeout(airLanding,1250);
}
async function doCare(type){
  if(type==='play'&&!canPlay(save)){explainLowEnergy();updatePlayAvailability();return;}
  if(type==='sleep'&&status==='sleeping'){await wakePet();return;}
  try{await runCare(type);}catch(error){
    console.error('Cuidado interrompido:',error);cancelFlow();say('Vamos tentar outra vez.');
  }
}
async function runCare(type){
  if(!['ready','ambient'].includes(status)||save?.phase==='egg'||!CARE[type])return;
  if(type==='play'&&!canPlay(save)){explainLowEnergy();updatePlayAvailability();return;}
  if(status==='ambient')cancelAmbient();
  stopAirMotion(false);
  clearEffect();const token=++flow,ui=careUI[type];if(type==='play')authorizedPlayToken=token;const act=ACT[type];if(act){SFX[act.sfx]?.();playArt.querySelector('#fx').innerHTML=fx(act.fx);}if(type==='food')$('#food-piece').dataset.stage='hidden';
  save=noteInteraction(save);write();setStatus('moving');say('');
  setStatus('perceiving');setMotion(playArt,'notice');
  if(ui.x!==null)sceneObject(type,ui.x);
  if(!await hold(420,token))return;
  setStatus('moving');
  if(ui.x!==null&&!await moveTo(ui.x,token))return;
  $('#world').style.setProperty('--pet-x',`${currentX}%`);if(type==='food')$('#scene-object').style.left=`${Math.min(94,currentX+19)}%`;
  setStatus('preparing');setMotion(playArt,type==='food'?'food-ready':'notice');
  if(!await hold(380,token))return;
  if(token!==flow)return;
  if(type==='play'){startMiniGame(token,chosenToy);return;}
  if(type==='sleep'){await settlePet(token);return;}
  if(type==='bath')drawPet(playArt,save.appearance,save.phase,'happy');
  if(type==='food'){
    const piece=$('#food-piece'),bowl=$('#scene-object');
    const phases=[['food-reach',650,'whole','0'],['food-bite',650,'whole','1'],['food-chew',1050,'bitten','2'],['food-swallow',480,'hidden','3']];
    for(const [motion,duration,foodStage,eaten] of phases){
      setStatus('acting');setMotion(playArt,motion);piece.dataset.stage=foodStage;bowl.dataset.eaten=eaten;
      if(!await hold(duration,token))return;
    }
    const result=applyCare(save,'food',Date.now());
    if(!result.changed){piece.dataset.stage='hidden';commitCare(type,token);return;}
    committedFlow=token;save=result.save;write();renderGrowth();
    const button=document.querySelector('[data-care="food"]');button.classList.remove('care-done');void button.offsetWidth;button.classList.add('care-done');
    sound([480,640]);say(careUI.food.label);effect('food');
    setStatus('reacting');setMotion(playArt,'satisfied');
    if(!await hold(650,token))return;
    bowl.classList.remove('visible');piece.dataset.stage='hidden';
    setMotion(playArt,'idle');if(result.evolved)showEvolution();else {setStatus('ready');recordDiscovery();}
    return;
  }
  const sequences={
    water:[['water-look',420],['water-lower',500],['water-sip',1150],['water-lift',420]],
    bath:[['bath-notice',420],['bath-sponge',850],['bath-rinse',950],['bath-shake',650]],
    potty:[['potty-ask',450],['potty-private',1150],['potty-clean',500],['potty-relief',450]],
    love:[['love-look',420],['love-lean',850],['love-blink',650],['love-return',400]],
    injection:[['health-notice',450],['health-ready',500],['health-injection',650],['health-relief',650]],
  };
  const layer=$('#care-layer');layer.dataset.care=type;layer.dataset.phase='start';playArt.dataset.care=type;
  if(type==='love'){layer.dataset.variant=String((save.actionCount||0)%2);playArt.dataset.loveVariant=layer.dataset.variant;}
  for(const [motion,duration] of sequences[type]){
    setStatus('acting');setMotion(playArt,motion);layer.dataset.phase=motion;playArt.dataset.carePhase=motion;
    if(type==='bath')$('#pet-wrap').dataset.bathing=String(motion==='bath-sponge'||motion==='bath-rinse');
    if(!await hold(duration,token))return;
  }
  if(type==='bath')delete $('#pet-wrap').dataset.bathing;
  layer.dataset.phase='done';setStatus('reacting');setMotion(playArt,'satisfied');
  if(!await hold(500,token))return;
  layer.dataset.care='';playArt.dataset.care='';commitCare(type,token);
}
function commitCare(type,token){
  if(token!==flow||committedFlow===token)return;
  committedFlow=token;
  const result=applyCare(save,type,Date.now(),type==='play'&&authorizedPlayToken===token);
  if(type==='play')authorizedPlayToken=-1;
  if(result.changed){save=result.save;write();renderGrowth();const button=document.querySelector(`[data-care="${type}"]`);button.classList.remove('care-done');void button.offsetWidth;button.classList.add('care-done');sound(type==='sleep'?[430,360]:[480,640]);say(careUI[type].label);effect(type);}
  else say('Vamos tentar outra coisa!');
  $('#scene-object').classList.remove('visible');
  setMotion(playArt,'idle');
  if(result.evolved)showEvolution();else {setStatus('ready');recordDiscovery();}
}
function startGardenAdventure(token){
 setStatus('minigame');setMotion(playArt,'curious');clearEffect();const host=$('#mini-targets');host.hidden=false;
 let step='path',busy=false,route='left';
 const trail=`<svg viewBox="0 0 100 70" aria-hidden="true"><ellipse cx="50" cy="55" rx="45" ry="11" fill="#e7caa4" stroke="#765d6d" stroke-width="3"/><ellipse cx="34" cy="52" rx="8" ry="4" fill="#c7a68c"/><ellipse cx="67" cy="57" rx="8" ry="4" fill="#c7a68c"/><path d="M50 18v24m-8-8 8 8 8-8" stroke="#fff8e5" stroke-width="5" fill="none"/></svg>`;
 const pond=`<svg viewBox="0 0 100 80" aria-hidden="true"><ellipse cx="50" cy="57" rx="43" ry="18" fill="#79bbce" stroke="#466d83" stroke-width="4"/><path d="M24 55q9-6 19 0m12 6q10-6 20 0" fill="none" stroke="#e9fcfa" stroke-width="4"/><path d="M15 44q-3-12 2-17m5 16q2-14 7-17" stroke="#79a867" stroke-width="5"/></svg>`;
 const sprout=`<svg viewBox="0 0 100 100" aria-hidden="true"><ellipse cx="50" cy="87" rx="32" ry="9" fill="#947960"/><path d="M50 84V51M50 68Q23 44 21 64q12 12 29 10M50 62q20-24 28-5-10 11-28 11" fill="#8bcc8f" stroke="#487656" stroke-width="4"/><circle cx="50" cy="49" r="10" fill="#d9ab80"/></svg>`;
 const gate=`<svg viewBox="0 0 100 110" aria-hidden="true"><path d="M12 102V46Q12 9 50 9t38 37v56" fill="#d5b3df" stroke="#574b6c" stroke-width="5"/><path d="M25 102V48Q25 25 50 25t25 23v54Z" fill="#637b82"/><path d="m50 44 5 10 11 1-8 8 2 12-10-6-10 6 2-12-8-8 11-1Z" fill="#ffe395" stroke="#574b6c" stroke-width="3"/></svg>`;
 const place=(action,art,label,x,y,cls='')=>`<button type="button" class="garden-object ${cls}" data-adventure="${action}" aria-label="${label}" style="--gx:${x}%;--gy:${y}%">${art}</button>`;
 const draw=()=>{
  if(token!==flow)return;let view='';
  if(step==='path')view=place('left',trail,'Seguir caminho da esquerda',22,72,'trail')+place('right',trail,'Seguir caminho da direita',78,72,'trail');
  if(step==='water')view=place('water',pond,'Pegar água no lago',route==='left'?24:76,64,'pond')+place('decor',sprout,'Flor esperando água',route==='left'?75:25,66,'plant');
  if(step==='flower')view=place('flower',sprout,'Regar a plantinha',route==='left'?75:25,66,'plant')+`<div class="garden-carry">${item('water')}</div>`;
  if(step==='match')view=place('star',gate,'Abrir portão com estrela',75,58,'gate')+place('circle',TOY_ART.ball,'Bola',25,75,'ball')+`<div class="garden-carry">${ACTIVITY_ART.stars}</div>`;
  host.innerHTML=view+'<button type="button" class="mini-exit" aria-label="Voltar aos cuidados">←</button>';
  host.querySelector('.mini-exit').onclick=()=>{if(token===flow)cancelFlow();};
  host.querySelectorAll('[data-adventure]').forEach(button=>button.onclick=async()=>{
   if(busy||token!==flow)return;const action=button.dataset.adventure;const next=adventureStep(step,action);
   if(next===step){button.classList.remove('try-again');void button.offsetWidth;button.classList.add('try-again');return;}
   busy=true;button.disabled=true;
   if(step==='path'||step==='water'||step==='flower'||step==='match'){
    const x=Number.parseFloat(button.style.getPropertyValue('--gx'));await moveTo(x,token);if(token!==flow)return;
   }
   if(step==='path')route=action;
   setMotion(playArt,step==='flower'?'flower-water':step==='match'?'surprise-open':'curious');sound([480,590]);
   if(step==='flower')button.innerHTML=ACTIVITY_ART.flowers;
   if(!await hold(850,token))return;
   step=next;busy=false;
   if(step==='celebrate'){
    host.innerHTML=`<div class="garden-celebrate">${OBJECT_ART.butterfly}${ACTIVITY_ART.flowers}${ACTIVITY_ART.stars}</div>`;
    setMotion(playArt,'play-celebrate');if(!await hold(1600,token))return;finishActivity(token,'adventure');return;
   }
   setMotion(playArt,'curious');draw();
  });
 };draw();
}
function startPeek(token){
 setStatus('minigame');setMotion(playArt,'curious');const host=$('#mini-targets');host.hidden=false;let round=0,busy=false;
 const draw=()=>{
  const surprise=Math.floor(Math.random()*3);setMotion(playArt,'look');
  host.innerHTML=[20,50,80].map((x,i)=>`<button type="button" class="mini-target" style="--tx:${x}%;--ty:65%" data-peek="${i}" aria-label="Abrir caixa">${ACTIVITY_ART.peek}</button>`).join('')+'<button type="button" class="mini-exit" aria-label="Voltar aos cuidados">←</button>';
  host.querySelector('.mini-exit').addEventListener('click',()=>{if(token===flow){cancelFlow();setStatus('ready');}});
  host.querySelectorAll('[data-peek]').forEach(button=>button.addEventListener('click',async()=>{
   if(busy||token!==flow||status!=='minigame')return;busy=true;
   button.innerHTML=Number(button.dataset.peek)===surprise?ACTIVITY_ART.stars:TOY_ART.ball;
   setMotion(playArt,'surprise-open');sound([500,650]);await sleep(850);if(token!==flow)return;
   round++;if(round<3){busy=false;draw();return;}
   host.hidden=true;host.innerHTML='';setMotion(playArt,'play-celebrate');await sleep(650);if(token===flow)commitCare('play',token);
  }));
 };draw();
}
function startMiniGame(token,toy='ball'){
  setStatus('minigame');setMotion(playArt,'play');clearEffect();$('#scene-object').classList.remove('visible');$('#care-layer').dataset.care='play';say('');
  if(toy==='tidy'){const box=$('#scene-object');box.dataset.kind='tidy';box.innerHTML=ACTIVITY_ART.tidy;box.style.left='87%';box.classList.add('visible');}
  const positions=({drum:[[24,73],[68,73],[43,73]],kite:[[23,22],[69,15],[45,26]],butterfly:[[18,32],[69,21],[43,37]],car:[[18,73],[68,73],[41,76]],rattle:[[26,48],[65,38],[40,52]],book:[[22,68],[66,68],[43,68]],plush:[[20,70],[69,64],[45,67]],surprise:[[28,67],[66,67],[45,70]],instrument:[[23,70],[67,70],[45,70]],flowers:[[19,71],[72,72],[45,77]],stars:[[22,20],[73,26],[45,13]],tidy:[[17,73],[74,73],[44,75]],race:[[70,73],[27,73],[68,73]],faces:[[22,25],[70,22],[45,20]]})[toy]||(save.phase==='baby'?[[18,26],[67,17],[43,45]]:[[24,35],[67,18],[55,44]]);
  const art=TOY_ART[toy]||ACTIVITY_ART[toy]||OBJECT_ART.butterfly;
  const faceArt=[ACTIVITY_ART.faces,'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="25" fill="#ffe5a9" stroke="#365788" stroke-width="4"/><path d="M17 27q7 7 14 0m3 0q7 7 14 0" fill="none" stroke="#365788" stroke-width="3"/><path d="M25 42h14" stroke="#365788" stroke-width="3"/></svg>','<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="25" fill="#ffe5a9" stroke="#365788" stroke-width="4"/><path d="m21 23 2 5 5 1-5 2-2 5-2-5-5-2 5-1Zm22 0 2 5 5 1-5 2-2 5-2-5-5-2 5-1Z" fill="#fff" stroke="#365788" stroke-width="2"/><path d="M21 43q11 10 22 0" fill="none" stroke="#365788" stroke-width="3"/></svg>'];
  const total=toy==='flowers'||toy==='stars'?5:toy==='tidy'?4:3;
  const watch={kite:'kite-watch',butterfly:'butterfly-watch',drum:'drum-ready',car:'car-watch',rattle:'rattle-listen',book:'book-look',plush:'plush-want',surprise:'surprise-wonder',instrument:'instrument-listen',flowers:'flower-watch',stars:'look-up',tidy:'tidy-look',race:'race-ready',faces:'curious'};
  const act={drum:'drum-beat',kite:'kite-reach',butterfly:'butterfly-reach',car:'car-push',rattle:'rattle-shake',book:'book-page',plush:'plush-hug',surprise:'surprise-open',instrument:'instrument-play',flowers:'flower-water',stars:'star-find',tidy:'tidy-pack',race:'walk',faces:'imitate'};
  let index=0;
  const container=$('#mini-targets');container.hidden=false;
  const draw=()=>{
    const [x,y]=positions[index%positions.length];playArt.style.setProperty('--look-direction',x<50?'-5deg':'5deg');setMotion(playArt,watch[toy]||'play-watch');
    container.innerHTML=`<button type="button" class="mini-target ${toy}" style="--tx:${x}%;--ty:${y}%" aria-label="Tocar na figura">${toy==='tidy'?[TOY_ART.ball,TOY_ART.car,TOY_ART.plush][index%3]:toy==='faces'?faceArt[index]:art}</button><button type="button" class="mini-exit" aria-label="Voltar aos cuidados">←</button>`;
    container.querySelector('.mini-exit').addEventListener('click',()=>{if(token===flow){cancelFlow();setStatus('ready');}});
    const target=container.querySelector('.mini-target');let used=false;
    target.addEventListener('click',async()=>{
      if(used||token!==flow||status!=='minigame')return;
      used=true;setMotion(playArt,act[toy]||'play-reach');
      if(toy==='faces')drawPet(playArt,save.appearance,save.phase,['happy','sleepy','excited'][index]);
      if(['ball','bubbles','car','plush','tidy'].includes(toy)){target.style.setProperty('--tx',toy==='tidy'?'87%':`${currentX}%`);target.style.setProperty('--ty',toy==='plush'?'62%':'78%');}
      target.classList.add('used');sound(toy==='drum'?[180+index*35]:[520+index*90]);
      if(toy==='race'){await moveTo(x,token);if(token!==flow)return;}
      else await sleep(toy==='faces'?650:420);if(token!==flow)return;
      index++;
      if(index<total)draw();else{container.hidden=true;container.innerHTML='';setMotion(playArt,['drum','instrument'].includes(toy)?'dance':save.phase==='adult'?'adult-celebrate':'play-celebrate');await sleep(650);if(token!==flow)return;save=noteMoment(save,MOMENTS.includes(toy)?toy:'');write();$('#care-layer').dataset.care='';commitCare('play',token);}
    });
  };draw();
}
async function finishActivity(token,key){
  if(token!==flow)return;
  setMotion(playArt,save.phase==='adult'?'adult-celebrate':'play-celebrate');
  if(!await hold(650,token))return;
  save=noteMoment(save,key);write();$('#mini-targets').hidden=true;$('#mini-targets').innerHTML='';
  $('#care-layer').dataset.care='';commitCare('play',token);
}
const shapeArt={circle:'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="20" fill="#f8afc7" stroke="#345785" stroke-width="4"/></svg>',diamond:'<svg viewBox="0 0 64 64"><path d="M32 8 56 32 32 56 8 32Z" fill="#ffe39a" stroke="#345785" stroke-width="4"/></svg>',square:'<svg viewBox="0 0 64 64"><rect x="11" y="11" width="42" height="42" rx="6" fill="#a9dfc4" stroke="#345785" stroke-width="4"/></svg>'};
function startSequence(token){
  setStatus('minigame');setMotion(playArt,'curious');$('#care-layer').dataset.care='play';
  const container=$('#mini-targets'),order=['circle','diamond','square'];let index=0,busy=false;container.hidden=false;
  const draw=()=>{
    container.innerHTML=`<div class="sequence-strip">${order.map((key,i)=>`<span class="${i===index?'current':i<index?'done':''}">${shapeArt[key]}</span>`).join('')}</div><div class="sequence-choices">${order.map(key=>`<button type="button" data-shape="${key}" aria-label="Escolher figura">${shapeArt[key]}</button>`).join('')}</div><button class="mini-exit" type="button" aria-label="Voltar aos cuidados">←</button>`;
    container.querySelector('.mini-exit').onclick=()=>cancelFlow();
    container.querySelectorAll('[data-shape]').forEach(button=>button.onclick=async()=>{
      if(token!==flow||busy)return;
      if(button.dataset.shape!==order[index]){button.classList.remove('try-again');void button.offsetWidth;button.classList.add('try-again');sound([340]);return;}
      busy=true;setMotion(playArt,'imitate');sound([500+index*90]);await sleep(550);if(token!==flow)return;
      index++;busy=false;if(index<3)draw();else finishActivity(token,'sequence');
    });
  };draw();
}
function startDance(token){
  setStatus('minigame');setMotion(playArt,'curious');$('#care-layer').dataset.care='play';
  const container=$('#mini-targets');container.hidden=false;container.dataset.started='';
  container.innerHTML=`<div class="song-choices">${[0,1,2].map(i=>`<button type="button" data-song="${i}" aria-label="Escolher música" style="--song-color:${['#f9afc5','#a9d6ee','#ffe09b'][i]}">${ACTIVITY_ART.dance}</button>`).join('')}</div><button class="mini-exit" type="button" aria-label="Voltar aos cuidados">←</button>`;
  container.querySelector('.mini-exit').onclick=()=>cancelFlow();
  container.querySelectorAll('[data-song]').forEach(button=>button.onclick=async()=>{
    if(token!==flow||container.dataset.started==='1')return;
    container.dataset.started='1';container.querySelector('.song-choices').innerHTML='<span class="dance-notes" aria-hidden="true">'+ACTIVITY_ART.dance+'</span>';
    const songs=[[440,550,660],[520,660,780],[380,480,570]],notes=songs[Number(button.dataset.song)];
    for(let i=0;i<3;i++){if(token!==flow)return;setMotion(playArt,['dance','dance-step','dance-spin'][i]);sound([notes[i],notes[(i+1)%3]]);if(!await hold(820,token))return;}
    container.dataset.started='';finishActivity(token,'dance');
  });
}
function startPainting(token){
  setStatus('minigame');setMotion(playArt,'curious');$('#care-layer').dataset.care='play';
  const container=$('#mini-targets');container.hidden=false;
  let color=save.drawingColor||save.appearance.color||'pink';if(!COLORS[color])color='pink';
  container.innerHTML=`<div class="paint-board"><div id="paint-preview"></div><div class="paint-colors">${['pink','blue','green','yellow'].map(key=>`<button type="button" data-paint="${key}" aria-label="Pintar de ${key}" style="background:${COLORS[key][0]}"></button>`).join('')}</div><button id="paint-done" type="button" aria-label="Terminar pintura">✓</button></div><button class="mini-exit" type="button" aria-label="Voltar aos cuidados">←</button>`;
  const draw=()=>{const {sel,col}=selectionOf({...save.appearance,color,colors:COLORS[color]});$('#paint-preview').innerHTML=svg(pixelPet(sel,col,{stage:stageOf(save.phase),mood:'happy',outfit:save.appearance.outfit,shoes:save.appearance.shoes,partSizes:save.appearance.partSizes,partColors:save.appearance.partColors,mouthOffset:save.appearance.mouthOffset,hands:save.appearance.hands,handPosition:save.appearance.handPosition,partPositions:save.appearance.partPositions}));container.querySelectorAll('[data-paint]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.paint===color));};draw();
  container.querySelector('.mini-exit').onclick=()=>cancelFlow();
  container.querySelectorAll('[data-paint]').forEach(button=>button.onclick=()=>{if(token!==flow)return;color=button.dataset.paint;draw();sound([550]);});
  $('#paint-done').onclick=()=>{if(token!==flow)return;save={...save,drawingColor:color};write();finishActivity(token,'paint');};
}
async function startEvent(key,token){
  if(token!==flow)return;
  clearEffect();setStatus('event');setMotion(playArt,'surprise-wonder');$('#event-hint').hidden=true;
  const layer=$('#event-layer');layer.dataset.event=key;
  const dots=['rain','snow','party','night'].includes(key)?Array.from({length:14},(_,i)=>`<i style="--x:${(i*37)%93+3}%;--delay:${(i*17)%11/10}s"></i>`).join(''):'';
  layer.innerHTML=`${key==='costume'?'':EVENT_ART[key]}${dots}`;
  if(key==='costume'){
    drawPet(playArt,save.appearance,save.phase,'excited');
    const {col}=selectionOf(save.appearance),party=PARTS.accessory[IDS.accessory.indexOf('party')];
    playArt.querySelector('.atelier-head')?.insertAdjacentHTML('beforeend',party.f(col));
    playArt.dataset.eventCostume='1';
  }
  $('#mini-targets').hidden=false;$('#mini-targets').innerHTML='<button type="button" class="mini-exit" aria-label="Voltar aos cuidados">←</button>';
  $('#mini-targets .mini-exit').onclick=()=>cancelFlow();
  // Eventos preservam o cenário V63 ao fundo; não substituem os quadros durante a ação.
  if(!await hold(550,token))return;
  setMotion(playArt,key==='party'?'dance':key==='gift'?'surprise-open':key==='rain'||key==='snow'?'bath-shake':'look-up');
  sound(key==='party'?[520,660,790]:key==='gift'?[440,660,880]:[420,520]);
  if(!await hold(2300,token))return;
  save=noteMoment(save,key);write();layer.innerHTML='';layer.dataset.event='';$('#mini-targets').hidden=true;$('#mini-targets').innerHTML='';renderArea();if(playArt.dataset.eventCostume){drawPet(playArt,save.appearance,save.phase,moodFromNeeds(save.needs));delete playArt.dataset.eventCostume;}setMotion(playArt,'idle');setStatus('ready');effect('play');
}
function showEvolution(){
  recordDiscovery();setStatus('ready');sound([400,520,660]);setMotion(playArt,'happy');
  const token=flow;setTimeout(()=>{if(flow===token&&status==='ready'&&playArt.dataset.motion==='happy')setMotion(playArt,'idle');},1000);
}
function askConfirm(title,text,onYes){
  const dialog=$('#confirm-dialog');$('#confirm-title').textContent=title;$('#confirm-text').textContent=text;dialog.showModal();
  $('#confirm-no').onclick=()=>dialog.close();$('#confirm-yes').onclick=()=>{dialog.close();onYes();};
}
function updateSleepingProgress(){
 if(!save?.sleeping||document.hidden)return;
 const now=Date.now(),delta=now-lastSleepTick;lastSleepTick=now;
 const next=restSleep(save,delta,now);if(next!==save){save=next;write();drawNeeds();}
}
function stopSleepTimer(){if(sleepTimer){clearInterval(sleepTimer);sleepTimer=null;}}
function startSleepTimer(){stopSleepTimer();if(document.hidden||!save?.sleeping)return;lastSleepTick=Date.now();sleepTimer=setInterval(updateSleepingProgress,1000);}
async function settlePet(token){
 if(area==='bedroom'&&lampOn){lampOn=false;renderArea();sound([480,360]);}
 setStatus('acting');setMotion(playArt,'sleep-yawn');if(!await hold(650,token))return;
 setMotion(playArt,'sleep-settle');if(!await hold(650,token))return;
 save=beginSleep(save,Date.now());write();$('#scene-object').classList.remove('visible');clearEffect();
 setStatus('sleeping');setMotion(playArt,'sleep-rest');$('#need-cue').hidden=true;drawNeeds();say('Dormindo...');startSleepTimer();
}
async function wakePet(){
 if(status!=='sleeping'||!save?.sleeping)return;
 updateSleepingProgress();stopSleepTimer();const token=++flow;save=endSleep(save,Date.now());write();
 setStatus('acting');setMotion(playArt,'sleep-wake');if(!await hold(650,token))return;
 renderGrowth();setMotion(playArt,'idle');setStatus('ready');say('Bom dia!');recordDiscovery();
}
function startTicks(){
  if(tickTimer)clearInterval(tickTimer);
  lastTick=Date.now();
  tickTimer=setInterval(()=>{
    const now=Date.now(),delta=now-lastTick;lastTick=now;
    const active=['ready','ambient','moving','perceiving','preparing','acting','reacting','minigame','event'].includes(status);
    if(!save||!active||document.hidden)return;
    const result=advance(save,delta,now,status==='ready');
    if(result.save!==save){save=result.save;write();drawNeeds();if(status==='ready'){renderGrowth();if(result.evolved)showEvolution();}}
  },4_000);
}
async function hold(duration,token){await sleep(duration);return token===flow&&!document.hidden;}
function cancelAmbient(){
  stopGaze();
  const wrap=$('#pet-wrap'),world=$('#world');
  currentX=parseFloat(getComputedStyle(wrap).left)/world.clientWidth*100;
  wrap.style.transition='none';wrap.style.left=`${currentX}%`;void wrap.offsetWidth;wrap.style.transition='';
  flow++;$('#pet-wrap').classList.remove('moving');setMotion(playArt,'idle');setStatus('ready');}
function scheduleAmbient(){
  if(ambientTimer)clearTimeout(ambientTimer);
  ambientTimer=setTimeout(async()=>{
    if(save&&save.phase!=='egg'&&status==='ready'&&!document.hidden){
      const token=++flow;setStatus('ambient');
      const requesting=needStatus(save.needs[lowestNeed(save)]).request;
      const mode=ambientIndex++%18;
      let watched=null;
      if(mode%3===1)watched=await watchVisibleTarget(token,mode);
      else if(!requesting&&mode===2)await moveTo(currentX<50?62:38,token);
      else if(requesting&&mode%3===0)setMotion(playArt,lowestNeed(save)==='energy'?'sleep-yawn':'request');
      else setMotion(playArt,['look','stretch','walk','ear-twitch','settle','sniff','curious','sit','tail-wave',area==='garden'?'butterfly-watch':area==='kitchen'?'sniff':'dance',save.phase==='baby'?'quiet-blink':'book-look',save.phase==='baby'?'paw-step':'plush-hug',save.phase==='adult'?'proud':'curious','quiet-blink','look-up','greet',save.phase==='baby'?'paw-step':'dance-step','sleep-yawn'][mode]);
      if(watched&&token===flow){
        const kind=watched.className?.baseVal||watched.className||'';
        setMotion(playArt,/butterfly|bird|ufo/.test(kind)?'butterfly-reach':/star|planet|space/.test(kind)?'look-up':/crab|fish/.test(kind)?'sit':'curious');
      }
      if(mode===15&&area==='garden'&&!requesting){$('#event-hint').hidden=false;clearTimeout(eventHintTimer);eventHintTimer=setTimeout(()=>$('#event-hint').hidden=true,16000);}
      if(await hold(watched?850:mode===7?2500:1800,token)){resetGaze();setMotion(playArt,'idle');setStatus('ready');}
    }
    if(!document.hidden)scheduleAmbient();
  },12000+Math.random()*6000);
}
function cancelFlow(){
  stopGaze();
  if($('#pet-wrap'))delete $('#pet-wrap').dataset.bathing;
  selectedDecoration=null;decorationDrag=null;renderDecorations();
  cancelAlbumDrag(false);chosenDecoration=null;
  stopAirMotion(false);clearTimeout(lookTimer);lookTimer=null;
  if(ambientTimer){clearTimeout(ambientTimer);ambientTimer=null;}
  clearTimeout(eventHintTimer);eventHintTimer=null;authorizedPlayToken=-1;flow++;$('#mini-targets').hidden=true;$('#mini-targets').innerHTML='';$('#mini-targets').dataset.started='';$('#scene-object').classList.remove('visible');$('#care-layer').dataset.care='';$('#food-piece').dataset.stage='hidden';$('#pet-wrap').classList.remove('moving');$('#egg').classList.remove('hatching');$('#area-map').hidden=true;$('#toy-picker').hidden=true;$('#event-hint').hidden=true;$('#event-layer').innerHTML='';$('#event-layer').dataset.event='';clearEffect();
  if($('#wardrobe-panel')&&!$('#wardrobe-panel').hidden){$('#wardrobe-panel').hidden=true;$('#extras-shade').hidden=true;}
  if(save&&scene&&area==='garden')renderArea();
  if(playArt){if(playArt.dataset.eventCostume){drawPet(playArt,save.appearance,save.phase,moodFromNeeds(save.needs));delete playArt.dataset.eventCostume;}playArt.dataset.care='';setMotion(playArt,'idle');}
  if(save&&status!=='evolving'&&status!=='parents'){setStatus(save.sleeping?'sleeping':'ready');if(save.sleeping)setMotion(playArt,'sleep-rest');}
  if(!document.hidden)scheduleAmbient();
}
const wardrobeNames={outfit:{none:'Sem roupa',dress:'Vestido',overalls:'Jardineira',vest:'Colete',cardigan:'Casaquinho',sailor:'Marinheiro',pajamas:'Pijama',hoodie:'Moletom',raincoat:'Capa de chuva',kimono:'Quimono',princess:'Princesa',superhero:'Super-herói',pirate:'Pirata',astronaut:'Astronauta',bee:'Abelhinha',wizardrobe:'Mago',winter:'Casaco de inverno',chef:'Chef',sport:'Esportiva',flower:'Floral',dinosaur:'Dinossauro'},shoes:{none:'Sem sapatos',shoes:'Sapatinhos',sneakers:'Tênis',heels:'Saltinhos',boots:'Botinhas',slippers:'Pantufas',sandals:'Sandálias',rainboots:'Galochas',rollers:'Patins',highTops:'Tênis altos',ballet:'Balé',flipflops:'Chinelos',loafers:'Sociais',snowboots:'Botas de neve'}};
let wardrobeKind='outfit';
function drawWardrobe(){
 const panel=$('#wardrobe-panel'),kind=wardrobeKind,chosen=save.appearance[kind]||'none';
 panel.innerHTML=`<button type="button" id="wardrobe-close" class="extra-close" aria-label="Voltar">×</button><div class="wardrobe-preview" aria-hidden="true"></div><div class="wardrobe-choices">${OPTIONS[kind].map(value=>{
  const candidate={...save.appearance,[kind]:value},{sel,col}=selectionOf(candidate),label=wardrobeNames[kind][value];
  const art=svg(pixelPet(sel,col,{stage:stageOf(save.phase),mood:'happy',outfit:candidate.outfit,shoes:candidate.shoes,partSizes:candidate.partSizes,partColors:candidate.partColors,mouthOffset:candidate.mouthOffset,hands:candidate.hands,handPosition:candidate.handPosition,partPositions:candidate.partPositions}));
  return `<button type="button" data-wardrobe="${value}" aria-label="${label}" aria-pressed="${value===chosen}">${art}<span>${label}</span></button>`;
 }).join('')}</div>`;
 drawPet(panel.querySelector('.wardrobe-preview'),save.appearance,save.phase,'happy');
}
function openWardrobe(kind){
 if(status==='ambient')cancelAmbient();if(status!=='ready'||!save||save.phase==='egg')return;
 wardrobeKind=kind;drawWardrobe();$('#extras-shade').hidden=false;$('#wardrobe-panel').hidden=false;setStatus('wardrobe');
}
function closeWardrobe(){
 $('#wardrobe-panel').hidden=true;$('#extras-shade').hidden=true;setStatus('ready');setMotion(playArt,'idle');
}
function setupActionGroups(){
  const grid=$('#care-grid');
  grid.insertAdjacentHTML('beforeend','<button type="button" data-care="injection" aria-label="Cuidar da saúde">'+item('injection')+'<span>Injeção</span></button>');
  $('#care-layer').insertAdjacentHTML('beforeend','<span class="care-syringe" aria-hidden="true">'+item('injection')+'</span>');
  grid.insertAdjacentHTML('beforebegin',`<div id="needs-dashboard" class="needs-dashboard" role="group" aria-label="Toque nos indicadores para cuidar do pet">${Object.keys(CARE).map(type=>`<${type==='play'?'div':'button type="button"'} class="need-indicator ${type==='play'?'need-indicator-readonly':''}" data-need-indicator="${type}" aria-label="${NEED_TITLES[type]}"${type==='play'?' role="status"':''}><span class="need-symbol">${type==='play'?ACTIVITY_ART.stars:item(type)}</span><span class="need-name">${NEED_TITLES[type]}</span><span class="need-meter"><i class="filled"></i></span><span class="need-face"></span></${type==='play'?'div':'button'}>`).join('')}</div>`);
  grid.insertAdjacentHTML('beforebegin',`<div id="action-groups" class="action-groups">${ACTION_GROUPS.filter(group=>['fun','style'].includes(group.id)).map(group=>{
    const art=group.icon==='style'?$('#outfit-open').querySelector('svg').outerHTML:group.icon==='star'?ACTIVITY_ART.stars:item(group.icon);
    return `<button type="button" data-action-group="${group.id}" aria-label="${group.label}" aria-expanded="false"><span class="action-group-art">${art}</span><span>${group.label}</span></button>`;
  }).join('')}</div>`);
  grid.insertAdjacentHTML('afterbegin','<button id="action-back" class="action-back" type="button" aria-label="Voltar a Diversão e Visual"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M42 10 19 32l23 22" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Voltar</span></button>');
  for(const button of grid.querySelectorAll('[data-care]'))button.dataset.actionGroup=groupForAction(button.dataset.care);
  for(const id of ['activity-open','album-open','outfit-open','shoes-open']){
    const button=$('#'+id);button.dataset.actionGroup=groupForAction(id);grid.append(button);
  }
  $('.extras').hidden=true;renderActionGroups();
}
function bind(){
  $('#action-groups').addEventListener('click',event=>{const button=event.target.closest('[data-action-group]');if(button)openActionGroup(button.dataset.actionGroup);});
  $('#needs-dashboard').addEventListener('click',event=>{
    const button=event.target.closest('button[data-need-indicator]');
    if(!button||button.disabled||!save||save.phase==='egg')return;
    const type=button.dataset.needIndicator;
    if(type==='sleep'&&status==='sleeping'){void doCare('sleep');return;}
    if(!['ready','ambient'].includes(status))return;
    if(status==='ambient')cancelAmbient();
    if(actionGroup)closeActionGroup();
    if(type==='play'){openDiversao();return;}
    void doCare(type);
  });
  $('#world').addEventListener('pointerdown',event=>aimPetAt(event.clientX,event.clientY),{capture:true});
  $('#outfit-open').addEventListener('click',()=>openWardrobe('outfit'));
  $('#shoes-open').addEventListener('click',()=>openWardrobe('shoes'));
  $('#wardrobe-panel').addEventListener('click',event=>{
    if(event.target.closest('#wardrobe-close')){closeWardrobe();return;}
    const button=event.target.closest('[data-wardrobe]');if(!button||status!=='wardrobe'||!save)return;
    const value=button.dataset.wardrobe;if(!OPTIONS[wardrobeKind].includes(value))return;
    save={...save,appearance:{...save.appearance,[wardrobeKind]:value}};write();renderGrowth();drawWardrobe();setMotion(playArt,'idle');sound([520]);
  });
  $('#activity-open').addEventListener('click',openDiversao);
  $('#activity-panel').addEventListener('click',event=>{
    if(event.target.closest('#activity-close')){closeActivityPanel();return;}
    if(event.target.closest('#activity-prev')){activityPage=Math.max(0,activityPage-1);renderActivityPanel();return;}
    if(event.target.closest('#activity-next')){activityPage=Math.min(diversaoPages().length-1,activityPage+1);renderActivityPanel();return;}
    const option=event.target.closest('[data-toy],[data-activity],[data-event]');if(!option||status!=='activities')return;
    if(option.dataset.toy){const toy=option.dataset.toy;if(!toyAvailable(toy,save.phase))return;chosenToy=toy;save={...save,playToy:toy};write();closeActivityPanel();doCare('play');return;}
    const key=option.dataset.activity||option.dataset.event;closeActivityPanel();launchActivity(key).catch(error=>{console.error('Atividade interrompida:',error);cancelFlow();});
  });
  $('#event-hint').addEventListener('click',()=>{if(status==='ambient')cancelAmbient();if(status!=='ready')return;const available=EVENTS.filter(key=>activityAvailable(key,save.phase));launchActivity(available[Math.floor(Math.random()*available.length)]).catch(error=>{console.error(error);cancelFlow();});});
  $('#area-open').addEventListener('click',()=>{if(['ready','ambient'].includes(status))$('#area-map').hidden=false;});
  $('#area-map').addEventListener('click',event=>{if(event.target.closest('#area-close')){$('#area-map').hidden=true;return;}const button=event.target.closest('[data-area]');if(button)changeArea(button.dataset.area);});
  $('#area-objects').addEventListener('click',event=>{
    const object=event.target.closest('[data-object]');if(!object||status!=='ready')return;
    aimPetAt(event.clientX,event.clientY,false);
    const type=object.dataset.object;
    if(type==='lamp'){lampOn=!lampOn;renderArea();sound([lampOn?640:360]);return;}
    if(type==='food'||type==='water')doCare(type);
  });
  $('#discovery-close').addEventListener('click',()=>{$('#discovery').hidden=true;$('#extras-shade').hidden=true;setStatus('ready');});
  $('#room-open').addEventListener('click',()=>{if(status==='ambient')cancelAmbient();if(status!=='ready'||save?.phase==='egg')return;roomCategory='bed';renderRoomChoices();$('#extras-shade').hidden=false;$('#room-picker').hidden=false;setStatus('room');});
  $('#room-close').addEventListener('click',()=>{$('#room-picker').hidden=true;$('#extras-shade').hidden=true;setStatus('ready');});
  $('#room-picker').addEventListener('click',event=>{const tab=event.target.closest('[data-room-tab]');if(tab){roomCategory=tab.dataset.roomTab;renderRoomChoices();return;}const choice=event.target.closest('[data-room]');if(!choice||choice.disabled||!save)return;const key=choice.dataset.room,value=choice.dataset.value;if(!ROOM_OPTIONS[key]?.includes(value)||!roomOptionAvailable(key,value))return;save=noteMoment({...save,room:{...(save.room||{bed:'cloud',rug:'sun',toy:'ball',wall:'lavender'}),[key]:value}},'decor');write();renderGrowth();setStatus('room');});
  $('#album-open').addEventListener('click',()=>{if(status==='ambient')cancelAmbient();if(status!=='ready'||!save)return;drawAlbum();$('#extras-shade').hidden=false;$('#album').hidden=false;setStatus('album');});
  $('#album-grid').addEventListener('click',event=>{if(suppressAlbumClick){suppressAlbumClick=false;return;}const button=event.target.closest('[data-album-moment]');if(!button||button.disabled||status!=='album')return;const kind=button.dataset.albumMoment;if((save.decorations||[]).filter(d=>d.kind===kind).length>=2){say('Até dois de cada!');return;}selectedDecoration=null;chosenDecoration=kind;$('#album').hidden=true;$('#extras-shade').hidden=true;setStatus('ready');renderDecorations();say('Toque no cenário para colocar.');});
  $('#album-grid').addEventListener('pointerdown',event=>{const button=event.target.closest('[data-album-moment]');if(!button||button.disabled||status!=='album'||!event.isPrimary)return;albumDrag={pointer:event.pointerId,kind:button.dataset.albumMoment,x:event.clientX,y:event.clientY,active:false,ghost:null};button.setPointerCapture(event.pointerId);});
  $('#album-grid').addEventListener('pointermove',event=>{if(!albumDrag||event.pointerId!==albumDrag.pointer)return;if(!albumDrag.active&&Math.hypot(event.clientX-albumDrag.x,event.clientY-albumDrag.y)>10){if((save.decorations||[]).filter(d=>d.kind===albumDrag.kind).length>=2){cancelAlbumDrag();return;}albumDrag.active=true;albumDrag.ghost=document.createElement('div');albumDrag.ghost.className='album-drag-ghost';albumDrag.ghost.innerHTML=decorationArt(albumDrag.kind);document.body.append(albumDrag.ghost);$('#album').style.opacity='0';$('#extras-shade').hidden=true;}if(albumDrag.active){event.preventDefault();albumDrag.ghost.style.left=`${event.clientX}px`;albumDrag.ghost.style.top=`${event.clientY}px`;}});
  $('#album-grid').addEventListener('pointerup',event=>{if(!albumDrag||event.pointerId!==albumDrag.pointer)return;const drag=albumDrag;if(!drag.active){cancelAlbumDrag();return;}suppressAlbumClick=true;setTimeout(()=>suppressAlbumClick=false,400);const rect=$('#world').getBoundingClientRect(),inside=event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=rect.top&&event.clientY<=rect.bottom;$('#album').style.opacity='';cancelAlbumDrag(false);if(inside&&placeDecoration(drag.kind,(event.clientX-rect.left)/rect.width*100,(event.clientY-rect.top)/rect.height*100)){$('#album').hidden=true;$('#extras-shade').hidden=true;setStatus('ready');}else{$('#album').hidden=false;$('#extras-shade').hidden=false;}});
  $('#album-grid').addEventListener('pointercancel',()=>{$('#album').style.opacity='';cancelAlbumDrag();});
  $('#album-close').addEventListener('click',()=>{$('#album').hidden=true;$('#extras-shade').hidden=true;setStatus('ready');});
  $('#decorations').addEventListener('pointerdown',event=>{const button=event.target.closest('[data-decoration-index]');if(!button||!['ready','ambient'].includes(status)||!event.isPrimary)return;if(status==='ambient')cancelAmbient();event.stopPropagation();decorationDrag={index:Number(button.dataset.decorationIndex),pointer:event.pointerId,x:event.clientX,y:event.clientY,moved:false,button};button.setPointerCapture(event.pointerId);});
  $('#decorations').addEventListener('pointermove',event=>{const drag=decorationDrag;if(!drag||drag.pointer!==event.pointerId)return;if(Math.hypot(event.clientX-drag.x,event.clientY-drag.y)>8)drag.moved=true;if(!drag.moved)return;event.preventDefault();const rect=$('#world').getBoundingClientRect();drag.button.style.left=`${Math.max(8,Math.min(92,(event.clientX-rect.left)/rect.width*100))}%`;drag.button.style.top=`${Math.max(20,Math.min(88,(event.clientY-rect.top)/rect.height*100))}%`;});
  $('#decorations').addEventListener('pointerup',event=>{const drag=decorationDrag;if(!drag||drag.pointer!==event.pointerId)return;decorationDrag=null;if(drag.moved){suppressDecorationClick=true;setTimeout(()=>suppressDecorationClick=false,400);const rect=$('#world').getBoundingClientRect();if(!updateDecoration(drag.index,(event.clientX-rect.left)/rect.width*100,(event.clientY-rect.top)/rect.height*100))renderDecorations();}});
  $('#decorations').addEventListener('pointercancel',()=>{decorationDrag=null;renderDecorations();});
  $('#decorations').addEventListener('click',event=>{const button=event.target.closest('[data-decoration-index]');if(!button)return;event.stopPropagation();if(suppressDecorationClick)return;const index=Number(button.dataset.decorationIndex);chosenDecoration=null;selectedDecoration=selectedDecoration===index?null:index;renderDecorations();});
  $('#decoration-cancel').addEventListener('click',event=>{event.stopPropagation();chosenDecoration=null;selectedDecoration=null;renderDecorations();say('');});
  $('#decoration-remove').addEventListener('click',event=>{event.stopPropagation();if(selectedDecoration!==null)updateDecoration(selectedDecoration,0,0,true);});
  $('#decoration-use').addEventListener('click',event=>{event.stopPropagation();if(selectedDecoration!==null)interactDecoration(selectedDecoration).catch(error=>{console.error(error);cancelFlow();});});
  $('#room-toy').addEventListener('click',()=>{if(status==='ready'){chosenToy=toyAvailable(save.room?.toy,save.phase)?save.room.toy:'ball';doCare('play');}});
  $('#toy-picker').addEventListener('click',event=>{const choice=event.target.closest('[data-toy]');if(choice&&status==='ready'&&toyAvailable(choice.dataset.toy,save.phase)){chosenToy=choice.dataset.toy;save={...save,playToy:chosenToy};write();$('#toy-picker').hidden=true;doCare('play');}else if(event.target.closest('#toy-close'))$('#toy-picker').hidden=true;});
  $('#bed').addEventListener('click',()=>doCare('sleep'));
  window.addEventListener('resize',constrainPosition);
  for(const button of document.querySelectorAll('#care-grid button[data-care]')){
    button.querySelector('svg').outerHTML=item(button.dataset.care);
  }
  $('#need-cue').addEventListener('click',event=>{event.stopPropagation();const type=Object.keys(CARE).find(k=>CARE[k].need===lowestNeed(save));doCare(type);});
  $('#part-size').addEventListener('input',event=>{
    if(status!=='creating')return;
    const key=categories[step].key;if(!CUSTOM_PARTS.includes(key))return;
    const value=Math.max(MIN_PART_SCALE,Math.min(MAX_PART_SCALE,Number(event.target.value)||1));
    draft.partSizes={...(draft.partSizes||{}),[key]:value};saveDraft();
    $('#part-size-label').textContent=`${Math.round(value*100)}%`;
    drawPet(previewArt,draft,'baby');setMotion(previewArt,'idle');stopPetFrames(previewArt);
  });
  $('#mouth-height').addEventListener('input',event=>{
    if(status!=='creating'||categories[step]?.key!=='mouth')return;
    draft.mouthOffset=mouthOffset(Number(event.target.value));saveDraft();
    $('#mouth-height-label').textContent=draft.mouthOffset<0?`↑ ${Math.abs(draft.mouthOffset)} px`:draft.mouthOffset>0?`↓ ${draft.mouthOffset} px`:'Centro';
    drawPet(previewArt,draft,'baby');setMotion(previewArt,'idle');stopPetFrames(previewArt);
  });
  $('#hand-position-adjust').addEventListener('input',event=>{
    const key=categories[step]?.key,axis=event.target.dataset.partAxis;
    if(status!=='creating'||!Object.hasOwn(PART_POSITION_LIMITS,key)||(axis!=='x'&&axis!=='y'))return;
    const position=partPosition(key,{...draftPartPosition(key),[axis]:Number(event.target.value)});
    if(key==='hands')draft.handPosition=position;
    else draft.partPositions={...draft.partPositions,[key]:position};
    saveDraft();renderPartPosition(key);
    drawPet(previewArt,draft,'baby');setMotion(previewArt,'idle');stopPetFrames(previewArt);
  });
  $('#part-colors').addEventListener('click',event=>{
    if(status!=='creating')return;
    const button=event.target.closest('[data-part-color]'),key=categories[step].key;
    if(!button||key==='mouth'||!CUSTOM_PARTS.includes(key)||!Object.hasOwn(PART_PALETTE,button.dataset.partColor))return;
    draft.partColors={...(draft.partColors||{}),[key]:button.dataset.partColor};saveDraft();
    $('#part-colors').querySelectorAll('[data-part-color]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
    drawPet(previewArt,draft,'baby');setMotion(previewArt,'idle');stopPetFrames(previewArt);sound([490]);
  });
  $('#choice-list').addEventListener('click',event=>{const button=event.target.closest('[data-choice]');if(!button||status!=='creating')return;draft[categories[step].key]=button.dataset.choice;renderCreator();sound([480]);});
  $('#create-back').addEventListener('click',()=>{if(step>0){step--;renderCreator();}});
  $('#creation-cancel').addEventListener('click',()=>{if(!save)return;clearCreatorSession(localStorage,DRAFT_KEY);creatingNew=false;const url=new URL(location.href);url.searchParams.delete('criar');history.replaceState(null,'',url);showScreen();});
  $('#create-next').addEventListener('click',()=>{if(step<categories.length-1){step++;renderCreator();sound([520]);}else finishCreation();});
  $('#egg').addEventListener('click',async()=>{
    if(status!=='ready'||save?.phase!=='egg')return;
    const token=++flow;setStatus('acting');$('#egg').classList.add('hatching');sound([390,510,690]);await sleep(920);
    if(token!==flow)return;
    const result=hatch(save);save=result.save;write();$('#egg').classList.remove('hatching');renderGrowth();setStatus('ready');setMotion(playArt,'happy');say('Olá, amiguinho!');await sleep(1200);if(token===flow)setMotion(playArt,'idle');
  });
  $('#care-grid').addEventListener('click',event=>{if(event.target.closest('#action-back')){closeActionGroup();return;}const button=event.target.closest('[data-care]');if(!button)return;if(button.dataset.care==='play'&&['ready','ambient'].includes(status)){if(status==='ambient')cancelAmbient();$('#toy-picker').hidden=false;return;}doCare(button.dataset.care);});
  $('#scene-object').addEventListener('click',event=>{if($('#scene-object').classList.contains('visible')&&status==='ready')doCare('food');event.stopPropagation();});
  $('#pet-wrap').addEventListener('click',event=>{event.stopPropagation();if(flightLevel||$('#pet-wrap').classList.contains('flying')||playArt.dataset.motion==='land')return;aimPetAt(event.clientX,event.clientY,false);playArt.dataset.touchSide=event.offsetX<$('#pet-wrap').clientWidth/2?'left':'right';doCare('love');});
  $('#world').addEventListener('click',async event=>{
    if(!['ready','ambient'].includes(status)||save?.phase==='egg'||event.target.closest('button'))return;
    if(status==='ambient')cancelAmbient();
    const rect=$('#world').getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width*100,y=(event.clientY-rect.top)/rect.height*100;
    if(chosenDecoration){const kind=chosenDecoration;chosenDecoration=null;if(!placeDecoration(kind,x,y))renderDecorations();return;}
    if(selectedDecoration!==null){updateDecoration(selectedDecoration,x,y);return;}
    aimPetAt(event.clientX,event.clientY,false);
    if(y<50){reactToUpperTap(x);return;}
    stopAirMotion(false);setMotion(playArt,'look-target');
    const token=++flow;save=noteInteraction(save);write();setStatus('moving');$('#scene-object').classList.remove('visible');
    if(!await hold(260,token))return;
    if(await moveTo(x,token)){setStatus('ready');say('Passeando pelo jardim!');}
  });
  $('#parents-open').addEventListener('click',()=>{if(!['ready','ambient','creating','sleeping'].includes(status))return;if(status==='ambient')cancelAmbient();returnStatus=status;setStatus('parents');$('#pet-name').value=save?.name??'';$('#parent-message').textContent=loaded.recovered?'Um salvamento inválido foi guardado para recuperação; um novo jogo pode ser criado.':'';$('#parents-dialog').showModal();});
  $('#parents-dialog').addEventListener('close',()=>setStatus(returnStatus));
  $('#pet-name').addEventListener('change',event=>{if(!save)return;save=renamePet(save,event.target.value);write();renderGrowth();$('#parent-message').textContent='Nome salvo.';});
  $('#sound-button').addEventListener('click',()=>{soundEnabled=!soundEnabled;AU.setMute(!soundEnabled);const value=soundEnabled?'on':'off';localStorage.setItem('meu-pequeno-pet.sound',value);void mirrorNativeValue('meu-pequeno-pet.sound',value);updateSoundButton();if(soundEnabled)sound([520]);});
  $('#backup-button').addEventListener('click',async()=>{
    if(!save){$('#parent-message').textContent='Crie o pet antes de exportar.';return;}
    const text=exportBackup(save);
    if(await shareNativeBackup(text)){$('#parent-message').textContent='Escolha onde guardar o backup.';return;}
    const blob=new Blob([text],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='meu-pequeno-pet-backup.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),10_000);$('#parent-message').textContent='Backup preparado para download.';
  });
  $('#backup-input').addEventListener('change',async event=>{
    const file=event.target.files?.[0];event.target.value='';if(!file)return;
    try{if(file.size>1_000_000)throw new Error('Arquivo grande demais');const restored=importBackup(await file.text());
      askConfirm('Restaurar backup?','O pet atual será substituído pelo pet do arquivo.',()=>{save=restored;clearCreatorSession(localStorage,DRAFT_KEY);write();draft={...restored.appearance,scene:restored.scene||'garden'};step=0;returnStatus='ready';$('#parents-dialog').close();showScreen();say('Backup restaurado.');});
    }catch(e){$('#parent-message').textContent=e.message||'Não foi possível restaurar.';}
  });
  $('#reset-button').addEventListener('click',()=>askConfirm('Recomeçar?','O pet atual será apagado deste aparelho. Exporte um backup antes se quiser guardá-lo.',()=>{resetSave(localStorage,ACTIVE_SAVE_KEY);clearCreatorSession(localStorage,DRAFT_KEY);save=null;draft={...DEFAULT_APPEARANCE,scene:'garden'};step=0;flow++;returnStatus='creating';$('#parents-dialog').close();showScreen();}));
  if(TEST_MODE){
    $('#test-tools').insertAdjacentHTML('beforeend','<button id="test-needs" type="button" class="parent-action">Demonstrar pedidos de cuidado</button>');
    $('#test-needs').addEventListener('click',()=>{
      if(!save||save.phase==='egg'){$('#parent-message').textContent='Abra o ovo de teste primeiro.';return;}
      save={...save,needs:{food:38,water:48,clean:60,potty:38,energy:48,affection:60,fun:38,health:36}};write();renderGrowth();$('#parent-message').textContent='Indicadores de teste preparados.';
    });
  }
  $('#test-grow').addEventListener('click',()=>{
    if(!TEST_MODE||!save||save.phase==='egg'||save.phase==='adult'){$('#parent-message').textContent='Crie e abra o ovo primeiro, ou o pet já é adulto.';return;}
    const kinds=save.phase==='baby'?['food','water','bath','love']:Object.keys(CARE);
    const activeMs=save.phase==='baby'?Math.max(save.activeMs,5*60_000):Math.max(save.activeMs,(save.youngAtActiveMs??5*60_000)+10*60_000);
    const result=maybeEvolve({...save,activeMs,careKinds:[...new Set([...save.careKinds,...kinds])]},Date.now());
    save=result.save;write();renderGrowth();$('#parent-message').textContent=result.evolved?`Fase de teste: ${phaseLabel[save.phase]}.`:'A fase já foi testada.';
    returnStatus='ready';$('#parents-dialog').close();if(result.evolved)showEvolution();
  });
  $('#evolution-close').addEventListener('click',()=>{$('#evolution').hidden=true;setStatus('ready');setMotion(playArt,'idle');});
  window.addEventListener('pagehide',checkpoint);
  document.addEventListener('freeze',checkpoint);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)checkpoint();document.documentElement.classList.toggle('paused',document.hidden);document.querySelectorAll('svg').forEach(svg=>document.hidden?svg.pauseAnimations?.():svg.unpauseAnimations?.());if(document.hidden){Ambient.stop();AU.setMute(true);}else AU.setMute(!soundEnabled);if(document.hidden){stopSleepTimer();cancelFlow();if(tickTimer){clearInterval(tickTimer);tickTimer=null;}}else{lastTick=Date.now();if(save&&!creatingNew&&status!=='creating'&&status!=='loading')renderGrowth();startTicks();if(save?.sleeping){setStatus('sleeping');setMotion(playArt,'sleep-rest');startSleepTimer();}scheduleAmbient();if(save&&save.phase!=='egg'&&status==='ready'){const token=++flow;setStatus('ambient');setMotion(playArt,'greet');hold(1300,token).then(ok=>{if(ok){setMotion(playArt,'idle');setStatus('ready');}});}}});
}
function updateSoundButton(){$('#sound-button use').setAttribute('href',soundEnabled?'#i-sound':'#i-mute');$('#sound-button span').textContent=`Som: ${soundEnabled?'ligado':'desligado'}`;}
async function init(){
  $('#world').insertAdjacentHTML('afterbegin','<div id="scene-life" class="scene-life-layer" aria-hidden="true"></div>');
  $('#world').insertAdjacentHTML('beforeend','<div id="toy-picker" class="toy-picker" hidden><button type="button" data-toy="ball" aria-label="Brincar com a bola"><svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="18" fill="#ff8e99" stroke="#1d2b5e" stroke-width="3"/><path d="M8 24h32M24 7v34" stroke="white" stroke-width="3"/></svg></button><button type="button" data-toy="bubbles" aria-label="Brincar com bolhas"><svg viewBox="0 0 48 48"><circle cx="16" cy="29" r="10" fill="#bcefff" stroke="#1d2b5e" stroke-width="2"/><circle cx="34" cy="17" r="8" fill="#bcefff" stroke="#1d2b5e" stroke-width="2"/></svg></button><button id="toy-close" type="button" aria-label="Fechar brinquedos">×</button></div><button id="bed" class="bed" type="button" aria-label="Dormir na cama" hidden><svg viewBox="0 0 100 60"><path d="M5 40Q50 60 95 40V55H5Z" fill="#b994e8" stroke="#263b70" stroke-width="4"/><path d="M5 40Q50 18 95 40Q50 58 5 40Z" fill="#e8d7ff" stroke="#263b70" stroke-width="4"/></svg></button>');
  $('#world').insertAdjacentHTML('beforeend','<div id="room-rug" class="room-rug" hidden></div><button id="room-toy" class="room-toy" type="button" aria-label="Brincar com o brinquedo" hidden></button>');
  $('#world').insertAdjacentHTML('beforeend','<div id="area-objects" class="area-objects"></div>');
  $('#world').insertAdjacentHTML('beforeend','<div id="decorations" class="decorations"></div><button id="decoration-cancel" class="decoration-cancel" type="button" aria-label="Cancelar seleção" hidden><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M13 13l22 22M35 13 13 35" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg></button><button id="decoration-use" class="decoration-use" type="button" aria-label="Pet interagir com lembrança" hidden><svg viewBox="0 0 48 48" aria-hidden="true"><path d="m17 9 23 15-23 15Z" fill="currentColor"/></svg></button><button id="decoration-remove" class="decoration-remove" type="button" aria-label="Retirar lembrança do cenário" hidden><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 13h28M18 13V8h12v5m-16 0 2 26h16l2-26M21 19v14m6-14v14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></button>');
  $('#toy-close').insertAdjacentHTML('beforebegin','<button type="button" data-toy="kite" aria-label="Brincar com a pipa"><svg viewBox="0 0 64 64"><path d="M32 4 55 28 32 48 9 28Z" fill="#ffcb76" stroke="#2f4b7b" stroke-width="3"/><path d="M32 48q12 6 4 13" fill="none" stroke="#2f4b7b" stroke-width="3"/></svg></button><button type="button" data-toy="drum" aria-label="Tocar tambor"><svg viewBox="0 0 64 64"><ellipse cx="32" cy="18" rx="24" ry="10" fill="#fff0bf" stroke="#2f4b7b" stroke-width="3"/><path d="M8 18v34q24 15 48 0V18" fill="#f59aa6" stroke="#2f4b7b" stroke-width="3"/></svg></button>');
  $('#play-screen').insertAdjacentHTML('afterbegin','<div class="area-bar"><button id="area-open" type="button" aria-label="Abrir mapa dos cômodos"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M5 17 22 8l19 9 18-9v40l-18 9-19-9-17 9Z" fill="#e9f6ff" stroke="#275484" stroke-width="4"/><path d="M22 8v40m19-31v40" stroke="#275484" stroke-width="3"/><circle cx="41" cy="29" r="5" fill="#f5aa6a"/></svg></button></div><div id="area-map" class="area-map" hidden><button id="area-close" type="button" aria-label="Fechar mapa">×</button><button data-area="garden" type="button" aria-label="Ir ao jardim"><svg viewBox="0 0 64 64"><path d="M9 53h46" stroke="#2c5679" stroke-width="4"/><path d="M31 52V27m0 9q-15 0-15-13 15 0 15 13Zm0-6q14 0 14-13-14 0-14 13Z" fill="#79c698" stroke="#2c5679" stroke-width="3"/><circle cx="31" cy="16" r="9" fill="#ffca78" stroke="#2c5679" stroke-width="3"/></svg></button><button data-area="bedroom" type="button" aria-label="Ir ao quarto"><svg viewBox="0 0 64 64"><path d="M7 28 32 8l25 20v34H7Z" fill="#eedcf7" stroke="#2c5679" stroke-width="4"/><path d="M16 43q16-14 32 0v14H16Z" fill="#bf9de5" stroke="#2c5679" stroke-width="3"/><path d="M18 38V29h16v9" fill="#fff" stroke="#2c5679" stroke-width="3"/></svg></button><button data-area="kitchen" type="button" aria-label="Ir à cozinha"><svg viewBox="0 0 64 64"><path d="M7 35q3 22 25 22t25-22Z" fill="#f2a27a" stroke="#2c5679" stroke-width="4"/><ellipse cx="32" cy="34" rx="25" ry="9" fill="#ffe8bc" stroke="#2c5679" stroke-width="3"/><path d="M13 12v17m7-17v17m-7-9h7m29-8v18" stroke="#2c5679" stroke-width="4" stroke-linecap="round"/></svg></button></div>');
  $('#play-screen').insertAdjacentHTML('beforeend','<div class="extras"><button id="room-open" type="button" aria-label="Escolher objetos do cantinho" hidden>⌂</button><button id="album-open" type="button" aria-label="Abrir álbum">▣</button></div><div id="room-picker" class="extra-panel" hidden><button id="room-close" class="extra-close" type="button" aria-label="Fechar">×</button><div><button data-room="bed" data-value="cloud" aria-label="Cama nuvem">☁</button><button data-room="bed" data-value="leaf" aria-label="Cama folha">✿</button></div><div><button data-room="rug" data-value="sun" aria-label="Tapete sol">☼</button><button data-room="rug" data-value="flower" aria-label="Tapete flor">✿</button></div><div><button data-room="toy" data-value="ball" aria-label="Bola">●</button><button data-room="toy" data-value="bubbles" aria-label="Bolhas">◯</button></div></div><div id="album" class="extra-panel" hidden><button id="album-close" class="extra-close" type="button" aria-label="Fechar álbum">×</button><div id="album-grid" class="album-grid"></div></div><div id="discovery" class="extra-panel" hidden><span id="discovery-symbol" class="discovery-symbol"></span><button id="discovery-close" type="button" aria-label="Continuar">✓</button></div>');
  $('#play-screen').insertAdjacentHTML('beforeend','<div id="extras-shade" hidden></div>');
  $('#room-open').innerHTML='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M7 54V15h7v24h42v15M14 39V26h18c6 0 9 4 9 10v3M41 31h15v8" fill="#d6b9e9" stroke="#fff0e4" stroke-width="4" stroke-linejoin="round"/></svg><span>Cantinho</span>';
  $('#album-open').innerHTML='<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="9" y="7" width="46" height="50" rx="4" fill="#d9b7be" stroke="#fff0e4" stroke-width="4"/><circle cx="32" cy="26" r="9" fill="#ffe5a3"/><path d="M18 48q14-19 28 0" fill="#88b6ab"/></svg><span>Álbum</span>';
  $('#album-open').insertAdjacentHTML('beforebegin','<button id="activity-open" type="button" aria-label="Abrir descobertas">'+ACTIVITY_ART.stars+'</button>');
  $('#activity-open').innerHTML=ACTIVITY_ART.stars+'<span>Brincadeiras</span>';
  $('#album-open').insertAdjacentHTML('beforebegin',`<button id="outfit-open" type="button" aria-label="Escolher roupinha"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M22 9h20l5 9 11 6-6 12-7-4v22H19V32l-7 4-6-12 11-6Z" fill="#eeb0c8" stroke="#fff0e4" stroke-width="4" stroke-linejoin="round"/><path d="M24 10q8 12 16 0" fill="none" stroke="#fff0e4" stroke-width="3"/></svg><span>Roupinhas</span></button><button id="shoes-open" type="button" aria-label="Escolher sapatinhos"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 39h22l6-11 9 12 12 4v9H8Z" fill="#9ec9dc" stroke="#fff0e4" stroke-width="4" stroke-linejoin="round"/><path d="M12 49h41M35 39h9" stroke="#fff0e4" stroke-width="3"/></svg><span>Sapatinhos</span></button>`);
  $('#play-screen').insertAdjacentHTML('beforeend','<div id="wardrobe-panel" class="extra-panel" hidden></div>');
  $('#play-screen').insertAdjacentHTML('beforeend','<div id="activity-panel" class="extra-panel" hidden></div>');
  $('#world').insertAdjacentHTML('beforeend','<div id="event-layer" aria-hidden="true"></div><button id="event-hint" type="button" aria-label="Ver surpresa no jardim" hidden>'+EVENT_ART.gift+'</button>');
  $('#room-picker').innerHTML='<button id="room-close" class="extra-close" type="button" aria-label="Voltar">×</button><div class="room-tabs"><button data-room-tab="bed" aria-label="Escolher cama">'+item('sleep')+'</button><button data-room-tab="rug" aria-label="Escolher tapete">'+item('star')+'</button><button data-room-tab="toy" aria-label="Escolher brinquedo favorito">'+item('play')+'</button><button data-room-tab="wall" aria-label="Escolher cor do quarto">'+item('bath')+'</button></div><div id="room-options" class="room-options"></div>';
  setupActionGroups();
  document.head.insertAdjacentHTML('beforeend',`<style>${PET_CSS}</style>`);
  AU.setMute(!soundEnabled);document.addEventListener('pointerdown',()=>AU.init(),{once:true});
  previewArt=$('#create-art');playArt=$('#play-art');
  // Bolhas presas ao próprio pet: independem de ele estar no centro ou caminhar.
  if(!$('#pet-bath-bubbles'))$('#pet-wrap').insertAdjacentHTML('beforeend',`<span id="pet-bath-bubbles" aria-hidden="true">${Array.from({length:13},(_,i)=>`<i style="--bubble-x:${[34,44,53,63,38,49,58,67,33,46,55,61,50][i]}%;--bubble-y:${[39,52,34,45,68,61,55,74,50,77,41,64,29][i]}%;--delay:${-(i*0.19)}s"></i>`).join('')}</span>`);
  $('#scene-art').style.setProperty('--v64-scene-sky',sceneFill(scene));
  $('#scene-art').innerHTML=sceneMarkup(scene,false);
  $('#test-banner').hidden=!TEST_MODE;$('#test-tools').hidden=!TEST_MODE;
  updateSoundButton();bind();showScreen();startTicks();scheduleAmbient();startSceneGazeLoop();
  if(loaded.recovered)$('#care-message').textContent='O progresso anterior não pôde ser lido. Abra a área dos responsáveis.';
  // O modo offline é complementar: uma implementação parcial da API no
  // navegador não pode impedir os cuidados e brincadeiras de iniciarem.
  void registerOfflineWorker();
}
init().catch(error=>{
  console.error(error);
  if(status==='loading')document.body.insertAdjacentHTML('beforeend','<p class="load-error">Não foi possível abrir o jogo. Recarregue a página.</p>');
});
