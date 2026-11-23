from pathlib import Path
from playwright.sync_api import sync_playwright
import json,traceback
ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'PREVIA_OFFLINE_V70.html').read_text()
OUT=ROOT/'previews'/'v70';OUT.mkdir(parents=True,exist_ok=True)
RESULTS=[]
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for width,height in [(320,700),(390,844),(430,932)]:
  ctx=b.new_context(viewport={'width':width,'height':height},device_scale_factor=1,locale='pt-BR',service_workers='block',reduced_motion='reduce')
  page=ctx.new_page();page.set_default_timeout(18000)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  try:
   page.set_content(HTML,wait_until='domcontentloaded',timeout=45000)
   page.wait_for_function("() => !document.querySelector('#create-screen')?.hidden && document.querySelector('#choice-list [data-choice]')",timeout=27000)
   # first three stages unchanged
   for expected in ['Cenário','Cores do pet']:
    assert page.locator('#category-title').inner_text()==expected
    assert not page.locator('#choice-list').evaluate("el=>el.classList.contains('two-row-options')")
    page.locator('#create-next').click()
   assert page.locator('#category-title').inner_text()=='Boca'
   assert page.locator('#step-count').inner_text().startswith('3 /')
   def dims():
    return page.evaluate('''() => {const grid=document.querySelector('#choice-list'); const cards=[...grid.querySelectorAll('.choice')]; const rows=[...new Set(cards.map(el=>Math.round(el.offsetTop)))];const head=document.querySelector('.game-header');const prev=document.querySelector('.create-preview');const ctrl=document.querySelector('#creator-adjust');const size=document.querySelector('#part-size'); const mouth=document.querySelector('#mouth-height'); const opts=document.querySelector('#part-colors');const style=getComputedStyle(grid);return {category:grid.dataset.category,headHeight:Math.round(head.getBoundingClientRect().height),previewHeight:Math.round(prev.getBoundingClientRect().height),gridHeight:Math.round(grid.getBoundingClientRect().height),gridScrollHeight:grid.scrollHeight,cardHeight:Math.round(cards[0].getBoundingClientRect().height),rowCount:rows.length,optionCount:cards.length,gridOverflow:style.overflowY,scrolled:Math.round(grid.scrollTop),range:!ctrl.hidden&&size.min==='0.85'&&size.max==='1.2',mouth:!mouth.closest('[hidden]'),colors:opts.children.length,viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,previewFloor:Math.round(prev.getBoundingClientRect().bottom),ctrlTop:Math.round(ctrl.getBoundingClientRect().top),creatorTitle:document.getElementById('category-title').textContent}}''')
   current=dims()
   assert current['gridScrollHeight']>current['gridHeight']+20,current
   assert current['gridHeight']<=current['cardHeight']*2+13,current
   assert current['gridHeight']>=current['cardHeight']*2+1,current
   assert current['headHeight']<=55,current
   assert current['range'] and current['mouth'] and current['colors']>=6,current
   assert current['documentWidth']<=width,current
   page.screenshot(path=str(OUT/f'criacao_boca_{width}.png'),full_page=True)
   # Verify scrolling occurs in list only and persists when editing after scroll
   page.locator('#choice-list').evaluate('el=>el.scrollTop=el.scrollHeight')
   page.locator('#choice-list .choice').nth(15).click()
   assert page.locator('#choice-list').evaluate('el=>el.scrollTop')>0
   before=page.locator('#choice-list').evaluate('el=>el.scrollTop')
   page.locator('#part-size').fill('1.1')
   assert page.locator('#choice-list').evaluate('el=>el.scrollTop')>0
   page.locator('#mouth-height').fill('-4')
   assert page.locator('#mouth-height-label').inner_text()=='↑ 4 px'
   page.locator('#create-next').click()
   assert page.locator('#category-title').inner_text()=='Corpo'
   assert not page.locator('#choice-list').evaluate('el=>el.classList.contains("two-row-options")')
   # find ear stage after body/head
   page.locator('#create-next').click()
   page.locator('#create-next').click()
   assert page.locator('#category-title').inner_text()=='Orelhas/Chifres'
   ear=dims()
   assert ear['gridHeight']<=ear['cardHeight']*2+13,ear
   assert ear['gridScrollHeight']>ear['gridHeight'],ear
   page.screenshot(path=str(OUT/f'criacao_orelhas_{width}.png'),full_page=True)
   assert not errors,errors
   data={'width':width,'mouth':current,'ears':ear,'scrollAfterSelection':before,'errors':errors}
   RESULTS.append(data)
   print('PASS',json.dumps(data,ensure_ascii=False),flush=True)
  except Exception as exc:
   print('ERROR',width,repr(exc),errors,flush=True)
   try:page.screenshot(path=str(OUT/f'falha_{width}.png'),full_page=True)
   except Exception:pass
   raise
  finally:ctx.close()
 b.close()
(OUT/'medidas.json').write_text(json.dumps(RESULTS,ensure_ascii=False,indent=2))
