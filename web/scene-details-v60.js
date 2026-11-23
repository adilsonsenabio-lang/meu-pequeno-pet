// Meu Pequeno Pet V60 — coleção original de cenários em pixel art com movimento.
// Os blocos SVG usam posições inteiras, sem blur ou antialiasing; o cenário de base
// e as cores do pet não são alterados. Animação SMIL discreta e independente.
const r=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
const p=(d,c)=>`<path d="${d}" fill="${c}"/>`;
const line=(d,c,w=2)=>`<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none"/>`;
const t=(body,values,dur,delay=0)=>`<g>${body}<animateTransform attributeName="transform" type="translate" values="${values}" calcMode="discrete" dur="${dur}s" begin="-${delay}s" repeatCount="indefinite"/></g>`;
const wobble=(body,x,y,ang,dur,delay=0)=>`<g>${body}<animateTransform attributeName="transform" type="rotate" values="${-ang} ${x} ${y};0 ${x} ${y};${ang} ${x} ${y};0 ${x} ${y};${-ang} ${x} ${y}" calcMode="discrete" dur="${dur}s" begin="-${delay}s" repeatCount="indefinite"/></g>`;
const glow=(body,dur,delay=0)=>`<g>${body}<animate attributeName="opacity" values=".35;.85;1;.65;.35" calcMode="discrete" dur="${dur}s" begin="-${delay}s" repeatCount="indefinite"/></g>`;
const C={ink:'#243d4b',ink2:'#36596a',mint:'#a4d8aa',shadow:'#4b8171',sun:'#ffe59b',sand:'#f4d595'};
const plant=(x,y,color='#4f9e70',tip='#b3e89c')=>{
 const a=r(x,y-9,3,11,'#397459')+r(x-4,y-8,4,3,color)+r(x+3,y-6,4,3,color)+r(x+1,y-12,2,4,tip);
 return wobble(a,x+2,y,6,3.3,(x%4)*.4);
};
const flower=(x,y,petal,leaf='#447f5b')=>{
 const a=r(x,y-12,2,14,leaf)+r(x-3,y-7,3,2,'#6aba78')+r(x+2,y-5,4,2,'#6aba78')+
 r(x-3,y-18,4,4,petal)+r(x+1,y-21,4,4,petal)+r(x+5,y-18,4,4,petal)+r(x+1,y-15,4,4,petal)+r(x+1,y-18,4,4,'#ffe7a4');
 return wobble(a,x+2,y,4,4,(x%7)*.4);
};
const pebbles=(items,light,dark)=>items.map(([x,y,s=3],i)=>r(x,y,s+2,2,dark)+r(x+1,y-1,s,1,i%2?light:'#f9ebd6')).join('');
const star=(x,y,c='#fff4bb',s=2)=>r(x+s,y,s,s,c)+r(x,y+s,s,s,c)+r(x+2*s,y+s,s,s,c)+r(x+s,y+2*s,s,s,c);
const dust=(n,top,bottom,colors)=>Array.from({length:n},(_,i)=>{
 const x=7+(i*37+13*i*i)%186,y=top+(i*31+9*i*i)%(bottom-top);
 const col=colors[i%colors.length];return glow(r(x,y,1+i%2,1+i%2,col),4.5+(i%5),i*.37);
}).join('');
const tree=(x,y,s=1,autumn=false)=>{
 const leaves=autumn?['#976383','#b77c84','#e0a273','#f3c88c']:['#306e64','#3d8f6a','#5ba873','#91c785'];
 const inner=r(x-2,y-43,12,47,'#42564b')+r(x+1,y-40,5,38,'#765d4c')+r(x+1,y-35,2,12,'#a48156')+
 r(x-10,y-39,19,5,leaves[0])+r(x-17,y-34,33,8,leaves[1])+r(x-12,y-49,25,10,leaves[1])+
 r(x-6,y-55,15,8,leaves[2])+r(x-15,y-26,29,8,leaves[0])+r(x+9,y-32,10,8,leaves[2])+
 r(x-13,y-42,7,4,leaves[2])+r(x+7,y-47,5,5,leaves[3])+r(x-7,y-51,5,3,leaves[3])+
 r(x-9,y-30,5,3,leaves[3])+r(x+3,y-37,4,3,leaves[3]);
 return `<g transform="translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})">${wobble(inner,x+5,y,1.5,7,x%6)}</g>`;
};
const fence=(x,y,w=38,c='#bd8a63')=>r(x,y,w,3,'#6b645c')+r(x,y+11,w,3,'#6b645c')+
 Array.from({length:Math.floor(w/10)},(_,i)=>r(x+3+i*10,y-4,6,26,c)+r(x+4+i*10,y-6,4,2,'#e4c296')+r(x+4+i*10,y+4,2,4,'#e4c296')).join('');
