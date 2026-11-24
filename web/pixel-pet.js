// Personagem modular em pixel art 2D. Coordenadas inteiras no palco de 200 × 200.
import {handPosition} from './core.js?v=74';

const ink='#273249';
const r=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const b=(x,y,w,h,c)=>r(x-3,y-3,w+6,h+6,ink)+r(x,y,w,h,c);
const shape=(d,c,outline=ink)=>`<path d="${d}" fill="${c}" stroke="${outline}" stroke-width="3" stroke-linejoin="miter"/>`;
const rows=(spans,c)=>spans.map(([x,y,w,h])=>r(x,y,w,h,c)).join('');
const shade=(hex,amount)=>{const n=parseInt(hex.slice(1),16);return '#'+[16,8,0].map(bit=>Math.max(0,Math.min(255,Math.round(((n>>bit)&255)+amount))).toString(16).padStart(2,'0')).join('')};
const id=(ids,n)=>ids[n]||ids[0];
const earIds=['cat','dog','bunny','bear','horns','unicorn','antlers','elf','bat','mouse','antenna','ram','fox','floppy','spiky','deer'];
const headIds=['round','wide','tall','square','cheeks','heart','fox','mini','pear','frog','diamond','fluffy'];
const eyeIds=['big','dots','cat','sleepy','happy','star','heart','angry','wink','wide','sparkle','shades','oval','square','diamond','crescent','lashes','shy','robot','rainbow','galaxy','teary','tiny','tall','sleepywide','gem'];
const snoutIds=['button','cat','dog','beak','dragon','pig','grin','bunny','mouse','trunk','cat3','tongue','short','long','wide','heart','whiskers','whiskerslong','whiskerscurled','whiskersdots','foxy','bunnywhiskers'];
const mouthIds=['smile','open','cat','heart','surprised','teeth','tongue','serious','grin','smirk','kiss','wave','tiny','fangs','laugh','pout','soft','none'];
const accIds=['star','crown','halo','bow','party','glasses','flower','bell','tie','wizard','headphones','scarf','sunglasses'];
const markIds=['blush','spots','stripes','freckles','forehead','swirl','brows','tuxedo','bolt','confetti','whiskers','bandage'];
const hairIds=['mane','tuft','curls','bangs','spikes','leaf','pigtails','plumes','bun','locks','beanie','curlq'];
const wingIds=['dragon','angel','fairy','bat','phoenix','tiny','butterfly','fin','dragonfly','leaf','crystal','flame'];
const tailIds=['cat','dog','pompom','dragon','fish','fox','peacock','flame','leaf','snake','bolt','spikes','feathers'];
const p=(s,k)=>s[k]<0?'none':id(({ears:earIds,head:headIds,eyes:eyeIds,snout:snoutIds,mouth:mouthIds,accessory:accIds,markings:markIds,hair:hairIds,wings:wingIds,tail:tailIds})[k],s[k]);
function headShape(s,c){
 const kind=p(s,'head');let w=78,h=66,x=61,y=61;
 if(['wide','cheeks','frog'].includes(kind)){w=90;x=55}
 if(['tall','pear','diamond'].includes(kind)){h=74;y=53}
 if(kind==='mini'){w=68;x=66;h=60;y=67}
 if(kind==='square')return b(59,60,82,67,c.p)+r(65,65,58,4,shade(c.p,35))+r(136,68,4,44,shade(c.p,-33));
 let a=shape(`M${x+13} ${y}H${x+w-13}V${y+7}H${x+w-5}V${y+18}H${x+w}V${y+h-18}H${x+w-5}V${y+h-7}H${x+w-13}V${y+h}H${x+13}V${y+h-7}H${x+5}V${y+h-18}H${x}V${y+18}H${x+5}V${y+7}H${x+13}Z`,c.p);
 if(kind==='heart')a+=b(58,63,36,20,c.p)+b(106,63,36,20,c.p);
 if(kind==='fluffy')a+=rows([[55,85,7,19],[138,78,7,23],[63,56,15,6],[120,56,15,6]],c.p);
 if(kind==='fox')a+=rows([[55,84,9,9],[136,84,9,9]],c.p);
 if(kind==='frog')a+=b(58,61,23,18,c.p)+b(119,61,23,18,c.p);
 if(kind==='diamond')a+=rows([[67,57,15,5],[118,57,15,5],[71,125,58,5]],shade(c.p,-20));
 if(kind==='cheeks')a+=b(54,95,15,19,c.p)+b(131,95,15,19,c.p);
 if(kind==='pear')a+=r(64,65,72,8,shade(c.p,18));
 if(kind==='round')a+=r(81,65,38,3,shade(c.p,30));
 if(kind==='wide')a+=rows([[58,88,6,16],[136,88,6,16]],shade(c.p,-18));
 if(kind==='tall')a+=r(91,57,18,5,c.s);
 if(kind==='mini')a+=rows([[69,104,7,7],[124,104,7,7]],c.s);
 a+=r(x+17,y+4,34,3,shade(c.p,37))+r(x+7,y+17,4,25,shade(c.p,20))+r(x+w-9,y+22,4,28,shade(c.p,-31))+r(x+24,y+h-8,39,3,shade(c.p,-24));
 return a;
}
function ears(s,c){
 const k=p(s,'ears');if(k==='none')return '';
 const pair=(left,right)=>left+right;
 if(k==='bunny')return pair(shape('M68 66V36H70V25H78V36H82V67Z',c.p)+r(73,32,4,24,c.s)+r(70,30,2,17,shade(c.p,35)),shape('M118 67V36H122V25H130V36H132V66Z',c.p)+r(123,32,4,24,c.s)+r(127,30,2,17,shade(c.p,35)));
 if(k==='horns'||k==='unicorn'||k==='antlers'||k==='ram'){
  let z=b(65,42,12,23,c.a)+b(123,42,12,23,c.a);
  if(k==='unicorn')z+=shape('M96 59V46H99V32H103V46H106V59Z',c.a)+r(99,45,5,2,shade(c.a,40));
  if(k==='antlers')z+=rows([[56,41,22,6],[122,41,22,6],[60,31,6,15],[134,31,6,15]],c.a);
  if(k==='ram')z+=shape('M58 63V54H67V51H77V61H72V68H63V64Z',c.a)+shape('M142 63V54H133V51H123V61H128V68H137V64Z',c.a);
  return z;
 }
 if(k==='fox'){
  const left=shape('M62 79H56V49H53V27H67V38H75V50H82V80Z',c.p)
    +shape('M65 67H61V49H60V39H67V48H73V66Z',c.s)
    +r(63,43,4,8,shade(c.s,28));
  return `<g class="fox-ear-left">${left}</g><g class="fox-ear-right" transform="translate(200 0) scale(-1 1)">${left}</g>`;
 }
 if(k==='floppy')return b(45,65,20,47,c.p)+b(135,65,20,47,c.p)+r(50,76,9,22,c.s)+r(141,76,9,22,c.s);
 if(k==='spiky')return shape('M61 73H57V34H65V25H73V47H80V73Z',c.p)+shape('M120 73V47H127V25H135V34H143V73Z',c.p);
 if(k==='deer')return rows([[68,34,6,31],[125,34,6,31],[57,38,16,6],[126,38,16,6],[57,26,6,15],[137,26,6,15],[67,25,6,16],[126,25,6,16]],c.a);
 if(k==='dog')return b(49,69,19,38,c.p)+b(132,69,19,38,c.p);
 if(k==='bear'||k==='mouse'){const size=k==='mouse'?27:20;return b(60,50,size,size,c.p)+b(120,50,size,size,c.p)+r(66,56,size-12,size-12,c.s)+r(126,56,size-12,size-12,c.s)}
 if(k==='antenna')return rows([[74,37,5,26],[121,37,5,26]],ink)+b(67,30,16,11,c.a)+b(117,30,16,11,c.a);
 if(k==='bat')return shape('M72 73H59V66H48V60H45V83H55V78H72Z',c.p)+shape('M128 73H141V66H152V60H155V83H145V78H128Z',c.p);
 if(k==='elf')return shape('M72 77H51V72H43V66H54V70H72Z',c.p)+shape('M128 77H149V72H157V66H146V70H128Z',c.p);
 return shape('M63 75V59H67V48H74V52H80V75Z',c.p)+shape('M120 75V52H126V48H133V59H137V75Z',c.p)+r(68,55,6,12,c.s)+r(126,55,6,12,c.s);
}
function eyes(s,mood,color=null){
 const k=p(s,'eyes'),iris=color||ink,dark=color?shade(color,-72):ink,mid=color?shade(color,-32):ink;
 const lit=color?shade(color,54):'#fff8e6';
 // Apenas a íris e seus brilhos acompanham o alvo: bordas, cílios e pálpebras
 // permanecem ancorados ao rosto. Dois grupos independentes para as pupilas.
 const gaze=(x,art)=>`<g class="pixel-pupil" data-eye="${x<100?'left':'right'}">${art}</g>`;
 const closed=['sleepy','sleep-rest','sleep-settle'].includes(mood)||k==='sleepy';
 if(closed)return rows([[76,88,16,4],[109,88,16,4]],mid);
 if(k==='sleepywide')return [74,109].map(x=>r(x,86,20,4,mid)+r(x+3,90,14,3,iris)+gaze(x,r(x+8,90,4,3,dark))).join('');
 // Olhos sorrindo estão semicerrados: preserva a expressão, sem falsas pupilas.
 if(k==='happy')return [76,111].map(x=>r(x,88,3,4,mid)+r(x+3,84,8,5,iris)+r(x+11,88,3,4,mid)).join('');
 if(k==='shy')return [76,111].map(x=>r(x,88,14,5,iris)+r(x+2,84,10,3,mid)+gaze(x,r(x+5,92,4,3,dark))+r(x-4,101,10,4,'#ef87a5')).join('');
 if(k==='tiny')return [81,116].map(x=>gaze(x,r(x-1,84,8,10,iris)+r(x+1,86,3,3,lit))).join('');
 if(k==='shades')return r(73,81,22,18,mid)+r(105,81,22,18,mid)+r(75,83,18,12,dark)+r(107,83,18,12,dark)+r(95,85,10,4,mid);
 if(k==='robot')return [76,111].map(x=>b(x-2,80,18,15,iris)+r(x+2,84,10,7,dark)+gaze(x,r(x+5,86,4,3,lit))).join('');
 let z='';for(const x of [76,111]){
  if(k==='oval'){z+=b(x+2,78,9,22,'#f6ead8')+gaze(x,r(x+4,84,4,11,iris)+r(x+4,84,2,3,lit));continue;}
  if(k==='square'){z+=b(x-1,82,15,15,'#f6ead8')+gaze(x,r(x+4,86,7,8,iris)+r(x+5,86,3,3,lit));continue;}
  if(k==='diamond'){z+=shape(`M${x+6} 76H${x+10}V80H${x+14}V90H${x+10}V96H${x+6}V90H${x+2}V80H${x+6}Z`,'#f6ead8')+gaze(x,r(x+6,83,5,8,iris)+r(x+6,83,2,3,lit));continue;}
  if(k==='crescent'){z+=b(x,79,13,16,'#f6ead8')+gaze(x,r(x+3,84,7,9,iris)+r(x+6,83,5,6,'#f6ead8'));continue;}
  if(k==='galaxy'){z+=b(x,82,13,17,iris)+gaze(x,r(x+4,85,5,6,mid)+r(x+7,91,3,3,lit)+r(x+5,93,2,2,'#fff8ee'));continue;}
  if(k==='rainbow'){z+=b(x,82,13,17,'#fff8ee')+gaze(x,r(x+4,85,7,10,iris)+r(x+5,88,5,6,lit)+r(x+7,89,2,4,mid));continue;}
  if(k==='tall'){z+=b(x,75,12,27,'#fff8ee')+gaze(x,r(x+4,79,5,18,iris)+r(x+4,79,2,6,lit));continue;}
  if(k==='gem'){z+=shape(`M${x+5} 76H${x+9}V80H${x+13}V88H${x+9}V94H${x+5}V88H${x+1}V80H${x+5}Z`,'#f6ead8')+gaze(x,r(x+5,82,5,8,iris)+r(x+5,82,2,3,lit));continue;}
  z+=b(x,82,13,17,'#f6ead8');
  if(k==='lashes'){
   // V68: três cílios compridos e bem conectados em cada olho, com pontinhas
   // pixeladas. Permanecem fixos quando as pupilas seguem os objetos.
   z+=r(x-1,76,3,7,mid)+r(x-3,73,2,4,mid)
     +r(x+5,73,3,10,mid)+r(x+5,70,2,4,mid)
     +r(x+12,76,3,7,mid)+r(x+15,73,2,4,mid);
  }
  if(k==='teary')z+=r(x+12,97,5,8,'#74cce9')+r(x+13,99,2,3,'#e1ffff');
  if(k==='dots')z+=gaze(x,r(x+4,86,6,9,iris)+r(x+5,86,2,3,lit));
  else if(k==='heart')z+=gaze(x,shape(`M${x+3} 87V84H${x+6}V87H${x+8}V84H${x+11}V89H${x+9}V92H${x+7}V95H${x+5}V92H${x+3}Z`,iris));
  else if(k==='star'||k==='sparkle')z+=gaze(x,r(x+4,86,7,7,iris)+r(x+6,84,3,11,iris)+r(x+5,86,2,3,lit));
  else z+=gaze(x,r(x+4,85,6,10,iris)+r(x+5,86,2,4,lit)+r(x+8,92,2,2,mid));
 }
 if(k==='wink')z+=r(110,81,19,20,'#f6ead8')+r(111,88,16,4,iris);
 if(k==='cat')z+=r(78,83,11,3,mid)+r(113,83,11,3,mid);
 if(k==='wide')z+=r(78,81,11,2,'#fff')+r(113,81,11,2,'#fff');
 if(k==='sparkle')z+=r(75,80,4,4,lit)+r(122,79,4,4,lit)+r(80,79,3,3,iris);
 if(k==='star')z+=rows([[82,77,3,6],[117,77,3,6]],iris);
 if(k==='angry'||['hungry','sad','dirty','potty'].includes(mood))z+=r(76,78,14,4,dark)+r(112,78,14,4,dark);
 return z;
}

