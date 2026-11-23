#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
from io import BytesIO
import json,zipfile,re,hashlib
R=Path(__file__).resolve().parents[1];s=R/'assets-src/v63'; p=R/'web/index.html'
src=Path('/mnt/data/MEU_PEQUENO_PET_V84_13_JOGO_COMPLETO.zip')
orig='MEU_PEQUENO_PET_V84_13/web/index.html'
match=lambda html:json.loads(re.search(r'<script id="v64-scene-media" type="application/json">(.*?)</script>',html,re.S).group(1))
new=match(p.read_text('utf-8'))
with zipfile.ZipFile(src) as z: old=match(z.read(orig).decode('utf-8'))
changed={'forest','sunset','night','desert'}
assert set(old)==set(new) and len(new)==13
assert all(new[k]==old[k] for k in set(new)-changed),'Other scenes changed unexpectedly'
print('PASSOU: outras 9 cenas embutidas preservadas byte a byte')
for k in changed:
  x=new[k]
  for mime,typ in [('gif','GIF'),('still','PNG'),('preview','GIF')]:
    raw=x[mime].split(',',1)[1];import base64
    im=Image.open(BytesIO(base64.b64decode(raw)))
    assert im.size in ((120,120),(320,320)) and im.format==typ
    if mime=='gif':assert im.size==(320,320) and im.n_frames==40
    if mime=='preview':assert im.size==(120,120)
    print('PASSOU:',k,mime, im.size, im.n_frames if im.format=='GIF' else 1)
  assert new[k]!=old[k]
# restored forest exactly matches original approved animation, not the old green scene.
assert (s/'animacoes/forest_sem_pet.gif').read_bytes()==(R/'assets-src/v84_remakes/forest_40_quadros.gif').read_bytes()
assert (s/'cenarios/forest_sem_pet.png').read_bytes()==(R/'assets-src/v84_remakes/forest_foto.png').read_bytes()
print('PASSOU: floresta igual à arte aprovada da V84')
assert 'v8414-lantern-halo' in (R/'web/scene-v63-player.js').read_text()
assert 'v8414-halo-constant' in (R/'web/scene-v64.css').read_text()
print('PASSOU: luz adicional das duas lanternas presente no HTML e no CSS')
assert '<title>Meu Pequeno Pet V84.14' in p.read_text('utf-8')
off=Path('/mnt/data/MEU_PEQUENO_PET_V84_14_JOGAR_OFFLINE.html')
html=off.read_text('utf-8')
assert '<script type="module">import("data:text/javascript;base64,' in html
assert 'v8414-lantern-halo' in html and 'forest_fundo_aprovado' not in html
print('PASSOU: HTML offline contém código, estilos e mídia nova embutidos')
