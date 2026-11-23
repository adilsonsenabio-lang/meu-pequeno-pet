from pathlib import Path
from playwright.sync_api import sync_playwright
src=Path('/mnt/data/MEU_PEQUENO_PET_V84_1_TESTE_OFFLINE.html').read_text(encoding='utf-8')
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for name in ('garden','sunset'):
  pg=b.new_page(viewport={'width':390,'height':900})
  errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
  pg.set_content(src,wait_until='domcontentloaded',timeout=40000)
  pg.wait_for_selector('#choice-list button[data-choice="'+name+'"]')
  pg.locator(f'#choice-list button[data-choice="{name}"]').click()
  for i in range(16):pg.locator('#create-next').click(timeout=12000)
  pg.locator('#egg').click()
  pg.wait_for_timeout(2200)
  state=pg.evaluate('''() => {const stage=document.querySelector('#scene-art .v64-scene-stage');const img=stage.querySelector('img.v64-scene-frame');return {scene:stage.dataset.v64Scene,ready:img.complete&&img.naturalWidth===320,markers:stage.querySelectorAll('.v64-gaze-marker').length,eggHidden:document.querySelector('#egg').hidden}}''')
  assert state['scene']==name and state['ready'] and state['markers']==3 and state['eggHidden'],state
  assert not errors,errors
  pg.screenshot(path=f'/mnt/data/MEU_PEQUENO_PET_V84_1_JOGO_{name.upper()}.png',full_page=False)
  print('BIRTH PASS',name,state)
  pg.close()
 b.close()
