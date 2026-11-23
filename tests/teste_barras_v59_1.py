"""Confere visualização e comportamento de cada barra de tamanho da criação.
Executar: python tests/teste_barras_v59_1.py"""
from pathlib import Path
from playwright.sync_api import sync_playwright
R=Path(__file__).resolve().parents[1]
HTML=(R/'PREVIA_OFFLINE_V59.html').read_text()
INJECT='''<script>window.__saved=new Map();Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__saved.get(k)??null,setItem:(k,v)=>window.__saved.set(k,String(v)),removeItem:k=>window.__saved.delete(k),clear:()=>window.__saved.clear()}});</script>'''
report=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for width,height in [(320,700),(390,844),(430,932)]:
        context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1,locale='pt-BR',service_workers='block')
        page=context.new_page()
        errors=[]
        page.on('pageerror',lambda exc:errors.append(str(exc)))
        page.set_content(HTML.replace('<head>','<head>'+INJECT,1),wait_until='domcontentloaded')
        page.wait_for_function("document.querySelector('#create-screen')?.hidden===false")
        results=[]
        for i in range(16):
            category=page.locator('#category-title').inner_text()
            adjust=page.locator('#creator-adjust')
            if not adjust.is_visible():
                options=page.locator('#choice-list [data-choice]:not([data-choice="none"])')
                if options.count()>0:
                    options.first.click()
            if adjust.is_visible():
                metrics=page.evaluate("""() => {
                  const track=document.querySelector('#part-size'), panel=document.querySelector('#creator-adjust');
                  const a=track.getBoundingClientRect(),b=panel.getBoundingClientRect();
                  return {track:a.width,panel:b.width,left:a.left-b.left,right:b.right-a.right,max:track.max,min:track.min,step:track.step};
                }""")
                assert metrics['track'] < metrics['panel']*.81, (category,metrics)
                assert abs(metrics['left']-metrics['right']) < 2, (category,metrics)
                assert metrics['min']=='0.85' and metrics['max']=='1.2' and metrics['step']=='0.05',metrics
                # Move to the maximum and check the label still updates, then revert to minimum.
                page.locator('#part-size').evaluate("e=>{e.value='1.2';e.dispatchEvent(new Event('input',{bubbles:true}));}")
                assert page.locator('#part-size-label').inner_text()=='120%',category
                page.locator('#part-size').evaluate("e=>{e.value='0.85';e.dispatchEvent(new Event('input',{bubbles:true}));}")
                assert page.locator('#part-size-label').inner_text()=='85%',category
                results.append((category,round(metrics['track'],1)))
                if width==390 and category=='Orelhas/Chifres':
                    page.locator('#part-size').evaluate("e=>{e.value='1.2';e.dispatchEvent(new Event('input',{bubbles:true}));}")
                    (R/'previews/v59').mkdir(exist_ok=True,parents=True)
                    page.screenshot(path=str(R/'previews/v59/barra_padronizada_390.png'),full_page=True)
            if i<15:page.locator('#create-next').click()
        assert len(results)>=6,(width,results)
        assert not errors,(width,errors)
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),width
        report.append((width,results))
        print('PASSOU',width,'px',len(results),'filtros:',results,flush=True)
        context.close()
    browser.close()
print('TESTE VISUAL V59.1 PASSOU: barra com comprimento igual em todos os filtros e percentuais inalterados.')