function snout(s,c,mood){
 const k=p(s,'snout');let z='';
 if(k==='none')return '';
 if(k==='button')z=b(94,105,12,8,c.s)+r(97,107,6,4,ink);
 else if(k==='cat'||k==='cat3'){z=shape('M94 106H106V111H103V114H97V111H94Z','#ef91ac')+rows([[67,110,14,2],[119,110,14,2]],ink);if(k==='cat3')z+=r(94,104,12,3,'#ffbdd1')+r(98,113,4,5,'#df7da0');}
 else if(k==='dog')z=b(81,102,38,19,c.s)+b(94,103,12,9,ink);
 else if(k==='beak')z=shape('M89 105H111V109H117V117H83V109H89Z',c.a)+r(96,109,8,3,shade(c.a,-30));
 else if(k==='dragon')z=shape('M79 105H88V102H112V105H121V119H79Z',c.s)+rows([[86,111,4,4],[110,111,4,4]],ink);
 else if(k==='pig')z=b(82,104,36,17,'#ef9db5')+rows([[91,110,5,7],[104,110,5,7]],'#b55e83');
 else if(k==='grin')z=b(85,104,30,15,c.s)+r(91,108,18,6,shade(c.s,-35));
 else if(k==='bunny')z=b(86,104,28,16,c.s)+r(96,107,8,5,'#ef91ac');
 else if(k==='mouse')z=shape('M94 104H106V110H112V116H88V110H94Z','#ef91ac')+rows([[67,110,17,2],[116,110,17,2]],ink);
 else if(k==='trunk')z=b(91,100,18,21,c.s)+b(94,118,12,12,c.s)+r(97,126,6,3,ink);
 else if(k==='tongue')z=b(86,103,28,16,c.s)+r(97,117,7,6,'#ed7994');
 else if(k==='short')z=b(91,105,18,12,c.s)+r(97,107,6,4,ink);
 else if(k==='long')z=b(89,99,22,27,c.s)+b(95,118,10,9,c.s)+r(96,107,8,5,ink);
 else if(k==='wide')z=b(76,103,48,18,c.s)+r(96,106,8,6,ink);
 else if(k==='heart')z=rows([[92,105,6,4],[102,105,6,4],[89,109,22,5],[92,114,16,4],[95,118,10,3],[98,121,4,3]],'#f28eac')+r(94,107,3,2,'#ffd5df');
 else if(k==='whiskers')z=r(94,104,12,6,'#f09ab2')+rows([[64,105,23,2],[66,112,21,2],[113,105,23,2],[113,112,21,2]],shade(c.p,-52));
 else if(k==='whiskerslong')z=r(95,103,10,7,c.s)+rows([[56,101,30,2],[57,109,29,2],[114,101,30,2],[114,109,29,2]],shade(c.p,-55));
 else if(k==='whiskerscurled')z=r(95,105,10,6,'#f19ab0')+rows([[64,105,18,2],[58,102,7,5],[66,114,17,2],[117,105,18,2],[135,102,7,5],[117,114,17,2]],shade(c.p,-55));
 else if(k==='whiskersdots')z=r(96,105,8,7,'#ee9bad')+rows([[77,106,3,3],[84,102,3,3],[82,111,3,3],[120,106,3,3],[113,102,3,3],[115,111,3,3]],shade(c.p,-55));
 else if(k==='foxy')z=rows([[94,105,12,6],[97,110,6,3]],'#4b3944')+rows([[69,109,17,2],[114,109,17,2],[72,115,13,2],[115,115,13,2]],shade(c.p,-65));
 else if(k==='bunnywhiskers')z=r(96,103,8,5,'#f5a3ba')+rows([[78,109,9,2],[69,111,8,2],[113,109,9,2],[123,111,8,2]],shade(c.p,-58))+r(98,109,4,4,c.s);

 return z;
}
function mouthArt(s,c,mood,color=null){
 const k=p(s,'mouth');
 // "Sem boca" é uma escolha explícita, inclusive nos humores especiais.
 if(k==='none')return '';
 const tone=color||'#75445c',dim=color?shade(color,-43):'#694052',lit=color?shade(color,48):'#ffdbe5';
 const sad=['sad','hungry','dirty','potty'].includes(mood),sleepy=['sleepy','sleep-rest','sleep-settle'].includes(mood);
 if(sleepy)return r(94,124,12,2,tone);
 if(sad)return rows([[91,124,4,3],[95,121,10,3],[105,124,4,3]],tone);
 if(k==='smile')return rows([[89,119,3,4],[92,123,5,3],[97,126,6,3],[103,123,5,3],[108,119,3,4]],tone);
 if(k==='open')return r(92,118,16,15,dim)+r(95,120,10,3,lit)+r(95,128,10,3,'#ee94b1');
 if(k==='cat')return rows([[89,120,3,3],[92,123,5,3],[97,120,6,3],[103,123,5,3],[108,120,3,3]],tone);
 if(k==='heart')return rows([[92,117,6,4],[102,117,6,4],[89,121,22,5],[92,126,16,3],[95,129,10,3],[98,132,4,3]],color||'#df648c')+rows([[93,119,3,2],[104,119,3,2]],lit);
 if(k==='surprised')return r(95,119,10,13,tone)+r(98,122,4,7,lit);
 if(k==='teeth')return r(89,121,22,11,dim)+r(92,123,16,5,'#fff8ee')+r(99,123,2,5,dim)+r(94,129,12,2,'#eea4bb');
 if(k==='tongue')return r(90,121,20,10,dim)+r(96,127,8,7,'#ef91b0')+r(99,130,2,4,tone);
 if(k==='serious')return r(92,125,16,3,tone);
 if(k==='grin')return rows([[89,120,3,4],[92,124,16,4],[108,120,3,4]],tone)+r(95,124,10,2,lit);
 if(k==='smirk')return rows([[93,124,14,3],[106,121,4,4],[91,125,3,2]],tone);
 if(k==='kiss')return rows([[97,119,6,3],[94,122,12,5],[97,127,6,3]],tone)+r(98,123,4,3,lit);
 if(k==='wave')return rows([[88,124,6,3],[94,121,6,3],[100,124,6,3],[106,121,6,3]],tone);
 if(k==='tiny')return r(97,124,6,3,tone);
 if(k==='fangs')return r(90,121,20,11,dim)+rows([[94,122,5,6],[101,122,5,6]],'#fff9ed')+r(96,129,9,2,'#df8fa5');
 if(k==='laugh')return r(88,119,24,13,dim)+r(91,121,18,4,'#fff8ee')+r(94,127,12,4,'#ee94ad');
 if(k==='pout')return rows([[94,122,12,4],[96,126,8,3]],tone)+r(98,123,4,2,lit);
 if(k==='soft')return rows([[91,123,4,3],[95,126,10,2],[105,123,4,3]],tone);
 return '';
}

