"""V84.2 smoke: creation, hatch, 3 corrected scenes in mobile widths."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json
html=Path('/mnt/data/MEU_PEQUENO_PET_V84_2_TESTE_OFFLINE.html').read_text(encoding='utf-8')
reports=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width in (320,390,430):
  page=browser.new_page(viewport={'width':width,'height':920},device_scale_factor=1)
  errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(html,wait_until='domcontentloaded',timeout=60000)
  page.wait_for_selector('#choice-list button[data-choice="sunset"]',timeout=30000)
  assert page.locator('#create-screen').is_visible()
  for scene in ('sunset','beach','night','garden','snow','forest','christmas','space'):
   page.locator(f'#choice-list button[data-choice="{scene}"]').click()
   page.wait_for_timeout(135)
   status=page.evaluate('''() => {const s=document.querySelector('#create-scene-art .v64-scene-stage');const img=s?.querySelector('.v64-scene-frame');return {scene:s?.dataset.v64Scene,loaded:img?.complete&&img?.naturalWidth===320,overflow:document.documentElement.scrollWidth>innerWidth,planet:s?.querySelectorAll('.v77-orbit-planet').length||0}}''')
   assert status['scene']==scene and status['loaded'] and not status['overflow'],(width,scene,status)
   if scene=='space':assert status['planet']==1,(width,status)
   print('CREATE PASS',width,scene,flush=True)
   if width==390 and scene in ('sunset','beach','night'):
    page.locator('#create-scene-art').screenshot(path=f'/mnt/data/MEU_PEQUENO_PET_V84_2_{scene.upper()}_CRIACAO.png')
  if width==390:
   for scene in ('beach',):
    page.locator(f'#choice-list button[data-choice="{scene}"]').click()
    for i in range(16):page.locator('#create-next').click(timeout=10000)
    assert page.locator('#play-screen').is_visible()
    assert page.locator('#egg').is_visible()
    page.locator('#egg').click()
    page.wait_for_timeout(1600)
    info=page.evaluate('''() => {const s=document.querySelector('#scene-art .v64-scene-stage');const i=s?.querySelector('.v64-scene-frame');return {scene:s?.dataset.v64Scene,loaded:i?.naturalWidth===320,markers:s?.querySelectorAll('.v64-gaze-marker').length,eggHidden:document.querySelector('#egg').hidden}}''')
    print('HATCH',info,flush=True)
    assert info['scene']=='beach' and info['loaded'] and info['markers']==3 and info['eggHidden'],info
    page.locator('#world').screenshot(path='/mnt/data/MEU_PEQUENO_PET_V84_2_PRAIA_JOGO.png')
  assert not errors,errors
  reports.append({'width':width,'ok':True,'errors':errors})
  page.close()
 browser.close()
Path('/mnt/data/MEU_PEQUENO_PET_V84_2_BROWSER_RELATORIO.json').write_text(json.dumps(reports,indent=2))
print('V84.2 PLAYWRIGHT PASS')
