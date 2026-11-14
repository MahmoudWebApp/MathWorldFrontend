#!/usr/bin/env python3
"""Read-only visual audit of MathWorld Next.js favicon/PWA and shared mark.

Uses PNG previews in CI logs to allow precise inspection without modifying
the approved cap/sigma/x² artwork. No assets are generated here.
"""
from __future__ import annotations
import base64
import io
import json
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
FILES={
    "approved-web-mark":"public/mathworld-mark-transparent-v3.png",
    "favicon-16":"public/mathworld-favicon-16-v2.png",
    "favicon-32":"public/mathworld-favicon-32-v2.png",
    "apple-touch-icon":"public/apple-touch-icon.png",
    "web-pwa-192":"public/android-chrome-192x192.png",
    "web-pwa-512":"public/android-chrome-512x512.png",
}

def audit(name,path):
    with Image.open(path) as f:
        image=f.convert("RGBA")
        w,h=image.size
        corners=[image.getpixel((0,0)),image.getpixel((w-1,0)),image.getpixel((0,h-1)),image.getpixel((w-1,h-1))]
        preview=image.resize((96,96),Image.Resampling.LANCZOS)
        buff=io.BytesIO()
        preview.save(buff,format="PNG",optimize=True)
        print("WEB_BRAND_PREVIEW|"+name+"|"+base64.b64encode(buff.getvalue()).decode("ascii"),flush=True)
        return {
            "name":name,"mode":f.mode,"size":[w,h],
            "alphaRange":list(image.getchannel("A").getextrema()),
            "corners":[list(p) for p in corners],
            "opaqueBlackCorners":sum(1 for r,g,b,a in corners if a>=250 and max(r,g,b)<42),
            "transparentCorner":any(a<32 for _,_,_,a in corners)
        }

def main():
    results=[]
    for label,relative in FILES.items():
        path=ROOT/relative
        if not path.is_file():
            raise SystemExit("Missing expected web brand asset: "+relative)
        results.append(audit(label,path))
    print("WEB_BRAND_AUDIT_JSON|"+json.dumps(results),flush=True)
    assert next(x for x in results if x["name"]=="approved-web-mark")["transparentCorner"], (
        "MathWorld shared source mark has a baked-in background"
    )
    if any(x["opaqueBlackCorners"] for x in results):
        raise SystemExit("A web app icon still contains an opaque BLACK corner")
    print("PASS: no opaque black matte detected in Next.js/PWA logo assets",flush=True)

if __name__=="__main__":
    main()
