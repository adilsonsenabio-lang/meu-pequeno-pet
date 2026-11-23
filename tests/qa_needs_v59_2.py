from pathlib import Path
from playwright.sync_api import sync_playwright
import json, time
r=Path(__file__).resolve().parents[1]
html=(r/'PREVIA_OFFLINE_V59.html').read_text()
out=r/'previews/v59_2';out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for w,h in [(320,700),(390,844),(430,932)]:
  ctx=b.new_context(viewport={'width':w,'height':h},service_workers='block')
  pg=ctx.new_page();pg.set_default_timeout(10000);errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.set_content(html.replace('<head>', '<head><script>window.__saved=new Map();Object.defineProperty(window,"localStorage",{configurable:true,value:{getItem:k=>window.__saved.get(k)??null,setItem:(k,v)=>window.__saved.set(k,String(v)),removeItem:k=>window.__saved.delete(k),clear:()=>window.__saved.clear()}});</script>',1),wait_until='domcontentloaded')
  pg.wait_for_function("document.querySelector('#create-screen')&&!document.querySelector('#create-screen').hidden")
  # Complete creator steps
  for _ in range(16):
   pg.locator('#create-next').click()
   if not pg.locator('#create-screen').is_visible():break
  pg.wait_for_function("document.querySelector('#play-screen')&&!document.querySelector('#play-screen').hidden")
  pg.locator('#egg').click()
  pg.wait_for_function("document.querySelector('#egg').hidden&&document.querySelector('#pet-wrap')&&!document.querySelector('#pet-wrap').hidden",timeout=8000)
  pg.wait_for_timeout(1500)
  dashboard=pg.locator('#needs-dashboard');assert dashboard.is_visible()
  indicators=dashboard.locator('button.need-indicator');assert indicators.count()==8,indicators.count()
  assert pg.locator('#action-groups > button').count()==2
  assert pg.locator('#action-groups > button').all_text_contents()==['Diversão','Visual']
  assert not pg.locator('#care-grid').is_visible()
  assert pg.evaluate('document.documentElement.scrollWidth<=innerWidth'),'overflow-x'
  # 4 cards wide, 2 rows
  boxes=indicators.evaluate_all('(buttons)=>buttons.map(b=>({x:b.getBoundingClientRect().x,y:b.getBoundingClientRect().y,width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height}))')
  assert len({round(v['y']) for v in boxes})==2,(w,boxes)
  assert all(q['width']>55 and q['height']>=76 for q in boxes)
  pg.screenshot(path=str(out/f'barra_de_necessidades_{w}.png'),full_page=True)
  print('PASS layout',w,flush=True)
  if w!=390:
   ctx.close()
   continue
  # click health -> may enter long care, use play to test direct control
  print("Testing play",flush=True)
  pg.locator('#needs-dashboard [data-need-indicator="play"]').click()
  assert pg.locator('#toy-picker').is_visible(),'direct play did not reveal toys'
  pg.locator('#toy-close').click()
  assert pg.locator('#toy-picker').is_hidden()
  # clicking food triggers care (async)
  print("Testing food",flush=True)
  pg.locator('#needs-dashboard [data-need-indicator="food"]').click()
  pg.wait_for_function("document.querySelector('#world').dataset.state==='perceiving'||document.querySelector('#world').dataset.state==='moving'||document.querySelector('#world').dataset.state==='acting'||document.querySelector('#world').dataset.state==='preparing'",timeout=5000)
  assert pg.locator('#needs-dashboard [data-need-indicator="food"]').is_disabled()
  pg.wait_for_function("document.querySelector('#world').dataset.state==='ready'",timeout=25000)
  assert pg.locator('#needs-dashboard [data-need-indicator="food"]').is_enabled()
  # sleep/wake test
  print("Testing sleep",flush=True)
  pg.locator('#needs-dashboard [data-need-indicator="sleep"]').click()
  pg.wait_for_function("document.querySelector('#world').dataset.state==='sleeping'",timeout=25000)
  assert pg.locator('#needs-dashboard [data-need-indicator="sleep"]').is_enabled()
  assert pg.locator('#needs-dashboard [data-need-indicator="sleep"] .need-name').inner_text()=='Acordar'
  pg.locator('#needs-dashboard [data-need-indicator="sleep"]').click()
  pg.wait_for_function("document.querySelector('#world').dataset.state==='ready'",timeout=15000)
  assert pg.locator('#needs-dashboard [data-need-indicator="sleep"] .need-name').inner_text()=='Sono'
  assert not errs,errs
  print('PASS',w,'width, 8 clickable indicators, 2 bottom buttons, food/play/sleep/wake, no overflow')
  ctx.close()
 b.close()
