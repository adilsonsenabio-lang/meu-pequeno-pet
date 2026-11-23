from pathlib import Path
from playwright.sync_api import sync_playwright
import json, traceback
R=Path('/mnt/data/v69_work/MEU_PEQUENO_PET_V68')
HTML=(R/'PREVIA_OFFLINE_V69.html').read_text()
PRE=R/'previews/v69';PRE.mkdir(parents=True,exist_ok=True)
shim='''<script>window.__saved=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__saved.get(k)??null,setItem:(k,v)=>window.__saved.set(k,String(v)),removeItem:k=>window.__saved.delete(k),clear:()=>window.__saved.clear()}});</script>'''
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(320,700),(390,844),(430,932)]:
  c=b.new_context(viewport={'width':width,'height':height},service_workers='block',reduced_motion='reduce')
  page=c.new_page();page.set_default_timeout(25000)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content(HTML.replace('<head>','<head>'+shim,1),wait_until='domcontentloaded',timeout=60000)
  page.wait_for_function("document.querySelector('#create-screen')?.hidden===false",timeout=30000)
  # Scene + colors + mouth
  assert page.locator('#category-title').inner_text()=='Cenário'
  page.locator('[data-choice="beach"]').first.click()
  page.locator('#create-next').click()
  assert page.locator('#category-title').inner_text()=='Cores do pet'
  page.locator('#create-next').click()
  assert page.locator('#category-title').inner_text()=='Boca'
  assert page.locator('#step-count').inner_text()=='3 / 16'
  assert page.locator('#mouth-height').is_visible()
  assert page.locator('#mouth-height-label').inner_text()=='Centro'
  for v,target in [('-8','-17'),('8','-1'),('0','-9'),('-4','-13')]:
   page.locator('#mouth-height').evaluate('(el,v)=>{el.value=v;el.dispatchEvent(new Event("input",{bubbles:true}));}',v)
   assert page.locator('#create-art .atelier-mouth').get_attribute('data-mouth-offset')==v
   assert page.locator('#create-art .atelier-mouth').get_attribute('transform')==f'translate(0 {target})'
  assert page.evaluate("JSON.parse(window.__saved.get('meu-pequeno-pet.save.v1.criacao')).draft.mouthOffset")==-4
  assert page.locator('#mouth-height-label').inner_text()=='↑ 4 px'
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), 'horizontal overflow'
  if width==390:page.screenshot(path=str(PRE/'V69_BOCA_CONTROLE_390.png'),full_page=True)
  for _ in range(14):page.locator('#create-next').click()
  page.wait_for_function('document.querySelector("#play-screen")?.hidden===false',timeout=20000)
  key='meu-pequeno-pet.save.v1'
  saved=page.evaluate('(k)=>JSON.parse(window.__saved.get(k))',key)
  assert saved['appearance']['mouthOffset']==-4, saved['appearance'].get('mouthOffset')
  assert saved['scene']=='beach'
  page.locator('#egg').click()
  page.wait_for_timeout(1050)
  assert page.locator('#play-art .atelier-mouth').get_attribute('data-mouth-offset')=='-4'
  assert not errors,errors
  if width==390:page.screenshot(path=str(PRE/'V69_PRAIA_JOGO_390.png'),full_page=True)
  print('PASS',width,'Boca -4 + praia + nascimento, nenhum erro JS')
  c.close()
 b.close()
