from pathlib import Path
from PIL import Image
import json
R=Path(__file__).resolve().parents[1];S=R/'web/assets/sprites/v59'
m=json.loads((S/'sprites-manifest.json').read_text())
assert m['version']==59
assert len(m['sprites'])==10
assert sum(g['count'] for g in m['sprites'].values())==159
assert m['sprites']['mouth']['count']==18
assert m['sprites']['snout']['count']==22
assert len(m['sheets'])==45
for group,rec in m['sprites'].items():
 atlas=Image.open(S/rec['atlas']);assert atlas.mode=='RGBA'
 assert len(rec['items'])==rec['count']
 for name,part in rec['items'].items():
  im=Image.open(S/part['file']);assert im.mode=='RGBA' and im.size==(128,128),(group,name)
  assert im.getbbox() or name in ('none','plain'),(group,name)
for name,rec in m['sheets'].items():
 im=Image.open(S/rec['file']);assert im.mode=='RGBA' and im.size==(1000,400),name
 frames=[im.crop((i%5*200,i//5*200,i%5*200+200,i//5*200+200)) for i in range(10)]
 assert all(fr.getbbox() for fr in frames)
 assert len({fr.tobytes() for fr in frames})>=7,name
# Todas as opções de focinho precisam estar visualmente centradas na faixa horizontal.
for name,part in m['sprites']['snout']['items'].items():
 im=Image.open(S/part['file']).getchannel('A');a=im.getbbox()
 assert a is not None
 assert abs((a[0]+a[2])/2-64)<=3,(name,a)
print('PASSOU: 159 PNGs RGBA; 10 atlas; 22 focinhos centralizados; 45 folhas x 10 quadros')
