import {SCENE_DETAILS} from './scene-details-v60.js';
/* ===== BIBLIOTECA DE PEÇAS (copie esta parte para o jogo) =====
   PARTS[categoria][i].f({p,s,a}) -> string SVG (viewBox 0 0 200 200)
   p = cor principal, s = cor secundária (barriga/interior), a = cor de destaque
   pet(sel, cores) desenha o pet inteiro. sel = {tail,wings,body,feet,ears,head,markings,hair,eyes,snout,accessory}, -1 = nenhum */
const O="#1d2b5e",W=3;
const P=(d,f,x="")=>`<path d="${d}" fill="${f}" stroke="${O}" stroke-width="${W}" stroke-linejoin="round" stroke-linecap="round" ${x}/>`;
const E=(cx,cy,rx,ry,f,x="")=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" stroke="${O}" stroke-width="${W}" ${x}/>`;
const C=(cx,cy,r,f,x="")=>E(cx,cy,r,r,f,x);
const N=(cx,cy,rx,ry,f)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}"/>`;
const K=(cx,cy,r,f)=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}"/>`;
const L=(d,s,w=3)=>`<path d="${d}" fill="none" stroke="${s}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const TL=(d,c,w)=>L(d,O,w+6)+L(d,c,w);
let MX=0,MS=1;const M=g=>`<g transform="translate(${-MX} 0) translate(72 120) scale(${MS}) translate(-72 -120)">${g}</g><g transform="translate(${200+MX} 0) scale(-1 1) translate(72 120) scale(${MS}) translate(-72 -120)">${g}</g>`;
const T=(x,g)=>`<g transform="translate(${x} 0)">${g}</g>`;
const R=(a,x,y)=>`transform="rotate(${a} ${x} ${y})"`;
const star=(x,y,r,f)=>{let p="";for(let i=0;i<10;i++){const a=Math.PI*i/5-Math.PI/2,q=i%2?r*.45:r;p+=(i?"L":"M")+(x+q*Math.cos(a)).toFixed(1)+" "+(y+q*Math.sin(a)).toFixed(1)}return P(p+"Z",f)};
const GOLD="#ffd84a",ORG="#ffb02e",PINK="#ff8fa8";

const PARTS={
body:[
 {n:"Ovo",f:c=>E(100,139,34,39,c.p)+N(100,145,21,27,c.s)},
 {n:"Redondo",f:c=>E(100,138,46,38,c.p)+N(100,144,28,24,c.s)},
 {n:"Esguio",f:c=>E(100,139,26,39,c.p)+N(100,144,14,27,c.s)},
 {n:"Gordinho",f:c=>E(100,137,50,37,c.p)+N(100,143,32,23,c.s)},
 {n:"Alto",f:c=>E(100,143,30,43,c.p)+N(100,148,17,31,c.s)},
 {n:"Baixinho",f:c=>E(100,133,42,33,c.p)+N(100,139,25,20,c.s)},
 {n:"Pera",f:c=>P("M82 104Q100 98 118 104Q150 130 142 164Q100 184 58 164Q50 130 82 104Z",c.p)+N(100,148,24,24,c.s)},
 {n:"Gota",f:c=>P("M100 100Q140 130 138 158Q134 180 100 180Q66 180 62 158Q60 130 100 100Z",c.p)+N(100,152,22,22,c.s)},
 {n:"Sino",f:c=>P("M70 108Q100 94 130 108Q146 150 140 172Q100 180 60 172Q54 150 70 108Z",c.p)+N(100,148,22,22,c.s)},
 {n:"Tubinho",f:c=>`<rect x="68" y="100" width="64" height="78" rx="30" fill="${c.p}" stroke="${O}" stroke-width="3"/>`+N(100,146,18,26,c.s)},
 {n:"Cone",f:c=>P("M100 98Q112 98 124 126Q146 160 140 174Q100 180 60 174Q54 160 76 126Q88 98 100 98Z",c.p)+N(100,152,22,20,c.s)},
 {n:"Fofinho",f:c=>P("M64 130Q56 112 74 108Q80 96 100 100Q120 96 126 108Q144 112 136 130Q150 150 132 166Q124 178 100 176Q76 178 68 166Q50 150 64 130Z",c.p)+N(100,146,24,22,c.s)}],
head:[
 {n:"Redonda",f:c=>C(100,80,36,c.p)},
 {n:"Larga",f:c=>E(100,82,44,32,c.p)},
 {n:"Alta",f:c=>E(100,80,32,40,c.p)},
 {n:"Quadrada",f:c=>`<rect x="66" y="48" width="68" height="64" rx="22" fill="${c.p}" stroke="${O}" stroke-width="3"/>`},
 {n:"Bochechuda",f:c=>P("M58 88Q56 50 100 48Q144 50 142 88Q130 112 100 112Q70 112 58 88Z",c.p)},
 {n:"Coração",f:c=>P("M100 112Q60 100 62 70Q64 46 84 50Q96 52 100 60Q104 52 116 50Q136 46 138 70Q140 100 100 112Z",c.p)},
 {n:"Raposa",f:c=>P("M100 114Q64 96 58 66Q80 52 100 54Q120 52 142 66Q136 96 100 114Z",c.p)},
 {n:"Mini",f:c=>E(100,84,30,28,c.p)},
 {n:"Pêra",f:c=>P("M86 48Q100 44 114 48Q128 60 138 90Q138 112 100 114Q62 112 62 90Q72 60 86 48Z",c.p)},
 {n:"Sapo",f:c=>E(100,88,46,26,c.p)},
 {n:"Diamante",f:c=>P("M100 46Q124 60 140 84Q124 108 100 116Q76 108 60 84Q76 60 100 46Z",c.p)},
 {n:"Nuvem",f:c=>P("M62 84Q54 66 72 60Q76 46 100 48Q124 46 128 60Q146 66 138 84Q146 104 126 108Q114 118 100 114Q86 118 74 108Q54 104 62 84Z",c.p)}],
ears:[
 {n:"Gato",f:c=>M(P("M66 60L60 26L90 48Z",c.p)+P("M68 52L66 36L80 47Z",c.s))},
 {n:"Cão",f:c=>M(E(56,80,12,26,c.a,R(18,56,80)))},
 {n:"Coelho",f:c=>M(E(80,30,10,28,c.p)+N(80,32,5,19,c.s))},
 {n:"Urso",f:c=>M(C(68,52,14,c.p)+K(68,52,7,c.s))},
 {n:"Chifres",f:c=>M(P("M72 56Q56 38 62 18Q80 28 88 52Z",c.a))},
 {n:"Unicórnio",f:c=>P("M91 54L100 6L109 54Z","#ffe08a")+L("M94 38L106 34M96 24L104 20",O,2)+M(P("M68 58L64 38L86 50Z",c.p))},
 {n:"Galhada",f:c=>M(L("M76 56Q62 34 70 12M68 34Q58 28 52 30M72 22Q64 14 60 14",c.a,6))},
 {n:"Elfa",f:c=>M(P("M64 78L28 58L66 64Z",c.p))},
 {n:"Morcego",f:c=>M(P("M66 62L46 22L88 50Z",c.p)+P("M66 54L58 36L78 49Z",c.s))},
 {n:"Ratinho",f:c=>M(E(60,56,15,17,c.p)+N(60,56,8,10,c.s))},
 {n:"Antenas",f:c=>M(L("M84 52Q78 32 68 24",O,3)+C(67,22,5,c.a))},
 {n:"Carneiro",f:c=>M(TL("M68 58Q44 46 46 66Q50 80 64 72",c.a,6))},
 {n:"Raposa",f:c=>M(P("M66 64L55 22L89 53Z",c.p)+P("M66 54L61 35L79 51Z",c.s))},
 {n:"Caídas",f:c=>M(P("M65 63Q45 61 46 90L58 97L74 68Z",c.p)+N(53,79,4,10,c.s))},
 {n:"Espinhos",f:c=>M(P("M66 63L55 25L85 55Z",c.a)+P("M62 58L58 40L76 56Z",c.p))},
 {n:"Cervo",f:c=>M(L("M70 58L64 20M65 37L51 29M65 30L77 21",c.a,6))}],
eyes:[
 {n:"Brilhantes",f:c=>M(C(84,80,9,"#fff")+K(85,81,6,"#2a5db0")+K(85,81,3,O)+K(83,78,2,"#fff"))},
 {n:"Pontinhos",f:c=>M(K(84,80,4.5,O)+K(82.8,78.6,1.4,"#fff"))},
 {n:"Felino",f:c=>M(E(84,80,8,9,GOLD)+`<ellipse cx="84" cy="80" rx="2.2" ry="7" fill="${O}"/>`)},
 {n:"Sonolento",f:c=>M(L("M75 81Q84 89 93 81",O,3.5))},
 {n:"Feliz",f:c=>M(L("M75 85Q84 73 93 85",O,3.5))},
 {n:"Estrela",f:c=>M(star(84,80,10,GOLD))},
 {n:"Coração",f:c=>M(`<path transform="translate(84 80) scale(1.4)" d="M0 5C-10-2-5-9 0-4C5-9 10-2 0 5Z" fill="#ff4d79" stroke="${O}" stroke-width="2"/>`)},
 {n:"Bravinho",f:c=>M(K(85,82,5,O)+L("M73 68L94 76",O,4))},
 {n:"Piscadinha",f:c=>L("M75 85Q84 73 93 85",O,3.5)+K(116,80,4.5,O)+K(114.8,78.6,1.4,"#fff")},
 {n:"Arregalados",f:c=>M(C(84,80,10,"#fff")+K(84,80,3,O))},
 {n:"Brilhosos",f:c=>M(C(84,80,10,"#fff")+K(85,83,7,"#6b3fa0")+K(83,80,2.5,"#fff")+K(88,86,1.5,"#fff"))},
 {n:"Óculos escuros",f:c=>P("M68 74H132L130 86Q128 94 116 94Q104 94 102 84H98Q96 94 84 94Q72 94 70 86Z","#2b2b4a")+L("M76 79L84 77M108 79L116 77","#ffffff99",2)},
 {n:"Ovais",f:c=>M(E(84,81,6,12,"#fff")+K(85,83,3,O))},
 {n:"Quadrados",f:c=>M(P("M77 73H91V89H77Z","#fff")+K(84,81,4,O))},
 {n:"Diamante",f:c=>M(P("M84 68L94 81L84 94L74 81Z","#fff")+K(84,82,3,O))},
 {n:"Lua crescente",f:c=>M(P("M78 76H91V82H87V88H78Z",GOLD))},
 {n:"Cílios",f:c=>M(E(84,82,8,8,"#fff")+K(84,82,4,O)+L("M78 75L73 70M84 74V68M90 75L95 70",O,2))},
 {n:"Tímidos",f:c=>M(L("M75 83H91",O,4)+K(74,92,4,PINK))},
 {n:"Robô",f:c=>M(P("M75 74H93V90H75Z","#59cbd2")+P("M80 79H88V85H80Z",O))},
 {n:"Arco-íris",f:c=>M(E(84,81,8,10,"#fff")+K(84,81,6,"#9a75df")+K(84,81,3,"#ffb64b")+K(82,78,2,"#fff"))},
 {n:"Galáxia",f:c=>M(E(84,81,9,10,"#674d9b")+K(86,79,3,"#f8e2ac")+K(80,85,2,"#fff"))},
 {n:"Lacrimejantes",f:c=>M(E(84,81,9,10,"#fff")+K(84,82,5,O)+K(82,79,2,"#fff")+P("M88 90L92 97L88 98Z","#7fcce7"))},
 {n:"Mini",f:c=>M(C(84,82,3,O)+K(83,81,1,"#fff"))},
 {n:"Altinhos",f:c=>M(E(84,80,6,14,"#fff")+E(84,80,3,10,O))},
 {n:"Sonolentos XL",f:c=>M(L("M73 77Q84 94 95 77",O,4))},
 {n:"Joias",f:c=>M(P("M84 68L96 82L84 96L72 82Z","#c9a7ff")+K(84,82,5,"#6b4eb1"))}],
snout:[
 {n:"Botão",f:c=>E(100,92,5,3.5,O)+L("M92 98Q100 106 108 98",O)},
 {n:"Gato",f:c=>P("M95 90L105 90L100 96Z",PINK)+L("M100 96Q95 103 90 98M100 96Q105 103 110 98",O,2.5)+L("M62 92L84 95M62 102L84 100M138 92L116 95M138 102L116 100",O,2)},
 {n:"Cachorro",f:c=>E(100,98,17,12,c.s)+E(100,91,6.5,4.5,O)+L("M100 95L100 100M92 103Q100 108 108 103",O,2.5)},
 {n:"Bico",f:c=>P("M87 88L113 88L100 108Z",ORG)+L("M91 94L109 94","#c97a00",2)},
 {n:"Dragão",f:c=>E(100,98,21,13,c.s)+K(92,96,2.5,O)+K(108,96,2.5,O)+L("M90 104Q100 110 110 104",O,2.5)},
 {n:"Porquinho",f:c=>E(100,97,15,10,"#ffb3c7")+K(94,97,2.8,"#c24b72")+K(106,97,2.8,"#c24b72")},
 {n:"Sorrisão",f:c=>P("M84 94Q100 118 116 94Z","#7a1f3d")+`<path d="M92 104Q100 112 108 104Q100 100 92 104Z" fill="${PINK}"/>`},
 {n:"Coelho",f:c=>P("M95 90L105 90L100 96Z",PINK)+L("M100 96L100 100M92 100Q100 106 100 100Q100 106 108 100",O,2.5)+`<rect x="95" y="104" width="10" height="9" rx="2" fill="#fff" stroke="${O}" stroke-width="2"/>`},
 {n:"Ratinho",f:c=>P("M94 96L106 96L100 88Z",PINK)+L("M62 92L88 96M62 102L88 100M138 92L112 96M138 102L112 100",O,2)+`<rect x="96" y="100" width="8" height="7" rx="2" fill="#fff" stroke="${O}" stroke-width="1.5"/>`},
 {n:"Tromba",f:c=>E(100,102,10,17,c.s)+K(97,114,1.8,O)+K(103,114,1.8,O)},
 {n:"Carinha :3",f:c=>E(100,91,4,3,"#ff7b9c")+L("M88 96Q94 104 100 96Q106 104 112 96",O,3)},
 {n:"Linguinha",f:c=>E(100,90,5,3.5,O)+P("M95 100Q100 118 105 100Z","#ff7b9c")+L("M90 98Q100 104 110 98",O,3)},
 {n:"Curtinho",f:c=>E(100,98,10,5,c.s)+E(100,95,4,3,O)},
 {n:"Comprido",f:c=>E(100,107,9,19,c.s)+K(100,112,3,O)},
 {n:"Larguinho",f:c=>E(100,98,27,10,c.s)+K(100,94,5,O)},
 {n:"Coração",f:c=>P("M100 117Q75 100 86 91Q95 85 100 94Q105 85 114 91Q125 100 100 117Z",PINK)}],
wings:[
 {n:"Dragão",f:c=>M(P("M72 114L22 76L32 110L20 132L44 128L40 150L74 138Z",c.a))},
 {n:"Anjo",f:c=>M(P("M72 118Q30 66 16 94Q14 120 38 130Q26 140 34 148Q60 150 74 136Z","#fff"))},
 {n:"Fada",f:c=>M(E(52,102,26,13,"#d7f3ff",R(-30,52,102)+' opacity=".9"')+E(58,130,17,9,"#d7f3ff",R(25,58,130)+' opacity=".9"'))},
 {n:"Morcego",f:c=>M(P("M72 110L20 92Q32 106 26 118Q40 118 40 132Q54 126 56 142L74 136Z",c.a))},
 {n:"Fênix",f:c=>M(E(66,90,9,30,ORG,R(-62,72,118))+E(66,90,9,30,c.a,R(-40,72,118))+E(66,90,9,30,GOLD,R(-18,72,118)))},
 {n:"Pequenas",f:c=>M(E(66,116,13,9,c.s,R(-25,66,116)))},
 {n:"Borboleta",f:c=>M(E(50,100,24,19,c.a,R(-25,50,100))+E(56,134,16,12,c.p,R(20,56,134))+K(48,98,5,"#fff")+K(55,134,3.5,"#fff"))},
 {n:"Barbatana",f:c=>M(P("M70 118Q40 108 28 130Q50 140 72 142Z",c.s))},
 {n:"Libélula",f:c=>M(E(48,100,28,8,"#d7f3ff",R(-20,48,100)+' opacity=".85"')+E(52,118,24,7,"#d7f3ff",R(10,52,118)+' opacity=".85"'))},
 {n:"Folhas",f:c=>M(P("M72 116Q38 92 22 104Q36 132 72 130Z","#6fcf6f")+L("M70 122Q46 114 30 106",O,2))},
 {n:"Cristal",f:c=>M(P("M72 112L28 84L24 118L46 108L40 138L74 132Z","#bfe9ff")+L("M72 118L36 112",O,2))},
 {n:"Chamas",f:c=>M(P("M72 122Q36 106 30 78Q50 92 54 70Q64 96 74 100Z","#ff8a3d")+P("M70 122Q50 114 44 98Q58 106 60 94Q66 108 72 112Z",GOLD))}],
tail:[
 {n:"Gato",f:c=>TL("M134 164Q188 168 176 116",c.p,12)},
 {n:"Cão",f:c=>TL("M136 156Q172 146 174 120",c.p,12)},
 {n:"Pompom",f:c=>C(142,160,12,c.s)},
 {n:"Dragão",f:c=>P("M134 150Q172 172 188 142L196 128L194 154Q176 186 134 168Z",c.p)+P("M188 142L196 124L198 150Z",c.a)},
 {n:"Peixe",f:c=>P("M134 156Q160 148 170 172L194 148L194 196L170 176Q150 182 134 172Z",c.a)},
 {n:"Raposa",f:c=>E(168,146,14,30,c.p,R(42,168,146))+C(186,126,9,"#fff")},
 {n:"Pavão",f:c=>E(164,142,14,30,c.a,R(32,164,142))+C(174,122,7,c.p)+K(174,122,3,"#2a5db0")},
 {n:"Chama",f:c=>P("M134 166Q172 174 178 142Q182 124 168 106Q168 128 154 134Q160 120 150 108Q138 130 134 150Z","#ff8a3d")+`<path d="M146 160Q166 162 168 142Q160 150 150 150Z" fill="${GOLD}"/>`},
 {n:"Folha",f:c=>P("M134 164Q170 172 186 146Q160 140 134 150Z","#6fcf6f")+L("M138 158Q160 156 180 148",O,2)},
 {n:"Cobrinha",f:c=>TL("M134 164Q166 176 176 156Q184 140 166 144Q156 148 164 156",c.p,8)},
 {n:"Raio",f:c=>P("M136 162L160 150L152 142L180 124L166 144L174 150Z",GOLD)},
 {n:"Espinhos",f:c=>P("M134 152L168 138L156 154L188 154L158 168L182 180L134 172Z",c.a)},
 {n:"Penas",f:c=>E(168,148,10,28,c.a,R(70,168,148))+E(172,164,9,24,c.p,R(100,172,164))}],
feet:[
 {n:"Redondos",f:(c,o=22)=>[100-o,100+o].map(x=>T(x,E(0,176,14,8,c.p))).join("")},
 {n:"Garras",f:(c,o=22)=>[100-o,100+o].map(x=>T(x,E(0,176,14,8,c.p)+K(-6,183,2.5,"#fff")+K(0,184,2.5,"#fff")+K(6,183,2.5,"#fff"))).join("")},
 {n:"Cascos",f:(c,o=22)=>[100-o,100+o].map(x=>T(x,P("M-10 168H10V180Q10 184 6 184H-6Q-10 184 -10 180Z",c.a))).join("")},
 {n:"Pato",f:(c,o=22)=>[100-o,100+o].map(x=>T(x,P("M-14 184Q0 164 14 184Q7 179 0 184Q-7 179 -14 184Z",ORG))).join("")},
 {n:"Botinhas",f:(c,o=22)=>[100-o,100+o].map(x=>T(x,P("M-11 166H11V180Q11 185 6 185H-8Q-11 185 -11 180Z",c.a)+L("M-11 172H11","#fff",3))).join("")},
 {n:"Nadadeira",f:(c,o=22)=>[100-o,100+o].map(x=>T(x,P("M-14 170Q0 192 16 184Q8 178 8 168Z",c.s))).join("")},
 {n:"Patinhas",f:(c,o=22)=>[100-o,100+o].map(x=>T(x,E(0,176,14,8,c.p)+K(-6,178,2,O)+K(0,180,2,O)+K(6,178,2,O))).join("")},
 {n:"Pés de ave",f:(c,o=22)=>[100-o,100+o].map(x=>T(x,L("M0 166L0 180M0 180L-10 187M0 180L0 189M0 180L10 187",ORG,4))).join("")},
 {n:"Tênis",f:(c,o=22)=>[100-o,100+o].map(x=>T(x,P("M-12 168H8V176Q16 176 16 182Q16 187 10 187H-12Z","#fff")+L("M-12 182H16","#ff5c7a",3))).join("")},
 {n:"Sapatilhas",f:(c,o=22)=>[100-o,100+o].map(x=>T(x,E(0,178,13,7,"#ff9ed8")+L("M-6 175H6","#fff",2))).join("")},
 {n:"Rodinhas",f:(c,o=22)=>[100-o,100+o].map(x=>T(x,C(0,180,8,"#556")+K(0,180,3,"#ccd"))).join("")},
 {n:"Pés de sapo",f:(c,o=22)=>[100-o,100+o].map(x=>T(x,P("M-14 186Q-8 170 0 178Q8 170 14 186Q7 182 0 186Q-7 182 -14 186Z",c.s))).join("")}],
accessory:[
 {n:"Estrela",f:c=>star(100,134,12,GOLD)},
 {n:"Coroa",f:c=>P("M80 52L84 30L94 42L100 24L106 42L116 30L120 52Z",GOLD)},
 {n:"Auréola",f:c=>`<ellipse cx="100" cy="34" rx="18" ry="5" fill="none" stroke="${GOLD}" stroke-width="5"/>`},
 {n:"Laço",f:c=>P("M128 54L110 46L112 64Z",PINK)+P("M128 54L146 46L144 64Z",PINK)+C(128,55,4,"#ff4d79")},
 {n:"Festa",f:c=>P("M100 18L82 54H118Z","#ff7ac8")+L("M92 40L108 40M88 48L112 48","#fff",3)+C(100,18,5,GOLD)},
 {n:"Óculos",f:c=>C(84,80,13,"#ffffff55")+C(116,80,13,"#ffffff55")+L("M97 80Q100 76 103 80",O,3)},
 {n:"Flor",f:c=>[0,72,144,216,288].map(a=>C(128+8*Math.cos(a*Math.PI/180),54+8*Math.sin(a*Math.PI/180),6,"#ff9ed8")).join("")+C(128,54,5,GOLD)},
 {n:"Sininho",f:c=>L("M72 112Q100 128 128 112","#e0301e",6)+C(100,122,6,GOLD)},
 {n:"Gravata",f:c=>P("M100 124L84 114V134Z","#4a8cff")+P("M100 124L116 114V134Z","#4a8cff")+C(100,124,4,"#2f5fb5")},
 {n:"Mago",f:c=>P("M100 4L74 54H126Z","#6b4fd6")+E(100,54,32,6,"#5238b8")+star(100,34,5,GOLD)},
 {n:"Fones",f:c=>L("M64 80Q64 38 100 38Q136 38 136 80","#444",5)+E(62,84,8,12,"#ff5c7a")+E(138,84,8,12,"#ff5c7a")},
 {n:"Cachecol",f:c=>L("M70 114Q100 128 130 114","#ff6b6b",9)+P("M118 120L128 144L112 144Z","#ff6b6b")}],
mouth:[
 {n:"Sorriso",f:c=>L("M90 119H94V123H106V119H110",c.a,3)},
 {n:"Aberta",f:c=>E(100,122,10,7,c.a)},
 {n:"Gatinho",f:c=>L("M89 120Q95 130 100 122Q105 130 111 120",c.a,3)},
 {n:"Coração",f:c=>P("M100 132L90 125Q86 119 92 118Q98 117 100 121Q102 117 108 118Q114 119 110 125Z",c.a)},
 {n:"Surpresa",f:c=>E(100,124,6,8,c.a)},
 {n:"Dentinhos",f:c=>E(100,121,13,6,c.a)+N(100,119,9,3,"#fff")},
 {n:"Linguinha",f:c=>E(100,122,10,7,c.a)+N(100,125,4,4,"#ff91a5")},
 {n:"Séria",f:c=>L("M92 123H108",c.a,3)}],
markings:[
 {n:"Bochechas",f:c=>`<g opacity=".7">${K(70,94,7,"#ff7b9c")+K(130,94,7,"#ff7b9c")}</g>`},
 {n:"Manchas",f:c=>K(86,58,6,c.a)+K(114,62,4,c.a)+K(84,136,8,c.a)+K(116,150,6,c.a)},
 {n:"Listras",f:c=>L("M90 50L93 62M100 48L100 62M110 50L107 62",c.a,4)+L("M64 140L84 144M64 154L84 156M136 140L116 144M136 154L116 156",c.a,4)},
 {n:"Sardas",f:c=>[[76,92],[82,96],[72,98],[124,92],[118,96],[128,98]].map(p=>K(p[0],p[1],1.8,c.a)).join("")},
 {n:"Testa",f:c=>star(100,58,7,GOLD)},
 {n:"Redemoinho",f:c=>L("M92 142Q100 132 108 142Q106 154 94 150Q88 144 96 140",c.a,3)},
 {n:"Sobrancelhas",f:c=>K(84,67,3,c.a)+K(116,67,3,c.a)},
 {n:"Peitoral",f:c=>P("M84 112Q100 128 116 112Q112 150 100 156Q88 150 84 112Z","#fff",'opacity=".9"')},
 {n:"Raio",f:c=>M(L("M64 92L72 88L68 97L76 94",GOLD,3))},
 {n:"Confete",f:c=>K(80,56,3,"#6cc7ff")+K(94,50,3,"#ff8fc8")+K(110,52,3,"#7be09a")+K(122,58,3,"#ffd84a")+K(104,62,2.5,"#c58bff")},
 {n:"Bigodes",f:c=>M(L("M58 94L74 96M58 102L74 100",c.a,2.5))},
 {n:"Curativo",f:c=>`<rect x="112" y="92" width="18" height="8" rx="3" fill="#ffd9b0" stroke="${O}" stroke-width="2" transform="rotate(-20 121 96)"/>`}],
hair:[
 {n:"Crina",f:c=>P("M84 50Q90 28 100 40Q104 22 114 42Q122 34 118 50Z",c.a)},
 {n:"Topete",f:c=>P("M96 52Q92 34 106 30Q104 42 110 52Z",c.a)},
 {n:"Cachinhos",f:c=>C(80,54,8,c.a)+C(100,48,9,c.a)+C(120,54,8,c.a)},
 {n:"Franja",f:c=>P("M66 70Q70 46 100 46Q130 46 134 70Q118 56 100 62Q82 56 66 70Z",c.a)},
 {n:"Espetado",f:c=>P("M90 52L94 28L100 46L106 24L110 46L116 30L114 54Z",c.a)},
 {n:"Folhinha",f:c=>P("M100 50Q98 34 112 26Q114 40 100 50Z","#6fcf6f")+L("M100 50L100 40",O,2)},
 {n:"Maria-chiquinha",f:c=>M(E(60,74,9,18,c.a,R(25,60,74)))},
 {n:"Plumas",f:c=>E(92,40,6,16,c.a,R(-20,92,52))+E(100,36,6,18,GOLD)+E(108,40,6,16,c.p,R(20,108,52))},
 {n:"Coque",f:c=>C(100,36,11,c.a)+L("M92 44Q100 50 108 44",O,2)},
 {n:"Mechas",f:c=>M(L("M72 56Q62 70 64 90",c.a,6))+P("M70 54Q100 34 130 54Q100 46 70 54Z",c.a)},
 {n:"Gorro",f:c=>P("M64 66Q64 34 100 34Q136 34 136 66Z","#ff6b6b")+L("M64 66H136","#fff",5)+C(100,32,6,"#fff")},
 {n:"Espiral",f:c=>M(L("M76 52Q64 42 72 36Q82 34 80 44",c.a,4))}]

};
/* ===== API v3 ===== (compatível com o save "meu-pequeno-pet-backup")
   pet(sel,cores,{stage,mood,shadow}) -> SVG do pet. O CORPO define as âncoras (tabela BODY): cabeça, cauda, asas e patas sempre encaixam.
   PET_CSS: animações por humor. Envolva o pet em <g class="pet m-HUMOR"> e injete o CSS 1x.
   SCENES[id]: cenários ANIMADOS (SMIL, viewBox 200x200). SCENE_NAMES: lista para a tela de escolha. toSave guarda {phase,scene,appearance}.
   fx(nome): efeitos visuais (sparkle,hearts,bubbles,crumbs,splash,zzz,confetti,poof,glow,notes) -> coloque num <g id="fx"> e limpe depois de ~3s.
   SFX.* sons sintetizados (WebAudio, sem arquivos). AU.init() no 1º toque. Ambient.start(cenario)/stop(). ACT[acao] = fx+som+humor temporário.
   moodFromNeeds(needs)->humor, moodScore/moodFace. IDS = nomes das peças no save. "plain"/"none" = sem peça. */
const KEYS=["body","head","feet","ears","eyes","snout","mouth","markings","hair","tail","wings","accessory"];
const LAB={tail:"Cauda",wings:"Asas",body:"Corpo",feet:"Patas",ears:"Orelhas/Chifres",head:"Cabeça",markings:"Marcas",hair:"Cabelo/Crina",eyes:"Olhos",snout:"Focinho",mouth:"Boca",accessory:"Acessório"};
const IDS={
 body:["egg","round","slim","chubby","tall","short","pear","drop","bell","tube","cone","fluffy"],
 head:["round","wide","tall","square","cheeks","heart","fox","mini","pear","frog","diamond","fluffy"],
 ears:["cat","dog","bunny","bear","horns","unicorn","antlers","elf","bat","mouse","antenna","ram","fox","floppy","spiky","deer"],
 eyes:["big","dots","cat","sleepy","happy","star","heart","angry","wink","wide","sparkle","shades","oval","square","diamond","crescent","lashes","shy","robot","rainbow","galaxy","teary","tiny","tall","sleepywide","gem"],
 snout:["button","cat","dog","beak","dragon","pig","grin","bunny","mouse","trunk","cat3","tongue","short","long","wide","heart","whiskers","whiskerslong","whiskerscurled","whiskersdots","foxy","bunnywhiskers"],
 mouth:["smile","open","cat","heart","surprised","teeth","tongue","serious","grin","smirk","kiss","wave","tiny","fangs","laugh","pout","soft","none"],
 wings:["dragon","angel","fairy","bat","phoenix","tiny","butterfly","fin","dragonfly","leaf","crystal","flame"],
 tail:["cat","dog","pompom","dragon","fish","fox","peacock","flame","leaf","snake","bolt","spikes","feathers"],
 feet:["round","claws","hooves","duck","boots","flipper","paws","bird","sneaker","slipper","wheels","frog"],
 accessory:["star","crown","halo","bow","party","glasses","flower","bell","tie","wizard","headphones","scarf","sunglasses"],
 markings:["blush","spots","stripes","freckles","forehead","swirl","brows","tuxedo","bolt","confetti","whiskers","bandage"],
 hair:["mane","tuft","curls","bangs","spikes","leaf","pigtails","plumes","bun","locks","beanie","curlq"]};
const COLORS={pink:["#ff5fa2","#ffd1e6","#ffc43d"],blue:["#5aa9ff","#d6ebff","#ffd84a"],green:["#5ccf8a","#dff7e8","#ffd84a"],yellow:["#ffd24d","#fff4c9","#ff9f43"],purple:["#a77bff","#eadfff","#ff9ed8"],orange:["#ff9a4d","#ffe4cc","#c9692f"],red:["#ff6b6b","#ffe0e0","#ffc43d"],mint:["#6fe0cf","#dcfaf5","#ff9ed8"],white:["#f4f1ee","#ffffff","#9fd0ff"],coral:["#ff7f6e","#ffe3de","#ffd166"],sky:["#7fd3ff","#e3f6ff","#ffa7d1"],lime:["#b6e24b","#f2fbd2","#ff9f43"],lavender:["#c9a7ff","#f3eaff","#7fd3ff"],gold:["#ffcf40","#fff3c4","#c9692f"],gray:["#9aa5b8","#e9edf3","#ff8fb1"],brown:["#a8714a","#f0dcc6","#6b4429"],teal:["#2fb7b0","#d4f5f2","#ffd166"],night:["#4a4f6a","#d9dcf0","#ffd84a"]};
const STAGES={baby:{s:.78,h:1.14,w:.7},child:{s:.9,h:1.04,w:1},adult:{s:.96,h:.96,w:1.15}};
const MOODS=["happy","hungry","thirsty","dirty","potty","sleepy","loved","playful","sad","excited","angry","shy"];

const heartP=(x,y,s,f="#ff5c8a")=>`<path transform="translate(${x} ${y}) scale(${s})" d="M0 5C-10-2-5-9 0-4C5-9 10-2 0 5Z" fill="${f}" stroke="${O}" stroke-width="${2/s}"/>`;
const drop=(x,y,s=1)=>`<path transform="translate(${x} ${y}) scale(${s})" d="M0 0Q8 10 6 15Q3 20 0 20Q-3 20-6 15Q-8 10 0 0Z" fill="#9fd8ff" stroke="${O}" stroke-width="${2/s}"/>`;
const blush=`<g opacity=".7">${K(70,94,7,"#ff7b9c")+K(130,94,7,"#ff7b9c")}</g>`;
const EXPR={
 hungry:{e:M(C(84,82,8,"#fff")+K(84,85,4,O)+L("M74 70Q84 64 94 70",O,3)),o:drop(106,104,.6)+L("M68 150Q60 156 68 162M132 150Q140 156 132 162","#ff8a3d",3)},
 thirsty:{e:PARTS.eyes[3].f({}),o:P("M95 105Q100 124 105 105Z","#ff7b9c")+drop(148,52,.9)},
 dirty:{e:M(K(84,80,4.5,O)),o:K(72,66,5,"#7a5a32")+K(122,98,4,"#7a5a32")+K(88,140,6,"#7a5a32")+K(118,152,5,"#7a5a32")+L("M150 70Q144 60 150 50Q156 40 150 30","#8bc34a",3)+L("M160 76Q154 66 160 56","#8bc34a",3)},
 potty:{e:M(L("M76 77L92 84L76 91",O,3.5)),o:blush+drop(138,56,.8)+L("M46 150L36 150M46 160L34 162M154 150L164 150M154 160L166 162",O,2.5)},
 sleepy:{e:PARTS.eyes[3].f({}),o:`<text x="132" y="50" font-size="22" font-weight="800" fill="#5b6bd6" font-family="sans-serif">Z</text><text x="152" y="32" font-size="14" font-weight="800" fill="#5b6bd6" font-family="sans-serif">z</text>`},
 loved:{e:PARTS.eyes[6].f({}),o:blush+heartP(146,48,1.2)+heartP(56,40,.9)+heartP(160,70,.7)},
 playful:{e:PARTS.eyes[5].f({}),o:star(150,46,8,GOLD)+star(52,58,6,GOLD)+star(160,76,5,"#ff8fc8")},
 sad:{e:M(C(84,82,8,"#fff")+K(84,85,4.5,O)+L("M74 74L93 68",O,3)),o:M(drop(77,92,.55))},
 angry:{e:PARTS.eyes[7].f({}),o:`<g opacity=".5">${K(70,94,8,"#ff3b3b")+K(130,94,8,"#ff3b3b")}</g>`+L("M146 62Q140 52 148 44M156 66Q150 56 158 48","#ff7a7a",3)+L("M128 54L136 50M130 60L138 58","#e03030",3)},
 excited:{e:M(C(84,80,10,"#fff")+K(84,80,6,"#2a5db0")+K(84,80,3,O)+K(81,77,2.5,"#fff")),o:star(46,62,6,GOLD)+star(156,54,7,GOLD)+star(150,86,4,"#ff8fc8")+L("M44 40L46 48M156 34L154 42",O,2.5)},
 shy:{e:PARTS.eyes[4].f({}),o:`<g opacity=".85">${K(68,94,9,"#ff7b9c")+K(132,94,9,"#ff7b9c")}</g>`+drop(138,56,.7)}};

const BODY=[{B:178,hs:29.7,tx:-10,ty:1,fo:17},{B:176,hs:40.5,tx:0,ty:0,fo:23},{B:178,hs:22.7,tx:-17,ty:1,fo:15},{B:174,hs:44.4,tx:3,ty:-1,fo:25},{B:186,hs:25.3,tx:-12,ty:5,fo:17},{B:166,hs:38.6,tx:-7,ty:-5,fo:22},{B:175,hs:31,tx:0,ty:0,fo:22},{B:180,hs:23,tx:-3,ty:0,fo:19},{B:176,hs:34,tx:0,ty:0,fo:22},{B:178,hs:30.3,tx:-9,ty:1,fo:17},{B:177,hs:22,tx:-2,ty:0,fo:21},{B:177,hs:38,tx:-1,ty:0,fo:21}];
function pet(s,c,o={}){const st=STAGES[o.stage]||STAGES.child,x=EXPR[o.mood]||{},g=k=>s[k]>=0?PARTS[k][s[k]].f(c):"",b=BODY[s.body<0?1:s.body]||BODY[1],d=176-b.B;
 MX=b.hs-40.5;MS=st.w;const wg=g("wings");MX=0;MS=1;
 const ft=s.feet>=0?PARTS.feet[s.feet].f(c,b.fo):"",sh=o.shadow===false?"":`<ellipse cx="100" cy="187" rx="${b.fo+24}" ry="5" fill="#000" opacity=".12"/>`;
 const eyes=`<g class="atelier-eyes">${x.e||g("eyes")}</g><g class="atelier-eyes-shut">${M(L("M76 81Q84 87 92 81",O,3))}</g>`;
 const mouth=`<g class="atelier-snout">${g("snout")}</g><g class="atelier-eating-mouth">${E(100,105,10,8,"#57283f")+N(100,109,6,2,"#ef8fa6")}</g>`;
 const props=`<g class="care-cup">${P("M103 108H127L124 128H106Z","#fff")+L("M107 116H123","#65c8f5",4)}</g><g class="care-sponged">${P("M121 84Q136 80 142 90L140 102Q127 108 120 100Z",GOLD)}</g><g class="care-dirt">${K(72,98,4,"#8a6744")+K(128,98,4,"#8a6744")}</g><g class="care-suds">${C(74,108,7,"#fff")+C(130,110,8,"#fff")+C(120,116,5,"#fff")}</g>`;
 return `<g transform="translate(100 185) scale(${st.s}) translate(-100 -185)">${sh}<g transform="translate(0 ${d})"><g transform="translate(${b.tx} ${b.ty})"><g class="atelier-tail">${g("tail")}</g></g><g class="atelier-wings">${wg}</g><g class="atelier-body">${g("body")}</g></g><g class="atelier-feet">${ft}</g><g transform="translate(0 ${d})"><g transform="translate(100 112) scale(${st.h}) translate(-100 -112)"><g class="atelier-head"><g class="atelier-ears">${g("ears")}</g>${g("head")}${g("markings")}${g("hair")}${eyes}${mouth}${g("accessory")}${x.o||""}${props}</g></g></g></g>`}

const svg=(inner,vb="0 0 200 200")=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${inner}</svg>`;

