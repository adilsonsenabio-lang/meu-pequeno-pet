from pathlib import Path
import json,time,re,base64
from playwright.sync_api import sync_playwright
P=Path(__file__).resolve().parents[1]
WEB=P/'web'
mod_re=re.compile(r'''(?m)^(import\s+.*?\s+from\s+['"])(\./[^'"]+)(['"];?)''')
cache={}
def module(name):
 name=name.split('?')[0]
 if name in cache:return cache[name]
 source=(WEB/name).read_text()
 def replace(m):return m.group(1)+module(m.group(2).removeprefix('./'))+m.group(3)
 source=mod_re.sub(replace,source)
 cache[name]='data:text/javascript;base64,'+base64.b64encode(source.encode()).decode()
 return cache[name]
ht=(WEB/'index.html').read_text()
ht=re.sub(r'<link\s+rel="stylesheet"\s+href="\./([^"?]+)(?:\?[^\"]*)?">',lambda m:'<style>'+(WEB/m.group(1)).read_text()+'</style>',ht)
ht=re.sub(r'<script type="module" src="\./app\.js\?v=56"></script>','',ht)
ht=re.sub(r'<link\s+rel="manifest".*?>','',ht)
ht=re.sub(r'<link\s+rel="icon".*?>','',ht)
uri=module('app.js')
def start(page):
 page.set_content(ht,wait_until='domcontentloaded')
 page.evaluate('''() => {const saved = new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k),clear:()=>saved.clear()}});}''')
 page.evaluate('''async source => { await import(source) }''',uri)
 page.wait_for_timeout(300)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height in [(320,700),(390,844),(430,932)]:
  c=b.new_context(viewport={'width':width,'height':height},device_scale_factor=1)
  page=c.new_page();errors=[];page.on('pageerror',lambda e: errors.append(str(e)))
  start(page)
  print('\nWIDTH',width,'ERRORS',errors,'INITIAL',page.locator('#create-screen').get_attribute('hidden'))
  print('INIT BOX',page.locator('#create-art').bounding_box(),page.locator('.create-preview').bounding_box())
  # choose customized parts
  assert page.locator('#create-screen').is_visible()
  categories=['Cor','Cenário','Cauda','Asas','Corpo','Patas','Orelhas/Chifres','Cabeça','Marcas','Cabelo/Crina','Olhos','Focinho','Acessório','Roupinhas','Sapatinhos']
  page.screenshot(path=str(P/'previews'/f'V56_criacao_{width}.png'),full_page=True)
  values={2:'fox',3:'fairy',6:'fox',10:'gem',11:'long',14:'rollers'}
  for n,cat in enumerate(categories):
   title=page.locator('#category-title').inner_text()
   assert title==cat,(n,title,cat,errors)
   if n in values:
    page.locator(f'[data-choice="{values[n]}"]').click()
   if n in [2,3,6,10,11]:
    assert page.locator('#creator-adjust').is_visible(),title
    page.locator('#part-size').fill('1.2')
    page.locator('[data-part-color="mint"]').click()
    assert page.locator('#part-size-label').inner_text()=='120%'
    assert page.locator('[data-part-color="mint"]').get_attribute('aria-pressed')=='true'
   if n in [6,10,11]:
    page.screenshot(path=str(P/'previews'/f'V56_{cat.replace("/", "_")}_{width}.png'),full_page=True)
   if n < len(categories)-1:page.locator('#create-next').click()
  page.locator('#create-next').click();page.wait_for_timeout(200)
  stored=json.loads(page.evaluate("localStorage.getItem('meu-pequeno-pet.save.v1')"))
  print('SAVED',stored['appearance']['eyes'],stored['appearance']['snout'],stored['appearance']['ears'],stored['appearance']['partSizes'],stored['appearance']['partColors'])
  assert stored['appearance']['partSizes']['tail']==1.2
  page.locator('#egg').click();page.wait_for_timeout(1100)
  assert page.locator('#pet-wrap').is_visible()
  world=page.locator('#world').bounding_box()
  steps=[]
  for i in range(4):
   page.mouse.click(world['x']+world['width']/2,world['y']+world['height']*.25)
   page.wait_for_timeout(270)
   steps.append(page.locator('#pet-wrap').evaluate("e=>e.style.getPropertyValue('--air-height')"))
  print('WINGED FLIGHT',steps,'class',page.locator('#pet-wrap').get_attribute('class'),'motion',page.locator('#play-art').get_attribute('data-motion'))
  assert len(set(steps))==4 or (steps[-1]==steps[-2] and steps[0]!=steps[-1]),steps
  assert page.locator('#play-art').get_attribute('data-motion')=='fly'
  page.screenshot(path=str(P/'previews'/f'V56_voo_{width}.png'),full_page=True)
  page.wait_for_timeout(2400)
  print('LANDED?',page.locator('#pet-wrap').get_attribute('class'),'airheight',page.locator('#pet-wrap').evaluate("e=>e.style.getPropertyValue('--air-height')"))
  assert not page.locator('#pet-wrap').evaluate("e=>e.classList.contains('airborne')")
  print('OVERFLOW',page.evaluate("document.documentElement.scrollWidth - innerWidth"),'ERRORS',errors[:3])
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  assert not errors,errors
  c.close()
 # test non-winged four taps
 c=b.new_context(viewport={'width':390,'height':844});page=c.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 start(page)
 for i in range(3):page.locator('#create-next').click()
 assert page.locator('#category-title').inner_text()=='Asas'
 page.locator('[data-choice="none"]').click()
 for i in range(11):page.locator('#create-next').click()
 assert page.locator('#category-title').inner_text()=='Sapatinhos'
 page.locator('#create-next').click();page.locator('#egg').click();page.wait_for_timeout(1300)
 world=page.locator('#world').bounding_box();steps=[]
 for i in range(5):
  page.mouse.click(world['x']+world['width']/2,world['y']+world['height']*.23)
  page.wait_for_timeout(220)
  steps.append(page.locator('#pet-wrap').evaluate("e=>e.style.getPropertyValue('--air-height')"))
 print('NO WINGS 5 TAPS',steps, 'motion',page.locator('#play-art').get_attribute('data-motion'), 'errors',errors)
 assert steps[3]==steps[4] and len(set(steps[:4]))==4,steps
 page.screenshot(path=str(P/'previews'/'V56_sem_asas_390.png'),full_page=True)
 page.wait_for_timeout(2600)
 assert not page.locator('#pet-wrap').evaluate("e=>e.classList.contains('airborne')")
 assert not errors,errors
 b.close()
