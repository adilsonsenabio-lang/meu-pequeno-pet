from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1];html=(R/'PREVIA_OFFLINE_V59_3.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 for width,height,body,model in [(320,720,'slim','astronaut'),(390,844,'chubby','dress'),(430,932,'round','hoodie')]:
  ctx=browser.new_context(viewport={'width':width,'height':height},service_workers='block')
  page=ctx.new_page();errors=[]
  page.on('pageerror',lambda err:errors.append(str(err)))
  safe_html=html.replace('<head>', '<head><script>const __storageMap = new Map();Object.defineProperty(window,"localStorage",{configurable:true,value:{getItem:k=>__storageMap.get(k)??null,setItem:(k,v)=>__storageMap.set(k,String(v)),removeItem:k=>__storageMap.delete(k)}});</script>',1)
  page.set_content(safe_html,wait_until='domcontentloaded');page.wait_for_function('document.querySelector("#create-screen")?.hidden === false',timeout=10000)
  page.locator('#create-screen [data-choice="'+body+'"]').first.click()
  for i in range(16):
   if page.locator('#category-title').inner_text()=='Roupinhas':break
   page.locator('#create-next').click()
  assert page.locator('#category-title').inner_text()=='Roupinhas','aba roupas não encontrada'
  page.locator('[data-choice="'+model+'"]').first.click()
  info=page.locator('#create-art .outfit-fit').evaluate('''n=>({top:n.dataset.roupaTop,bottom:n.dataset.roupaBottom,width:n.dataset.fitWidth,torso:n.dataset.bodyWidth,svg:n.outerHTML.slice(0,90)})''')
  assert int(info['bottom'])==174 and not errors,errors
  page.screenshot(path=str(R/'previews/v59_3'/f'V59_3_ROUPA_{width}.png'),full_page=True)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'Horizontal scroll on {width}'
  # Vai até o fim da criação e confere que o pet ainda usa o mesmo modelo.
  for _ in range(4):
   if page.locator('#play-screen').is_visible():break
   page.locator('#create-next').click()
  assert page.locator('#play-screen').is_visible(),'finalizar criação'
  page.locator('#egg').click(timeout=5000)
  page.wait_for_timeout(500)
  assert page.locator('#play-art .pixel-outfit .outfit-fit').count()>0,'roupa continua no pet nascido'
  assert not errors,errors
  print('PASS',width,body,model,info)
  ctx.close()
 browser.close()