const DEF={tail:3,wings:-1,body:1,feet:1,ears:4,head:0,markings:-1,hair:-1,eyes:0,snout:4,mouth:0,accessory:0};
const cc=a=>({p:a[0],s:a[1],a:a[2]});
function fromSave(a={}){
 const legacy={ears:{round:'bear',leaf:'elf',pointed:'cat'},wings:{feather:'angel',petal:'fairy'},tail:{curl:'cat',tuft:'pompom'},markings:{dots:'spots',waves:'swirl'}};
 const sel={...DEF};
 for(const k of KEYS){const id=legacy[k]?.[a[k]]||a[k];if(id!==undefined){const index=IDS[k].indexOf(id);sel[k]=index>=0?index:-1}}
 const oldColors={snow:COLORS.white,lilac:COLORS.purple,peach:COLORS.orange,sky:COLORS.blue};
 const raw=Array.isArray(a.colors)&&a.colors.length===3?a.colors:oldColors[a.color]||COLORS[a.color]||COLORS.pink;
 return {sel,col:cc(raw)};
}
function toSave(sel,col,stage="child",scene="garden"){const ap={colors:[col.p,col.s,col.a]};
 ap.color=Object.keys(COLORS).find(k=>COLORS[k][0]==col.p)||"custom";
 for(const k of KEYS)ap[k]=sel[k]<0?(k=="markings"?"plain":"none"):IDS[k][sel[k]];return{phase:stage,scene,appearance:ap}}
