#!/usr/bin/env python3
"""V84.24. Move kitchen clock onto the middle wall; make all scenes fill tall panels.

Idempotent: restores the old clock's background from unmodified kitchen_fundo.png
before drawing a clock at its new location in each existing animation frame.
"""
from pathlib import Path
from PIL import Image
import re

ROOT=Path(__file__).resolve().parents[1]
WEB=ROOT/'web'
SCENES=WEB/'assets/scenes'
SOURCE=ROOT/'assets-src/v63'
BASE=Image.open(SOURCE/'cenarios/kitchen_fundo.png').convert('RGBA')
SHEET=Image.open(SOURCE/'objetos/kitchen__clock_spritesheet.png').convert('RGBA')
assert BASE.size==(320,320) and SHEET.size==(640,288)
NEW_X,NEW_Y=131,48
# Covers old sprite *including* its frame-to-frame movement without painting over
# the floor; all covered pixels are sourced from the actual approved base background.
OLD_RECT=(258,119,303,188)
CLOCK_TILES=[SHEET.crop((128*(n%5),144*(n//5),128*(n%5+1),144*(n//5+1))).resize((64,72), Image.Resampling.NEAREST) for n in range(10)]

def paint(frame,n):
    fr=frame.convert('RGBA').copy()
    fr.paste(BASE.crop(OLD_RECT), OLD_RECT[:2])
    fr.alpha_composite(CLOCK_TILES[(n//4)%10], (NEW_X,NEW_Y))
    return fr

def save_gif(images,path,durations):
    # Keep palette coherent, preserve exactly 40 or 20 frames.
    p=images[0].convert('RGB').quantize(colors=256,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
    fs=[im.convert('RGB').quantize(palette=p,dither=Image.Dither.NONE) for im in images]
    fs[0].save(path,save_all=True,append_images=fs[1:],loop=0,duration=durations,disposal=2,optimize=False)
    chk=Image.open(path)
    assert chk.n_frames==len(images),f'{path}: {chk.n_frames}, expected {len(images)}'

src=Image.open(SCENES/'kitchen-gif.gif')
assert src.n_frames==40
frames=[];duration=[]
for n in range(40):
    src.seek(n)
    frames.append(paint(src.convert('RGBA'),n))
    duration.append(src.info.get('duration',145) or 145)
save_gif(frames,SCENES/'kitchen-gif.gif',duration)
frames[0].save(SCENES/'kitchen-still.png',optimize=True)
# Preview GIF: 20 frames at the same 120×120 resolution and cadence.
pre=Image.open(SCENES/'kitchen-preview.gif')
assert pre.n_frames==20
small=[frames[2*n].resize(pre.size,Image.Resampling.NEAREST) for n in range(20)]
save_gif(small,SCENES/'kitchen-preview.gif',[290]*20)
# Maintain independent source exports for future rebuilds.
frames[0].save(SOURCE/'cenarios/kitchen_sem_pet.png',optimize=True)
save_gif(frames,SOURCE/'animacoes/kitchen_sem_pet.gif',duration)

meta=WEB/'scene-v63-data.js'
text=meta.read_text('utf-8')
text,changes=re.subn(r'(\{"key":"kitchen__clock","x":)\d+(,"y":)\d+(,"w":64,"h":72,"trajectory":null\})',r'\g<1>131\g<2>48\3',text,count=1)
assert changes==1
meta.write_text(text,'utf-8')

css=WEB/'scene-v64.css'
s=css.read_text('utf-8')
old='.v64-scene-stage {height:100%;height:min(100%, 100cqw);aspect-ratio:auto;}'
assert old in s
s=s.replace(old, '''/* V84.24: no letterbox at the top of tall rooms or scenes. */
#scene-art .v64-scene-stage,
#create-scene-art .v64-scene-stage{inset:0;width:100%;height:100%;aspect-ratio:auto;}
.v64-scene-stage {height:100%;aspect-ratio:auto;}''')
s=s.replace('.choice-pet.v64-scene-choice .v64-scene-stage {height:100%;height:min(100%, 100cqw);aspect-ratio:auto;}','.choice-pet.v64-scene-choice .v64-scene-stage {height:100%;aspect-ratio:auto;}')
# Decorative fallback backgrounds may also occupy full height.
s=s.replace('top:0;bottom:min(100cqw, 100%);background:url(', 'top:0;bottom:0;background:url(')
css.write_text(s,'utf-8')
print('OK V84.24: clock and 13 scene sizing rules applied')
