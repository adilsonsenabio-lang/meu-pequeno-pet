#!/usr/bin/env python3
"""V84.29 — remove lanternas antigas dos cenários, gera sprites transparentes
e animações, corrige a coruja na volta e sombras dos animais. Determinístico.
Executado no GitHub Actions antes do precache, sem alterar saves do usuário.
"""
from pathlib import Path
from collections import Counter
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps
import statistics
ROOT=Path(__file__).resolve().parents[1]
SC=ROOT/'web/assets/scenes'
ASSETS=ROOT/'web/assets/v8429'
BACK=ROOT/'assets-src/v63/cenarios'
FLIGHT_SOURCE=ROOT/'assets-src/v8429'
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

def clean_lamp(frame,kind,bg,have_original):
    box=(0,205,101,309) if kind=='night' else (220,205,320,310)
    if have_original:
        restore(frame,bg,box)
        return frame
    # GitHub import contains the 13 finished scenes, but not assets-src.
    # Recover only the grass strip from the adjacent area of the SAME frame.
    # Blend the safe edge to avoid a hard rectangular patch or repeated sky.
    raw=frame.copy()
    shift=101 if kind=='night' else -116
    for y in range(box[1],box[3]):
        for x in range(box[0],box[2]):
            edge=1 if (kind=='night' and x<=81) or (kind=='sunset' and x>=240) else (
                max(0,min(1,(99-x)/18)) if kind=='night' else max(0,min(1,(x-222)/18)))
            source=raw.getpixel((max(0,min(319,x+shift)),y))
            old=raw.getpixel((x,y))
            frame.putpixel((x,y),tuple(round(old[c]*(1-edge)+source[c]*edge) for c in range(4)))
    return frame

def contact_shadow(frame,x,y,rx,fill):
    shadow=Image.new('RGBA',(320,320))
    ImageDraw.Draw(shadow).ellipse((int(x-rx),y-3,int(x+rx),y+3),fill=fill)
    return Image.alpha_composite(frame,shadow.filter(ImageFilter.GaussianBlur(1.8)))

BIRD_CELL=48