const moodScore=n=>{const v=Object.values(n);return v.reduce((a,b)=>a+b,0)/v.length};
const moodFace=s=>s>80?"😄":s>60?"🙂":s>40?"😐":s>20?"😟":"😢";
const moodFromNeeds=(n,th=35)=>{let b="happy",v=th,low=0;for(const[k,m]of[["food","hungry"],["water","thirsty"],["clean","dirty"],["potty","potty"],["energy","sleepy"],["affection","sad"],["fun","sad"],["health","sick"]]){if((n[k]??100)<25)low++;if((n[k]??100)<v){v=n[k];b=m}}return low>=3?"angry":b};

const ITEMS={
 food:P("M16 50H84Q82 82 50 84Q18 82 16 50Z","#ff9f5a")+E(50,50,34,8,"#ffd9a8")+C(40,46,6,"#b5651d")+C(54,44,6,"#b5651d")+C(64,50,5,"#b5651d"),
 water:P("M50 10Q82 48 78 66Q74 88 50 88Q26 88 22 66Q18 48 50 10Z","#6cc7ff")+L("M36 62Q36 74 46 78","#fff",4),
 bath:P("M12 52H88Q86 80 68 82H32Q14 80 12 52Z","#8fd3ff")+C(30,40,8,"#fff")+C(44,32,6,"#fff")+C(66,38,9,"#fff")+C(78,28,5,"#fff")+C(56,48,11,GOLD)+K(59,46,2,O),
 potty:P("M24 38H76Q80 72 64 84H36Q20 72 24 38Z","#fff")+E(50,38,26,7,"#bfe3ff")+L("M34 58Q50 66 66 58","#bfe3ff",3),
 sleep:P("M62 12Q28 20 30 52Q32 84 70 86Q36 72 44 44Q48 26 62 12Z",GOLD)+star(76,28,7,"#fff6b0")+star(82,58,5,"#fff6b0"),
 love:P("M50 86C8 56 16 22 38 24C46 25 50 32 50 38C50 34 54 25 62 24C84 22 92 56 50 86Z","#ff5c8a")+L("M30 38Q24 44 26 52","#fff",4),
 play:C(50,50,34,"#ff6b6b")+L("M18 40Q50 62 82 40","#fff",5)+L("M18 62Q50 40 82 62","#fff",5)+C(50,50,8,GOLD),
 injection:P("M17 65L37 85L78 44L58 24Z","#e7f4f6")+L("M27 55L47 75M53 29L73 49M66 18L84 36M20 67L12 75",O,5)+P("M44 52L58 66L72 52L58 38Z","#72c5d4")+L("M17 65L8 56",O,4)};