const lantern=(x,y,c='#ffca75')=>{
 const bulb=r(x-4,y-4,10,12,'#3b4e55')+r(x-2,y-2,6,8,c)+r(x,y,2,3,'#fff7cc')+r(x-5,y-6,12,3,'#4b6371')+r(x-2,y-10,6,4,'#536979');
 return glow(bulb,3.7,(x%5)*.5);
};
const mushroom=(x,y,color='#f29a8b')=>r(x-3,y-1,6,9,'#ede9c9')+r(x-4,y+5,8,2,'#c9bea7')+p(`M${x-12} ${y+1}h24v-6h-4v-5h-16v5h-4Z`,color)+r(x-5,y-7,4,3,'#ffe7d5')+r(x+3,y-5,3,3,'#fff3dc');
const pine=(x,y,s=1,light=false)=>{
 const colors=light?['#306e70','#40898b','#70b8ad']:['#235c5a','#30796b','#5ca08a'];
 const art=r(x-3,y-4,6,13,'#6d6157')+p(`M${x-9} ${y-5}h18l-6-12h4l-7-16-7 16h4Z`,colors[0])+
 p(`M${x-8} ${y-11}h16l-5-10h-6Z`,colors[1])+r(x-3,y-25,6,3,colors[2])+r(x-10,y-8,7,2,'#eaf7ed')+r(x+4,y-15,5,2,'#d4f1ee');
 return `<g transform="translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})">${wobble(art,x,y,1.3,8,x%4)}</g>`;
};
const rock=(x,y,c='#89a4a1')=>p(`M${x} ${y}v-5h4v-4h11v4h5v5Z`,C.ink2)+r(x+3,y-6,14,6,c)+r(x+6,y-8,7,2,'#ccddce');
const cloudShadow=(x,y)=>r(x,y,26,4,'#a5bfba')+r(x+4,y-4,19,5,'#e5f4eb')+r(x+8,y-8,10,5,'#fffaf0');
const heartBush=(x,y,colors=['#598f76','#6db18b','#a0d1a3'])=>{
 const s=r(x-14,y-15,28,16,colors[0])+r(x-11,y-21,22,10,colors[1])+r(x-6,y-27,15,8,colors[2])+
 r(x-17,y-13,7,8,colors[1])+r(x+9,y-15,8,7,colors[1])+r(x-9,y-22,4,3,colors[2])+r(x+6,y-20,5,3,colors[2]);
 return wobble(s,x,y,2,5,x*.1);
};
const animatedBird=(x,y,dark='#415767')=>t(r(0,4,4,2,dark)+r(5,2,4,3,dark)+r(8,5,3,2,dark)+r(9,3,2,2,'#f3eec8'),`${x} ${y};${x+12} ${y-3};${x+24} ${y-4};${x+38} ${y};${x+50} ${y-5};${x+65} ${y-7}`,9,(x%6)) ;
const skull=(x,y)=>r(x,y,14,12,'#d6d4c7')+r(x+2,y-3,10,3,'#f6ebd9')+r(x+2,y+4,3,3,'#4a4658')+r(x+9,y+4,3,3,'#4a4658')+r(x+6,y+7,2,2,'#4a4658')+r(x+3,y+11,8,4,'#e2dacb')+r(x+5,y+12,1,3,'#5b4e5d')+r(x+8,y+12,1,3,'#5b4e5d');
const pumpkin=(x,y,s=1)=>{
 const art=r(x-10,y-1,20,13,'#9e4b30')+r(x-13,y+1,26,8,'#d87540')+r(x-8,y-5,17,17,'#ee9a4e')+
 r(x-2,y-9,4,6,'#4a7c48')+r(x-5,y-6,3,3,'#84b76a')+r(x-7,y+1,4,3,'#473b48')+r(x+4,y+1,4,3,'#473b48')+
 r(x-4,y+7,9,3,'#63404a')+r(x-2,y+7,3,2,'#ffdc88')+r(x+3,y+7,2,2,'#ffdc88')+r(x-11,y+3,2,6,'#f8b968');
 return `<g transform="translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})">${glow(art,7,1)}</g>`;
};
const present=(x,y,c='#e86d79',w=17,h=16)=>r(x,y,w,h,'#4b6575')+r(x+2,y+2,w-4,h-3,c)+r(x+w/2-2,y,4,h,'#ffe2a0')+r(x,y+4,w,3,'#ffe2a0')+
 p(`M${x+w/2} ${y}q-12-10-12-2q0 4 12 4q12-11 12-4q0 6-12 2Z`,'#fff0bb')+r(x+3,y+h-3,w-6,2,'#a7475e');
