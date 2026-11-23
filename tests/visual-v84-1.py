"""V84.1 creation + hatch smoke. Uses standalone offline HTML, no network."""
from playwright.sync_api import sync_playwright
from pathlib import Path
from PIL import Image,ImageDraw
import json
file=Path('/mnt/data/MEU_PEQUENO_PET_V84_1_TESTE_OFFLINE.html')
assert file.is_file()
HTML=file.read_text(encoding='utf-8')
reports=[]
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width in (320,390,430):
  pg=b.new_page(viewport={'width':width,'height':920},device_scale_factor=1)
  errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
  pg.set_content(HTML,wait_until='domcontentloaded',timeout=60000)
  pg.wait_for_selector('#choice-list button[data-choice="garden"]',timeout=30000)
  assert pg.locator('#create-screen').is_visible()
  for scene in ('garden','sunset','snow','forest','christmas'):
   pg.locator(f'#choice-list button[data-choice="{scene}"]').click()
   pg.wait_for_timeout(160)
   status=pg.evaluate('''() => {const s=document.querySelector('#create-scene-art .v64-scene-stage');const img=s?.querySelector('img.v64-scene-frame');return {scene:s?.dataset.v64Scene,loaded:img?.complete&&img?.naturalWidth>0,width:img?.naturalWidth,overflow:document.documentElement.scrollWidth>innerWidth,santa:s?.querySelectorAll('.v64-overlay-santa').length}}''')
   assert status['scene']==scene,status
   assert status['loaded'] and status['width']==320,status
   assert not status['overflow'],(width,scene,status)
   if scene=='christmas':assert status['santa']==0,status
   print('CREATE PASS',width,scene,status,flush=True)
   if width==390 and scene in ('garden','sunset','snow'):
    pg.locator('#create-scene-art').screenshot(path=f'/mnt/data/MEU_PEQUENO_PET_V84_1_{scene.upper()}_CRIACAO.png')
  if width==390:
   # Test birth with snow scene selected
   pg.locator('#choice-list button[data-choice="snow"]').click()
   for i in range(16): pg.locator('#create-next').click(timeout=10000)
   assert pg.locator('#play-screen').is_visible()
   assert pg.locator('#egg').is_visible()
   pg.locator('#egg').click()
   pg.wait_for_timeout(2600)
   info=pg.evaluate('''() => {let s=document.querySelector('#scene-art .v64-scene-stage');let im=s?.querySelector('img.v64-scene-frame');return {scene:s?.dataset.v64Scene,loaded:im?.complete&&im?.naturalWidth===320,markers:s?.querySelectorAll('.v64-gaze-marker').length,eggHidden:document.querySelector('#egg').hidden}}''')
   print('HATCH',info,flush=True)
   assert info['scene']=='snow' and info['loaded'] and info['markers']==2 and info['eggHidden'],info
   pg.screenshot(path='/mnt/data/MEU_PEQUENO_PET_V84_1_NEVE_JOGO.png',full_page=False)
  assert not errors,errors
  reports.append({'width':width,'errors':errors,'create':True,'birthSnow':width==390})
  pg.close()
 b.close()
Path('/mnt/data/MEU_PEQUENO_PET_V84_1_BROWSER_RELATORIO.json').write_text(json.dumps(reports,indent=2,ensure_ascii=False))
print('PLAYWRIGHT SMOKE V84.1 PASS')