function marks(s,c){
 const k=p(s,'markings');const bright=c.a,deep=shade(c.a,-62),light=shade(c.a,48);let z='';
 if(k==='none')return '';
 if(k==='blush')return rows([[61,100,12,7],[127,100,12,7]],'#ee7c9d')+rows([[63,100,8,2],[129,100,8,2]],'#ffbfd0');
 if(k==='spots')return rows([[63,78,9,8],[133,86,8,8],[71,110,5,5],[123,109,6,6]],deep)+r(65,79,4,3,light);
 if(k==='stripes')return rows([[92,65,5,11],[101,63,5,13],[110,65,5,11]],deep)+rows([[63,93,9,4],[128,93,9,4]],bright);
 if(k==='freckles')return rows([[64,102,4,4],[70,108,4,4],[65,112,3,3],[132,102,4,4],[126,108,4,4],[132,112,3,3]],deep);
 if(k==='forehead')return shape('M98 62H103V68H110V74H103V80H97V74H90V68H97Z',bright)+r(99,66,3,9,light);
 if(k==='swirl')return rows([[94,65,12,4],[103,69,4,7],[95,73,11,4],[94,76,4,4]],deep)+r(94,65,6,3,light);
 if(k==='brows')return rows([[77,68,13,4],[111,68,13,4],[77,72,4,3],[120,72,4,3]],deep);
 if(k==='tuxedo')return rows([[66,99,9,4],[125,99,9,4]],'#fff5e6')+shape('M93 110H107V114H112V119H107V124H93V119H88V114H93Z','#fff5e6');
 if(k==='bolt')return shape('M99 60H109V66H103V70H111V76H103V83H100V77H93V72H99Z',bright)+r(99,62,5,3,light);
 if(k==='confetti')return rows([[66,99,7,5],[128,99,7,5]],bright)+rows([[93,67,4,4],[103,64,5,5],[109,74,4,4]],'#ee8ca7');
 if(k==='whiskers')return rows([[53,109,22,3],[55,116,18,3],[125,109,22,3],[127,116,18,3]],deep);
 if(k==='bandage')return r(123,64,16,10,'#e7c19a')+r(127,67,9,4,'#fff0d9')+r(130,67,2,4,'#c28e72');
 return z;
}

