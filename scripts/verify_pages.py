#!/usr/bin/env python3
"""Quick static invariants of a Pages/PWA build; no external services required."""
from pathlib import Path
import re,json
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
assert 'V84.28' in html
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

assets=json.loads(re.search(r'const FILES=(\[.*?\]);',(web/'sw.js').read_text(encoding='utf-8'),re.S).group(1))
assert len(assets)>=40
for uri,digest in assets:
 assert (web/uri.removeprefix('./')).is_file(),uri
 assert len(digest)==16
assert (web/'manifest.webmanifest').is_file()
assert 'registerOfflineWorker' in (web/'app.js').read_text(encoding='utf-8')
print('PASSOU: 13 cenas, moldura quadrada e pet responsivo; PWA precache:',len(assets),'arquivos; fantasma 15s')