const item=id=>svg(ITEMS[id],"0 0 100 100");

const sky=(id,a,b)=>`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="200" height="200" fill="url(#${id})"/>`;
const hill=(d,f)=>`<path d="${d}" fill="${f}"/>`;
const rd=i=>Math.abs(Math.sin(i*91.7)*1000)%1;
const mv=(g,v,d,b=0)=>`<g>${g}<animateTransform attributeName="transform" type="translate" values="${v}" dur="${d}s" begin="${-b}s" repeatCount="indefinite"/></g>`;
const sw=(g,x,y,a,d,b=0)=>`<g>${g}<animateTransform attributeName="transform" type="rotate" values="${-a} ${x} ${y};${a} ${x} ${y};${-a} ${x} ${y}" dur="${d}s" begin="${-b}s" repeatCount="indefinite"/></g>`;
const tw=(g,d,b=0,lo=.2)=>`<g>${g}<animate attributeName="opacity" values="${lo};1;${lo}" dur="${d}s" begin="${-b}s" repeatCount="indefinite"/></g>`;
const rays=(x,y,n,a,b,col,d)=>`<g transform="translate(${x} ${y})"><g stroke="${col}" stroke-width="3" stroke-linecap="round">${Array.from({length:n},(_,i)=>`<path d="M0 ${-a}V${-b}" transform="rotate(${i*360/n})"/>`).join("")}<animateTransform attributeName="transform" type="rotate" values="0;360" dur="${d}s" repeatCount="indefinite"/></g></g>`;
const sunA=(x,y,r,col)=>rays(x,y,8,r+6,r+12,col,40)+`<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"><animate attributeName="r" values="${r};${r+2};${r}" dur="3s" repeatCount="indefinite"/></circle>`;
const cl=(s=1,o=.85)=>`<g transform="scale(${s})" fill="#fff" opacity="${o}"><ellipse rx="22" ry="9"/><circle cx="-8" cy="-7" r="9"/><circle cx="8" cy="-9" r="11"/></g>`;
const drift=(y,s,d,b,o)=>mv(cl(s,o),`-40 ${y};240 ${y}`,d,b);
const bf=c=>`<g><ellipse cx="-3" rx="3.2" ry="2.8" fill="${c}"/><ellipse cx="3" rx="3.2" ry="2.8" fill="${c}"/><animateTransform attributeName="transform" type="scale" values="1 1;.3 1;1 1" dur=".45s" repeatCount="indefinite"/></g>`;
const bd=col=>`<g><path d="M-6 0Q-3 -5 0 0Q3 -5 6 0" fill="none" stroke="${col}" stroke-width="1.6" stroke-linecap="round"/><animateTransform attributeName="transform" type="scale" values="1 1;1 -.6;1 1" dur=".7s" repeatCount="indefinite"/></g>`;
const ff=(x,y,b)=>mv(tw(K(0,0,1.8,"#fff6a8"),1.6+b%2,b,.1),`${x} ${y};${x+14} ${y-10};${x-6} ${y-18};${x} ${y}`,8+b%4,b);
const fl=(x,y,c,b)=>sw(L(`M${x} ${y}V${y-12}`,"#4a9a5a",2)+K(x,y-13,4,c)+K(x,y-13,1.6,"#ffe08a"),x,y,9,2.6,b);
const wv=(y,c,w=2)=>L("M-20 "+y+"Q-10 "+(y-4)+" 0 "+y+Array.from({length:11},(_,i)=>"T"+(20+i*20)+" "+y).join(""),c,w);
const stars=(n,h,c="#fff")=>Array.from({length:n},(_,i)=>tw(K(rd(i)*190+5,rd(i+4)*h+6,1+rd(i+2),c),2+rd(i)*3,rd(i)*5)).join("");
const fish=c=>`<g><ellipse rx="8" ry="5" fill="${c}"/><path d="M8 0L14 -5V5Z" fill="${c}"/><circle cx="-4" cy="-1" r="1.3" fill="#123"/></g>`;
const flip=g=>`<g transform="scale(-1 1)">${g}</g>`;
const snowF=n=>Array.from({length:n},(_,i)=>{const x=rd(i)*200;return mv(K(0,0,1.4+rd(i+9)*1.6,"#fff"),`${x} -6;${x+rd(i+3)*30-15} 206`,5+rd(i+5)*6,rd(i+7)*10)}).join("");
// Água em camadas: fundo profundo, reflexo claro, margem úmida e vida discreta.
// Os reflexos se deslocam em passos inteiros para manter os pixels estáveis.
const shorelineWater=()=>`<rect y="116" width="200" height="43" fill="#247a9f"/><rect y="130" width="200" height="29" fill="#55b9d5"/><path d="M0 141h200v18H0Z" fill="#8bd4df" opacity=".7"/><g fill="#335e72" opacity=".48"><rect x="11" y="119" width="17" height="3"/><rect x="18" y="124" width="12" height="2"/><rect x="165" y="120" width="16" height="3"/><rect x="171" y="126" width="10" height="2"/></g><g fill="#e6f7e5" opacity=".65"><rect x="30" y="135" width="17" height="2"/><rect x="74" y="145" width="24" height="2"/><rect x="138" y="137" width="20" height="2"/><animateTransform attributeName="transform" type="translate" values="0 0;2 0;-2 0;0 0" calcMode="discrete" dur="4s" repeatCount="indefinite"/></g><path d="M0 151h19v2h16v-2h21v2h30v-2h23v2h28v-2h24v2h19" fill="none" stroke="#eef9ee" stroke-width="2"><animateTransform attributeName="transform" type="translate" values="0 0;1 0;2 0;1 0;0 0" calcMode="discrete" dur="3.5s" repeatCount="indefinite"/></path><path d="M0 158h200v9H0Z" fill="#9a9a84" opacity=".55"/><path d="M0 163h29v2h22v-2h32v2h29v-2h30v2h29v-2h29" fill="none" stroke="#d9e3bd" stroke-width="2"/><g fill="#fffbe1"><rect x="38" y="128" width="2" height="2"/><rect x="112" y="140" width="2" height="2"/><rect x="173" y="133" width="2" height="2"/><animate attributeName="opacity" values=".15;.9;.15" dur="4s" repeatCount="indefinite"/></g><g fill="#d7f4e8"><rect x="58" y="151" width="7" height="2"/><rect x="126" y="155" width="6" height="2"/></g>`;
const SCENE_NAMES={garden:"🌿 Jardim",sunset:"🌇 Entardecer",night:"🌙 Noite",beach:"🏖️ Praia",clouds:"🌈 Nuvens",forest:"🍄 Floresta",snow:"❄️ Neve",space:"🚀 Espaço",sea:"🐠 Fundo do mar",halloween:"🎃 Halloween",christmas:"🎄 Natal"};
const SCENES={
 garden:sky("s1","#cdeafc","#eaf8ff")+sunA(160,34,15,"#ffe08a")+drift(40,1,46,8)+drift(76,.7,60,30)+hill("M0 150Q60 128 130 146T200 140V200H0Z","#9ad3a8")+mv(bd("#3b4a7a"),"-10 50;210 28",18,4)+hill("M0 178Q80 160 200 178V200H0Z","#79bd92")+fl(24,180,"#ff8fc8",0)+fl(44,188,"#fff",1)+fl(150,186,"#ffd84a",2)+fl(176,180,"#c58bff",1.5)+fl(12,166,"#fff",.5)+mv(bf("#ff9ed8"),"20 120;70 100;110 128;150 96;190 118;20 120",16)+mv(bf("#ffd84a"),"180 130;130 108;80 134;40 104;180 130",13,5),
 sunset:sky("s2","#ff9f7a","#ffe6c7")+`<circle cx="100" cy="140" r="30" fill="#ff8a5c"><animate attributeName="cy" values="140;147;140" dur="8s" repeatCount="indefinite"/></circle>`+drift(50,1,50,5,.7)+drift(72,.8,64,35,.7)+hill("M0 150Q70 130 140 148T200 142V200H0Z","#a58bc7")+mv(bd("#5a3a66"),"-10 60;210 40",14,2)+mv(bd("#5a3a66"),"-30 68;190 50",14)+mv(bd("#5a3a66"),"-50 54;170 36",14,.5)+hill("M0 178Q80 160 200 178V200H0Z","#7d6aa8")+[20,60,150,180].map((x,i)=>sw(L(`M${x} 190Q${x-2} 182 ${x-4} 176M${x} 190Q${x} 180 ${x} 174M${x} 190Q${x+2} 182 ${x+4} 176`,"#5b4a8a",2),x,190,8,2.4,i)).join(""),
 night:sky("s3","#16224f","#3d4f94")+stars(14,100)+`<g class="scene-focus scene-focus-moon"><circle cx="156" cy="36" r="22" fill="#fff4c2" opacity=".15"><animate attributeName="r" values="22;24;27;24;22" calcMode="discrete" dur="7s" repeatCount="indefinite"/></circle>${K(156,36,15,"#fff4c2")}${K(162,31,13,"#243370")}</g><g class="scene-focus scene-focus-shooting-star" opacity="0"><path d="M0 0L18 -8" stroke="#fff" stroke-width="2" stroke-linecap="round"/><animateTransform attributeName="transform" type="translate" values="225 -12;205 -2;165 18;115 45;55 76;-35 118;-35 118" keyTimes="0;.08;.2;.38;.58;.76;1" calcMode="discrete" dur="16s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;1;1;0;0" keyTimes="0;.08;.2;.38;.58;.76;1" calcMode="discrete" dur="16s" repeatCount="indefinite"/></g>`+hill("M0 150Q60 130 130 148T200 142V200H0Z","#2f5a6b")+hill("M0 178Q80 160 200 178V200H0Z","#244a58")+[[36,156],[170,160],[150,138],[20,130],[100,170],[60,110]].map((p,i)=>ff(p[0],p[1],i)).join(""),
 beach:sky("s4","#b8e6ff","#e8fbff")+sunA(40,36,14,"#ffe08a")+drift(46,1,50,12)+drift(70,.6,70,40)+shorelineWater()+hill("M0 169Q100 164 200 169V200H0Z","#f6dfa4")+hill("M0 184Q100 170 200 184V200H0Z","#ecd08c")+L("M22 160Q28 130 20 104","#8a5a2c",5)+sw(`<path d="M20 104Q0 96 -6 108M20 104Q10 90 -2 90M20 104Q36 92 46 100M20 104Q30 114 44 116" stroke="#3f9a5a" stroke-width="4" fill="none" stroke-linecap="round"/>`,20,104,4,3.5)+mv(`<g class="scene-focus scene-focus-crab"><ellipse cx="0" cy="5" rx="13" ry="3" fill="#b88757" opacity=".28"/><path d="M-10 2h20v6h-20z" fill="#b5423f"/><path d="M-12 -1h24v7h-24z" fill="#ff7a6b"/><path d="M-9 -4h18v4h-18z" fill="#ff9886"/><path d="M-6 2h12v2h-12z" fill="#ffa694"/><path d="M-13 -3l-6 -4v3l6 3zM13 -3l6 -4v3l-6 3z" fill="#ff7a6b"/><path d="M-18 -8l6 3l-3 4l-6 -3zM18 -8l-6 3l3 4l6 -3z" fill="#ff8f7c"/><path d="M-6 -7v5h3v-5zM3 -7v5h3v-5z" fill="#6b3b2d"/><path d="M-7 -10h5v4h-5zM2 -10h5v4h-5z" fill="#f7f1e3"/><path d="M-6 -9h2v2h-2zM4 -9h2v2h-2z" fill="#222"/><path class="scene-crab-legs" d="M-10 3l-6 3M-7 5l-10 6M-3 6l-7 7M10 3l6 3M7 5l10 6M3 6l7 7" stroke="#b5423f" stroke-width="2" stroke-linecap="square"/></g>`,"30 182;45 181;60 184;78 182;90 182;112 184;132 181;150 184;132 182;110 184;88 182;64 184;42 181;30 182",22)+mv(bd("#5a6a8a"),"-10 40;210 60",15,3),
 clouds:sky("s5","#a6d8ff","#fff0fb")+["#ff8a8a","#ffd27a","#9be08a","#7ac0ff"].map((c,i)=>tw(L(`M${24+i*6} 160Q100 ${40+i*6} ${176-i*6} 160`,c,6),3,i*.7,.55)).join("")+drift(34,1.1,40,6)+drift(60,.8,52,28)+drift(96,.9,60,10)+[30,160,120].map((x,i)=>mv(`<g><ellipse rx="7" ry="9" fill="${["#ff6b8a","#ffd84a","#6cc7ff"][i]}"/><path d="M0 9Q-3 16 0 24" stroke="#fff" fill="none"/></g>`,`${x} 215;${x+12} -30`,16+i*3,i*6)).join("")+[[20,30],[170,90],[60,60],[140,20],[30,110]].map((p,i)=>tw(star(p[0],p[1],4,"#fff6b0"),2,i)).join("")+[20,70,120,170].map((x,i)=>mv(`<ellipse cx="${x}" cy="188" rx="34" ry="22" fill="#fff"/>`,"0 0;0 -3;0 0",4,i)).join(""),
 forest:sky("s6","#2d5a52","#8fd6b0")+[30,100,160].map((x,i)=>`<path d="M${x} 0L${x+24} 0L${x+60} 170L${x-30} 170Z" fill="#fff" opacity=".1"><animate attributeName="opacity" values=".05;.16;.05" dur="${5+i}s" begin="${-i*2}s" repeatCount="indefinite"/></path>`).join("")+[30,90,165].map((x,i)=>`<rect x="${x-5}" y="70" width="10" height="90" fill="#4a3a2a"/>`+sw(`<circle cx="${x}" cy="66" r="30" fill="#2f7a5a"/><circle cx="${x+10}" cy="80" r="18" fill="#3a8d68"/>`,x,100,2.2,5+i,i)).join("")+hill("M0 160Q100 146 200 160V200H0Z","#3f8f6a")+[[150,172,"#ff5c5c"],[40,178,"#c58bff"]].map((m,i)=>`<circle cx="${m[0]}" cy="${m[1]-6}" r="12" fill="${m[2]}" opacity=".25"><animate attributeName="r" values="10;17;10" dur="${3+i}s" repeatCount="indefinite"/></circle><rect x="${m[0]-3}" y="${m[1]-2}" width="6" height="10" fill="#fff"/><path d="M${m[0]-11} ${m[1]}Q${m[0]} ${m[1]-18} ${m[0]+11} ${m[1]}Z" fill="${m[2]}"/>`).join("")+[20,70,120,160,185].map((x,i)=>mv(`<path d="M0 0Q4 -4 8 0Q4 4 0 0Z" fill="#ffb347"/>`,`${x} -10;${x+24} 210`,8+i*1.5,i*2)).join("")+[[30,120],[170,110],[100,90],[60,150],[140,140],[20,70],[180,60]].map((p,i)=>ff(p[0],p[1],i)).join(""),
 snow:sky("s7","#9fb8e8","#eaf2ff")+mv(`<path d="M0 40Q50 10 100 40T200 40V70Q150 100 100 70T0 70Z" fill="#7dffb2" opacity=".28"/>`,"-8 0;8 6;-8 0",9)+mv(`<path d="M0 60Q50 30 100 60T200 60V84Q150 110 100 84T0 84Z" fill="#c58bff" opacity=".25"/>`,"8 0;-8 -4;8 0",11)+stars(8,60)+hill("M0 150Q60 130 130 148T200 142V200H0Z","#f4f8ff")+[[22,140,1],[176,136,.8]].map((p,i)=>sw(`<g transform="translate(${p[0]} ${p[1]}) scale(${p[2]})"><path d="M0 -40L14 -10H-14ZM0 -26L18 6H-18ZM0 -10L22 24H-22Z" fill="#2f6a58"/><path d="M0 -40L6 -28H-6Z" fill="#fff"/></g>`,p[0],p[1]+24,2,5,i)).join("")+hill("M0 178Q80 162 200 178V200H0Z","#dfe9fb")+`<g transform="translate(160 176)">${C(0,0,12,"#fff")}${C(0,-18,8,"#fff")}<path d="M0 -18L8 -16L0 -14Z" fill="#ff8a3d"/>${K(-3,-20,1.2,O)}${K(3,-20,1.2,O)}</g>`+snowF(18),
 space:sky("s8","#0b0f2e","#2b1b5e")+stars(18,150)+mv(`<g class="scene-focus scene-focus-planet">${C(0,0,16,"#ff9ed8")}<ellipse rx="26" ry="6" fill="none" stroke="${GOLD}" stroke-width="3" transform="rotate(-18)"/></g>`,"40 50;40 52;40 55;40 56;40 54;40 51;40 50",9)+mv(`<g class="scene-focus scene-focus-planet">${C(0,0,8,"#6cc7ff")}</g>`,"165 40;166 38;168 34;169 36;168 39;165 40",8)+mv(`<g class="scene-focus scene-focus-shooting-star"><circle r="3" fill="#fff"/><path d="M0 0L18 -7" stroke="#ffffff88" stroke-width="3"/></g>`,"230 -15;205 -2;165 18;110 46;50 76;-35 112",16,3)+mv(`<g class="scene-focus scene-focus-ufo"><ellipse rx="14" ry="5" fill="#cfd6ff"/><ellipse cy="-4" rx="7" ry="5" fill="#8fe3ff"/>${tw(`<path d="M-8 6L8 6L16 44H-16Z" fill="#fff2a8" opacity=".35"/>`,1.4,0,.1)}</g>`,"125 70;132 68;145 72;158 78;166 84;158 88;144 84;132 76;125 70",18)+hill("M0 160Q60 146 130 158T200 152V200H0Z","#9aa0c8")+hill("M0 184Q80 170 200 184V200H0Z","#7f86b3")+`<g opacity=".35">${K(30,172,6,"#5a608a")}${K(160,168,8,"#5a608a")}${K(110,190,5,"#5a608a")}</g>`,
 sea:sky("s9","#7fd3ff","#1e6fb5")+[30,90,150].map((x,i)=>`<path d="M${x} 0L${x+22} 0L${x+50} 190L${x-10} 190Z" fill="#fff" opacity=".1"><animate attributeName="opacity" values=".04;.15;.04" dur="${4+i}s" begin="${-i*1.5}s" repeatCount="indefinite"/></path>`).join("")+Array.from({length:9},(_,i)=>mv(`<circle r="${2+rd(i)*3}" fill="#ffffff55" stroke="#fff" stroke-width=".8"/>`,`${rd(i+1)*200} 210;${rd(i+1)*200+8} -10`,6+rd(i+3)*6,rd(i+5)*8)).join("")+mv(fish("#ffb347"),"220 60;-20 74",14)+mv(fish("#ff7ac8"),"220 110;-20 96",18,6)+mv(flip(fish("#ffe36b")),"-20 140;220 128",16,3)+mv(`<g><path d="M-8 0Q0 -12 8 0Z" fill="#ff9ed8" opacity=".75"/>${L("M-5 0Q-7 8 -4 12M0 0Q2 9 0 14M5 0Q7 8 4 12","#ff9ed8",1.5)}</g>`,"160 60;154 74;160 60",5)+hill("M0 176Q100 160 200 176V200H0Z","#f0d9a0")+[14,30,170,186].map((x,i)=>sw(`<path d="M${x} 192Q${x-6} 178 ${x} 166Q${x+6} 154 ${x} 142" stroke="#2f9a5a" stroke-width="5" fill="none" stroke-linecap="round"/>`,x,192,7,3+i*.4,i)).join("")+`<path d="M60 190Q56 176 62 170Q64 180 68 172Q72 182 74 190Z" fill="#ff7a8a"/><path d="M140 192Q136 178 142 172Q144 182 148 174Q152 184 154 192Z" fill="#ff9f5c"/>`};
