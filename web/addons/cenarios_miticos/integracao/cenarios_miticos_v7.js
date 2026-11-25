/* Meu Pequeno Pet - plugin de cenários V7. Baseado na prévia V7 aprovada.
   Não altera o pet, o save, nem o seletor de cenários automaticamente. */
const MODULE_BASE=new URL('../',import.meta.url);
const ACTOR_SCALE=1.15;
const MOON_ATLAS={cols:4,rows:2,cellW:448,cellH:448};
const MOON_PIVOTS={cat:[224,383],wolf:[224,416],bat:[224,224]};
const ASSET_PATHS={"sky": "ceu/cenario.webp", "sea": "cthulhu/cenario.webp", "dragon": "ceu/personagens/dragao_celeste/sheet.webp", "pegasus": "ceu/personagens/pegaso_lilas/sheet.webp", "fox": "ceu/personagens/raposa_celestial/sheet.webp", "cthulhu": "cthulhu/personagens/cthulhu_bebe/sheet.webp", "octopus": "cthulhu/personagens/polvinho_mago/sheet.webp", "fish": "cthulhu/personagens/peixe_lanterna/sheet.webp", "shell": "cthulhu/objetos/concha_perola/sheet.png", "dragon_right": "ceu/personagens/dragao_celeste/sheet_espelhado.webp", "moon": "clareira_lunar/cenario.webp", "cat": "clareira_lunar/gato_preto_direita.webp", "cat_left": "clareira_lunar/gato_preto_esquerda.webp", "wolf": "clareira_lunar/lobisomem_direita.webp", "wolf_left": "clareira_lunar/lobisomem_esquerda.webp", "bat": "clareira_lunar/morcego_direita.webp", "bat_left": "clareira_lunar/morcego_esquerda.webp"};
const META={"dragon": {"cols": 4, "rows": 2, "cellW": 448, "cellH": 448, "bounds": [[56, 131, 414, 355], [59, 126, 407, 354], [63, 103, 409, 349], [76, 58, 407, 360], [75, 61, 410, 364], [60, 102, 408, 355], [62, 107, 411, 351], [59, 134, 416, 353]]}, "pegasus": {"cols": 4, "rows": 2, "cellW": 448, "cellH": 448, "bounds": [[43, 46, 387, 349], [36, 79, 387, 359], [31, 92, 389, 371], [30, 105, 388, 376], [29, 106, 388, 397], [29, 94, 387, 376], [30, 81, 388, 357], [37, 59, 388, 349]]}, "fox": {"cols": 4, "rows": 2, "cellW": 448, "cellH": 448, "bounds": [[48, 121, 395, 374], [39, 123, 397, 374], [38, 124, 405, 366], [28, 114, 414, 327], [32, 117, 413, 352], [35, 123, 405, 372], [42, 122, 401, 375], [47, 116, 399, 375]]}, "cthulhu": {"cols": 4, "rows": 2, "cellW": 448, "cellH": 448, "bounds": [[71, 113, 380, 375], [70, 113, 376, 375], [69, 86, 388, 355], [63, 75, 380, 328], [64, 85, 385, 347], [68, 112, 381, 376], [68, 113, 371, 377], [73, 113, 380, 377]]}, "octopus": {"cols": 4, "rows": 2, "cellW": 448, "cellH": 448, "bounds": [[70, 85, 403, 389], [82, 77, 401, 389], [83, 49, 397, 378], [77, 43, 407, 366], [80, 48, 403, 370], [75, 68, 401, 377], [76, 77, 403, 391], [76, 88, 400, 390]]}, "fish": {"cols": 4, "rows": 2, "cellW": 448, "cellH": 448, "bounds": [[51, 135, 420, 346], [47, 115, 415, 333], [59, 93, 406, 362], [35, 127, 417, 329], [43, 136, 421, 333], [33, 148, 415, 349], [46, 145, 413, 347], [51, 135, 417, 343]]}, "shell": {"cols": 8, "rows": 1, "cellW": 192, "cellH": 192, "bounds": [[10, 32, 182, 160], [10, 33, 182, 160], [10, 35, 182, 161], [10, 37, 182, 161], [10, 38, 182, 161], [10, 37, 182, 161], [9, 35, 182, 161], [9, 33, 182, 160]]}};
export function montar(container,options={}){
  if(typeof container==='string')container=document.querySelector(container);
  if(!container)throw new Error('Informe o contêiner do cenário');
  const baseUrl=new URL(options.baseUrl||MODULE_BASE,document.baseURI);
  const URLS=Object.fromEntries(Object.entries(ASSET_PATHS).map(([id,p])=>[id,new URL(p,baseUrl).href]));
  const stage=document.createElement('div');
  stage.className='cenario-mitico-v7';
  Object.assign(stage.style,{position:'relative',width:'100%',height:'100%',overflow:'hidden',isolation:'isolate'});
  const bg=document.createElement('img');
  bg.alt='';
  bg.draggable=false;
  Object.assign(bg.style,{width:'100%',height:'100%',position:'absolute',inset:'0',objectFit:'contain',imageRendering:'pixelated'});
  const cnv=document.createElement('canvas');
  cnv.width=724;cnv.height=724;
  Object.assign(cnv.style,{position:'absolute',inset:'0',width:'100%',height:'100%',background:'transparent',imageRendering:'pixelated'});
  stage.append(bg,cnv);container.appendChild(stage);
  const c=cnv.getContext('2d',{alpha:true});
  if(!c)throw new Error('Canvas 2D indisponível');
  const WORLD={W:1448,H:1086};
  // A arte quadrada estende os fundos V7 acima e abaixo da área original.
  const sceneOffsetY={sky:195,sea:215,moon:0};
  const aliases={ceu_arco_iris:'sky',cthulhu_fofinho:'sea',clareira_lunar:'moon'};
  let scene='sky';
  let clock=0,lastStamp=null,paused=false,rate=options.rate||1,showBounds=!!options.showBounds,destroyed=false,raf=0;
  const IMAGES={};
  const WORLDS={
 sky:{title:'Céu do Arco-Íris',actors:[
  {id:'dragon',kind:'fly',x:.265,y:.245,size:172,frameMs:148,bob:3,seed:511,pxps:[53,85],roamX:[.19,.345],roamY:[.205,.29],pauseMs:[260,800],minLeg:65,zone:[.07,.035,.385,.345]},
  {id:'pegasus',kind:'fly',fluid:true,flowTau:.39,x:.690,y:.245,size:165,frameMs:110,bob:2,seed:621,pxps:[49,64],roamX:[.625,.76],roamY:[.195,.29],pauseMs:[0,0],minLeg:75,zone:[.515,.04,.840,.345]},
  {id:'fox',kind:'ground',x:.525,y:.643,size:156,frameMs:135,bob:0,seed:731,pxps:[61,99],roamX:[.365,.695],roamY:[.615,.665],pauseMs:[420,1450],minLeg:90,zone:[.285,.465,.780,.710]},
 ],props:[]},
 sea:{title:'Cthulhu fofinho',actors:[
  // A faixa mais restrita abaixo garante todo o corpo do peixe NA ÁGUA.
  {id:'fish',kind:'water',x:.48,y:.387,size:120,frameMs:140,bob:2,seed:841,pxps:[38,70],roamX:[.345,.645],roamY:[.375,.405],pauseMs:[100,600],minLeg:66,zone:[.275,.305,.710,.465]},
  {id:'cthulhu',kind:'ground',x:.195,y:.733,size:158,frameMs:153,bob:0,seed:951,pxps:[38,62],roamX:[.145,.255],roamY:[.708,.753],pauseMs:[550,1800],minLeg:35,zone:[.055,.465,.315,.785]},
  {id:'octopus',kind:'ground',fluid:true,flowTau:.33,x:.825,y:.733,size:152,frameMs:113,bob:0,seed:1061,pxps:[40,57],roamX:[.775,.910],roamY:[.704,.753],pauseMs:[0,0],minLeg:57,zone:[.735,.470,.985,.790]}
 ],props:[
  {id:'shell',x:.273,y:.447,size:73,phase:380,frameMs:220,depth:'water-entrance'},
  {id:'shell',x:.831,y:.860,size:105,phase:1100,frameMs:220,depth:'right-rock'}
 ]},
 moon:{title:'Clareira Lunar',actors:[
  {id:'bat',kind:'fly',x:.62,y:.22,size:136,frameMs:115,bob:5,seed:1171,pxps:[72,106],roamX:[.46,.76],roamY:[.17,.25],pauseMs:[240,520],minLeg:95,zone:[.38,.13,.85,.32]},
  {id:'wolf',kind:'ground',x:.74,y:.60,size:180,frameMs:140,bob:0,seed:1281,pxps:[50,71],roamX:[.66,.83],roamY:[.57,.64],pauseMs:[440,940],minLeg:95,zone:[.58,.43,.92,.66]},
  {id:'cat',kind:'ground',x:.32,y:.81,size:134,frameMs:130,bob:0,seed:1391,pxps:[69,102],roamX:[.28,.43],roamY:[.76,.83],pauseMs:[360,880],minLeg:85,zone:[.21,.66,.51,.86]},
 ],props:[]}
};
  function sceneAssetIds(){
    const ids=new Set([...WORLDS[scene].actors,...WORLDS[scene].props].map(item=>item.id));
    if(scene==='sky')ids.add('dragon_right');
    if(scene==='moon')for(const id of Object.keys(MOON_PIVOTS))ids.add(id+'_left');
    return ids;
  }
  function updateStatus(){
    if(typeof options.onStatus==='function'){
      const keys=[scene,...sceneAssetIds()];
      const ready=keys.filter(key=>{
        const image=key===scene?bg:IMAGES[key];
        return image?.complete&&image.naturalWidth>0;
      }).length;
      options.onStatus({scene,ready,total:keys.length});
    }
  }
  function loadSceneImages(){
   for(const id of sceneAssetIds()){
    if(IMAGES[id])continue;
    const pic=new Image();
    pic.onload=()=>{if(!destroyed){draw();updateStatus();}};
    pic.onerror=()=>{if(!destroyed&&typeof options.onError==='function')options.onError(new Error('Asset não carregado: '+id));};
    IMAGES[id]=pic;pic.src=URLS[id];
   }
  }
function random01(a){
 a.seed=(Math.imul(a.seed,1664525)+1013904223)>>>0;
 return a.seed/4294967296;
}
function randomBetween(a,lo,hi){return lo+random01(a)*(hi-lo)}
function initMotion(a){
 a.motion={x:a.x,y:a.y,fromX:a.x,fromY:a.y,targetX:a.x,targetY:a.y,dir:1,moving:false,progress:0,duration:0,hold:a.fluid?0:120+random01(a)*350,vx:0,vy:0,fluidReady:false,fluidSpeed:0};
}
for(const world of Object.values(WORLDS))for(const a of world.actors)initMotion(a);
function chooseDestination(a){
 const m=a.motion;
 let x=m.x,y=m.y,d=0;
 for(let tries=0;tries<30;tries++){
  const tx=randomBetween(a,a.roamX[0],a.roamX[1]);
  const ty=randomBetween(a,a.roamY[0],a.roamY[1]);
  const dx=(tx-m.x)*WORLD.W,dy=(ty-m.y)*WORLD.H;
  const len=Math.hypot(dx,dy);
  if(len>=a.minLeg || tries===29){x=tx;y=ty;d=len;break}
 }
 m.fromX=m.x;m.fromY=m.y;m.targetX=x;m.targetY=y;
 const dx=x-m.x;
 // O dragão original olha para a ESQUERDA. drawSprite utiliza a versão
 // espelhada dragon_right quando dir=+1 e a original quando dir=-1.
 if(Math.abs(dx)>.001)m.dir=dx>0?1:-1;
 const speed=randomBetween(a,a.pxps[0],a.pxps[1]);
 m.duration=Math.max(720,d/speed*1000);
 m.progress=0;m.moving=true;m.hold=0;
}
// Locomoção suave para o pégaso e o polvinho. Eles não param a cada ponto.
// Velocidade e direção são amortecidas; o próximo ponto é escolhido antes
// de chegar ao destino. O movimento permanece dentro da zona aprovada.
function chooseFluidDestination(a){
 const m=a.motion;
 let chosenX=m.x,chosenY=m.y;
 for(let j=0;j<35;j++){
  // Pequena margem interna evita trombar na borda quando o corpo gira.
  const xx=randomBetween(a,a.roamX[0]+.009,a.roamX[1]-.009);
  const yy=randomBetween(a,a.roamY[0]+.005,a.roamY[1]-.005);
  const leg=Math.hypot((xx-m.x)*WORLD.W,(yy-m.y)*WORLD.H);
  if(leg>=a.minLeg || j===34){chosenX=xx;chosenY=yy;break}
 }
 m.targetX=chosenX;m.targetY=chosenY;
 m.fluidSpeed=randomBetween(a,a.pxps[0],a.pxps[1]);
 m.fluidReady=true;m.moving=true;m.hold=0;
}
function advanceFluid(a,ms){
 const m=a.motion;
 // Subpassos impedem trancos se o telefone apresentar uma queda de FPS.
 let rest=ms;
 while(rest>0){
  const delta=Math.min(18,rest)/1000;rest-=delta*1000;
  if(!m.fluidReady)chooseFluidDestination(a);
  let dx=(m.targetX-m.x)*WORLD.W,dy=(m.targetY-m.y)*WORLD.H;
  let dist=Math.hypot(dx,dy);
  if(dist<22){chooseFluidDestination(a);dx=(m.targetX-m.x)*WORLD.W;dy=(m.targetY-m.y)*WORLD.H;dist=Math.hypot(dx,dy)}
  const inv=dist>1?1/dist:0;
  // Steering amortecido: preserva o impulso nas curvas sem teleportar.
  const alpha=1-Math.exp(-delta/a.flowTau);
  m.vx+=(dx*inv*m.fluidSpeed-m.vx)*alpha;
  m.vy+=(dy*inv*m.fluidSpeed-m.vy)*alpha;
  const nx=m.x+m.vx*delta/WORLD.W,ny=m.y+m.vy*delta/WORLD.H;
  const lx=a.roamX[0],hx=a.roamX[1],ly=a.roamY[0],hy=a.roamY[1];
  m.x=Math.max(lx,Math.min(hx,nx));m.y=Math.max(ly,Math.min(hy,ny));
  if(m.x!==nx)m.vx*=.25;
  if(m.y!==ny)m.vy*=.25;
  // Espelhamento usa velocidade real, não o alvo futuro.
  if(m.vx>6)m.dir=1;else if(m.vx< -6)m.dir=-1;
 }
}
function advanceMotion(ms){
 for(const a of WORLDS[scene].actors){
  if(a.fluid){advanceFluid(a,ms);continue}
  let remaining=ms;
  // Garante determinismo inclusive quando o browser fica suspenso e retoma.
  for(let iter=0;iter<6&&remaining>0;iter++){
   const m=a.motion;
   if(!m.moving){
    const elapsed=Math.min(remaining,m.hold);
    m.hold-=elapsed;remaining-=elapsed;
    if(m.hold<=.0001)chooseDestination(a);
    continue;
   }
   const used=Math.min(remaining,m.duration-m.progress);
   m.progress+=used;remaining-=used;
   const t=Math.min(1,m.progress/m.duration);
   // Entrada/saída suave, sem arrancadas ou teleporte no retorno.
   const easing=t*t*(3-2*t);
   m.x=m.fromX+(m.targetX-m.fromX)*easing;
   m.y=m.fromY+(m.targetY-m.fromY)*easing;
   if(t>=1){
    m.x=m.targetX;m.y=m.targetY;m.moving=false;
    m.hold=randomBetween(a,a.pauseMs[0],a.pauseMs[1]);
   }
  }
 }
}
function positionFor(a){return a.motion}
// Acompanhamento opcional para validar os limites em testes automatizados.
function getPositions(){return {scene,actors:Object.fromEntries(Object.values(WORLDS).flatMap(w=>w.actors.map(a=>[a.id,{x:a.motion.x,y:a.motion.y,dir:a.motion.dir,moving:a.motion.moving,rangeX:a.roamX,rangeY:a.roamY}])))};}
function frameFor(ms,item){
 const meta=META[item.id]??MOON_ATLAS,count=meta.cols*meta.rows;
 return (Math.floor((ms+(item.phase||0))/item.frameMs)%count+count)%count;
}
function drawSprite(id,frame,x,y,width,dir=1,anchor='center'){
 const pivot=MOON_PIVOTS[id];
 const actualId=(id==='dragon'&&dir===1)?'dragon_right':pivot&&dir<0?id+'_left':id;
 const im=IMAGES[actualId],m=META[id]??MOON_ATLAS;if(!im?.complete||!im.naturalWidth)return;
 const count=m.cols*m.rows, f=((frame%count)+count)%count;
 const sc=width/m.cellW, b0=m.bounds?.[0];
 const pivotX=pivot?pivot[0]:(id==='dragon'&&dir===1)?(m.cellW-(b0[0]+b0[2])/2):(b0[0]+b0[2])/2;
 // The frame art is kept at its natural original scale.
 // For walking animals, frame zero foot contact establishes one constant ground baseline.
 const pivotY=pivot?pivot[1]:anchor==='feet'||anchor==='bottom'?b0[3]:(b0[1]+b0[3])/2;
 c.save();c.translate(x,y);if(id!=='dragon'&&!pivot&&dir<0)c.scale(-1,1);
 c.drawImage(im,(f%m.cols)*m.cellW,Math.floor(f/m.cols)*m.cellH,m.cellW,m.cellH,-pivotX*sc,-pivotY*sc,width,m.cellH*sc);
 c.restore();
}
function waterRipples(x,y,phase){
 // Small, water-colored contact ripples, not a detached rectangular water tile.
 const r=1+(.5+.5*Math.sin(phase))*.7;
 c.save();c.lineWidth=2.5;c.strokeStyle='rgba(183,252,250,.79)';
 c.beginPath();c.ellipse(x,y,24*r,4*r,0,0,Math.PI);c.stroke();
 c.strokeStyle='rgba(39,170,229,.65)';c.beginPath();c.ellipse(x-7,y+3,32*r,5*r,0,0,Math.PI);c.stroke();c.restore();
}
function draw(){
 c.setTransform(.5,0,0,.5,0,0);
 c.clearRect(0,0,WORLD.W,WORLD.W);
 c.translate(0,sceneOffsetY[scene]);
 c.imageSmoothingEnabled=false;
 const w=WORLD.W,h=WORLD.H,actors=WORLDS[scene].actors;
 if(scene==='sea'){
  const f=actors[0],p=positionFor(f);
  const size=f.size*ACTOR_SCALE;
  const fishX=p.x*w,fishY=p.y*h+Math.sin(clock*.0022)*f.bob;
  // Strict shoreline mask: the fish cannot appear in the meadow.
  c.save();c.beginPath();c.rect(w*.205,h*.320,w*.57,h*.147);c.clip();
  drawSprite(f.id,frameFor(clock,f),fishX,fishY,size,p.dir);
  waterRipples(fishX,fishY+size*.12,clock*.004);
  c.restore();
 }
 for(const a of actors){
  if(a.kind==='water')continue;
  const size=a.size*ACTOR_SCALE;
  const p=positionFor(a);const px=p.x*w;
  const y=p.y*h+(a.kind==='fly'?Math.sin(clock*.0034+a.frameMs)*a.bob:0);
  if(a.kind==='ground'){
   // Position shadows on ground, never outside the stage.
   c.save();c.fillStyle='rgba(34,94,79,.19)';c.beginPath();c.ellipse(px,y+2,size*.23,6,0,0,Math.PI*2);c.fill();c.restore();
  }
  const animationTime=scene==='moon'&&a.kind==='ground'?p.progress:clock;
  const frame=scene==='moon'&&a.kind==='ground'&&!p.moving?0:frameFor(animationTime,a);
  drawSprite(a.id,frame,px,y,size,p.dir,a.kind==='ground'?'feet':'center');

 }
 if(scene==='sea'){
  for(const prop of WORLDS.sea.props){
   drawSprite(prop.id,frameFor(clock,prop),prop.x*w,prop.y*h,prop.size,1,'bottom');

  }
 }
 if(showBounds){
  // The boxes intentionally match the SIX zones drawn in the submitted phone screenshots.
  for(const actor of WORLDS[scene].actors){
   const [x1,y1,x2,y2]=actor.zone;
   c.save();c.strokeStyle=actor.kind==='water'?'rgba(108,242,239,.85)':'rgba(255,233,118,.83)';
   c.lineWidth=3;c.setLineDash([12,8]);
   c.strokeRect(x1*w,y1*h,(x2-x1)*w,(y2-y1)*h);
   c.setLineDash([]);c.font='bold 23px sans-serif';c.fillStyle='white';
   c.shadowColor='#132c48';c.shadowBlur=5;c.fillText(actor.id,x1*w+9,y1*h+28);c.restore();
  }
 }
}

  function tick(now){
    if(destroyed||paused)return;
    if(lastStamp===null)lastStamp=now;
    const dt=Math.min(55,Math.max(0,now-lastStamp));lastStamp=now;
    clock+=dt*rate;advanceMotion(dt*rate);draw();
    raf=requestAnimationFrame(tick);
  }
  function selecionar(id){
    id=aliases[id]??id;
    if(!WORLDS[id])throw new Error('Cenário inválido: '+id);
    scene=id;WORLD.H=scene==='moon'?1448:1086;bg.src=URLS[id];loadSceneImages();draw();updateStatus();
  }
  bg.onload=updateStatus;
  selecionar(options.scene??'sky');
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  function syncMotion(){
    paused=document.hidden||reducedMotion.matches;
    cancelAnimationFrame(raf);
    lastStamp=null;
    if(!paused)raf=requestAnimationFrame(tick);
  }
  reducedMotion.addEventListener('change',syncMotion);
  document.addEventListener('visibilitychange',syncMotion);
  syncMotion();
  return {
    element:stage,canvas:cnv, background:bg,
    selecionar, setScene:selecionar, getScene:()=>scene,
    setRate(v){rate=Math.max(.1,Math.min(3,Number(v)||1));},
    mostrarAreas(v){showBounds=!!v;draw()},getPositions,
    destruir(){
      destroyed=true;cancelAnimationFrame(raf);
      reducedMotion.removeEventListener('change',syncMotion);
      document.removeEventListener('visibilitychange',syncMotion);
      stage.remove();
    },
  };
}
