from pathlib import Path
import re, base64, html, json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
WEB=ROOT/'web'
mod_re=re.compile(r"(?m)^(import\s+.*?\s+from\s+['\"])(\./[^'\"]+)(['\"];?)")
cache={}
def module(name):
 name=name.split('?')[0]
 if name in cache:return cache[name]
 s=(WEB/name).read_text()
 def replace(m):return m.group(1)+module(m.group(2).removeprefix('./'))+m.group(3)
 s=mod_re.sub(replace,s)
 u='data:text/javascript;base64,'+base64.b64encode(s.encode()).decode()
 cache[name]=u
 return u
# consolidate styles into html; text only in set_content, avoid fetching URLs
ht=(WEB/'index.html').read_text()
ht=re.sub(r'<link\s+rel="stylesheet"\s+href="\./([^"?]+)(?:\?[^\"]*)?">',lambda m:'<style>'+(WEB/m.group(1)).read_text()+'</style>',ht)
ht=re.sub(r'<script type="module" src="./app\.js\?v=55"></script>','',ht)
ht=re.sub(r'<link\s+rel="manifest".*?>','',ht)
ht=re.sub(r'<link\s+rel="icon".*?>','',ht)
uri=module('app.js')

with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 for width,height in [(320,700),(390,844),(430,932)]:
  page=b.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
  page.set_content(ht,wait_until='domcontentloaded')
  page.evaluate('''() => {const saved = new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k),clear:()=>saved.clear()}});}''')
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  try:
   page.evaluate('''async source => { await import(source) }''',uri)
   page.wait_for_timeout(350)
   print('SCREEN',width,'create hidden',page.locator('#create-screen').get_attribute('hidden'),'play hidden',page.locator('#play-screen').get_attribute('hidden'),'errors',errors[:2])
   print('PREVIEW BOUNDS',page.locator('.create-preview').bounding_box())
   # navigate to eyes (category index determined by map)
   next=page.locator('#create-next')
   for _ in range(10):next.click(timeout=4000)
   print('CATEGORY',page.locator('#category-title').inner_text(),'CHOICES',page.locator('#choice-list .choice').count())
   # choose a new eye and confirm preview updates
   page.locator('[data-choice="galaxy"]').click()
   page.screenshot(path=str(ROOT/'previews'/f'v55_olhos_{width}px.png'),full_page=True)
   print('GALAXY SELECTED',page.locator('[data-choice="galaxy"]').get_attribute('aria-pressed'))
   for _ in range(2):next.click(timeout=4000)
   print('CATEGORY2',page.locator('#category-title').inner_text())
   # advance to shoes after steps; inspect conditional
   for _ in range(2):next.click(timeout=4000)
   print('SHOES?',page.locator('#category-title').inner_text(),page.locator('#choice-list .choice').count())
   page.locator('[data-choice="rollers"]').click()
   page.screenshot(path=str(ROOT/'previews'/f'v55_calcados_{width}px.png'),full_page=True)
   print('ROLLERS SELECTED',page.locator('[data-choice="rollers"]').get_attribute('aria-pressed'))
   next.click()
   page.wait_for_timeout(300)
   print('SAVED', (page.evaluate('localStorage.getItem("meu-pequeno-pet.save.v1")') or '')[:160])
   print('FINAL SCREEN',page.locator('#play-screen').get_attribute('hidden'),'WORLD',page.locator('#world').bounding_box(), 'errors',errors[:2])
   assert page.locator('#choice-list .choice').count() == 14
   stored=json.loads(page.evaluate('localStorage.getItem("meu-pequeno-pet.save.v1")'))
   assert stored['appearance']['eyes']=='galaxy'
   assert stored['appearance']['shoes']=='rollers'
   assert not errors
   page.locator('#egg').click()
   page.wait_for_timeout(1300)
   page.screenshot(path=str(ROOT/'previews'/f'v55_jogo_{width}px.png'),full_page=True)
  except Exception as e:
   print('FAILED',width,repr(e)[:1000], 'errors',errors[:4]);page.screenshot(path=str(ROOT/'previews'/f'v55_erro_{width}px.png'),full_page=True)
  page.close()
 b.close()