// Vida em pixels: peças independentes, deslocamentos inteiros e pausas longas.
// A composição original de cada cenário permanece intacta.
const pixelShift=(art,frames,duration,begin=0)=>`<g>${art}<animateTransform attributeName="transform" type="translate" values="${frames}" calcMode="discrete" dur="${duration}s" begin="${begin}s" repeatCount="indefinite"/></g>`;
const pixelPulse=(art,duration,begin=0)=>`<g>${art}<animate attributeName="opacity" values=".15;.15;.9;.15" keyTimes="0;.55;.7;1" calcMode="discrete" dur="${duration}s" begin="${begin}s" repeatCount="indefinite"/></g>`;
const scenePixelLife={
 garden:pixelShift('<path d="M15 172h5v-3h3m131 8h5v-3h3" fill="none" stroke="#5c9e71" stroke-width="2"/>','0 0;1 0;0 0;-1 0;0 0',5),
 sunset:pixelPulse('<rect x="135" y="117" width="5" height="2" fill="#ffe3a9"/><rect x="151" y="122" width="3" height="2" fill="#ffe3a9"/>',6),
 night:pixelPulse('<rect x="22" y="147" width="3" height="3" fill="#ffe999"/><rect x="168" y="151" width="2" height="2" fill="#ffe999"/>',7,2),
 beach:pixelShift('<rect x="42" y="151" width="9" height="2" fill="#fff5d2"/><rect x="137" y="147" width="7" height="2" fill="#fff5d2"/>','0 0;2 0;0 0;-2 0;0 0',4),
 clouds:pixelPulse('<rect x="35" y="140" width="3" height="3" fill="#fff"/><rect x="164" y="117" width="2" height="2" fill="#fff"/>',5,1),
 forest:pixelShift('<path d="M22 163h4v-3h3m127 10h4v-3h3" fill="none" stroke="#a8d794" stroke-width="2"/>','0 0;1 0;0 0;-1 0;0 0',6),
 snow:pixelPulse('<rect x="44" y="170" width="4" height="2" fill="#fff"/><rect x="139" y="183" width="4" height="2" fill="#fff"/>',6,2),
 space:pixelPulse('<rect x="75" y="33" width="2" height="2" fill="#ffefb0"/><rect x="178" y="98" width="2" height="2" fill="#bdeaff"/>',5),
 sea:pixelShift('<rect x="27" y="129" width="9" height="2" fill="#b9efff"/><rect x="146" y="116" width="7" height="2" fill="#b9efff"/>','0 0;2 0;0 0;-2 0;0 0',5)
};
// V60: pintura em camadas, preserva cenários antigos e acrescenta ambientes sazonais.
for(const [name,details] of Object.entries(SCENE_DETAILS)){
 if(name==='halloween'||name==='christmas')SCENES[name]=details;
 else if(SCENES[name])SCENES[name]+=details;
}
for(const [name,art] of Object.entries(scenePixelLife))SCENES[name]+=art;
const FXH=1;
const rnd=(a,b)=>a+Math.random()*(b-a);
const pt=(x,y,dx,dy,d,b,g)=>`<g transform="translate(${x} ${y})"><g opacity="0">${g}<animateTransform attributeName="transform" type="translate" values="0 0;${dx} ${dy}" dur="${d}s" begin="${b}s" fill="freeze"/><animate attributeName="opacity" values="0;1;1;0" dur="${d}s" begin="${b}s" fill="freeze"/></g></g>`;
const ring=(x,y,r,col,d,b)=>`<circle cx="${x}" cy="${y}" r="4" fill="none" stroke="${col}" stroke-width="5" opacity="0"><animate attributeName="r" values="4;${r}" dur="${d}s" begin="${b}s" fill="freeze"/><animate attributeName="opacity" values=".9;0" dur="${d}s" begin="${b}s" fill="freeze"/></circle>`;
const FX={
 sparkle:()=>Array.from({length:9},(_,i)=>{const a=i*40*Math.PI/180;return pt(100,110,Math.cos(a)*60,Math.sin(a)*55,1.1,0,star(0,0,rnd(4,7),GOLD))}).join(""),
 hearts:()=>Array.from({length:7},(_,i)=>pt(rnd(55,145),150,rnd(-14,14),-rnd(70,110),rnd(1.6,2.2),i*.25,heartP(0,0,rnd(.9,1.6)))).join(""),
 bubbles:()=>Array.from({length:10},(_,i)=>{const r=rnd(3,8);return pt(rnd(40,160),176,rnd(-14,14),-rnd(90,130),rnd(1.8,2.6),i*.18,`<circle r="${r}" fill="#bfe9ff99" stroke="#fff" stroke-width="1.5"/><circle cx="${-r/3}" cy="${-r/3}" r="${r/4}" fill="#fff"/>`)}).join(""),
 crumbs:()=>Array.from({length:9},(_,i)=>pt(rnd(92,108),104,rnd(-30,30),rnd(46,76),.9,i*.08,K(0,0,rnd(1.6,3),"#c98a4b"))).join(""),
 splash:()=>Array.from({length:8},(_,i)=>pt(100,100,(i-3.5)*12,rnd(30,60),.9,i*.05,drop(0,0,.55))).join(""),
 zzz:()=>[0,1,2].map(i=>pt(128+i*8,70-i*8,14,-36,2.2,i*.7,`<text font-size="${15+i*5}" font-weight="800" fill="#5b6bd6" font-family="sans-serif">Z</text>`)).join(""),
 confetti:()=>Array.from({length:22},(_,i)=>pt(rnd(10,190),-8,rnd(-24,24),rnd(190,230),rnd(1.8,2.8),rnd(0,.7),`<rect width="5" height="8" fill="${["#ff6b8a","#ffd84a","#6cc7ff","#7be09a","#c58bff"][i%5]}" transform="rotate(${rnd(0,90)})"/>`)).join(""),
 poof:()=>[[-18,0],[0,-8],[18,0]].map((p,i)=>`<circle cx="${100+p[0]}" cy="${150+p[1]}" r="6" fill="#fff" opacity="0"><animate attributeName="r" values="6;24" dur="1s" begin="${i*.1}s" fill="freeze"/><animate attributeName="opacity" values=".95;0" dur="1s" begin="${i*.1}s" fill="freeze"/></circle>`).join(""),
 glow:()=>ring(100,120,100,GOLD,1.4,0)+ring(100,120,100,"#fff",1.4,.35)+FX.sparkle(),
 notes:()=>Array.from({length:6},(_,i)=>pt(rnd(50,150),130,rnd(-20,20),-rnd(70,100),2,i*.3,`<text font-size="18" font-weight="800" fill="${["#ff6b8a","#6cc7ff","#7be09a"][i%3]}" font-family="sans-serif">♪</text>`)).join("")};