function hair(s,c){const k=p(s,'hair');if(k==='none')return '';
 if(k==='beanie')return b(69,55,62,15,c.a)+r(76,49,48,8,c.a);
 if(k==='pigtails')return b(49,66,18,18,c.a)+b(133,66,18,18,c.a)+r(52,71,12,3,shade(c.a,40));
 if(k==='plumes')return shape('M60 74H51V62H46V54H55V62H64Z',c.a)+shape('M140 74H149V62H154V54H145V62H136Z',c.a);
 if(k==='mane')return b(55,61,14,50,c.a)+b(131,61,14,50,c.a)+r(57,69,4,35,shade(c.a,35));
 if(k==='locks')return b(55,61,14,50,c.a)+b(131,61,14,50,c.a)+rows([[55,101,8,12],[137,101,8,12]],shade(c.a,-30));
 if(k==='leaf')return b(93,52,15,10,'#72b880')+r(99,49,5,6,'#72b880');
 if(k==='spikes')return rows([[81,50,10,14],[96,46,9,18],[111,50,9,14]],c.a);
 if(k==='bangs')return b(77,59,46,9,c.a)+r(83,66,10,8,c.a);
 if(k==='curls')return b(80,53,13,12,c.a)+b(95,50,13,12,c.a)+b(110,53,13,12,c.a);
 if(k==='bun')return b(87,45,25,16,c.a)+r(93,47,11,3,shade(c.a,38));
 if(k==='curlq')return shape('M90 65V53H110V48H119V55H108V61H101V65Z',c.a);
 return b(91,53,18,12,c.a)+r(99,49,8,7,c.a);
}
// Cada desenho tem silhueta própria. As coordenadas ficam no palco usado pelas animações.
const wingPaths={
 dragon:'M70 122H62V112H51V104H39V119H43V128H38V141H48V137H54V146H61V138H70Z',
 angel:'M70 121H62V114H51V110H40V118H37V130H40V139H46V145H53V143H59V147H65V140H70Z',
 fairy:'M70 126H65V116H60V107H48V105H39V110H37V120H44V127H52V130H45V133H43V141H48V148H57V147H64V140H70Z',
 bat:'M70 122H62V113H55V106H47V100H41V116H38V137H46V131H52V140H58V135H64V143H70Z',
 phoenix:'M70 122H65V110H58V100H52V110H44V105H40V118H33V113H35V130H42V141H50V145H58V140H65V146H70Z',
 tiny:'M70 125H61V120H53V124H49V132H53V138H62V135H70Z',
 butterfly:'M70 124H65V113H59V105H47V103H38V110H36V120H41V128H52V130H42V132H38V141H41V150H51V153H60V147H65V140H70Z',
 fin:'M70 120H59V115H51V107H47V118H39V126H34V133H39V140H50V138H58V146H65V138H70Z',
 dragonfly:'M70 125H63V119H56V104H48V99H43V105H43V120H52V127H43V132H40V140H46V145H54V140H62V133H70Z',
 leaf:'M70 125H62V117H55V107H48V101H43V112H39V123H41V135H48V143H58V145H65V137H70Z',
 crystal:'M70 125H64V112H59V100H53V110H48V105H42V119H37V128H43V138H53V145H61V138H70Z',
 flame:'M70 124H63V115H58V101H53V114H47V108H45V122H38V116H40V132H37V139H44V146H55V150H64V142H70Z'};
function wings(s,c){const k=p(s,'wings');if(k==='none')return '';
 const path=wingPaths[k];if(!path)return '';
 const color=['angel','fairy','butterfly','dragonfly','crystal'].includes(k)?c.s:c.a;
 let detail=rows([[48,119,5,4],[56,127,6,3]],shade(color,35));
 if(k==='butterfly'||k==='fairy')detail+=rows([[44,113,8,7],[50,137,7,6]],c.a);
 if(k==='angel')detail+=rows([[42,128,15,3],[47,136,12,3]],'#fff9e8');
 if(k==='bat'||k==='dragon')detail+=rows([[48,119,3,11],[56,125,3,9]],shade(color,-35));
 if(k==='leaf')detail+=rows([[48,117,3,18],[51,128,10,3]],shade(color,-40));
 if(k==='crystal')detail+=rows([[51,109,3,22],[55,119,5,3]],'#fff9ef');
 const joined=r(65,120,19,12,color)+shape(path,color)+detail;
 return `<g class="pixel-wing-left"><g class="pixel-wing-pose">${joined}</g></g><g class="pixel-wing-right" transform="translate(200 0) scale(-1 1)"><g class="pixel-wing-pose">${joined}</g></g>`;
}
const tailPaths={
 cat:'M130 146H153V142H160V128H156V120H163V117H171V123H174V142H170V151H162V157H130Z',
 dog:'M130 146H149V140H154V132H162V129H170V135H174V143H170V150H164V155H130Z',
 pompom:'M130 146H154V139H161V133H167V143H162V151H155V156H130Z',
 dragon:'M130 146H153V141H162V134H169V130H176V139H171V149H162V155H130Z',
 fish:'M130 146H151V140H161V134H166V143H172V136H181V128H185V145H181V151H185V168H181V161H172V154H165V158H130Z',
 fox:'M130 146H147V137H153V128H164V121H177V125H182V136H179V146H170V155H157V159H130Z',
 peacock:'M130 146H150V140H157V133H162V122H169V117H176V121H184V128H187V139H183V149H176V155H165V159H130Z',
 flame:'M130 146H153V139H160V128H165V118H171V129H178V120H180V135H185V143H181V153H170V158H130Z',
 leaf:'M130 146H153V141H160V134H165V125H174V119H181V125H184V134H181V145H175V152H165V157H130Z',
 snake:'M130 146H154V140H165V132H175V137H171V146H164V153H170V158H179V151H185V156H183V164H175V168H164V165H158V159H130Z',
 bolt:'M130 146H151V139H160V132H166V124H176V130H171V136H182V142H174V151H166V159H158V155H130Z',
 spikes:'M130 146H147V138H152V130H158V136H163V127H169V133H174V124H180V140H176V150H167V157H130Z',
 feathers:'M130 146H150V139H157V128H163V121H169V127H175V118H181V126H186V136H183V145H176V152H167V158H130Z'};
