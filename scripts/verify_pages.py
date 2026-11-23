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
assets=json.loads(re.search(r'const FILES=(\[.*?\]);',(web/'sw.js').read_text(encoding='utf-8'),re.S).group(1))
assert len(assets)>=40
for uri,digest in assets:
 assert (web/uri.removeprefix('./')).is_file(),uri
 assert len(digest)==16
assert (web/'manifest.webmanifest').is_file()
assert 'registerOfflineWorker' in (web/'app.js').read_text(encoding='utf-8')
print('PASSOU: 13 cenários externos; PWA precache:',len(assets),'arquivos; fantasma 15s; manifesto presente')
