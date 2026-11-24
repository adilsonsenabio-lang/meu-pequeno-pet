#!/usr/bin/env python3
"""Quick static invariants of a Pages/PWA build; no external services required."""
from pathlib import Path
import re,json
from statistics import median
web=Path(__file__).resolve().parents[1]/'web'
html=(web/'index.html').read_text(encoding='utf-8')
m=re.search(r'<script id="v64-scene-media" type="application/json">(.*?)</script>',html,re.S)
assert m,'Scene JSON not found'
media=json.loads(m.group(1))
assert len(media)==13,(len(media),list(media))
for scene,srcs in media.items():
 for role,src in srcs.items():
  assert src.startswith('./assets/scenes/'),(scene,role,src[:40])
  assert (web/src.removeprefix('./')).is_file(),(scene,role,src)
assert 'GHOST_CYCLE_MS=15000' in (web/'scene-v63-player.js').read_text(encoding='utf-8')
assert 'v64-ghost-minute 15s' in (web/'scene-v64.css').read_text(encoding='utf-8')
# V84.26: moldura quadrada sem crop e pet de tamanho responsivo.
scene_css=(web/'scene-v64.css').read_text(encoding='utf-8')
layout_css=(web/'v84-26-layout.css').read_text(encoding='utf-8')
assert '.v64-scene-stage{position:absolute;inset:0;width:100%;height:100%;aspect-ratio:1/1;' in scene_css
assert 'object-fit:contain' in scene_css
assert 'object-fit:cover' not in scene_css and 'object-fit:fill' not in scene_css
assert 'width:max(100cqw' not in scene_css
assert '::before{' not in scene_css
assert '#world.world,' in layout_css and '#create-screen .create-preview' in layout_css
assert 'aspect-ratio:1 / 1' in layout_css
assert '#world #pet-wrap.pet-wrap' in layout_css and 'width:47%' in layout_css
assert '#create-screen #create-art.create-art' in layout_css and 'width:61%' in layout_css
assert 'v84-26-layout.css?v=84.27' in html and 'scene-v64.css?v=84.27' in html
# V84.27: trenó da criação e sombra de contato próxima aos pés.
assert '#create-scene-art .v844-sleigh' in scene_css
assert 'v8427-sleigh-in-creator 18s' in scene_css
assert 'v844-sleigh-trip 60s' in scene_css, 'Preservar a animação antiga do jogo'
assert 'prefers-reduced-motion:reduce' in scene_css
assert '#create-screen .create-preview::after' in layout_css
assert 'bottom:calc(7% + 10px)' in layout_css
assert 'id="v844-sleigh"' in html
assert 'SLEIGH_NODES' in (web/'scene-v63-player.js').read_text(encoding='utf-8')
# V84.28: o arquivo novo supera o cache de CSS legado sem apagar saves.
hotfix_css=(web/'v84-28-fix.css').read_text(encoding='utf-8')
sw=(web/'sw.js').read_text(encoding='utf-8')
pwa=(web/'pwa.js').read_text(encoding='utf-8')
assert 'v84-28-fix.css?v=84.28' in html
assert 'V84.29' in html
assert 'v8428-christmas-creator 18s' in hotfix_css
assert '#create-scene-art .v844-sleigh' in hotfix_css
assert 'bottom:calc(7% + 2px)' in hotfix_css
assert 'const codeAsset=' in sw and 'codeAsset' in sw
assert 'updateViaCache' in pwa and 'registration.update()' in pwa
for f in ('v55-mobile.css','v58-ajustes.css'):
 css=(web/f).read_text(encoding='utf-8')
 assert '#world.world{height:clamp(' not in css
 assert '#world.world { height:clamp(' not in css
 assert '#create-screen .create-preview{height:clamp(' not in css
 assert '#create-screen .create-preview {height:clamp(' not in css

