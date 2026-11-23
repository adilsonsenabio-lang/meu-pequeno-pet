from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];OUT=R/'previews/v59';OUT.mkdir(parents=True,exist_ok=True)
HTML=(R/'PREVIA_OFFLINE_V59.html').read_text()
INJECT='''<script>window.__saved=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__saved.get(k)??null,setItem:(k,v)=>window.__saved.set(k,String(v)),removeItem:k=>window.__saved.delete(k),clear:()=>window.__saved.clear()}});</script>'''
with sync_playwright() as p:
 b=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(320,700),(390,844),(430,932)]:
  context=b.new_context(viewport={'width':width,'height':height},device_scale_factor=1,locale='pt-BR',service_workers='block')
  page=context.new_page();page.set_default_timeout(7000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(HTML.replace('<head>','<head>'+INJECT,1),wait_until='domcontentloaded');page.wait_for_function("() => document.querySelector('#create-screen')?.hidden===false")
  def nav(n=1):
   for i in range(n):page.locator('#create-next').click()
  def shot(name):
   page.screenshot(path=str(OUT/f'{name}_{width}.png'),full_page=True)
  assert page.locator('#category-title').inner_text()=='Corpo'
  page.locator('[data-choice="slim"]').click();shot('corpo_magro')
  nav(4);assert page.locator('#category-title').inner_text()=='Olhos'
  page.locator('[data-choice="lashes"]').click();shot('cilios')
  assert page.locator('[data-choice="shades"]').count()==0
  nav();assert page.locator('#category-title').inner_text()=='Focinho'
  page.locator('[data-choice="whiskerslong"]').click();shot('bigodes')
  nav();assert page.locator('#category-title').inner_text()=='Boca'
  page.locator('[data-choice="heart"]').click();shot('boca_coracao')
  page.locator('[data-choice="none"]').click();shot('sem_boca')
  nav(6);assert page.locator('#category-title').inner_text()=='Acessório'
  page.locator('[data-choice="sunglasses"]').click();page.locator('[data-part-color="mint"]').click();shot('oculos_cor')
  nav();assert page.locator('#category-title').inner_text()=='Roupinhas'
  page.locator('[data-choice="raincoat"]').click();shot('roupa_no_magro')
  assert not errors,errors
  metrics=page.evaluate("""() => ({body:document.documentElement.scrollWidth,window:innerWidth,step:document.getElementById('step-count').textContent,selection:document.querySelector('.choice.selected')?.dataset.choice})""")
  assert metrics['body']<=width,metrics
  print('PASS',width,metrics,flush=True);context.close()
 b.close()
