#!/usr/bin/env python3
"""Generate Next.js favicon/PWA icons from the APPROVED transparent mark.

Do not redraw symbols or strip matte heuristically: all published outputs use
the source at public/mathworld-mark-transparent-v3.png. An opaque pastel
background is required by Apple touch icons and makes black icon corners
impossible. This visual identity matches the Flutter iOS/PWA launcher set.
"""
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/"public"
SRC=PUBLIC/"mathworld-mark-transparent-v3.png"
MASTER=1024

def source_mark():
    im=Image.open(SRC).convert("RGBA")
    alpha=im.getchannel("A")
    lo,hi=alpha.getextrema()
    if lo!=0 or hi!=255:
        raise ValueError("Source MathWorld mark must retain clean transparency")
    bbox=alpha.getbbox()
    if bbox is None:
        raise ValueError("Approved mark is empty")
    return im.crop(bbox)

def canvas(mark,extent=0.72):
    image=Image.new("RGBA",(MASTER,MASTER),(0,0,0,0))
    pixels=image.load()
    top=(248,244,255)
    end=(255,234,247)
    for y in range(MASTER):
        for x in range(MASTER):
            t=(x+y)/(2*(MASTER-1))
            rgb=tuple(round(top[k]*(1-t)+end[k]*t) for k in range(3))
            pixels[x,y]=(*rgb,255)
    lim=round(MASTER*extent)
    ratio=min(lim/mark.width,lim/mark.height)
    size=(round(mark.width*ratio),round(mark.height*ratio))
    symbol=mark.resize(size,Image.Resampling.LANCZOS)
    image.alpha_composite(symbol,((MASTER-size[0])//2,(MASTER-size[1])//2))
    return image.convert("RGB")

def save_png(master,path,size):
    image=master.resize((size,size),Image.Resampling.LANCZOS)
    image.save(path,"PNG",optimize=True)
    corner=image.getpixel((0,0))
    if max(corner)<90:
        raise ValueError(f"Black backing in {path}")
    print(f"WEB_BRAND_REBUILT|{path.relative_to(ROOT)}|{size}",flush=True)

def save_ico(master,path):
    master.save(path,format="ICO",sizes=[(16,16),(32,32),(48,48),(64,64)])
    print(f"WEB_BRAND_REBUILT|{path.relative_to(ROOT)}|ICO",flush=True)

def main():
    mark=source_mark()
    regular=canvas(mark,0.72)
    tiny=canvas(mark,0.84)
    for name,size in [
        ("android-chrome-192x192.png",192),
        ("android-chrome-512x512.png",512),
        ("apple-touch-icon.png",180),
    ]:
        save_png(regular,PUBLIC/name,size)
    for name,size in [
        ("mathworld-favicon-16-v2.png",16),
        ("mathworld-favicon-32-v2.png",32),
        ("favicon-16x16.png",16),
        ("favicon-32x32.png",32),
    ]:
        save_png(tiny,PUBLIC/name,size)
    for path in [
        PUBLIC/"mathworld-favicon-v2.ico",
        PUBLIC/"favicon.ico",
        ROOT/"src/app/favicon.ico",
    ]:
        save_ico(tiny,path)
    print("PASS: regenerated all active browser, iOS home shortcut and PWA icons from one transparent MathWorld symbol")

if __name__=="__main__":
    main()
