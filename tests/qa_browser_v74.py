from playwright.sync_api import sync_playwright
import subprocess, json
from pathlib import Path
html=Path('/mnt/data/MEU_PEQUENO_PET_V74_TESTE_OFFLINE.html').read_text(encoding='utf-8')
core=Path('/mnt/data/v74_work/MEU_PEQUENO_PET_V74/web/core.js').as_uri()
node=f"import{{createSave,hatch}}from '{core}';const s=hatch(createSave(Date.now()),Date.now()).save;console.log(JSON.stringify(s));"
base=json.loads(subprocess.check_output(['node','--input-type=module','-e',node],text=True))
with sync_playwright() as w:
 b=w.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,energy in [(320,25),(390,35),(430,29)]:
  page=b.new_page(viewport={'width':width,'height':844})
  save={**base,'needs':{**base['needs'],'energy':energy}}
  initial={'meu-pequeno-pet.save.v1':json.dumps(save)}
  page.evaluate("data=>{const db=new Map(Object.entries(data));Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>db.has(k)?db.get(k):null,setItem:(k,v)=>db.set(k,String(v)),removeItem:k=>db.delete(k),clear:()=>db.clear(),key:i=>[...db.keys()][i]??null,get length(){return db.size;}}});}",initial)
  errors=[];page.on('pageerror',lambda err: errors.append(str(err)))
  page.set_content(html,wait_until='domcontentloaded',timeout=22000)
  page.wait_for_timeout(2600)
  data=page.evaluate('''() => ({
    playHidden:document.querySelector('#play-screen').hidden,
    funDisabled:document.querySelector('#action-groups [data-action-group="fun"]').disabled,
    secondaryDisabled:document.querySelector('#activity-open').disabled,
    sleepDisabled:document.querySelector('[data-need-indicator="sleep"]').disabled,
    htmlWidth:document.documentElement.scrollWidth,
    viewportWidth:window.innerWidth,
    needNames:[...document.querySelectorAll('.need-indicator .need-name')].map(x=>x.textContent)
  })''')
  assert data['playHidden'] is False,(width,energy,'not on play screen',data,errors)
  assert data['funDisabled']==(energy<30),(width,energy,'fun mismatch',data)
  assert data['secondaryDisabled']==(energy<30),(width,energy,'activity mismatch',data)
  assert data['sleepDisabled'] is False,(width,energy,'sleep should remain usable')
  assert data['htmlWidth']<=data['viewportWidth']+2,(width,energy,'horizontal overflow',data)
  assert len(data['needNames'])==8,(width,energy,'missing needs',data)
  assert not errors,(width,energy,errors[:4])
  if width==390:
   page.locator('#action-groups [data-action-group="fun"]').click()
   assert not page.locator('#activity-panel').is_hidden()
   page.screenshot(path='/mnt/data/MEU_PEQUENO_PET_V74_PREVIA_DIVERSAO.png',full_page=True)
  print(f'PASS {width}px energy={energy} funDisabled={data["funDisabled"]} needs=8 scrollOK')
  page.close()
 b.close()
