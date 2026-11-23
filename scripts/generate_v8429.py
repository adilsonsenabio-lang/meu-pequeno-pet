#!/usr/bin/env python3
"""V84.29 — remove lanternas antigas dos cenários, gera sprites transparentes
e animações, corrige a coruja na volta e sombras dos animais. Determinístico.
Executado no GitHub Actions antes do precache, sem alterar saves do usuário.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import statistics
ROOT=Path(__file__).resolve().parents[1]
SC=ROOT/'web/assets/scenes'
ASSETS=ROOT/'web/assets/v8429'
BACK=ROOT/'assets-src/v63/cenarios'
ASSETS.mkdir(parents=True,exist_ok=True)

def lantern(kind):
    source=Image.open(ASSETS/f'{kind}_approved_base.png').convert('RGBA')
    assert source.size==(48,48)
    fixed=source.copy()
    ImageDraw.Draw(fixed).rectangle((27,18,47,39),fill=(0,0,0,0))
    hanging=source.crop((27,17,48,39))
    hinge=source.crop((9,6,39,21))
    frames=[]
    for deg in (0,-5,-9,-5,0,5,9,5):
        f=fixed.copy()
        f.alpha_composite(hanging.rotate(deg,resample=Image.Resampling.BICUBIC,expand=False),(27,17))
        f.alpha_composite(hinge,(9,6))
        frames.append(f)
    sheet=Image.new('RGBA',(384,48))
    for i,f in enumerate(frames):sheet.alpha_composite(f,(i*48,0))
    sheet.save(ASSETS/f'{kind}_spritesheet_8frames.png',optimize=True)
    frames[0].save(ASSETS/f'{kind}_sprite.png',optimize=True)
    frames[0].save(ASSETS/f'{kind}_animated.gif',save_all=True,append_images=frames[1:],duration=165,loop=0,disposal=2,optimize=False)
    gif=Image.open(ASSETS/f'{kind}_animated.gif')
    assert gif.n_frames==8 and gif.convert('RGBA').getpixel((0,0))[3]==0
    assert Image.open(ASSETS/f'{kind}_spritesheet_8frames.png').getpixel((0,0))[3]==0

def restore(frame,bg,box):
    frame.paste(bg.crop(box),box[:2])

def contact_shadow(frame,x,y,rx,fill):
    shadow=Image.new('RGBA',(320,320))
    ImageDraw.Draw(shadow).ellipse((int(x-rx),y-3,int(x+rx),y+3),fill=fill)
    return Image.alpha_composite(frame,shadow.filter(ImageFilter.GaussianBlur(1.8)))

def mirrored_owl(frame,bg,i):
    if i<=20:return frame
    q=max(0,min(1,(40-i)/20))
    q=q*q*(3-2*q)
    center=57.5+220*q
    rgb=frame.convert('RGB')
    bk=bg.convert('RGB')
    coords=[]
    for y in range(80,150):
        for x in range(max(0,round(center-35)),min(320,round(center+36))):
            a=rgb.getpixel((x,y));b=bk.getpixel((x,y))
            if max(abs(a[c]-b[c]) for c in range(3))>45:coords.append((x,y))
    if len(coords)<100:return frame
    box=(max(0,min(x for x,y in coords)-2),max(0,min(y for x,y in coords)-2),
         min(320,max(x for x,y in coords)+3),min(150,max(y for x,y in coords)+3))
    crop=frame.crop(box);original_bg=bg.crop(box)
    mask=Image.new('L',crop.size,0)
    for yy in range(crop.height):
        for xx in range(crop.width):
            a=crop.getpixel((xx,yy));b=original_bg.getpixel((xx,yy))
            delta=max(abs(a[c]-b[c]) for c in range(3))
            mask.putpixel((xx,yy),min(255,max(0,(delta-12)*8)))
    crop.putalpha(mask)
    restore(frame,bg,box)
    frame.alpha_composite(crop.transpose(Image.Transpose.FLIP_LEFT_RIGHT),box[:2])
    return frame

def object_x(frame,bg,kind):
    pix=frame.convert('RGB');background=bg.convert('RGB')
    points=[]
    box=(242,270,316,290) if kind=='desert' else (219,250,317,290)
    for y in range(box[1],box[3]):
        for x in range(box[0],box[2]):
            a=pix.getpixel((x,y));b=background.getpixel((x,y))
            if max(abs(a[k]-b[k]) for k in range(3))>60 and a[0]>a[1]*1.1:
                points.append(x)
    return statistics.median(points) if len(points)>=20 else 281

def scene(name):
    im=Image.open(SC/f'{name}-gif.gif')
    bg=Image.open(BACK/f'{name}_fundo.png').convert('RGBA')
    images=[];times=[]
    assert im.n_frames==40 and im.size==(320,320),(name,im.n_frames,im.size)
    for i in range(40):
        im.seek(i);f=im.convert('RGBA')
        if name=='night':
            restore(f,bg,(0,205,101,309))
            f=mirrored_owl(f,bg,i)
        elif name=='sunset':
            restore(f,bg,(220,205,320,310))
        elif name in ('desert','forest'):
            x=object_x(f,bg,name)
            if name=='desert':f=contact_shadow(f,x,296,12,(81,53,38,67))
            else:f=contact_shadow(f,x,298,13,(27,62,47,81))
        images.append(f.convert('RGB'))
        times.append(im.info.get('duration',145))
    common=images[0].quantize(colors=255,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
    frames=[f.quantize(palette=common,dither=Image.Dither.NONE) for f in images]
    frames[0].save(SC/f'{name}-gif.gif',save_all=True,append_images=frames[1:],
        duration=times,loop=0,disposal=2,optimize=False)
    images[0].save(SC/f'{name}-still.png',optimize=True)
    thumbs=[f.resize((120,120),Image.Resampling.NEAREST) for f in images]
    pal=thumbs[0].quantize(colors=255,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE)
    thumbs=[f.quantize(palette=pal,dither=Image.Dither.NONE) for f in thumbs]
    thumbs[0].save(SC/f'{name}-preview.gif',save_all=True,append_images=thumbs[1:],
        duration=times,loop=0,disposal=2,optimize=False)
    assert Image.open(SC/f'{name}-gif.gif').n_frames==40
    assert Image.open(SC/f'{name}-preview.gif').n_frames==40
    print('PASSOU',name,'40 quadros e preview')

if __name__=='__main__':
    for kind in ('night','sunset'):lantern(kind)
    for kind in ('night','sunset','desert','forest'):scene(kind)
