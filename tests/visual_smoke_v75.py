"""QA manual automatizado das quatro cenas V75 no HTML único offline."""
from playwright.sync_api import sync_playwright
import subprocess,json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
html=(root/'PREVIA_OFFLINE_V75.html').read_text(encoding='utf-8')
core=(root/'web/core.js').as_uri()
node=f"import{{createSave,hatch}}from '{core}';const s=hatch(createSave(Date.now()),Date.now()).save;console.log(JSON.stringify(s));"
base=json.loads(subprocess.check_output(['node','--input-type=module','-e',node],text=True))
output=Path('/mnt/data')
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for scene in ['halloween','sea','space','desert']:
  width=390 if scene!='desert' else 320
  page=browser.new_page(viewport={'width':width,'height':844},device_scale_factor=1)
  data={**base,'scene':scene,'needs':{**base['needs'],'energy':50}}
  initial={'meu-pequeno-pet.save.v1':json.dumps(data)}
  page.evaluate("data=>{const db=new Map(Object.entries(data));Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>db.has(k)?db.get(k):null,setItem:(k,v)=>db.set(k,String(v)),removeItem:k=>db.delete(k),clear:()=>db.clear(),key:i=>[...db.keys()][i]??null,get length(){return db.size;}}});}",initial)
  errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.set_content(html,wait_until='domcontentloaded',timeout=40000)
  page.wait_for_timeout(1800)
  dat=page.evaluate('''() => ({
    scene:document.querySelector('[data-v64-scene]')?.dataset.v64Scene,
    playHidden:document.querySelector('#play-screen')?.hidden,
    sceneImg:document.querySelector('#world .v64-scene-frame')?.src,
    width:document.documentElement.scrollWidth,
    vw:window.innerWidth,
    ready:document.querySelector('#world .v64-scene-frame')?.complete,
    naturalWidth:document.querySelector('#world .v64-scene-frame')?.naturalWidth
  })''')
  assert not errors,(scene,errors[:4]);assert dat['playHidden'] is False,(scene,dat)
  assert dat['scene']==scene,(scene,dat)
  assert dat['ready'] and dat['naturalWidth']==320,(scene,dat)
  assert dat['width']<=dat['vw']+2,(scene,dat)
  path=output/f'MEU_PEQUENO_PET_V75_{scene.upper()}_NO_JOGO.png'
  page.locator('#world').screenshot(path=str(path))
  print('PASSOU',scene,width,'width',dat['width'],'image',dat['naturalWidth'], 'screenshot',path,flush=True)
  page.close()
 browser.close()
