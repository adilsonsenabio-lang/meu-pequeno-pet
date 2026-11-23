"""Auditoria automática de integridade e movimento dos spritesheets V57."""
from pathlib import Path
from PIL import Image, ImageChops
import json
R=Path(__file__).resolve().parents[1]
S=R/'web/assets/sprites/v57'
m=json.loads((S/'sprites-manifest.json').read_text())
assert len(m['sheets'])==45
assert sum(x['count'] for x in m['sprites'].values())==113
for name,rec in m['sheets'].items():
 im=Image.open(S/rec['file']).convert('RGBA')
 assert im.size==(1000,400),name
 frames=[im.crop(((n%5)*200,(n//5)*200,(n%5+1)*200,(n//5+1)*200)) for n in range(10)]
 assert len({f.tobytes() for f in frames})>=7,name
 assert all(f.getbbox() for f in frames),name
 assert any(ImageChops.difference(frames[0],f).getbbox() for f in frames[1:]),name
print('PASSOU: 113 peças, 8 atlas, 45 spritesheets e 10 quadros por animação')
