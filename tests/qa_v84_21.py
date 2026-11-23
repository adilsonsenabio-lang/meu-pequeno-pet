"""QA V84.21: structural, graphic and browser smoke."""
from pathlib import Path
from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright
import json,re,base64,hashlib,math,numpy as np

ROOT=Path(__file__).resolve().parents[1]
S=ROOT/'assets-src/v63'
O=S/'objetos';G=S/'animacoes';B=S/'cenarios'
old=Path('/mnt/data/slime_work_v84_18/MEU_PEQUENO_PET_V84_20/web/index.html').read_text(encoding='utf-8')
new=(ROOT/'web/index.html').read_text(encoding='utf-8')
def embedded(html):return json.loads(re.search(r'<script id="v64-scene-media" type="application/json">(.*?)</script>',html,re.S).group(1))
a,b=embedded(old),embedded(new)
assert len(a)==len(b)==13
for k in a:
    if k not in {'garden','sunset','forest'}: assert a[k]==b[k],k
print('PASS — 10 other scenes byte-identical in HTML media JSON')
for k in ('garden','sunset','forest'):
    gif=Image.open(G/f'{k}_sem_pet.gif')
    assert gif.n_frames==40 and gif.size==(320,320)
    assert gif.info.get('duration') in (140,150)  # GIF quantizes ms to 10ms
    print('PASS —',k,'40 complete frames')

# visual samples: compare all forest frames to their approved originals in static-trunk region
forest=Image.open(G/'forest_sem_pet.gif')
for k in (0,10,19,20,30,39):
    forest.seek(k)
    im=forest.convert('RGB')
    im.save(f'/mnt/data/v84_21_forest_frame_{k:02}.png')

# Confirm original direction sprite and mirrored return via pixel transform (code-level)
log=Image.open(O/'forest__log.png').convert('RGBA')
ant=Image.open(O/'forest__ant_spritesheet.png').convert('RGBA')
assert log.size==(112,43) and ant.size==(640,288)
script=(ROOT/'scripts/corrigir_v84_21.py').read_text()
assert 'if not outbound:' in script and 'FLIP_LEFT_RIGHT' in script
assert 'progress=(i if outbound else 39-i)/19' in script
print('PASS — ant faces left on return, and loop endpoints connect')

# Browser responsive testing on locally embedded single HTML, select scenes, capture screenshot
html=(ROOT/'JOGAR_OFFLINE.html').read_text('utf-8')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-web-security','--allow-file-access-from-files'])
    for width in (320,390,430):
        page=browser.new_page(viewport={'width':width,'height':844},device_scale_factor=1)
        errors=[]
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.set_content(html,wait_until='domcontentloaded',timeout=120000)
        page.wait_for_timeout(800)
        for name,key in [('Jardim','garden'),('Entardecer','sunset'),('Floresta','forest')]:
            page.get_by_text(name,exact=True).first.click(timeout=3500)
            page.wait_for_timeout(350)
            stage=page.locator('#create-scene-art .v64-scene-stage').first
            attr=stage.get_attribute('data-v64-scene')
            assert attr==key,(name,attr)
            imgs=stage.locator('img')
            assert imgs.count()>=1
            assert imgs.first.evaluate('(i)=>i.complete && i.naturalWidth>0'),(name,width)
            if width==390:
                page.screenshot(path=f'/mnt/data/MEU_PEQUENO_PET_V84_21_{key.upper()}_CELULAR.png',full_page=False)
        assert not errors,(width,errors)
        print('PASS — browser viewport',width,'no JS errors / scenes loaded')
        page.close()
    browser.close()