const fx=n=>`<g>${(FX[n]||(()=>""))()}</g>`;
const PET_CSS=`.pet{transform-origin:100px 186px}.m-happy,.m-loved{animation:pbob 2.4s ease-in-out infinite}.m-playful,.m-excited{animation:phop .6s ease-in-out infinite}.m-hungry{animation:pwob 1.4s ease-in-out infinite}.m-thirsty{animation:pwob 2s ease-in-out infinite}.m-sleepy{animation:pbreath 4.5s ease-in-out infinite}.m-sad,.m-sick{animation:pdroop 3s ease-in-out infinite}.m-dirty,.m-angry{animation:pshiver .2s linear infinite}.m-potty{animation:pwig .35s ease-in-out infinite}.m-shy{animation:psway 3s ease-in-out infinite}@keyframes pbob{50%{transform:translateY(-4px) scaleY(1.02)}}@keyframes phop{0%,100%{transform:translateY(0) scale(1.04,.94)}45%{transform:translateY(-16px) scale(.97,1.05)}}@keyframes pwob{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}@keyframes pbreath{50%{transform:scale(1.025,1.04)}}@keyframes pdroop{50%{transform:translateY(3px) scale(1.02,.97)}}@keyframes pshiver{0%,100%{transform:translateX(-1px)}50%{transform:translateX(1px)}}@keyframes pwig{0%,100%{transform:rotate(-1.5deg) translateX(-1px)}50%{transform:rotate(1.5deg) translateX(1px)}}@keyframes psway{50%{transform:rotate(3deg)}}`;
const ACT={food:{fx:"crumbs",sfx:"eat",mood:"happy",ms:2200},water:{fx:"splash",sfx:"drink",mood:"happy",ms:2000},bath:{fx:"bubbles",sfx:"bath",mood:"happy",ms:2600},potty:{fx:"poof",sfx:"potty",mood:"shy",ms:2200},sleep:{fx:"zzz",sfx:"sleep",mood:"sleepy",ms:3500},love:{fx:"hearts",sfx:"love",mood:"loved",ms:2800},play:{fx:"confetti",sfx:"play",mood:"excited",ms:2800},injection:{fx:"glow",sfx:"love",mood:"happy",ms:2300}};
/* ---- SOM (WebAudio sintetizado, sem arquivos) ---- */
const AU={ctx:null,vol:.6,mute:false,
 init(){if(!this.ctx){const A=typeof window!="undefined"&&(window.AudioContext||window.webkitAudioContext);if(!A)return null;this.ctx=new A();this.m=this.ctx.createGain();this.m.gain.value=this.mute?0:this.vol;this.m.connect(this.ctx.destination)}if(this.ctx.state=="suspended")this.ctx.resume();return this.ctx},
 setVol(v){this.vol=v;if(this.m&&!this.mute)this.m.gain.value=v},
 setMute(b){this.mute=b;if(this.m)this.m.gain.value=b?0:this.vol},
 tone(f,d=.15,type="sine",v=.2,at=0,to=0){const x=this.init();if(!x)return;const t=x.currentTime+at,o=x.createOscillator(),g=x.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+Math.min(.02,d/3));g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(this.m);o.start(t);o.stop(t+d+.05)},
 noise(d=.2,f=1500,v=.2,at=0,to=0,att=.01,type="lowpass"){const x=this.init();if(!x)return;if(!this.nb){const n=x.sampleRate*2,b=x.createBuffer(1,n,x.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;this.nb=b}
  const t=x.currentTime+at,s=x.createBufferSource(),fl=x.createBiquadFilter(),g=x.createGain();s.buffer=this.nb;fl.type=type;fl.frequency.setValueAtTime(f,t);if(to)fl.frequency.exponentialRampToValueAtTime(to,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+Math.min(att,d/2));g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl);fl.connect(g);g.connect(this.m);s.start(t,Math.random()*1.5,d+.05)}};