def sprite_sheet(name,frames,columns):
    rows=(len(frames)+columns-1)//columns
    sheet=Image.new('RGBA',(BIRD_CELL*columns,BIRD_CELL*rows))
    for i,sprite in enumerate(frames):
        sheet.paste(sprite,(i%columns*BIRD_CELL,i//columns*BIRD_CELL))
    sheet.save(ASSETS/f'{name}.png',optimize=True)

def isolate_birds(frames,name):
    """Separate the large moving silhouettes from the stationary sky."""
    area=(20,80,300,141) if name=='night' else (200,35,320,94)
    skies=[frame.crop(area).convert('RGB') for frame in frames]
    sky=Image.new('RGB',skies[0].size)
    sky.putdata([Counter(pixels).most_common(1)[0][0]
                 for pixels in zip(*(list(image.getdata()) for image in skies))])
    sky=sky.convert('RGBA')
    count=1 if name=='night' else 2
    extracted=[]
    for frame,region in zip(frames,skies):
        diff=ImageChops.difference(region,sky.convert('RGB'))
        pixels=diff.load()
        pending={(x,y) for y in range(diff.height) for x in range(diff.width) if max(pixels[x,y])>24}
        components=[]
        while pending:
            point=pending.pop()
            component=[point]
            for x,y in component:
                for neighbor in ((x+1,y),(x-1,y),(x,y+1),(x,y-1)):
                    if neighbor in pending:
                        pending.remove(neighbor)
                        component.append(neighbor)
            if len(component)>200:
                components.append(component)
        assert len(components)==count,(name,len(extracted),[len(c) for c in components])
        birds=[]
        for component in sorted(components,key=lambda points:min(x for x,y in points)):
            mask=Image.new('L',diff.size)
            for x,y in component:
                mask.putpixel((x,y),255)
            edge=mask.filter(ImageFilter.MaxFilter(3))
            for y in range(diff.height):
                for x in range(diff.width):
                    if edge.getpixel((x,y)) and max(pixels[x,y])>8:
                        mask.putpixel((x,y),255)
            left,top,right,bottom=mask.getbbox()
            x=(left+right-BIRD_CELL)//2
            y=(top+bottom-BIRD_CELL)//2
            sprite=region.convert('RGBA')
            sprite.putalpha(mask)
            birds.append((sprite.crop((x,y,x+BIRD_CELL,y+BIRD_CELL)),(x+area[0],y+area[1])))
            frame.paste(sky,area[:2],mask)
        extracted.append(birds)
    return extracted

def mirrored_owl(frames,birds):
    # The original poses face left. Only their horizontal reflection faces right.
    wing_cycle=[poses[0][0] for poses in birds[:10]]
    left=[wing_cycle[i%len(wing_cycle)] for i in range(len(frames))]
    right=[ImageOps.mirror(sprite) for sprite in left]
    sprite_sheet('night_owl_left',left,10)
    sprite_sheet('night_owl_right',right,10)
    positions=[poses[0][1] for poses in birds]
    for i,(frame,(x,y)) in enumerate(zip(frames,positions)):
        # At each turn, look ahead to the next horizontal movement.
        next_x=next(positions[(i+step)%len(frames)][0] for step in range(1,len(frames))
                    if positions[(i+step)%len(frames)][0]!=x)
        frame.alpha_composite((right if next_x>x else left)[i],(x,y))

def sunset_flaps(sprite):
    # Keep the body and beak fixed. Separate the nearer, larger wing at its shoulder.
    mask=Image.new('L',sprite.size)
    ImageDraw.Draw(mask).polygon(((5,8),(16,8),(16,15),(19,18),(20,21),(21,24),
                                 (20,26),(16,28),(10,28),(5,23)),fill=255)
    wing=sprite.copy()
    wing.putalpha(ImageChops.multiply(sprite.getchannel('A'),mask))
    body=sprite.copy()
    body.putalpha(ImageChops.subtract(sprite.getchannel('A'),mask))
    patch=Image.new('RGBA',sprite.size)
    ImageDraw.Draw(patch).polygon(((18,23),(21,21),(24,22),(24,27),(20,30),(16,28)),
                                 fill='#fce1a1',outline='#39334c')
    patch.alpha_composite(body)
    result=[]
    for degrees in (0,22,47,62,45,18,0,-15):
        frame=patch.copy()
        frame.alpha_composite(wing.rotate(degrees,Image.Resampling.NEAREST,center=(20,24)))
        result.append(frame)
    return result

def animate_sunset_birds(frames,birds):
    flaps=[sunset_flaps(sprite) for sprite,_ in birds[0]]
    sprite_sheet('sunset_birds_flap',[sprite for bird in flaps for sprite in bird],8)
    for i,(frame,poses) in enumerate(zip(frames,birds)):
        for j,(_,position) in enumerate(poses):
            sprite=flaps[j][(i*2+j*3)%len(flaps[j])]
            if 10<=i<30:
                sprite=ImageOps.mirror(sprite)
            frame.alpha_composite(sprite,position)

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
    source=FLIGHT_SOURCE if name in ('night','sunset') else SC
    im=Image.open(source/f'{name}-gif.gif')
    path=BACK/f'{name}_fundo.png'
    have_original=path.is_file()
    bg=Image.open(path if have_original else SC/f'{name}-still.png').convert('RGBA')
    images=[];times=[]
    assert im.n_frames==40 and im.size==(320,320),(name,im.n_frames,im.size)
    for i in range(40):
        im.seek(i);f=im.convert('RGBA')
        if name in ('night','sunset'):
            clean_lamp(f,name,bg,have_original)
        elif name in ('desert','forest'):
            x=object_x(f,bg,name)
            if name=='desert':f=contact_shadow(f,x,296,12,(81,53,38,67))
            else:f=contact_shadow(f,x,298,13,(27,62,47,81))
        images.append(f)
        times.append(im.info.get('duration',145))
    if name in ('night','sunset'):
        birds=isolate_birds(images,name)
        animation=mirrored_owl if name=='night' else animate_sunset_birds
        animation(images,birds)
    images=[frame.convert('RGB') for frame in images]
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
