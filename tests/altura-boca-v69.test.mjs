import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {OPTIONS, DEFAULT_APPEARANCE,createSave,validateSave,validAppearance,mouthOffset,MIN_MOUTH_OFFSET,MAX_MOUTH_OFFSET} from '../web/core.js';
import {pixelPet} from '../web/pixel-pet.js';
import {fromSave} from '../web/atelier.js';
import {saveCreatorSession,loadCreatorSession} from '../web/creator-session.js';
const ROOT=resolve(import.meta.dirname,'..');
const read=name=>readFile(join(ROOT,'web',name),'utf8');
const mock=()=>{const data=new Map();return {setItem:(k,v)=>data.set(k,v),getItem:k=>data.get(k)||null,removeItem:k=>data.delete(k)};};
const pet=(a,stage='baby')=>{const {sel,col}=fromSave(a);return pixelPet(sel,col,{stage,mouthOffset:a.mouthOffset,partColors:a.partColors,partSizes:a.partSizes});};
test('V69 boca: escala e cor preservadas, com altura independente',()=>{
 const a={...DEFAULT_APPEARANCE,partSizes:{mouth:1.2},partColors:{mouth:'pink'}};
 const n=pet({...a,mouthOffset:0}),up=pet({...a,mouthOffset:-8}),down=pet({...a,mouthOffset:8});
 for(const [markup,offset,dy] of [[n,0,-9],[up,-8,-17],[down,8,-1]]){
  assert.match(markup,new RegExp(`class="atelier-mouth" transform="translate\\(0 ${dy}\\)" data-mouth-offset="${offset}"`));
  assert.match(markup,/scale\(1.2\)/);
 }
 assert.notEqual(n,up);assert.notEqual(up,down);
 for(const stage of ['baby','child','adult'])assert.match(pet({...a,mouthOffset:8},stage),/data-mouth-offset="8"/);
});
test('V69 boca: clamp e validação com saves antigos',()=>{
 assert.equal(MIN_MOUTH_OFFSET,-8);assert.equal(MAX_MOUTH_OFFSET,8);
 assert.equal(mouthOffset(-18),-8);assert.equal(mouthOffset(25),8);assert.equal(mouthOffset(undefined),0);
 assert.equal(validAppearance({...DEFAULT_APPEARANCE,mouthOffset:8}),true);
 for(const wrong of [-9,9,1.5,'5',null])assert.equal(validAppearance({...DEFAULT_APPEARANCE,mouthOffset:wrong}),false,String(wrong));
 assert.equal(validateSave(createSave(100)),true);
 assert.equal(validateSave(createSave(100,{...DEFAULT_APPEARANCE,mouthOffset:-4})),true);
 assert.equal(validateSave(createSave(100,{...DEFAULT_APPEARANCE,mouthOffset:200})),false);
});
test('V69 boca: rascunho antigo e novo recuperáveis',()=>{
 const st=mock(),draft={...DEFAULT_APPEARANCE,scene:'beach',mouth:'cat',mouthOffset:-6};
 saveCreatorSession(st,'draft',draft,2,false);
 assert.equal(loadCreatorSession(st,'draft').draft.mouthOffset,-6);
 st.setItem('draft',JSON.stringify({version:3,draft:{...draft,mouthOffset:999},step:2}));
 assert.equal(loadCreatorSession(st,'draft').draft.mouthOffset,undefined);
 st.setItem('draft',JSON.stringify({version:2,draft:{...draft,mouthOffset:-4},step:7}));
 const old=loadCreatorSession(st,'draft');assert.equal(old.step,2);assert.equal(old.draft.mouthOffset,-4);
});
test('V69 interface: controle somente de boca e HTML autocontido',async()=>{
 const [app,html,css,sw]=await Promise.all(['app.js','index.html','v69-boca.css','sw.js'].map(read));
 assert.match(html,/id="mouth-height"[^>]+min="-8" max="8" step="2"/);
 assert.match(app,/mouthAdjust\.hidden=c\.key!=='mouth'/);
 assert.match(app,/\$\('#mouth-height'\)\.addEventListener\('input'/);
 assert.match(app,/mouthOffset:mouthOffset\(draft\.mouthOffset\)/);
 assert.match(css,/mouth-height-adjust/);
 assert.match(sw,/meu-pequeno-pet-v(?:74|75|77|80)/);
 assert.match(sw,/v69-boca\.css/);
 const cache=JSON.parse(sw.match(/const ASSETS=(\[[\s\S]*?\]);/)[1]);
 for(const item of ['./app.js?v=80','./core.js?v=80','./pixel-pet.js?v=69','./v69-boca.css?v=69'])assert.ok(cache.includes(item),item);
 for(const item of cache){const local=item.replace(/^\.\//,'').split('?')[0];if(local)await access(join(ROOT,'web',local));}
});
test('V69 praia: spritesheet aprovado, GIF novo do caranguejo e preview de seleção',async()=>{
 const path=join(ROOT,'assets-src/v63');
 for(const key of ['objetos/beach__crab_spritesheet.png','objetos/beach__crab_arte_aprovada_original.png','animacoes/beach_sem_pet.gif','animacoes/beach_miniatura.gif','quadros/beach__crab/09.png'])await access(join(path,key));
 const text=await read('index.html'); const media=JSON.parse(text.match(/<script id="v64-scene-media" type="application\/json">(.*?)<\/script>/s)[1]);
 assert.match(media.beach.gif,/^data:image\/gif;base64,/);assert.match(media.beach.preview,/^data:image\/gif;base64,/);
 assert.ok(media.beach.gif.length>40000);
});