const SFX={
 tap(){AU.tone(660,.07,"triangle",.18);typeof navigator!="undefined"&&navigator.vibrate&&navigator.vibrate(15)},
 pop(){AU.tone(900,.09,"sine",.2,0,220)},
 happy(){[523,659,784,1047].forEach((f,i)=>AU.tone(f,.14,"triangle",.18,i*.09))},
 chirp(p=1){AU.tone(900*p,.1,"sine",.2,0,1500*p);AU.tone(1500*p,.12,"sine",.18,.1,1100*p)},
 eat(){[0,.13,.26].forEach(t=>{AU.noise(.06,2600,.35,t,900);AU.tone(180,.07,"square",.07,t)})},
 drink(){[0,.17,.34].forEach(t=>AU.tone(320,.13,"sine",.25,t,720))},
 bath(){AU.noise(.9,900,.18,0,3500,.3,"bandpass");for(let i=0;i<7;i++)AU.tone(700+Math.random()*900,.06,"sine",.15,.1+i*.11,300)},
 potty(){AU.noise(1,2200,.3,0,250,.08);AU.tone(1318,.25,"sine",.15,1.05)},
 sleep(){[392,330,294,262].forEach((f,i)=>AU.tone(f,.5,"sine",.14,i*.38))},
 love(){AU.tone(80,.12,"sine",.5);AU.tone(80,.12,"sine",.5,.18);[523,659,784].forEach((f,i)=>AU.tone(f,.3,"sine",.14,.4+i*.12))},
 play(){AU.tone(180,.22,"sine",.3,0,620);AU.tone(620,.22,"sine",.3,.24,260);AU.tone(260,.18,"sine",.25,.5,520)},
 sad(){[392,349,311].forEach((f,i)=>AU.tone(f,.28,"triangle",.16,i*.2))},
 angry(){AU.tone(120,.3,"sawtooth",.14,0,90);AU.tone(114,.3,"sawtooth",.12,.25,80)},
 yawn(){AU.tone(420,.7,"triangle",.14,0,180)},
 tummy(){AU.noise(.5,180,.5,0,90,.15)},
 sparkle(){for(let i=0;i<6;i++)AU.tone(1600+Math.random()*1800,.08,"sine",.1,i*.05)},
 evolve(){[392,494,587,784,988,1175].forEach((f,i)=>AU.tone(f,.2,"square",.1,i*.11));AU.tone(1568,.7,"triangle",.15,.7);setTimeout(()=>SFX.sparkle(),700)}};