const festiveLights=(x,y,count=10)=>Array.from({length:count},(_,i)=>{
 const px=x+i*12,py=y+Math.round(4*Math.sin(i*.55));const c=['#ef7c8a','#ffe69a','#87d9ce','#baa4f5'][i%4];
 return glow(r(px,py,3,4,c)+r(px+1,py-1,1,1,'#fef3df'),2.2+(i%3),i*.23);
}).join('')+line(`M${x} ${y-4}q60 18 ${count*12-12} 0`,'#c7d4be',1);
const seashell=(x,y,c='#f4aa95')=>p(`M${x-7} ${y+3}v-5l3-4h8l3 4v5Z`,c)+r(x-6,y-1,12,2,'#ffddbb')+r(x-1,y-5,2,6,'#ffead4')+r(x+3,y-4,1,5,'#ffead4');
const softWaves=(y)=>t(r(12,y,32,2,'#e8f8e2')+r(75,y+6,24,2,'#d6f3e7')+r(142,y+3,31,2,'#f8fff3'),'-5 0;0 0;4 0;1 0;-5 0',4);

const flowerDots=[[8,180],[32,175],[54,191],[154,178],[183,185]];
const meadow=()=>flowerDots.map(([x,y],i)=>flower(x,y,['#f6b1cd','#f8da87','#c6b5f5'][i%3])).join('')+
 Array.from({length:14},(_,i)=>plant((i*43+9)%200,171+(i*11)%24)).join('');

