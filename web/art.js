// The original baby SVG and motion cycles came from the approved visual proof.
// Extra pieces are drawn as independent SVG layers so combinations share one rig.
const extras={
  ears:`<g class="new-ears"><g class="round-ears"><path class="ink" fill="url(#fur)" d="M153 153 Q116 137 120 108 Q124 89 145 99 Q163 109 174 136Z"/><path class="detail" d="M136 109 Q132 126 151 139"/><path class="ink" fill="url(#fur)" d="M287 153 Q324 137 320 108 Q316 89 295 99 Q277 109 266 136Z"/><path class="detail" d="M304 109 Q308 126 289 139"/></g><g class="leaf-ears"><path class="ink" fill="url(#fur)" d="M157 151 Q105 139 99 98 Q133 104 173 130Z"/><path class="detail" d="M112 109 Q137 120 158 139"/><path class="ink" fill="url(#fur)" d="M283 151 Q335 139 341 98 Q307 104 267 130Z"/><path class="detail" d="M328 109 Q303 120 282 139"/></g><g class="pointed-ears"><path class="ink" fill="url(#fur)" d="M158 150 Q123 132 124 72 Q153 92 175 136Z"/><path class="detail" d="M137 95 Q140 121 159 138"/><path class="ink" fill="url(#fur)" d="M282 150 Q317 132 316 72 Q287 92 265 136Z"/><path class="detail" d="M303 95 Q300 121 281 138"/></g></g>`,
  altWings:`<g class="petal-wings"><g class="petal-wing-left"><path class="ink" fill="url(#fur)" d="M157 244 Q103 198 83 248 Q74 278 101 309 Q116 303 124 321 Q144 318 160 285Z"/><path class="detail" d="M145 257 Q108 246 99 288"/></g><g class="petal-wing-right"><path class="ink" fill="url(#fur)" d="M283 244 Q337 198 357 248 Q366 278 339 309 Q324 303 316 321 Q296 318 280 285Z"/><path class="detail" d="M295 257 Q332 246 341 288"/></g></g>`,
  batWings:`<g class="bat-wings"><g class="bat-wing-left"><path class="ink" fill="url(#fur)" d="M158 244 Q120 216 83 222 Q92 246 79 269 Q100 267 106 290 Q127 280 137 307 Q151 289 163 271Z"/><path class="detail" d="M145 252 Q111 239 102 263"/></g><g class="bat-wing-right"><path class="ink" fill="url(#fur)" d="M282 244 Q320 216 357 222 Q348 246 361 269 Q340 267 334 290 Q313 280 303 307 Q289 289 277 271Z"/><path class="detail" d="M295 252 Q329 239 338 263"/></g></g>`,
  altTail:`<g class="tuft-tail"><path class="ink" fill="url(#fur)" d="M290 358 Q325 339 345 365 Q360 380 346 388 L351 401 L334 398 L328 412 Q317 404 311 395 Q300 396 290 387Z"/><path class="detail" d="M316 369 Q329 378 334 394"/></g>`,
  leafTail:`<g class="leaf-tail"><path class="ink" fill="url(#fur)" d="M291 356 Q315 343 329 365 Q350 353 367 361 Q362 395 333 399 Q315 405 294 384Z"/><path class="detail" d="M312 371 Q333 380 350 374"/></g>`,
  markings:`<g class="pet-markings"><g class="mark-dots" fill="#90b3d8"><circle cx="205" cy="304" r="6"/><circle cx="235" cy="304" r="6"/><circle cx="220" cy="326" r="6"/></g><g class="mark-stripes" fill="none" stroke="#90b3d8" stroke-width="6" stroke-linecap="round"><path d="M204 301 Q220 309 236 301 M201 325 Q220 335 239 325 M207 350 Q220 356 233 350"/></g><g class="mark-waves" fill="none" stroke="#90b3d8" stroke-width="6" stroke-linecap="round"><path d="M198 311 Q207 302 216 311 T234 311 T252 311 M199 341 Q208 332 217 341 T235 341 T251 341"/></g></g>`,
  bow:`<g class="pet-bow"><path class="ink" fill="#f0a6c5" d="M219 291 Q197 271 184 280 Q177 290 196 302 Q180 314 190 324 Q204 329 220 305 Q236 329 250 324 Q260 314 244 302 Q263 290 256 280 Q243 271 221 291Z"/><circle cx="220" cy="301" r="10" fill="url(#gold)" stroke="#101d44" stroke-width="4"/></g>`,
  flower:`<g class="pet-flower" fill="#f0a6c5" stroke="#101d44" stroke-width="3"><circle cx="220" cy="285" r="12"/><circle cx="238" cy="297" r="12"/><circle cx="231" cy="315" r="12"/><circle cx="209" cy="315" r="12"/><circle cx="202" cy="297" r="12"/><circle cx="220" cy="300" r="10" fill="url(#gold)"/></g>`,
  phases:`<g class="young-details"><path class="ink" fill="url(#fur)" d="M193 122 Q196 86 218 75 Q214 98 230 115 Q245 81 266 84 Q259 115 248 132Z"/><path class="detail" d="M215 86 Q213 106 220 119"/></g><g class="adult-details"><path class="ink" fill="url(#fur)" d="M193 122 Q184 79 210 55 Q212 83 226 104 Q239 58 267 61 Q261 96 250 131Z"/><path class="ink" fill="url(#fur)" d="M198 260 Q208 285 220 298 Q232 285 242 260 Q231 271 220 270 Q209 271 198 260Z"/><path class="detail" d="M211 278 Q220 290 229 278"/></g>`
};
export const PALETTES={
  snow:{light:'#ffffff',base:'#f6fbff',shadow:'#bad8f4',belly:'#c6e0f8',mark:'#80acd8',accessory:'#f0a6c5'},
  mint:{light:'#dcfff1',base:'#5ce0b4',shadow:'#2ba98b',belly:'#b9f4dc',mark:'#147d67',accessory:'#ff92bb'},
  lilac:{light:'#f5e2ff',base:'#c58bf2',shadow:'#8d5fc6',belly:'#e4cafa',mark:'#7d49af',accessory:'#ffcf65'},
  peach:{light:'#fff0d8',base:'#ffb37c',shadow:'#d97864',belly:'#ffe0c5',mark:'#b85b51',accessory:'#eb70aa'},
  pink:{light:'#ffe0ef',base:'#ff6cab',shadow:'#d84186',belly:'#ffc5df',mark:'#ae2869',accessory:'#ffcf58'},
  sky:{light:'#e5f8ff',base:'#69c7f6',shadow:'#348fc8',belly:'#d3f0ff',mark:'#236ea6',accessory:'#ffd36d'}
};
let artSerial=0;
export async function createArt(host){
  const serial=++artSerial;
  const unique=markup=>markup
    .replace(/id="(fur|belly|gold|cape|iris|shadow)"/g,(_,id)=>`id="art${serial}-${id}"`)
    .replace(/url\(#(fur|belly|gold|cape|iris|shadow)\)/g,(_,id)=>`url(#art${serial}-${id})`);
  const response=await fetch('./pet.svg?v=5');
  if(!response.ok)throw new Error('Arte indisponível');
  const source=await response.text();
  host.innerHTML=unique(source).replace('id="pet"',`id="pet-${serial}"`);
  const svg=host.querySelector('svg');
  svg.classList.add('game-pet');
  svg.removeAttribute('role');
  svg.setAttribute('aria-hidden','true');
  svg.querySelector('.head-part').insertAdjacentHTML('afterbegin',unique(extras.ears));
  svg.querySelector('#character').insertAdjacentHTML('afterbegin',unique(extras.altWings+extras.batWings+extras.altTail+extras.leafTail));
  svg.querySelector('.body-part').insertAdjacentHTML('beforeend',extras.markings);
  svg.querySelector('#character').insertAdjacentHTML('beforeend',unique(extras.bow+extras.flower));
  svg.querySelector('.head-part').insertAdjacentHTML('beforeend',unique(extras.phases));
  const fruit=svg.querySelector('.berry');
  fruit.classList.add('held-fruit');
  fruit.innerHTML='<g class="fruit-whole"><circle cx="162" cy="310" r="15" fill="#ef607b" stroke="#101d44" stroke-width="4"/><path d="M153 295 Q163 286 170 295" fill="none" stroke="#3d9469" stroke-width="5" stroke-linecap="round"/><circle cx="156" cy="305" r="4" fill="#ffd4df"/></g><path class="fruit-bitten" d="M164 295 Q147 292 147 309 Q147 325 163 325 Q174 323 176 313 Q166 315 168 307 Q160 309 164 295Z" fill="#ef607b" stroke="#101d44" stroke-width="4"/>';
  const grip=document.createElementNS('http://www.w3.org/2000/svg','g');grip.setAttribute('class','food-grip');grip.append(fruit);svg.querySelector('#character').append(grip);
  svg.querySelector('.head-part').insertAdjacentHTML('beforeend','<path class="mouth-chew" d="M211 261 Q220 267 229 261" fill="none" stroke="#101d44" stroke-width="4" stroke-linecap="round"/>');
  return svg;
}
export function setAppearance(svg,a){
  for(const key of ['color','ears','wings','tail','markings','accessory']){
    for(const cls of [...svg.classList])if(cls.startsWith(`${key}-`))svg.classList.remove(cls);
    svg.classList.add(`${key}-${a[key]}`);
  }
  svg.dataset.color=a.color;
  svg.classList.toggle('has-badge',a.accessory==='star');
  const palette=PALETTES[a.color]??PALETTES.snow;
  const furStops=svg.querySelector('linearGradient[id$="-fur"]').querySelectorAll('stop');
  [palette.light,palette.base,palette.shadow].forEach((color,index)=>furStops[index].setAttribute('stop-color',color));
  svg.querySelector('linearGradient[id$="-belly"] stop:last-child').setAttribute('stop-color',palette.belly);
  svg.querySelector('.mark-dots').setAttribute('fill',palette.mark);
  svg.querySelector('.mark-stripes').setAttribute('stroke',palette.mark);
  svg.querySelector('.mark-waves').setAttribute('stroke',palette.mark);
  svg.querySelector('.pet-bow path').setAttribute('fill',palette.accessory);
  svg.querySelectorAll('.pet-flower circle:not(:last-child)').forEach(petal=>petal.setAttribute('fill',palette.accessory));
}
export function setPhase(svg,phase){
  svg.classList.remove('phase-egg','phase-baby','phase-young','phase-adult');
  svg.classList.add(`phase-${phase}`);
}
export function setMotion(svg,motion){
  svg.classList.remove('idle','walk','happy','eat','sleep','bath','potty','drink','play','notice','food-ready','food-reach','food-bite','food-chew','food-swallow','satisfied','look','stretch','request');
  svg.classList.add(motion);
}