function tail(s,c){const k=p(s,'tail');if(k==='none')return '';const path=tailPaths[k];if(!path)return '';
 let z=r(116,145,24,12,c.p)+shape(path,c.p)+r(135,147,16,3,shade(c.p,35));
 if(k==='pompom')z+=shape('M163 127H172V130H179V137H181V145H176V151H166V148H160V141H160V133H163Z',c.s)+r(165,132,7,4,'#fff8ee');
 if(k==='fox')z+=shape('M168 123H177V127H180V136H177V143H170V138H165V131Z',c.s);
 if(k==='fish')z+=rows([[174,139,3,15],[180,135,3,7],[180,155,3,7]],c.s);
 if(k==='peacock')z+=shape('M164 130H170V125H176V130H180V138H176V144H169V141H164Z',c.a)+r(170,131,6,8,'#4c9596');
 if(k==='leaf')z+=rows([[165,135,14,3],[171,129,3,16]],shade(c.p,-45));
 if(k==='flame')z+=shape('M168 144V136H172V132H175V139H179V145H175V151H168Z',c.a);
 if(k==='bolt')z+=r(164,136,8,3,c.a)+r(168,145,7,3,c.a);
 if(k==='dragon'||k==='spikes')z+=rows([[153,137,5,5],[163,132,5,5],[173,128,5,5]],c.a);
 if(k==='feathers')z+=rows([[165,129,3,18],[175,127,3,18]],c.s);
 if(k==='dog')z+=r(163,134,7,5,c.s);
 return z;
}
function bodyWidth(s,stage){
 const widths=[56,64,48,78,53,70,73,61,76,50,67,75];
 return Math.max(46,Math.min(88,(widths[s.body]||64)+(stage==='adult'?9:stage==='child'?3:-5)));
}
function body(s,c,stage){
 const wide=bodyWidth(s,stage);
 const x=100-Math.floor(wide/2),y=stage==='adult'?111:stage==='child'?116:120,h=176-y;
 const outline=stage==='baby'
  ?`M${x+9} ${y}H${x+wide-9}V${y+7}H${x+wide-3}V${y+15}H${x+wide}V${y+h-10}H${x+wide-3}V${y+h}H${x+3}V${y+h-10}H${x}V${y+15}H${x+3}V${y+7}H${x+9}Z`
  :stage==='child'
  ?`M${x+15} ${y}H${x+wide-15}V${y+5}H${x+wide-9}V${y+13}H${x+wide-4}V${y+23}H${x+wide}V${y+h-7}H${x+wide-6}V${y+h}H${x+6}V${y+h-7}H${x}V${y+23}H${x+4}V${y+13}H${x+9}V${y+5}H${x+15}Z`
  :`M${x+10} ${y}H${x+wide-10}V${y+5}H${x+wide-3}V${y+17}H${x+wide}V${y+29}H${x+wide-4}V${y+h-8}H${x+wide-12}V${y+h}H${x+12}V${y+h-8}H${x+4}V${y+29}H${x}V${y+17}H${x+3}V${y+5}H${x+10}Z`;
 let z=shape(outline,c.p,'#12171d');
 z+=r(82,y+20,36,Math.min(22,h-23),c.s);
 z+=r(x+10,y+5,wide-25,3,shade(c.p,38))+r(x+5,y+17,4,h-29,shade(c.p,23))+r(x+wide-9,y+17,4,h-29,shade(c.p,-35));
 z+=r(86,y+23,13,3,shade(c.s,18));
 if(s.body===3||s.body===6||s.body===8)z+=rows([[x-3,y+25,6,13],[x+wide-3,y+25,6,13]],c.p);
 if(s.body===5||s.body===10)z+=r(87,y+34,26,4,shade(c.s,-30));
 if(s.body===7)z+=r(93,y+12,14,5,c.a);
 if(s.body===0)z+=r(96,y+11,8,5,c.s);
 if(s.body===1)z+=r(92,y+14,16,3,shade(c.p,30));
 if(s.body===4)z+=r(88,y+11,24,3,c.s);
 if(s.body===6)z+=rows([[x+3,y+27,7,5],[x+wide-10,y+27,7,5]],shade(c.p,-20));
 if(s.body===8)z+=r(x+8,y+h-7,wide-16,4,shade(c.p,-25));
 if(s.body===9)z+=r(96,y+12,8,7,c.a);
 if(s.body===10)z+=rows([[x+4,y+19,5,5],[x+wide-9,y+19,5,5]],c.a);
 if(s.body===11)z+=rows([[x-5,y+16,7,6],[x+wide-2,y+16,7,6],[x+4,y+5,6,5]],c.s);
 if(s.body===0||s.body===11)z+=rows([[x-4,y+23,7,11],[x+wide-3,y+20,7,13]],c.p);
 if(s.body===2||s.body===4||s.body===9)z+=r(x+5,y+8,wide-10,6,c.a);
 if(stage==='child')z+=rows([[x+10,y+11,4,5],[x+wide-14,y+11,4,5]],shade(c.p,40));
 if(stage==='adult')z+=rows([[x+10,y+10,9,4],[x+wide-19,y+10,9,4],[x+15,y+h-9,wide-30,3]],shade(c.p,40));
 return z;
}
/** V58: uma junção curta e orgânica; deixa o rosto legível, sem separar a cabeça do tronco. */
function neckBridge(c,stage){
 const y=stage==='adult'?101:stage==='child'?105:109;
 const bottom=stage==='adult'?138:stage==='child'?141:144;
 return `<g class="pixel-neck">${r(92,y,16,bottom-y,c.p)}${r(93,y+2,4,bottom-y-5,shade(c.p,22))}${r(105,y+4,3,bottom-y-7,shade(c.p,-25))}</g>`;
}
const HANDS={
 drop:{palm:'V27H28V33H24V38H12V35H8V28H11V24H16V20H21V17H25',light:[[12,28,3,4],[16,24,5,3]],shadow:[[21,34,4,2]]},
 bear:{palm:'V27H32V35H28V39H23V37H20V42H14V38H11V41H5V37H3V29H7V25H12V22H16V20H21V17H25',light:[[16,24,5,2]],pad:[[6,34,3,3],[15,37,3,3],[24,33,3,3],[12,28,7,5]]},
 star:{palm:'V24H36V29H32V34H28V39H24V42H11V38H7V29H10V24H15V21H16V20H21V17H25',light:[[11,31,3,5],[15,25,5,2]],accent:[[19,28,2,9],[16,31,8,3],[17,29,6,7]]},
 fan:{palm:'V25H29V30H27V34H24V30H22V36H19V41H14V35H11V38H5V35H3V29H7V25H12V22H16V20H21V17H25',light:[[7,29,4,3],[12,25,6,3]],shadow:[[14,33,5,2]]},
 shell:{palm:'V28H28V34H24V39H12V36H7V31H13V33H18V29H14V26H10V23H15V21H21V17H25',light:[[16,23,7,3]],shadow:[[21,31,4,4],[15,35,8,2]]},
 fist:{palm:'V25H32V31H28V35H12V32H7V24H10V20H21V17H25',light:[[11,23,5,3],[16,21,5,2]],shadow:[[13,28,7,2],[20,26,3,4]]},
 heart:{palm:'V25H33V34H29V40H24V43H12V40H7V36H4V28H8V24H13V22H16V20H21V17H25',light:[[8,29,4,4]],pad:[[12,28,5,3],[20,28,5,3],[12,31,13,4],[14,35,9,2],[17,37,3,2]]},
 dragon:{palm:'V26H28V31H24V35H21V38H17V35H14V41H9V38H6V32H9V27H13V23H16V20H21V17H25',light:[[13,26,5,3]],shadow:[[20,29,4,3]],pad:[[9,34,4,5],[17,33,4,4]]}
};
function handArt(s,c,stage,options){
 const {x:distance,y:height}=handPosition(options.handPosition);
 const x=102-Math.floor(bodyWidth(s,stage)/2)-distance;
 const y=(stage==='child'?142:139)+height;
 const key=Object.hasOwn(HANDS,options.hands)?options.hands:'shell';
 const model=HANDS[key];
 const scale=partScale(options.partSizes,'hands');
 const outline=`M25 15H34V22H31${model.palm}Z`;
 const transform=key==='shell'?'matrix(0 -1 -1 0 18 29)':'translate(-29 -18)';
 const art=`<g transform="${transform}">${shape(outline,c.p)}${rows(model.light,shade(c.p,40))}${rows(model.shadow||[],shade(c.p,-35))}${rows(model.pad||[],key==='dragon'?'#fff4c9':shade(c.p,115))}${rows(model.accent||[],'#ffc43d')}</g>`;
 const hand=`<g transform="translate(${x} ${y})"><g class="pixel-hand-joint"><g transform="scale(${scale})">${art}</g></g></g>`;
 return `<g class="pixel-paw-left">${hand}</g><g class="pixel-paw-right" transform="translate(200 0) scale(-1 1)">${hand}</g>`;
}
function feet(s,c,stage){
 const y=stage==='baby'?184:186;
 const k=s.feet<0?'none':s.feet;
 if(k==='none')return '';
 const one=x=>{
  // Pequenas pernas ficam atrás das patas. As duas regiões sempre se sobrepõem.
  let z=b(x+8,169,11,y-167,c.p)+r(x+10,174,4,9,shade(c.p,25));
  z+=b(x,y-5,26,8,c.p);
  if([1,5,7].includes(k))z+=rows([[x+6,y-2,4,4],[x+16,y-2,4,4]],c.s);
  if([3,6,10].includes(k))z+=r(x,y-3,26,5,c.a);
  if(k===2)z+=r(x+6,y-2,15,3,ink);
  if(k===4||k===8||k===9)z+=r(x+2,y-4,21,4,c.a);
  if(k===11)z+=r(x===67?65:128,y-4,7,8,c.s);
  return z;
 };
 return `<g class="pixel-foot-left">${one(67)}</g><g class="pixel-foot-right">${one(107)}</g>`;
}
function shoeArt(kind,stage){
 if(!kind||kind==='none')return '';
 const y=stage==='baby'?178:180;
 const colors={shoes:'#e99dbb',sneakers:'#74a6c6',heels:'#d57d9f',boots:'#a787bc',slippers:'#e8c5a4',sandals:'#d99373',rainboots:'#e1a85f',rollers:'#8795ca',highTops:'#81b6ad',ballet:'#dca3bd',flipflops:'#7cb6a4',loafers:'#8e6f63',snowboots:'#b5b3ce'};
 let z='';for(const x of [67,107]){
  let shoe=shape(`M${x} ${y+2}H${x+20}V${y+5}H${x+26}V${y+10}H${x}Z`,colors[kind]);
  if(kind==='sneakers')shoe+=r(x+3,y+8,20,2,'#fff8ed')+r(x+9,y+3,7,2,'#fff8ed');
  if(kind==='shoes')shoe+=r(x+9,y+2,8,3,'#fff2cf');
  if(kind==='heels')shoe+=r(x+2,y+9,5,4,'#754d64')+r(x+18,y+2,4,3,'#fff0dd');
  if(kind==='boots')shoe+=r(x+4,y-3,14,6,colors[kind])+r(x+5,y-3,11,2,'#f4e1ef');
  if(kind==='slippers')shoe+=r(x+8,y+2,5,3,'#fff8ee')+r(x+14,y+2,5,3,'#fff8ee');
  if(kind==='sandals')shoe=r(x,y+9,26,4,ink)+r(x+2,y+2,21,8,'#d99373')+r(x+4,y+3,17,3,'#f6dab1')+r(x+6,y+6,5,3,ink)+r(x+15,y+6,5,3,ink);
  if(kind==='rainboots')shoe=shape(`M${x+4} ${y-6}H${x+21}V${y+6}H${x+26}V${y+12}H${x}V${y+5}H${x+4}Z`,colors[kind])+r(x+6,y-3,11,3,'#fff1a8')+r(x+2,y+10,22,3,'#9b7759');
  if(kind==='rollers')shoe+=r(x+4,y+1,16,4,'#e9d5f2')+r(x+1,y+11,26,3,ink)+b(x+3,y+13,6,6,'#dedfeb')+b(x+16,y+13,6,6,'#dedfeb');
  if(kind==='highTops')shoe+=b(x+5,y-8,15,14,colors[kind])+r(x+8,y-3,8,3,'#f7f5db')+r(x+8,y+2,8,2,'#f7f5db')+r(x+1,y+10,23,3,'#f7f5db');
  if(kind==='ballet')shoe=b(x+1,y+6,24,6,colors[kind])+r(x+9,y+1,4,6,'#f8dddc')+r(x+14,y+1,4,6,'#f8dddc')+r(x+10,y+7,8,2,'#fff3f0');
  if(kind==='flipflops')shoe=r(x,y+10,27,4,ink)+r(x+2,y+8,23,3,colors[kind])+r(x+10,y+3,4,6,'#f6deb1')+r(x+5,y+3,5,3,'#f6deb1')+r(x+14,y+3,6,3,'#f6deb1');
  if(kind==='loafers')shoe=shape(`M${x+1} ${y+5}H${x+7}V${y+1}H${x+21}V${y+7}H${x+27}V${y+12}H${x+1}Z`,colors[kind])+r(x+7,y+5,14,3,'#d6b889')+r(x+1,y+11,26,2,'#4c4141');
  if(kind==='snowboots')shoe=shape(`M${x+5} ${y-8}H${x+21}V${y+5}H${x+27}V${y+12}H${x}V${y+4}H${x+5}Z`,colors[kind])+r(x+4,y-7,18,4,'#f9e7d9')+r(x+5,y+1,16,4,'#f4e6d8')+r(x+1,y+11,24,3,'#735a6d');
  z+=`<g class="pixel-shoe-${x===67?'left':'right'}">${shoe}</g>`;
 }return z;
}
function accessory(s,c){const k=p(s,'accessory');if(k==='none')return '';
 if(k==='star')return shape('M98 138H102V144H108V148H113V153H107V159H103V164H98V160H93V156H88V150H94V145H98Z',c.a)+r(98,148,5,4,shade(c.a,50));
 if(k==='crown')return b(82,44,36,15,c.a)+rows([[84,37,7,10],[96,33,8,13],[110,37,7,10]],c.a)+r(98,48,5,5,'#75c9cc');
 if(k==='party')return shape('M87 58H113L102 29H98Z',c.a)+r(97,39,5,5,c.s);
 if(k==='wizard')return shape('M79 58H121V53H108L102 29H98L91 53H79Z',c.a)+r(98,43,5,5,'#fff2a8');
 if(k==='halo')return b(77,40,46,7,c.a);
 if(k==='bow')return b(76,130,18,15,c.a)+b(106,130,18,15,c.a)+r(95,134,10,8,c.s);
 if(k==='glasses')return b(71,82,25,17,c.a)+b(104,82,25,17,c.a)+r(96,86,8,4,c.a);
 if(k==='sunglasses')return r(69,80,27,18,shade(c.a,-70))+r(104,80,27,18,shade(c.a,-70))+r(73,84,19,11,'#283447')+r(108,84,19,11,'#283447')+r(96,84,8,4,c.a)+r(74,83,8,2,shade(c.a,55))+r(109,83,8,2,shade(c.a,55));
 if(k==='flower')return b(122,56,16,15,c.a)+r(127,61,6,5,c.s);
 if(k==='bell')return b(94,132,12,16,c.a)+r(98,143,4,4,ink);
 if(k==='tie')return shape('M94 130H106V139H103L108 151H92L97 139H94Z',c.a);
 if(k==='headphones')return b(64,62,9,30,c.a)+b(127,62,9,30,c.a)+r(73,58,54,6,c.a);
 if(k==='scarf')return b(77,125,46,7,c.a)+r(116,131,9,18,c.a);
 return '';
}
/** V59.3: moldes integrais pixelados para todos os troncos e fases.
 * Um molde anatômico cobre desde os ombros até a cintura, mantendo margem
 * para contorno do corpo e o mesmo ponto de origem durante as animações.
 * Tecido e detalhes permanecem ancorados à geometria do corpo; nenhum save muda.
 */
