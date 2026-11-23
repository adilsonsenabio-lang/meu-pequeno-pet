"""Visual V80 QA: scenes, preview, GIF animations and no JS errors on Android widths."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
import json,subprocess
R=Path(__file__).resolve().parents[1]
html=(R/'PREVIA_OFFLINE_V80.html').read_text(encoding='utf-8')
previews=R/'previews/v80';previews.mkdir(parents=True,exist_ok=True)
node=f"import{{createSave,hatch}}from '{(R/'web/core.js').as_uri()}';console.log(JSON.stringify(hatch(createSave(Date.now()),Date.now()).save));"
base=json.loads(subprocess.check_output(['node','--input-type=module','-e',node],text=True))
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width in (320,390,430):
  page=browser.new_page(viewport={'width':width,'height':950},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(html,wait_until='domcontentloaded',timeout=90000)
  page.wait_for_timeout(1100)
  assert page.locator('#create-screen').is_visible(),width
  for scene in ('snow','beach','sunset','halloween'):
   page.locator(f'#choice-list [data-choice="{scene}"]').click()
   page.wait_for_timeout(100)
   info=page.evaluate('''() => {const s=document.querySelector('#create-scene-art .v64-scene-stage');const pic=s?.querySelector('.v64-scene-frame');return {scene:s?.dataset.v64Scene,width:pic?.naturalWidth,overflow:document.documentElement.scrollWidth-innerWidth,ghost:s?.querySelector('.v64-overlay-ghost')?.src?.slice(0,20)||null}}''')
   assert info['scene']==scene,info
   assert info['width']==320,info
   assert info['overflow']<=2,info
   if scene=='halloween':assert info['ghost'].startswith('data:image/gif;'),info
   if width==390:
    page.locator('.create-preview').screenshot(path=str(previews/f'V80_CRIACAO_{scene}_390.png'))
   print('CREATION',width,scene,info,'errors',errors[:2],flush=True)
  assert not errors,errors[:3]
  page.close()
 # Test game / movement and stillness while pet is visible
 for scene in ('snow','beach','sunset','halloween','space'):
  page=browser.new_page(viewport={'width':390,'height':940},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  initial={'meu-pequeno-pet.save.v1':json.dumps({**base,'scene':scene})}
  page.evaluate("data=>{const db=new Map(Object.entries(data));Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>db.has(k)?db.get(k):null,setItem:(k,v)=>db.set(k,String(v)),removeItem:k=>db.delete(k),clear:()=>db.clear(),key:i=>[...db.keys()][i]??null,get length(){return db.size;}}});}",initial)
  page.set_content(html,wait_until='domcontentloaded',timeout=90000)
  page.wait_for_timeout(1100)
  info=page.evaluate('''() => {const s=document.querySelector('#scene-art .v64-scene-stage');const pic=s?.querySelector('.v64-scene-frame');return {scene:s?.dataset.v64Scene,width:pic?.naturalWidth,gameVisible:!document.querySelector('#play-screen')?.hidden,ghostAnim:s?.querySelector('.v64-overlay-ghost')?.src?.startsWith('data:image/gif;'),cometDuration:s?.querySelector('.v77-orbit-comet-a')?getComputedStyle(s.querySelector('.v77-orbit-comet-a')).animationDuration:null}}''')
  assert info['scene']==scene and info['gameVisible'] and info['width']==320,info
  assert not errors,errors[:3]
  if scene=='halloween':assert info['ghostAnim'],info
  if scene=='space':assert info['cometDuration']=='60s',info
  page.locator('#world').screenshot(path=str(previews/f'V80_JOGO_{scene}_390.png'))
  print('GAME',scene,info,'errors',errors[:2],flush=True)
  page.close()
 browser.close()
# Preview contact sheet
names=['snow','beach','sunset','halloween']
canvas=Image.new('RGB',(320*4,370),'#334155');d=ImageDraw.Draw(canvas)
for i,n in enumerate(names):
 pic=Image.open(previews/f'V80_CRIACAO_{n}_390.png').convert('RGB')
 pic=pic.resize((320,320),Image.Resampling.LANCZOS)
 canvas.paste(pic,(320*i,0))
 d.text((320*i+12,332),{'snow':'Neve','beach':'Praia','sunset':'Entardecer','halloween':'Halloween'}[n],fill='white')
canvas.save('/mnt/data/MEU_PEQUENO_PET_V80_PREVIA_CENARIOS.png')
print('V80 visuals passed')
