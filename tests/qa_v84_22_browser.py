"""Smoke test do HTML offline V84.22 nas larguras 320, 390, 430."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json

root=Path(__file__).resolve().parents[1]
html=(root/'JOGAR_OFFLINE.html').read_text(encoding='utf-8')
result={}
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-web-security','--allow-file-access-from-files'])
    for width in (320,390,430):
        page=browser.new_page(viewport={'width':width,'height':850},device_scale_factor=1)
        errors=[]
        page.on('pageerror',lambda err: errors.append(str(err)))
        page.set_content(html,wait_until='domcontentloaded',timeout=120000)
        page.wait_for_timeout(320)
        label=page.get_by_text('Halloween',exact=True).first
        label.click(timeout=5000)
        page.wait_for_timeout(180)
        status=page.evaluate('''() => {
          const stage=document.querySelector('#create-scene-art .v64-scene-stage');
          const ghost=stage?.querySelector('.v64-overlay-ghost');
          return {
            stageScene:stage?.dataset.v64Scene,
            hasGhost: Boolean(ghost),
            animationDuration:ghost ? getComputedStyle(ghost).animationDuration:null,
            imagesTotal:document.images.length,
            brokenImages:[...document.images].filter(i=>i.complete && i.naturalWidth===0).length,
            stageWidth:stage?.getBoundingClientRect().width || 0
          };
        }''')
        page.screenshot(path=str(Path('/mnt/data')/f'V84_22_HALLOWEEN_{width}.png'),full_page=False)
        assert status['stageScene']=='halloween',status
        assert status['hasGhost'] and status['animationDuration']=='15s',status
        assert status['brokenImages']==0,status
        assert not errors,errors
        result[str(width)]={'status':'PASSOU',**status,'js_errors':errors}
        page.close()
    browser.close()
print(json.dumps(result,indent=2,ensure_ascii=False))
