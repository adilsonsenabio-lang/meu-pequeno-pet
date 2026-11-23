"""V84.14: real Chromium check of portable HTML and scene UI."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,threading,http.server,functools
handler=functools.partial(http.server.SimpleHTTPRequestHandler,directory='/mnt/data')
server=http.server.ThreadingHTTPServer(('127.0.0.1',8766),handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
URL='http://127.0.0.1:8766/MEU_PEQUENO_PET_V84_14_JOGAR_OFFLINE.html'
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-web-security','--allow-file-access-from-files'])
 page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
 errors=[]
 page.on('pageerror',lambda err:errors.append(str(err)))
 print('Loading',URL)
 page.set_content(Path('/mnt/data/MEU_PEQUENO_PET_V84_14_JOGAR_OFFLINE.html').read_text(encoding='utf-8'),wait_until='domcontentloaded',timeout=100000)
 page.wait_for_timeout(1200)
 print('Title:',page.title())
 print('Stages:',page.locator('.v64-scene-stage').count())
 print('Text excerpt:',page.locator('body').inner_text(timeout=20000)[:500].replace('\n',' | '))
 print('Images loaded:',page.evaluate("""() => ({all:document.images.length, failed:[...document.images].filter(i=>i.complete && i.naturalWidth===0).length, stages:document.querySelectorAll('.v64-scene-stage').length})"""))
 page.screenshot(path='/mnt/data/v84_14_browser_initial.png',full_page=False)
 for key in ['Floresta','Entardecer','Noite','Deserto']:
  try:
   label=page.get_by_text(key,exact=True).first
   label.click(timeout=2500)
   page.wait_for_timeout(150)
   stage=page.locator('#create-scene-art .v64-scene-stage').first
   scene=stage.get_attribute('data-v64-scene')
   image=stage.locator('img.v64-scene-frame').first
   nw=image.evaluate('(i)=>i.naturalWidth')
   halos=stage.locator('.v8414-lantern-halo').count()
   print('Selected',key,'stage',scene,'width',nw,'halos',halos)
   page.screenshot(path=f'/mnt/data/v84_14_browser_{key.lower()}.png',full_page=False)
  except Exception as e: print('Cannot select',key,str(e)[:180])
 print('JS errors:',errors[:12])
 browser.close()
server.shutdown()
