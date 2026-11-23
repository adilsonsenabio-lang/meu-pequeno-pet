"""QA visual automatizada das sheets: 10 quadros e movimento visível real.
Executar: python tests/sprite_qa_v56.py"""
from pathlib import Path
from PIL import Image,ImageChops,ImageOps
import json
ROOT=Path(__file__).resolve().parents[1]
S=ROOT/'web/assets/sprites/v56'
metadata=json.loads((S/'sprites-manifest.json').read_text())
count=0
for key,record in metadata['sheets'].items():
 im=Image.open(S/record['file']).convert('RGBA')
 assert im.size==(1000,400),key
 cells=[im.crop(((i%5)*200,(i//5)*200,(i%5+1)*200,(i//5+1)*200)) for i in range(10)]
 # Alguns frames podem se repetir (fim de uma ação); não são 10 poses iguais.
 unique=len({c.tobytes() for c in cells})
 assert unique>=7,(key,unique)
 assert all(c.getbbox() for c in cells),key
 # Também exija ao menos um quadro não idêntico ao inicial.
 assert any(ImageChops.difference(cells[0],c).getbbox() is not None for c in cells[1:]),key
 count+=1
print(f'PASSOU: {count} spritesheets, 10 quadros por sheet e >=7 poses distintas por ação.')