export const SCENE_DETAILS={
 garden:`<!-- V60 jardim: troncos com cascas, copa em quatro tons, cerca, flores, insetos -->`+
  tree(23,164,1.35)+tree(182,159,1.1)+fence(1,164,35)+fence(162,161,38)+heartBush(53,178)+heartBush(170,178)+
  meadow()+rock(126,186)+pebbles([[74,194,2],[106,181,2],[132,196,1]],'#d6dcbb','#6b9c87')+
  t(r(0,0,7,4,'#eac56c')+r(2,1,2,1,C.ink)+r(-4,2,3,2,'#fff0c9'), '34 120;48 118;52 111;42 116;34 120',6)+
  dust(7,123,165,['#f5e9a3','#f7f6d6']),
 sunset:tree(21,171,1.4,true)+tree(178,169,1.08,true)+fence(4,165,28,'#c19a81')+
  lantern(43,143)+lantern(169,145)+heartBush(49,188,['#726b89','#997da1','#cfa2a0'])+
  flower(143,187,'#f2bd93')+pebbles([[69,190,3],[120,186,5]],'#e5ae86','#71647d')+
  Array.from({length:6},(_,i)=>t(r(0,0,2,2,i%2?'#ffe3a4':'#d69276'),`${26+i*24} 184;${18+i*25} 159;${22+i*23} 133`,7+i%3,i*.6)).join(''),
 night:pine(24,169,1.3)+pine(184,170,1.2)+rock(45,185,'#4f7882')+rock(163,186,'#4c637b')+
  lantern(25,163,'#fff0ba')+lantern(177,163,'#fff0ba')+heartBush(52,193,['#274f66','#38687b','#53858a'])+
  Array.from({length:13},(_,i)=>t(glow(r(0,0,2,2,i%2?'#ffed9c':'#c1e9a8'),4+i%3,i*.3),`${(i*31)%185+8} ${(i*17)%70+112};${(i*31)%185+10} ${(i*17)%70+108};${(i*31)%185+5} ${(i*17)%70+116};${(i*31)%185+8} ${(i*17)%70+112}`,8+i%3,i*.4)).join(''),
 beach:`<!-- V60 praia: areia granulada, castelinho, guarda-sol, conchas e espuma móvel -->`+
  r(10,171,22,3,'#d0ae70')+r(16,167,9,4,'#f2ce85')+r(19,164,3,3,'#ffdfab')+
  t(r(0,0,16,3,'#fff6d8')+r(3,3,22,2,'#d5efe7'),'-4 157;0 157;4 157;0 157;-4 157',4)+
  softWaves(145)+
  r(167,150,3,33,'#98664a')+p('M153 155h40v-7h-4v-6h-10v-5h-9v5h-12v6h-5Z','#eb7c91')+
  r(170,146,14,4,'#ffbe9a')+r(164,151,7,2,'#fff0ca')+
  r(13,188,41,4,'#dab67d')+r(18,174,29,15,'#e9c78d')+r(22,169,7,8,'#f9dca3')+r(36,169,8,8,'#f9dca3')+
  r(23,181,5,8,'#9b826e')+r(37,176,3,4,'#bf9d75')+r(17,188,31,3,'#bb976d')+
  seashell(65,184)+seashell(137,191,'#e7bba1')+pebbles([[81,191,2],[104,183,2],[149,180,3]],'#fff0c9','#bdab85')+
  t(r(0,0,9,3,'#ef746c')+r(3,-2,3,3,'#fff')+r(2,-1,1,1,C.ink)+r(6,-1,1,1,C.ink), '47 190;51 190;58 189;62 190;57 190;50 190;47 190',8)+
  animatedBird(106,49,'#668798'),
 clouds:cloudShadow(8,143)+cloudShadow(155,136)+p('M7 191h65v-4h-8v-7H14v7H7Z','#ecf5e4')+
  p('M145 187h50v-5h-9v-7h-30v7h-11Z','#f5f7ec')+
  r(13,182,46,3,'#b2dcbe')+r(157,178,29,4,'#b3dcbd')+
  flower(21,181,'#f7a7b8')+flower(172,177,'#f7d784')+heartBush(52,185,['#99c6a7','#9dd5be','#c0e8b5'])+
  Array.from({length:9},(_,i)=>glow(star(10+(i*37)%180,90+(i*19)%55,['#f5b8d2','#f8ecbe','#b6e5de'][i%3],1),5,i*.5)).join(''),
 forest:tree(18,162,1.32)+tree(181,164,1.4)+pine(55,168,1)+pine(153,165,1)+
  heartBush(45,186)+heartBush(163,183)+mushroom(68,185)+mushroom(150,192,'#bb8db7')+
  plant(21,191)+plant(179,193)+r(112,187,10,2,'#d4c494')+r(120,181,3,6,'#b49a72')+
  t(r(0,0,7,4,'#78ba7a')+r(2,-3,5,3,'#7ecb7f')+r(0,-1,2,2,C.ink), '33 184;41 183;50 181;41 183;33 184',7)+
  dust(13,85,160,['#ffe18d','#b4dfb1']),
 snow:pine(23,168,1.4,true)+pine(180,168,1.25,true)+rock(57,188,'#a5c6d4')+
  r(45,153,23,29,'#8a9ea2')+r(49,147,16,10,'#d2e4dc')+p('M40 150h32v-5h-4v-4H44v4h-4Z','#eaf7ed')+
  r(53,165,7,17,'#7a6b75')+r(46,156,21,3,'#f8f6ee')+r(52,149,7,3,'#fff')+
  r(125,181,35,3,'#b7d1d0')+r(130,175,25,7,'#d2e8e1')+r(138,173,9,3,'#fff')+
  Array.from({length:16},(_,i)=>t(r(0,0,2+i%2,2+i%2,'#fdfcf4'),`${(i*41)%190} -6;${(i*41)%190+7} 49;${(i*41)%190-4} 100;${(i*41)%190+9} 161;${(i*41)%190+2} 207`,10+i%5,i*.6)).join(''),
 space:rock(16,179,'#a5a4c6')+rock(162,184,'#8b91b6')+
  p('M12 177h48v-5H49v-4H25v4H12Z','#666e9b')+r(27,172,10,3,'#b8bbd9')+r(39,177,5,2,'#d6c4a4')+
  r(142,143,3,34,'#8cb6c7')+r(131,141,27,6,'#bdd1d9')+r(134,132,21,11,'#6581ad')+r(141,128,7,5,'#dbe7e0')+
  glow(r(145,149,3,3,'#fff4aa')+r(145,159,3,3,'#fff4aa'),3)+
  t(r(0,0,18,5,'#9dbed0')+r(4,-5,10,7,'#cce5e9')+r(7,-7,4,2,'#fff7d4')+r(1,4,3,2,'#ffe99c')+r(14,4,3,2,'#ffe99c'), '43 98;56 95;67 98;55 102;43 98',10)+
  dust(16,20,142,['#f8f0c9','#adc1f5']),
 sea:rock(21,184,'#487ea1')+rock(163,189,'#5e8f95')+
  Array.from({length:10},(_,i)=>wobble(r(17+i*18,176-i%3*4,3,21+i%3*5,i%2?'#43967e':'#65b39a')+
  r(18+i*18,169-i%3*4,2,5,'#a5d9a6'),17+i*18,194,5,3.2+i%3,i*.2)).join('')+
  p('M12 195h35v-5h-9v-10h-7v-8h-6v9h-6v-6h-5Z','#e48593')+
  r(18,186,4,6,'#ffd0bb')+r(28,181,4,7,'#f9b2b2')+p('M158 195h32v-8h-6v-9h-6v7h-6v-11h-7v13h-7Z','#f1b376')+
  Array.from({length:8},(_,i)=>t(r(0,0,2+i%2,2+i%2,'#d8f6e7')+r(1,-3,1,1,'#fff'),`${12+(i*29)%180} 190;${14+(i*29)%180} 145;${10+(i*29)%180} 99;${12+(i*29)%180} 60`,8+i%5,i*.7)).join('')+
  t(r(0,0,12,6,'#ffe18b')+r(9,2,5,2,'#ecac8a')+r(2,1,2,2,C.ink), '205 106;169 108;129 110;89 106;49 108;-20 106',15),
 halloween:`<!-- Halloween original em pixels: casa, abóboras, morcegos, fantasminha, lápides -->`+
  r(0,0,200,200,'#242b51')+r(0,105,200,61,'#4c4164')+r(0,163,200,37,'#4f5b55')+
  r(140,24,26,25,'#ffe7a4')+r(145,28,17,16,'#f3d5a2')+r(150,32,5,4,'#fff0c0')+
  dust(26,15,128,['#f7e9aa','#daa5cf'])+
  p('M8 128h59v-28H57V80H18v20H8Z','#263349')+p('M2 103h75v-6H70V90H61V75H14v15H6v7H2Z','#53435e')+
  r(16,104,11,17,'#e8a96f')+r(39,100,14,16,'#ed9e68')+r(31,118,9,10,'#463650')+
  r(20,108,4,4,'#544153')+r(44,104,5,5,'#544153')+r(36,121,2,6,'#ffc17b')+
  fence(0,159,42,'#7c6e72')+fence(155,161,45,'#6c6872')+
  tree(182,163,1.3,true)+rock(73,178,'#7a7b83')+skull(165,182)+
  p('M106 178h22v-17h-5v-7h-12v7h-5Z','#747387')+r(111,164,12,2,'#c2b3ad')+r(115,169,4,9,'#d3c5bd')+r(112,172,10,3,'#b3aba8')+
  pumpkin(41,184,1)+pumpkin(155,190,.78)+
  t(r(0,0,10,10,'#e3dded')+r(2,-3,6,4,'#f4f1e9')+r(2,3,2,2,'#544d74')+r(7,3,2,2,'#544d74')+r(1,9,2,4,'#e3dded')+r(7,9,2,4,'#e3dded'), '165 92;158 89;150 83;144 88;155 94;165 92',7)+
  Array.from({length:3},(_,i)=>t(p('M0 0h6v3h4v-3h5v4h-5v3h-4V4H0Z','#222a40'),`${42+i*40} ${44+i*13};${49+i*40} ${39+i*12};${61+i*40} ${45+i*13};${42+i*40} ${44+i*13}`,5+i,i)).join('')+
  lantern(19,149,'#ffb86f')+glow(r(35,108,4,3,'#ffd49c')+r(45,107,4,3,'#ffd49c'),4),
 christmas:`<!-- Natal original: árvore luminosa, neve, presentes e casinha -->`+
  r(0,0,200,200,'#46647b')+r(0,102,200,61,'#b5d0c6')+r(0,160,200,40,'#e5f1e9')+
  r(14,101,51,61,'#ca737d')+p('M7 104h66v-9H60v-7H23v7H7Z','#6f657b')+
  r(18,116,15,19,'#efe6bf')+r(39,115,16,19,'#fee2ac')+r(34,139,13,23,'#765e66')+r(24,122,3,3,'#fffbe4')+r(46,122,4,3,'#fffbe4')+
  r(15,96,49,4,'#fff8ef')+r(22,91,36,5,'#f4e9dd')+
  pine(167,166,2.1,true)+r(161,167,13,13,'#876e59')+r(148,168,41,7,'#a3cabe')+
  festiveLights(132,114,6)+star(169,100,'#fff1a1',3)+
  present(114,179,'#d97588',17,13)+present(174,181,'#72b1ba',19,15)+present(142,192,'#ae8ac3',14,11)+
  r(72,162,25,3,'#ccdbd7')+r(76,158,18,4,'#fff5e5')+r(84,152,6,6,'#dbe5e0')+
  Array.from({length:16},(_,i)=>t(r(0,0,2+i%2,2+i%2,'#fff8ea'),`${(i*47)%198} -5;${(i*47)%198+6} 48;${(i*47)%198+2} 103;${(i*47)%198+8} 165;${(i*47)%198+4} 207`,9+i%5,i*.6)).join('')+
  glow(r(22,118,4,5,'#fffed7')+r(47,119,5,4,'#ffe49a'),4)
};

