#!/usr/bin/env python3
"""Kontaktbogen aus Standbildern: python3 contact.py <ordner> <prefix> <fmt> <ausgabe.png> [spalten]"""
import sys, glob, os
from PIL import Image, ImageDraw, ImageFont
d, prefix, fmt, out = sys.argv[1:5]
cols = int(sys.argv[5]) if len(sys.argv) > 5 else 5
files = sorted(glob.glob(os.path.join(d, f"{prefix}_{fmt}_*.png")),
               key=lambda p: float(p.rsplit("_", 1)[1][:-4]))
ims = [Image.open(f).convert("RGB") for f in files]
tw = {"16x9": 480, "9x16": 216, "1x1": 300}[fmt]
th = round(ims[0].height * tw / ims[0].width)
pad, lab = 16, 30
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (tw + pad) + pad, rows * (th + lab + pad) + pad), (233, 228, 216))
dr = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
except Exception:
    font = ImageFont.load_default()
for i, (im, f) in enumerate(zip(ims, files)):
    r, c = divmod(i, cols)
    x, y = pad + c * (tw + pad), pad + r * (th + lab + pad)
    sheet.paste(im.resize((tw, th), Image.LANCZOS), (x, y + lab))
    dr.text((x, y + 4), f"t = {float(f.rsplit('_',1)[1][:-4]):.2f} s", fill=(13, 0, 0), font=font)
sheet.save(out)
print(out, sheet.size)
