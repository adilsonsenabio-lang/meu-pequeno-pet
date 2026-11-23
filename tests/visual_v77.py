"""Smoke test browser for V77 Space, orbit layers and selector."""
from playwright.sync_api import sync_playwright
import json,subprocess
from pathlib import Path
R=Path(__file__).resolve().parents[1]
html=(R/'PREVIA_OFFLINE_V77.html').read_text(encoding='utf-8')
node=f"import{{createSave,hatch}}from '{(R/'web/core.js').as_uri()}';const s=hatch(createSave(Date.now()),Date.now()).save;console.log(JSON.stringify(s));"
base=json.loads(subprocess.check_output(['node','--input-type=module','-e',node],text=True))
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    for width in [320,390,430]:
        page=browser.new_page(viewport={'width':width,'height':844},device_scale_factor=1)
        initial={'meu-pequeno-pet.save.v1':json.dumps({**base,'scene':'space'})}
        page.evaluate("data=>{const db=new Map(Object.entries(data));Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>db.has(k)?db.get(k):null,setItem:(k,v)=>db.set(k,String(v)),removeItem:k=>db.delete(k),clear:()=>db.clear(),key:i=>[...db.keys()][i]??null,get length(){return db.size;}}});}",initial)
        errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
        page.set_content(html,wait_until='domcontentloaded',timeout=60000)
        page.wait_for_timeout(1500)
        details=page.evaluate('''() => {const s=document.querySelector('#scene-art .v64-scene-stage');return {scene:s?.dataset.v64Scene,hidden:document.querySelector('#play-screen')?.hidden,planet:s?.querySelector('.v77-orbit-planet')?.complete,comets:s?.querySelectorAll('.v77-orbit-comet').length,gif:s?.querySelector('.v64-scene-frame')?.naturalWidth,scroll:document.documentElement.scrollWidth,vw:innerWidth,active:!!s?.querySelector('.v77-orbit-comet-a'),planetDuration:window.getComputedStyle(s?.querySelector('.v77-orbit-planet')).animationDuration,cometDuration:window.getComputedStyle(s?.querySelector('.v77-orbit-comet-a')).animationDuration}}''')
        print(width,details,'errors',errors[:3],flush=True)
        assert not errors,errors[:3]
        assert details['scene']=='space' and details['hidden'] is False
        assert details['planet'] and details['comets']==2 and details['gif']==320
        assert details['scroll']<=width+2
        assert details['cometDuration']=='60s'
        if width==390:page.locator('#world').screenshot(path='/mnt/data/MEU_PEQUENO_PET_V77_JOGO_ESPACO_390.png')
        page.close()
    browser.close()
# Additional checks for 60 s CSS animation samples and creation previews
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(html,wait_until='domcontentloaded',timeout=60000)
    page.wait_for_timeout(1200)
    assert page.locator('#create-screen').is_visible()
    page.locator('#choice-list [data-choice="space"]').click()
    page.wait_for_timeout(300)
    info=page.evaluate('''()=>{const host=document.querySelector('#create-scene-art .v64-scene-stage');const mini=document.querySelector('[data-choice="space"] .v64-scene-stage');return {shown:host?.dataset.v64Scene,planet:host?.querySelector('.v77-orbit-planet')?.complete, comets:host?.querySelectorAll('.v77-orbit-comet').length,previewPlanet:mini?.querySelector('.v77-orbit-planet')?.complete,previewComets:mini?.querySelectorAll('.v77-orbit-comet').length}}''')
    print('CREATION',info,'errors',errors[:3],flush=True)
    assert info=={'shown':'space','planet':True,'comets':2,'previewPlanet':True,'previewComets':2}
    page.locator('#create-preview').screenshot(path='/mnt/data/MEU_PEQUENO_PET_V77_CRIACAO_ESPACO_390.png') if page.locator('#create-preview').count()>0 else None
    assert not errors
    # Manipulate CSS animation clock without waiting 60 seconds.
    for ms in [1500,13000,25000,33000,48000,56500]:
        v=page.evaluate('''(ms)=>{
          const el=document.querySelector('#create-scene-art .v77-orbit-comet-a');
          const other=document.querySelector('#create-scene-art .v77-orbit-comet-b');
          const a=el.getAnimations()[0],b=other.getAnimations()[0];
          a.currentTime=ms;b.currentTime=ms;
          const s=window.getComputedStyle(el),z=window.getComputedStyle(other);
          return {leftA:s.left,topA:s.top,opacityA:Number(s.opacity),
                  leftB:z.left,topB:z.top,opacityB:Number(z.opacity)};
        }''',ms)
        print('MOTION',ms,v,flush=True)
        if 2000<=ms<25000:assert v['opacityA']>.05
        if 31000<=ms<55000:assert v['opacityB']>.05
        if 56500<=ms<59000:assert v['opacityA']<.05 and v['opacityB']<.05
    browser.close()