export const EXTRA_ROOM_DETAILS={
 bedroom:`<!-- detalhes de quarto: estante, brinquedos, cama, cortinas, relógio -->`+
  r(221,39,130,9,'#896e9f')+r(221,47,130,4,'#dcc7dc')+
  Array.from({length:4},(_,i)=>r(234+i*25,58,13,20,['#b6a8d4','#f4b6b8','#a4c1d4','#e4cda2'][i])+r(236+i*25,60,4,15,'#f9e8de')).join('')+
  r(230,105,107,6,'#aa8b9e')+r(238,113,38,18,'#f7dcae')+r(289,113,36,18,'#b8ddd4')+
  r(35,202,130,39,'#91afa9')+r(41,209,118,25,'#b8d2bd')+r(47,214,106,4,'#d8dfc2')+
  r(51,194,18,14,'#ffe4b2')+r(69,199,68,10,'#ccb5c3')+
  r(30,307,83,11,'#ac91a1')+r(38,314,70,40,'#e8c6c5')+r(44,322,58,23,'#f4ded0')+
  r(330,189,27,42,'#d2adab')+r(331,189,24,4,'#f4d3c2')+r(337,198,12,24,'#e5c2a9')+
  wobble(r(18,59,13,79,'#bbaccd')+r(147,59,13,79,'#bbaccd')+r(23,61,6,62,'#f4e7e9'),26,57,1.7,7)+
  glow(r(93,75,8,4,'#fff4c7')+r(107,91,5,4,'#fff4c7'),5),
 kitchen:`<!-- detalhes de cozinha: azulejos, frascos, frutas, chaleira e vapor -->`+
  Array.from({length:7},(_,i)=>r(i*58,192,2,82,'#dfd0ad')).join('')+
  Array.from({length:2},(_,i)=>r(0,203+i*36,400,2,'#e4d4b5')).join('')+
  r(25,225,151,52,'#c88d75')+r(25,227,151,4,'#ffe0af')+r(25,273,151,4,'#b67a69')+
  r(46,197,12,21,'#d7a78e')+r(60,195,11,22,'#a7c5b6')+r(75,201,13,17,'#e8c6a8')+
  r(210,199,120,40,'#b7d6cd')+r(215,195,111,5,'#e9ead3')+r(219,205,20,27,'#f7dfae')+r(248,207,19,25,'#e7bba4')+
  r(275,214,41,22,'#e2a186')+r(280,206,31,9,'#edc0a6')+
  r(96,230,56,6,'#778a8e')+r(100,223,48,11,'#c5d8d3')+r(104,214,40,11,'#e1d0c5')+
  r(113,208,21,6,'#ffdfbd')+r(117,202,13,8,'#af7b68')+
  t(r(0,0,3,12,'#f5f7e3')+r(7,-2,3,12,'#e5f0db'), '113 190;111 177;116 162;113 190',5)+
  r(144,251,17,14,'#e1c993')+r(147,246,12,6,'#f4e1aa')+r(149,243,9,4,'#7cba85')+
  glow(r(296,71,7,4,'#fff4ce')+r(247,68,6,3,'#ffe0a6'),5)
};