function outfitArt(kind,s,stage){
 if(!kind||kind==='none')return '';
 const widths=[56,64,48,78,53,70,73,61,76,50,67,75];
 const w=Math.max(46,Math.min(88,(widths[s.body]||64)+(stage==='adult'?9:stage==='child'?3:-5)));
 // A roupa ocupa ~85–90% da largura e ~90% da altura real do corpo.
 // A escala é aplicada sobre o centro do tronco, sem deslocar a roupa quando o
 // corpo é magro, largo, bebê, jovem ou adulto.
 const x=70,inner=60,bodyFit=Math.max(.60,Math.min(1.28,(w-8)/60));
 const bodyTop=stage==='adult'?111:stage==='child'?116:120;
 const y=bodyTop+3,h=174-y;
 const colors={dress:'#e99dbb',overalls:'#7b9db8',vest:'#8d789d',cardigan:'#ddae9d',sailor:'#8eb7c3',pajamas:'#b9a5d4',hoodie:'#8ca4cc',raincoat:'#e8bc57',kimono:'#d995af',princess:'#dd9ccf',superhero:'#4979c0',pirate:'#6a5f81',astronaut:'#d7dee9',bee:'#eacb4a',wizardrobe:'#795e9f',winter:'#8bb5b4',chef:'#f2e9dc',sport:'#76b3a0',flower:'#9cc989',dinosaur:'#75bd8a'};
 const base=colors[kind]||colors.dress;
 const collar=()=>r(93,y+1,14,4,'#f9e5d7');
 const edge=()=>r(x+3,y+h-5,inner-6,3,shade(base,-37));
 // O tecido segue o mesmo perfil em degraus usado no corpo (não uma caixa).
 // Ombro + lados + cintura mudam na proporção da fase de crescimento.
 const outline=stage==='baby'
  ?`M${x+9} ${y}H${x+inner-9}V${y+7}H${x+inner-3}V${y+15}H${x+inner}V${y+h-10}H${x+inner-3}V${y+h}H${x+3}V${y+h-10}H${x}V${y+15}H${x+3}V${y+7}H${x+9}Z`
  :stage==='child'
  ?`M${x+15} ${y}H${x+inner-15}V${y+5}H${x+inner-9}V${y+13}H${x+inner-4}V${y+23}H${x+inner}V${y+h-7}H${x+inner-6}V${y+h}H${x+6}V${y+h-7}H${x}V${y+23}H${x+4}V${y+13}H${x+9}V${y+5}H${x+15}Z`
  :`M${x+10} ${y}H${x+inner-10}V${y+5}H${x+inner-3}V${y+17}H${x+inner}V${y+29}H${x+inner-4}V${y+h-8}H${x+inner-12}V${y+h}H${x+12}V${y+h-8}H${x+4}V${y+29}H${x}V${y+17}H${x+3}V${y+5}H${x+10}Z`;
 let z=shape(outline,base,shade(base,-65));
 // Luz lateral e gola dão volume sem esconder os detalhes de cada modelo.
 z+=r(x+5,y+16,3,Math.max(9,h-26),shade(base,15));
 z+=r(x+inner-8,y+16,3,Math.max(9,h-25),shade(base,-26));
 z+=r(x+9,y+h-10,inner-18,2,shade(base,-37));
 // Braços/ombros em tom idêntico ao tecido, ancorados no tronco, sem braços soltos.
 const sleeves=()=>b(x-3,y+7,7,12,base)+b(x+inner-4,y+7,7,12,base);
 if(kind==='dress')z+=r(x+3,y+h-6,inner-6,4,'#f9dce6')+r(95,y+6,10,5,'#fff0dc')+r(x+7,y+Math.round(h*.57),inner-14,3,shade(base,-28))+r(x+8,y+Math.round(h*.57)+4,inner-16,2,shade(base,24));
 if(kind==='overalls')z+=r(x+7,y,4,10,'#d8e9eb')+r(x+inner-11,y,4,10,'#d8e9eb')+r(93,y+13,14,8,'#c8dfe3');
 if(kind==='vest')z+=r(98,y+2,4,h-4,'#f6e5d2')+rows([[91,y+7,3,3],[106,y+7,3,3],[91,y+15,3,3],[106,y+15,3,3]],'#f4d28e');
 if(kind==='cardigan')z+=r(98,y+2,4,h-4,'#fff3e5')+rows([[104,y+6,3,3],[104,y+13,3,3],[104,y+20,3,3]],'#fff3e5');
 if(kind==='sailor')z+=shape(`M${x+6} ${y+2}H${x+inner-6}L100 ${y+13}Z`,'#eef5e9')+r(98,y+10,4,6,'#dd7f91');
 if(kind==='pajamas')z+=rows([[x+7,y+7,4,4],[x+inner-11,y+12,4,4],[98,y+19,4,4]],'#fff0c6');
 if(kind==='hoodie')z+=sleeves()+b(86,y-3,28,8,'#758bb6')+r(97,y+3,6,13,'#f0dfec')+r(x+9,y+16,inner-18,9,'#718bb4')+rows([[91,y+5,2,9],[107,y+5,2,9]],'#f9e5d7');
 if(kind==='raincoat')z+=sleeves()+r(96,y,8,h,'#fff5c7')+rows([[104,y+8,3,3],[104,y+16,3,3]],'#836d43')+r(x+3,y+h-8,inner-6,3,'#fdf1b2')+r(x+5,y+8,3,7,'#fff5c7');
 if(kind==='kimono')z+=shape(`M${x+8} ${y+1}H${x+20}L103 ${y+13}L97 ${y+13}Z`,'#f6dae3')+shape(`M${x+inner-8} ${y+1}H${x+inner-20}L97 ${y+13}L103 ${y+13}Z`,'#f8e8df')+r(x+4,y+15,inner-8,8,'#8d6b98')+r(97,y+13,6,13,'#fae9b1');
 if(kind==='princess')z+=collar()+r(x+2,y+h-9,inner-4,8,'#f3c8e5')+rows([[x+7,y+h-7,4,6],[x+inner-11,y+h-7,4,6]],'#f9e6ab')+r(97,y+8,6,8,'#f9e6ab')+sleeves();
 if(kind==='superhero')z+=sleeves()+shape(`M100 ${y+6}L110 ${y+14}L100 ${y+25}L90 ${y+14}Z`,'#f6d972')+r(98,y+10,4,12,'#c95767')+r(x+3,y+h-8,inner-6,5,'#f1cf75');
 if(kind==='pirate')z+=collar()+r(x+4,y+6,inner-8,6,'#3f4357')+r(x+4,y+h-10,inner-8,5,'#a58c67')+r(98,y+4,5,h-13,'#f1d2bc')+r(96,y+h-9,8,6,'#f1d265');
 if(kind==='astronaut')z+=sleeves()+b(87,y+5,26,19,'#f1f3e7')+r(90,y+8,20,12,'#7bc5ce')+r(x+3,y+h-8,inner-6,5,'#becada')+rows([[x+8,y+8,5,5],[x+inner-13,y+8,5,5]],'#f4cc78');
 if(kind==='bee')z+=r(x+3,y+8,inner-6,6,'#293a4c')+r(x+3,y+20,inner-6,6,'#293a4c')+r(94,y+2,12,4,'#fff6b9')+r(98,y+15,4,4,'#fff3c5');
 if(kind==='wizardrobe')z+=r(98,y+3,5,h-4,'#e6c891')+rows([[x+8,y+9,5,5],[x+inner-14,y+17,5,5],[90,y+h-7,5,5]],'#f4e3a1')+r(x+4,y+h-4,inner-8,3,'#ab8cc5');
 if(kind==='winter')z+=sleeves()+r(97,y+1,6,h-3,'#f1dfd2')+r(x+2,y+2,inner-4,4,'#e9e9e5')+r(x+2,y+h-6,inner-4,5,'#e9e9e5')+rows([[105,y+9,3,3],[105,y+17,3,3]],'#547c82');
 if(kind==='chef')z+=collar()+r(97,y+5,6,h-9,'#d5b7aa')+rows([[92,y+10,3,3],[105,y+10,3,3],[92,y+18,3,3],[105,y+18,3,3]],'#677a8b')+r(x+3,y+h-5,inner-6,4,'#91b5c8');
 if(kind==='sport')z+=sleeves()+r(x+3,y+8,inner-6,5,'#eaf7d5')+r(x+4,y+h-7,inner-8,4,'#f9e7b6')+r(96,y+16,8,8,'#f8f3e0')+r(99,y+18,3,5,'#6a9a8c');
 if(kind==='flower')z+=rows([[x+7,y+9,5,5],[x+inner-12,y+15,5,5],[95,y+h-10,5,5]],'#f6d5df')+rows([[x+9,y+11,3,3],[x+inner-10,y+17,3,3],[97,y+h-8,3,3]],'#eebf64')+r(x+4,y+h-5,inner-8,3,'#e8e6a9');
 if(kind==='dinosaur')z+=r(x+3,y+h-7,inner-6,4,'#4b9581')+rows([[x+5,y+12,6,7],[x+inner-11,y+12,6,7]],'#9dd7b9')+shape(`M96 ${y+3}H102V${y+9}H106V${y+15}H100V${y+13}H94V${y+9}H96Z`,'#e4d490');
 return `<g class="outfit-fit" transform="translate(100 0) scale(${bodyFit} 1) translate(-100 0)" data-torso-top="${bodyTop}" data-roupa-top="${y}" data-roupa-bottom="${y+h}" data-body-width="${w}" data-fit-width="${(60*bodyFit).toFixed(2)}">${z+edge()}</g>`;
}
const CUSTOM_PARTS=new Set(['tail','wings','ears','eyes','snout','mouth','accessory','hands']);
const PART_TINT={pink:'#ff8fa8',blue:'#7fd3ff',mint:'#6fe0cf',gold:'#ffcf40',purple:'#c9a7ff',cream:'#fff4c9',brown:'#a8714a'};
export const partScale=(sizes,key)=>{const raw=sizes?.[key];return typeof raw==='number'&&Number.isFinite(raw)?Math.max(.85,Math.min(1.2,raw)):1;};
const partGroup=(content,sizes,key,x,y)=>`<g transform="translate(${x} ${y}) scale(${partScale(sizes,key)}) translate(${-x} ${-y})">${content}</g>`;
export function pixelPet(s,c,o={}){
 const stage=o.stage||'baby', mood=o.mood||'happy';
 const headScale=stage==='adult'?.78:stage==='child'?.9:1;
 const headLift=stage==='adult'?-21:stage==='child'?-17:-14;
 const tint=k=>CUSTOM_PARTS.has(k)&&k!=='mouth'?PART_TINT[o.partColors?.[k]]:null; // V84.17: boca sempre na cor original
 const tone=k=>({p:c.p,s:c.s,a:c.a,...(tint(k)?(k==='snout'?{s:tint(k)}:k==='eyes'?{}:k==='ears'?{p:tint(k),a:tint(k)}:{p:tint(k),a:tint(k),s:tint(k)}):{})});
 const scaled=(k,art,x,y)=>partGroup(art,o.partSizes,k,x,y);
 // A boca permanece ancorada à cabeça, inclusive durante inclinação/olhar e crescimento.
 const mouthShift=typeof o.mouthOffset==='number'&&Number.isFinite(o.mouthOffset)?Math.max(-8,Math.min(8,Math.round(o.mouthOffset))):0;
 const eyesArt=eyes(s,mood,tint('eyes'));
 const bodyPart=`<g class="atelier-body">${body(s,c,stage)}<g class="pixel-outfit">${outfitArt(o.outfit,s,stage)}</g>${handArt(s,tone('hands'),stage,o)}</g>`;
 const headPart=`<g class="atelier-head"><g class="atelier-ears">${scaled('ears',ears(s,tone('ears')),100,74)}</g>${headShape(s,c)}<g class="atelier-markings">${marks(s,c)}</g><g class="atelier-hair">${hair(s,c)}</g><g class="atelier-eyes">${scaled('eyes',eyesArt,100,88)}</g><g class="atelier-eyes-shut">${rows([[76,89,16,4],[109,89,16,4]],ink)}</g><g class="atelier-snout" transform="translate(0 -2) translate(100 108) scale(.78) translate(-100 -108)">${scaled('snout',snout(s,tone('snout'),mood),100,108)}</g><g class="atelier-mouth" transform="translate(0 ${-9+mouthShift})" data-mouth-offset="${mouthShift}">${scaled('mouth',mouthArt(s,c,mood,tint('mouth')),100,125)}</g><g class="atelier-eating-mouth">${b(91,106,18,17,'#713d4e')+r(95,117,10,4,'#e58ea2')}</g><g class="atelier-accessory">${scaled('accessory',accessory(s,tone('accessory')),100,97)}</g><g class="care-cup">${b(107,108,17,20,'#e5eff0')+r(109,116,13,3,'#76c5d3')}</g><g class="care-sponged">${b(121,89,17,15,c.a)}</g><g class="care-dirt">${r(68,101,7,7,'#80684f')+r(125,102,7,7,'#80684f')}</g><g class="care-suds">${r(68,109,11,8,'#fff')+r(125,109,11,8,'#fff')}</g></g>`;
 return `<g class="pixel-pet" shape-rendering="crispEdges"><ellipse cx="100" cy="${stage==='baby'?190:192}" rx="36" ry="3" fill="#15282a" opacity=".3"/><g class="atelier-tail">${scaled('tail',tail(s,tone('tail')),132,150)}</g><g class="atelier-wings">${scaled('wings',wings(s,tone('wings')),100,125)}</g><g class="atelier-neck">${neckBridge(c,stage)}</g>${bodyPart}<g class="atelier-feet">${feet(s,c,stage)}<g class="pixel-shoes">${shoeArt(o.shoes,stage)}</g></g><g transform="translate(0 ${headLift}) translate(100 120) scale(${headScale}) translate(-100 -120)">${headPart}</g></g>`;
}