const AMB={
 garden:{w:[600,.03],t:[1.2,3.5],b:()=>{AU.tone(2200+Math.random()*900,.08,"sine",.05,0,3000);AU.tone(2800,.07,"sine",.05,.1,2300)}},
 sunset:{w:[500,.025],t:[2,5],b:()=>AU.tone(1800+Math.random()*600,.12,"sine",.04,0,2400)},
 night:{w:[300,.015],t:[.8,2],b:()=>[0,.09,.18].forEach(t=>AU.tone(4300,.05,"square",.012,t))},
 beach:{w:[1400,.05],t:[4,6],b:()=>AU.noise(3.2,900,.12,0,2600,1.4)},
 clouds:{w:[900,.02],t:[1.5,3.5],b:()=>AU.tone([523,587,659,784,880][Math.floor(Math.random()*5)]*2,.9,"sine",.05)},
 forest:{w:[500,.02],t:[6,10],b:()=>{AU.tone(420,.25,"sine",.07);AU.tone(350,.4,"sine",.07,.3)}},
 snow:{w:[1100,.04],t:[4,8],b:()=>AU.tone(1568,1,"sine",.03)},
 space:{w:[160,.05],t:[1.5,4],b:()=>AU.tone(1000+Math.random()*2000,.12,"sine",.04,0,300+Math.random()*500)},
 halloween:{w:[330,.018],t:[3,6],b:()=>{AU.tone(250,.1,"sine",.024,0,350)}},
 christmas:{w:[820,.018],t:[2.5,5],b:()=>{AU.tone(990,.2,"sine",.038);AU.tone(1320,.25,"sine",.03,.18)}},
 sea:{w:[400,.04],t:[.4,1.6],b:()=>AU.tone(500+Math.random()*500,.06,"sine",.08,0,900)}};
const Ambient={s:null,timer:0,
 start(id){this.stop();const a=AMB[id],x=AU.init();if(!a||!x)return;AU.noise(.01,1000,.0001);const s=x.createBufferSource(),f=x.createBiquadFilter(),g=x.createGain();s.buffer=AU.nb;s.loop=true;f.type="lowpass";f.frequency.value=a.w[0];g.gain.value=a.w[1];s.connect(f);f.connect(g);g.connect(AU.m);s.start();this.s=s;
  const go=()=>{a.b();this.timer=setTimeout(go,(a.t[0]+Math.random()*(a.t[1]-a.t[0]))*1000)};this.timer=setTimeout(go,800)},
 stop(){clearTimeout(this.timer);try{this.s&&this.s.stop()}catch(e){}this.s=null}};
/* ===== fim da biblioteca ===== */
export {PARTS,KEYS,LAB,IDS,COLORS,SCENES,SCENE_NAMES,ITEMS,item,pet,svg,fromSave,toSave,moodFromNeeds,cc,DEF,PET_CSS,fx,SFX,Ambient,ACT,AU};