// Props de brinquedos e objetos são aprimorados em camada 64x64,
// sem alterar a posição/área de clique que o jogo já calcula.
export const TOY_DETAIL={
 ball:r(17,19,9,4,'#ffd0d7')+r(19,16,5,3,'#fff4e2')+r(43,37,8,3,'#d47497'),
 bubbles:r(15,31,5,2,'#fff')+r(19,27,4,2,'#fff')+r(42,16,4,2,'#fff')+glow(r(7,19,2,2,'#d7faff'),3),
 kite:r(29,10,5,10,'#fff4be')+r(14,28,8,3,'#fff4e2')+r(37,35,12,3,'#e89f9c'),
 drum:r(13,32,7,7,'#ffe1c6')+r(27,35,9,6,'#ffbad0')+r(41,33,5,9,'#f5deb0'),
 car:r(14,32,13,5,'#ffe1a0')+r(29,17,9,4,'#fff5de')+r(48,34,6,4,'#cc7872'),
 rattle:r(15,15,7,3,'#fff4da')+r(25,33,5,2,'#fff')+r(44,43,3,8,'#d1b3da'),
 book:r(14,24,9,3,'#ffe3a0')+r(40,41,11,3,'#d9ecc7')+r(24,46,4,2,'#a3d2c6'),
 plush:r(17,17,6,3,'#ffe0ef')+r(37,18,7,3,'#f4c6df')+r(24,42,16,4,'#b891ce'),
 surprise:r(15,37,12,4,'#d7eee3')+r(37,40,10,3,'#a5ccbc')+glow(r(27,8,4,3,'#fffbe4'),4),
 instrument:r(17,20,12,4,'#ffddbd')+r(39,20,7,4,'#daeaf0')+r(15,45,12,3,'#ce9d82')
};

