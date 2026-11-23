"""Validação em Chromium: criação, pausa, retorno, salvamento e responsividade V57."""
import json, os, pathlib, subprocess, time, socket
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
PORT=4187
OUT=ROOT/'previews'/'v57';OUT.mkdir(parents=True,exist_ok=True)
HTML=(ROOT/'PREVIA_OFFLINE_V57.html').read_text()
def load(page, saved=None):
 storage=json.dumps(saved or {},ensure_ascii=False)
 init=f"""<script>window.__fakeStorage=new Map(Object.entries({storage}));Object.defineProperty(window,'localStorage',{{configurable:true,value:{{getItem:k=>window.__fakeStorage.get(k)??null,setItem:(k,v)=>window.__fakeStorage.set(k,String(v)),removeItem:k=>window.__fakeStorage.delete(k),clear:()=>window.__fakeStorage.clear()}}}});</script>"""
 page.set_content(HTML.replace('<head>','<head>'+init,1),wait_until='domcontentloaded')
 try:page.wait_for_function("() => document.querySelector('#create-screen')?.hidden===false || document.querySelector('#play-screen')?.hidden===false")
 except Exception:
  print('DEBUG after load',page.locator('body').inner_text()[:500],page.evaluate("Object.fromEntries(window.__fakeStorage||new Map())"),flush=True);raise
def restart(ctx,page,errors):
 saved=page.evaluate('Object.fromEntries(window.__fakeStorage.entries())')
 page.close()
 page=ctx.new_page();page.set_default_timeout(5000);page.on('pageerror',lambda e:errors.append(str(e)))
 load(page,saved)
 return page
with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  for w,h in [(320,700),(390,844),(430,932)]:
   ctx=browser.new_context(viewport={'width':w,'height':h},device_scale_factor=1,locale='pt-BR',service_workers='block')
   page=ctx.new_page();page.set_default_timeout(5000);errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   load(page)
   assert page.locator('#category-title').inner_text()=='Corpo'
   assert page.locator('#create-art').is_visible()
   # A linha da base do SVG em relação à prévia: deve ficar no terço inferior.
   boxes=page.evaluate('''() => { const pet=document.querySelector('#create-art').getBoundingClientRect(),scene=document.querySelector('.create-preview').getBoundingClientRect();return {pet: {top:pet.top,bottom:pet.bottom,height:pet.height},scene:{top:scene.top,bottom:scene.bottom,height:scene.height}};}''')
   foot_y=boxes['pet']['top']+boxes['pet']['height']*185/200
   pct=(foot_y-boxes['scene']['top'])/boxes['scene']['height']
   assert .76<=pct<=.94,(w,'ground',pct)
   print('GROUND',w,'baseline',round(pct,3),flush=True)
   page.screenshot(path=str(OUT/f'criacao_corpo_{w}.png'),full_page=True)
   print('click slim',flush=True);page.locator('[data-choice="slim"]').click()
   print('head',flush=True);page.locator('#create-next').click();assert page.locator('#category-title').inner_text()=='Cabeça'
   print('fox',flush=True);page.locator('[data-choice="fox"]').click()
   page.locator('#create-next').click();page.locator('#create-next').click()
   assert page.locator('#category-title').inner_text()=='Orelhas/Chifres'
   print('fox',flush=True);page.locator('[data-choice="fox"]').click()
   page.locator('#part-size').fill('1.2')
   page.locator('[data-part-color="gold"]').click()
   page.screenshot(path=str(OUT/f'orelha_raposa_{w}.png'),full_page=True)
   page.locator('#create-next').click();assert page.locator('#category-title').inner_text()=='Olhos'
   print('galaxy',flush=True);page.locator('[data-choice="galaxy"]').click()
   page.locator('[data-part-color="mint"]').click()
   page.screenshot(path=str(OUT/f'olhos_cor_{w}.png'),full_page=True)
   page.locator('#create-next').click();assert page.locator('#category-title').inner_text()=='Focinho'
   print('cat',flush=True);page.locator('[data-choice="cat"]').click()
   page.locator('#create-next').click();assert page.locator('#category-title').inner_text()=='Boca'
   assert page.locator('#choice-list .choice').count()==8
   print('tongue',flush=True);page.locator('[data-choice="tongue"]').click()
   page.locator('#part-size').fill('1.15')
   page.locator('[data-part-color="purple"]').click()
   page.screenshot(path=str(OUT/f'bocas_{w}.png'),full_page=True)
   page.locator('#create-next').click();assert page.locator('#category-title').inner_text()=='Marcas'
   print('freckles',flush=True);page.locator('[data-choice="freckles"]').click()
   page.screenshot(path=str(OUT/f'marcas_{w}.png'),full_page=True)
   # Reabrir enquanto ainda está criando (nenhum pet nasceu).
   saved_draft=json.loads(page.evaluate("localStorage.getItem('meu-pequeno-pet.save.v1.criacao')"))
   assert saved_draft['draft']['mouth']=='tongue' and saved_draft['step']==7,saved_draft
   page=restart(ctx,page,errors)
   assert page.locator('#category-title').inner_text()=='Marcas'
   page.locator('#create-back').click();assert page.locator('[data-choice="tongue"]').get_attribute('aria-pressed')=='true'
   assert page.locator('#part-size-label').inner_text()=='115%'
   assert page.locator('[data-part-color="purple"]').get_attribute('aria-pressed')=='true'
   page.locator('#create-next').click()
   # Complete restantes (Marcas até Cenário).
   for i in range(8):page.locator('#create-next').click()
   assert page.locator('#category-title').inner_text()=='Cenário', page.locator('#category-title').inner_text()
   page.locator('#create-next').click()
   page.wait_for_timeout(160)
   assert page.locator('#play-screen').is_visible()
   info=json.loads(page.evaluate("localStorage.getItem('meu-pequeno-pet.save.v1')"))
   a=info['appearance'];assert a['head']=='fox' and a['body']=='slim' and a['mouth']=='tongue' and a['ears']=='fox',a
   assert 'mouth' in a['partColors'] and a['partSizes']['mouth']==1.15
   assert page.evaluate("localStorage.getItem('meu-pequeno-pet.save.v1.criacao')")==None
   page.locator('#egg').click();page.wait_for_timeout(1100)
   assert page.locator('#pet-wrap').is_visible()
   initial=json.loads(page.evaluate("localStorage.getItem('meu-pequeno-pet.save.v1')"));assert initial['phase']=='baby'
   # Minimal save checkpoint by backgrounding; no time progress while hidden.
   page.evaluate("""() => {Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));}""")
   hidden=json.loads(page.evaluate("localStorage.getItem('meu-pequeno-pet.save.v1')"))
   page.wait_for_timeout(300)
   page.evaluate("""() => {Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));}""")
   page.wait_for_timeout(120)
   page=restart(ctx,page,errors)
   assert page.locator('#play-screen').is_visible()
   restored=json.loads(page.evaluate("localStorage.getItem('meu-pequeno-pet.save.v1')"))
   assert restored['phase']=='baby' and restored['appearance']==a
   assert all(abs(restored['needs'][k]-hidden['needs'][k])<=.25 for k in hidden['needs']),(hidden['needs'],restored['needs'])
   assert page.locator('#phase-name').inner_text().endswith('Bebê')
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   assert not errors,(w,errors)
   page.screenshot(path=str(OUT/f'jogo_reaberto_{w}.png'),full_page=True)
   print('PASS',w,'boca/cor/tamanho/marcas/salvar/retomar',len(errors),'erros',flush=True)
   ctx.close()
  browser.close()
