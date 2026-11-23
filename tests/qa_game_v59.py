from pathlib import Path
from playwright.sync_api import sync_playwright
import json
r=Path(__file__).resolve().parents[1];html=(r/'PREVIA_OFFLINE_V59.html').read_text();out=r/'previews/v59';out.mkdir(exist_ok=True,parents=True)
setup='''<script>window.__saved=new Map(%s);Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__saved.get(k)??null,setItem:(k,v)=>window.__saved.set(k,String(v)),removeItem:k=>window.__saved.delete(k),clear:()=>window.__saved.clear()}});</script>'''
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for width,height in [(320,700),(390,844),(430,932)]:
  ctx=b.new_context(viewport={'width':width,'height':height},service_workers='block');page=ctx.new_page();errs=[];page.on('pageerror',lambda e:errs.append(str(e)));page.set_default_timeout(8000)
  source=html.replace('<head>','<head>'+(setup%'[]'),1);page.set_content(source,wait_until='domcontentloaded');page.wait_for_function("!document.querySelector('#create-screen').hidden")
  for _ in range(5):page.locator('#create-next').click()
  page.locator('[data-choice="whiskerslong"]').click()
  page.locator('#create-next').click();page.locator('[data-choice="none"]').click()
  for _ in range(6):page.locator('#create-next').click()
  page.locator('[data-choice="sunglasses"]').click();page.locator('[data-part-color="purple"]').click()
  page.locator('#create-next').click();page.locator('[data-choice="princess"]').click()
  page.locator('#create-next').click();page.locator('#create-next').click();page.locator('#create-next').click()
  assert page.locator('#play-screen').is_visible()
  old=page.evaluate('''() => [...window.__saved]''')
  saved=[json.loads(v) for k,v in old if k=='meu-pequeno-pet.save.v1'][0]
  assert saved['appearance']['mouth']=='none';assert saved['appearance']['snout']=='whiskerslong';assert saved['appearance']['partColors']['accessory']=='purple';assert saved['appearance']['outfit']=='princess'
  page.locator('#egg').click();page.wait_for_timeout(1200)
  assert page.locator('#pet-wrap').is_visible()
  page.screenshot(path=str(out/f'pet_nascido_{width}.png'),full_page=True)
  hydrated=page.evaluate('''() => [...window.__saved]''')
  resumed=ctx.new_page();resumed.on('pageerror',lambda e:errs.append(str(e)));resumed.set_content(html.replace('<head>','<head>'+(setup%json.dumps(hydrated)),1),wait_until='domcontentloaded')
  resumed.wait_for_function("!document.querySelector('#play-screen').hidden",timeout=9000)
  assert resumed.locator('#pet-wrap').is_visible()
  assert resumed.evaluate('document.documentElement.scrollWidth<=innerWidth')
  assert not errs,errs
  print('PASS',width,'hatch+reload preserved',saved['appearance']['mouth'],saved['appearance']['snout'])
  ctx.close()
 b.close()