// Acabamentos V60: formas legíveis em 1x e 4x. Mantidos longe do rosto do pet.
SCENE_DETAILS.halloween +=
  // Caldeirão com borbulhas, vela, teia e uma segunda abóbora iluminada.
  r(122,174,24,4,'#302d49')+r(125,178,18,12,'#504458')+r(127,180,14,9,'#765c73')+
  r(124,171,21,3,'#5f5870')+r(128,171,15,2,'#c4a0a8')+
  t(r(0,0,3,3,'#b3e6a0')+r(4,-7,2,3,'#f4e5a8'),
    '130 173;132 163;128 152;126 141;130 173',5)+
  glow(r(127,173,16,3,'#85c6a2'),3.2)+
  line('M180 24H197V49M180 24l17 25M186 24l11 16M193 25l4 9','#9c95aa',1)+
  pumpkin(83,190,.58)+
  r(63,157,3,24,'#534a60')+r(57,156,15,3,'#8e7781')+
  glow(r(59,160,12,15,'#e6b875')+r(63,163,4,7,'#fff3ab'),4.5)+
  Array.from({length:16},(_,i)=>r((i*23)%198,191+(i%4)*2,2+(i%3),2,
    ['#61746b','#778379','#435955'][i%3])).join('');
SCENE_DETAILS.christmas +=
  // Guirlanda com laço, boneco de neve, sininhos e enfeites em 4 cores.
  r(35,122,12,3,'#527c65')+r(32,125,18,3,'#589278')+r(30,128,22,4,'#3d7a6a')+
  r(33,130,16,3,'#5e9774')+r(37,125,7,8,'#765f6c')+
  r(37,124,4,2,'#f3a3aa')+r(42,124,4,2,'#f3a3aa')+
  r(79,167,15,12,'#fffdf2')+r(82,160,10,10,'#f9faf0')+
  r(84,156,7,4,'#fcf9ed')+r(82,165,2,2,'#3c5b63')+
  r(88,165,2,2,'#3c5b63')+r(87,168,6,2,'#e5a96f')+
  r(80,155,14,3,'#c4a4c0')+r(84,151,7,5,'#c4a4c0')+
  r(87,173,2,2,'#7e797f')+r(87,177,2,2,'#7e797f')+
  r(145,138,5,4,'#ee8396')+r(177,139,4,4,'#ffe2a0')+
  r(159,128,4,4,'#93d9c6')+r(170,150,4,4,'#e9b1d3')+
  glow(star(167,112,'#fff0ac',2)+star(160,129,'#fff5c3',1),2.7)+
  festiveLights(10,104,5)+
  r(9,158,56,4,'#fff8ea')+r(15,161,40,2,'#d5e9df')+
  Array.from({length:13},(_,i)=>r((i*31)%195,193+(i%3)*2,2+(i%3),1,
    ['#f4fff4','#c0ded6','#fef4de'][i%3])).join('');