# V84.29: sprites realmente transparentes e quadros reescritos durante deploy.
from PIL import Image, ImageChops, ImageOps, ImageStat
from generate_v8429 import isolate_birds
assets_v8429=web/'assets/v8429'
for key in ('night','sunset'):
 base=Image.open(assets_v8429/f'{key}_approved_base.png').convert('RGBA')
 assert base.size==(48,48) and base.getpixel((0,0))[3]==0
 sheet=Image.open(assets_v8429/f'{key}_spritesheet_8frames.png').convert('RGBA')
 assert sheet.size==(384,48) and sheet.getpixel((0,0))[3]==0
 gif=Image.open(assets_v8429/f'{key}_animated.gif')
 assert gif.n_frames==8 and gif.convert('RGBA').getpixel((0,0))[3]==0
for key in ('night','sunset','desert','forest'):
 big=Image.open(web/'assets/scenes'/f'{key}-gif.gif')
 mini=Image.open(web/'assets/scenes'/f'{key}-preview.gif')
 assert big.n_frames==40 and mini.n_frames==40,(key,big.n_frames,mini.n_frames)
owl_right=Image.open(assets_v8429/'night_owl_right.png').convert('RGBA')
owl_left=Image.open(assets_v8429/'night_owl_left.png').convert('RGBA')
assert owl_right.size==owl_left.size==(480,192)
with Image.open(web.parent/'assets-src/v8429/night-gif.gif') as original:
 frames=[]
 for i in range(40):
  original.seek(i)
  frames.append(original.convert('RGBA'))
poses=isolate_birds(frames,'night')
positions=[pose[0][1] for pose in poses]
with Image.open(web/'assets/scenes/night-gif.gif') as night:
 for i,(x,y) in enumerate(positions):
  sx,sy=(i%10)*48,(i//10)*48
  box=(sx,sy,sx+48,sy+48)
  left,right=owl_left.crop(box),owl_right.crop(box)
  assert left.getpixel((0,0))[3]==0 and left.getchannel('A').getbbox()
  assert left.tobytes()==poses[i%10][0][0].tobytes(),i
  assert ImageOps.mirror(left).tobytes()==right.tobytes(),i
  next_x=next(positions[(i+step)%40][0] for step in range(1,40)
              if positions[(i+step)%40][0]!=x)
  expected,other=(right,left) if next_x>x else (left,right)
  night.seek(i)
  baked=night.crop((x,y,x+48,y+48)).convert('RGB')
  common=ImageChops.multiply(left.getchannel('A'),right.getchannel('A'))
  expected_error=sum(ImageStat.Stat(ImageChops.difference(baked,expected.convert('RGB')),common).sum)
  opposite_error=sum(ImageStat.Stat(ImageChops.difference(baked,other.convert('RGB')),common).sum)
  assert expected_error<opposite_error,i
birds=Image.open(assets_v8429/'sunset_birds_flap.png').convert('RGBA')
assert birds.size==(384,96)
for y in (0,48):
 poses=[birds.crop((x,y,x+48,y+48)) for x in range(0,384,48)]
 assert all(pose.getpixel((0,0))[3]==0 for pose in poses)
 assert len({pose.tobytes() for pose in poses})>=6
assert 'v8429-fixes.css?v=84.29' in html
assert 'V84.29' in html
scene_js=(web/'scene-v63-player.js').read_text(encoding='utf-8')
gen=(web.parent/'scripts/generate_v8429.py').read_text(encoding='utf-8')
assert 'v8429-lantern' in scene_js and 'mirrored_owl' in gen and 'contact_shadow' in gen
assert 'scene-v63-player.js?v=84.29' in (web/'app.js').read_text(encoding='utf-8')

assets=json.loads(re.search(r'const FILES=(\[.*?\]);',(web/'sw.js').read_text(encoding='utf-8'),re.S).group(1))
assert len(assets)>=40
for uri,digest in assets:
 assert (web/uri.removeprefix('./')).is_file(),uri
 assert len(digest)==16
assert (web/'manifest.webmanifest').is_file()
assert 'registerOfflineWorker' in (web/'app.js').read_text(encoding='utf-8')
print('PASSOU: 13 cenas, moldura quadrada e pet responsivo; PWA precache:',len(assets),'arquivos; fantasma 15s')
