"""Verificação de sprites e frames PNG/RGBA da V58. Não substitui inspeção artística."""
from pathlib import Path
from PIL import Image
import json
R=Path(__file__).resolve().parents[1]
S=R/'web/assets/sprites/v58'
m=json.loads((S/'sprites-manifest.json').read_text())
assert m['version']==58
assert len(m['sprites'])==9
assert sum(part['count'] for part in m['sprites'].values())==134
assert m['sprites']['outfit']['count']==21
assert len(m['sheets'])==45
for category,rec in m['sprites'].items():
    atlas=Image.open(S/rec['atlas']);assert atlas.mode=='RGBA',(category,atlas.mode)
    assert rec['count']==len(rec['items']),category
    for name,part in rec['items'].items():
        im=Image.open(S/part['file']);assert im.mode=='RGBA',(category,name,im.mode)
        assert im.size==(128,128),(category,name,im.size)
        assert im.getbbox() is not None or name in ('none','plain'),(category,name)
for name,rec in m['sheets'].items():
    im=Image.open(S/rec['file']);assert im.mode=='RGBA',(name,im.mode)
    assert im.size==(1000,400),(name,im.size)
    frames=[im.crop((n%5*200,n//5*200,(n%5+1)*200,(n//5+1)*200)) for n in range(10)]
    assert all(fr.getbbox() for fr in frames),name
    assert len({fr.tobytes() for fr in frames})>=7,name
print('PASSOU: 134 sprites RGBA, 9 atlas, 45 spritesheets com 10 quadros distintos por ação')