EXTRA_ROOM_DETAILS.bedroom +=
  // Livros e luminária com variação de brilho; tapete bordado.
  r(251,61,3,14,'#6c88a6')+r(257,59,5,17,'#de9aa4')+
  r(265,63,5,13,'#efd7a5')+r(274,56,7,20,'#84b6a7')+
  r(292,155,27,4,'#ddcdb8')+r(296,159,20,15,'#b88ea0')+
  r(300,157,6,2,'#f9e0b7')+
  r(38,319,68,2,'#bc9ba5')+r(52,333,40,3,'#d4afae')+
  r(10,355,380,2,'#9bb6ab')+
  glow(r(319,152,5,4,'#fff2b7'),4);
EXTRA_ROOM_DETAILS.kitchen +=
  // Frutas na bancada e relógio de parede com ponteiro animado.
  r(208,42,22,18,'#f9e4c0')+r(211,44,16,14,'#d4b0a8')+
  r(218,50,2,6,'#6e7681')+r(218,50,5,2,'#6e7681')+
  r(302,252,17,9,'#e09c70')+r(306,244,5,9,'#f4bd85')+
  r(314,244,4,7,'#eab18e')+r(312,241,2,3,'#79a67c')+
  glow(r(116,204,11,3,'#fff8dc')+r(263,66,5,4,'#fff0c8'),4.2);

// Telas altas: o céu extra recebe vida própria; evita uma faixa vazia
// em celulares compridos sem distorcer lua, sol, objetos ou pixels do cenário.
export function sceneTallExtension(key,up,down){
 const sky=Math.max(0,Math.round(up)),floor=Math.max(0,Math.round(down));
 if(!sky&&!floor)return {above:'',below:''};
 const isNight=['night','space','halloween'].includes(key);
 const snowy=['snow','christmas'].includes(key);
 const underwater=key==='sea';
 let above='';
 const N=Math.max(6,Math.round(sky/4));
 for(let i=0;i<N;i++){
  const x=9+(i*43+i*i*7)%180;
  const y=-sky+3+(i*17+i*i*3)%Math.max(4,sky-4);
  if(isNight){above+=glow(r(x,y,1+i%2,1+i%2,i%3?'#c8cde6':'#fff0b7'),4+i%4,i*.5);}
  else if(snowy){above+=t(r(0,0,2+i%2,2+i%2,'#fbfbf3'),`${x} ${y};${x+3} ${y+6};${x+1} ${y+12};${x+3} ${y}`,5+i%5,i*.4);}
  else if(underwater){above+=t(r(0,0,2,3,'#e5f5e8'),`${x} ${y+5};${x+3} ${y};${x} ${y-6};${x+3} ${y}`,5+i%4,i*.4);}
  else above+=glow(r(x,y,2+(i%3),1+(i%2),i%2?'#f7f5d9':'#d6eadc'),7+i%3,i*.3);
 }
 if(['garden','beach','clouds','sunset'].includes(key)&&sky>14){
  above+=t(r(0,0,28,3,'#f5f9ed')+r(4,-4,21,5,'#fff9ec')+r(11,-7,10,4,'#fff'),
   `12 ${-sky+14};21 ${-sky+14};28 ${-sky+14};21 ${-sky+14};12 ${-sky+14}`,12);
 }
 if(key==='forest'&&sky>12){above+=t(r(0,0,9,4,'#336a62')+r(2,-4,4,5,'#4b8970'),
   `18 ${-sky+13};20 ${-sky+12};23 ${-sky+14};18 ${-sky+13}`,12);}
 const floorColors=snowy?['#fffaf0','#cbded8']:underwater?['#ccddbd','#80baa5']:
  key==='beach'?['#eac78a','#fff0c9']:isNight?['#617377','#83919a']:['#8fbea1','#c4d8b1'];
 let below='';
 for(let i=0;i<Math.max(4,Math.ceil(floor/3));i++){
  const x=(19+i*37)%195;
  const y=201+(i*13)%Math.max(2,floor);
  below+=r(x,y,2+i%3,1+(i%2),floorColors[i%2]);
 }
 return {above,below};
}
