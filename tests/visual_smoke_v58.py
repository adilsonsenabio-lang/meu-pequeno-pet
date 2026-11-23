"""Visual QA V58 — standalone HTML on Chromium at 320/390/430 widths."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
R=Path(__file__).resolve().parents[1]
HTML=(R/'PREVIA_OFFLINE_V58.html').read_text()
OUT=R/'previews'/'v58';OUT.mkdir(parents=True,exist_ok=True)
INJECT="""<script>window.__saved=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__saved.get(k)??null,setItem:(k,v)=>window.__saved.set(k,String(v)),removeItem:k=>window.__saved.delete(k),clear:()=>window.__saved.clear()}});</script>"""
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(320,700),(390,844),(430,932)]:
  context=browser.new_context(viewport={'width':width,'height':height},locale='pt-BR',device_scale_factor=1,service_workers='block')
  page=context.new_page();page.set_default_timeout(6000)
  errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
  page.set_content(HTML.replace('<head>','<head>'+INJECT,1),wait_until='domcontentloaded')
  page.wait_for_function("() => document.querySelector('#create-screen')?.hidden===false")
  assert page.locator('#category-title').inner_text()=='Corpo'
  def info():
   return page.evaluate('''() => {const pet=document.querySelector('#create-art').getBoundingClientRect(),scene=document.querySelector('.create-preview').getBoundingClientRect(),world=document.querySelector('#world');let ground=pet.top+pet.height*192/200;return{petHeight:pet.height,sceneHeight:scene.height,petX:pet.x,sceneX:scene.x,groundPercent:(ground-scene.top)/scene.height,docW:document.documentElement.scrollWidth,viewW:innerWidth,worldHeight:getComputedStyle(world).height};}''')
  layout=info();assert layout['docW']<=width,layout
  assert .76<=layout['groundPercent']<=.98,(width,layout)
  page.screenshot(path=str(OUT/f'criacao_{width}.png'),full_page=True)
  for _ in range(5):page.locator('#create-next').click()
  assert page.locator('#category-title').inner_text()=='Focinho'
  page.locator('#create-next').click();assert page.locator('#category-title').inner_text()=='Boca'
  page.locator('[data-choice="heart"]').click()
  page.screenshot(path=str(OUT/f'boca_coracao_{width}.png'),full_page=True)
  for _ in range(7):page.locator('#create-next').click()
  assert page.locator('#category-title').inner_text()=='Roupinhas'
  assert page.locator('#choice-list .choice').count()==21
  page.locator('[data-choice="raincoat"]').click();page.screenshot(path=str(OUT/f'roupas_capa_{width}.png'),full_page=True)
  page.locator('[data-choice="dinosaur"]').click();page.screenshot(path=str(OUT/f'roupas_dinossauro_{width}.png'),full_page=True)
  sel=page.evaluate("JSON.parse(localStorage.getItem('meu-pequeno-pet.save.v1.criacao'))")
  assert sel['draft']['outfit']=='dinosaur' and sel['draft']['mouth']=='heart'
  page.locator('#create-next').click();assert page.locator('#category-title').inner_text()=='Sapatinhos'
  page.locator('#create-next').click();assert page.locator('#category-title').inner_text()=='Cenário'
  page.locator('#create-next').click();page.wait_for_timeout(200)
  assert page.locator('#play-screen').is_visible()
  saved=page.evaluate("JSON.parse(localStorage.getItem('meu-pequeno-pet.save.v1'))")
  assert saved['appearance']['outfit']=='dinosaur' and saved['appearance']['mouth']=='heart'
  page.locator('#egg').click();page.wait_for_timeout(1000)
  assert page.locator('#pet-wrap').is_visible()
  page.screenshot(path=str(OUT/f'jogo_{width}.png'),full_page=True)
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  assert not errs,errs
  print('PASS',width,layout,'outfit',saved['appearance']['outfit'],'errors',len(errs),flush=True)
  context.close()
 browser.close()
