#!/usr/bin/env python3
"""Meu Pequeno Pet V84.24: restaurar o balcão, mover o relógio e preencher cenários.

Execute após a importação inicial do jogo (requer Pillow):
    python3 scripts/ajustar_v84_24.py
    python3 scripts/update_sw.py
    python3 scripts/verify_pages.py
Não modifica saves nem os demais 12 cenários.
"""
from pathlib import Path
from PIL import Image
import re

ROOT=Path(__file__).resolve().parents[1]
WEB=ROOT/'web'
SCENES=WEB/'assets/scenes'
BASE=Image.open(ROOT/'assets-src/v63/cenarios/kitchen_fundo.png').convert('RGBA')
SHEET=Image.open(ROOT/'assets-src/v63/objetos/kitchen__clock_spritesheet.png').convert('RGBA')
CLOCK_X,CLOCK_Y=131,48
REGION=(261,123,297,173)
CLOCK=[SHEET.crop((128*(i%5),144*(i//5),128*(i%5+1),144*(i//5+1))).resize((64,72),Image.Resampling.NEAREST) for i in range(10)]

def patch_frame(source, index):
    image=source.convert('RGBA').copy()
    image.paste(BASE.crop(REGION),REGION[:2]) # restaurar gabinete original
    image.alpha_composite(CLOCK[(index//4)%10],(CLOCK_X,CLOCK_Y))
    return image.convert('RGB')

def gif_write(images,path,durations):
    palette=images[0].quantize(colors=256,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
    frames=[f.quantize(palette=palette,dither=Image.Dither.NONE) for f in images]
    frames[0].save(path,save_all=True,append_images=frames[1:],duration=durations,loop=0,disposal=2,optimize=False)

old=Image.open(SCENES/'kitchen-gif.gif')
frames=[]
lengths=[]
for i in range(old.n_frames):
    old.seek(i)
    frames.append(patch_frame(old.convert('RGBA'),i))
    lengths.append(old.info.get('duration',145))
assert len(frames)==40
gif_write(frames,SCENES/'kitchen-gif.gif',lengths)
frames[0].save(SCENES/'kitchen-still.png',optimize=True)

thumb=Image.open(SCENES/'kitchen-preview.gif')
mini=[frames[min(i*2,len(frames)-1)].resize(thumb.size,Image.Resampling.NEAREST) for i in range(thumb.n_frames)]
gif_write(mini,SCENES/'kitchen-preview.gif',[145]*len(mini))

source=ROOT/'assets-src/v63/cenarios/kitchen_sem_pet.png'
frames[0].save(source,optimize=True)
gif_write(frames,ROOT/'assets-src/v63/animacoes/kitchen_sem_pet.gif',lengths)

meta=WEB/'scene-v63-data.js'
text=meta.read_text(encoding='utf-8')
text,count=re.subn(r'(\{"key":"kitchen__clock","x":)\d+(,"y":)\d+(,"w":64,"h":72,"trajectory":null\})',r'\g<1>131\g<2>48\3',text,count=1)
assert count==1
meta.write_text(text,encoding='utf-8')

css=WEB/'scene-v64.css'
text=css.read_text(encoding='utf-8')
old='.v64-scene-stage {height:100%;height:min(100%, 100cqw);aspect-ratio:auto;}'
new='''/* V84.24: o fundo ocupa toda a janela sem faixa vazia; pet mantém escala própria. */
#scene-art .v64-scene-stage,
#create-scene-art .v64-scene-stage {inset:0;width:100%;height:100%;aspect-ratio:auto;}
.v64-scene-stage {height:100%;aspect-ratio:auto;}'''
if old in text: text=text.replace(old,new,1)
assert new in text
text=text.replace('.choice-pet.v64-scene-choice .v64-scene-stage {height:100%;height:min(100%, 100cqw);aspect-ratio:auto;}','.choice-pet.v64-scene-choice .v64-scene-stage {height:100%;aspect-ratio:auto;}')
css.write_text(text,encoding='utf-8')
print('V84.24 aplicado: relógio da cozinha no lugar, sem faixa vazia nos cenários.')
