"""Retoque de fotos para el carrusel Arbat (estilo cálido, fondo desenfocado, producto nítido).
Uso: python3 scripts/arbat/enhance_photos.py  -> escribe public/assets/arbat/pro/*.jpg
"""
import random
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageChops

SRC = Path(__file__).resolve().parents[2] / "public/assets/arbat"
OUT = SRC / "pro"
OUT.mkdir(exist_ok=True)
W, H = 1080, 1440


def warm(im, r=1.05, g=1.01, b=0.92):
    R, G, B = im.split()
    R = R.point(lambda v: min(255, int(v * r)))
    G = G.point(lambda v: min(255, int(v * g)))
    B = B.point(lambda v: min(255, int(v * b)))
    return Image.merge("RGB", (R, G, B))


def grade(im, contrast=1.12, sat=1.2, bright=1.03):
    im = warm(im)
    im = ImageEnhance.Contrast(im).enhance(contrast)
    im = ImageEnhance.Color(im).enhance(sat)
    im = ImageEnhance.Brightness(im).enhance(bright)
    return im


def vignette(im, strength=0.35):
    w, h = im.size
    m = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(m)
    d.ellipse((-w * 0.25, -h * 0.15, w * 1.25, h * 1.15), fill=255)
    m = m.filter(ImageFilter.GaussianBlur(w * 0.18))
    dark = ImageEnhance.Brightness(im).enhance(1 - strength)
    return Image.composite(im, dark, m)


def dof(im, poly, blur=12, feather=18, bg_dark=0.9):
    """Desenfoca todo excepto el polígono (producto + mano)."""
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).polygon(poly, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(feather))
    bg = im.filter(ImageFilter.GaussianBlur(blur))
    bg = ImageEnhance.Brightness(bg).enhance(bg_dark)
    fg = im.filter(ImageFilter.UnsharpMask(radius=2.2, percent=90, threshold=2))
    return Image.composite(fg, bg, mask)


def crop34(im, cx, cy, w):
    h = w * 4 / 3
    return im.crop((int(cx - w / 2), int(cy - h / 2), int(cx + w / 2), int(cy + h / 2)))


# 1) Mano tomando la bolsa del anaquel (cierre L5)
im = Image.open(SRC / "anaquel-mano.jpg").convert("RGB")
poly = [(538, 655), (772, 632), (788, 1075), (735, 1105), (690, 1150), (600, 1215), (520, 1270),
        (470, 1340), (420, 1440), (360, 1600), (0, 1600), (0, 1380), (180, 1300), (300, 1240),
        (360, 1170), (420, 1100), (500, 1050), (548, 1040)]
im = dof(im, poly, blur=8, feather=22, bg_dark=0.86)
im = grade(im, contrast=1.14, sat=1.25)
im = crop34(im, 640, 820, 810).resize((W, H), Image.LANCZOS)
vignette(im, 0.32).save(OUT / "anaquel-mano.jpg", quality=93)

# 2) Antojo con café (L2): ya trae desenfoque; solo color y nitidez
im = Image.open(SRC / "antojo-cafe.jpg").convert("RGB")
poly = [(60, 500), (560, 500), (560, 1110), (60, 1110), (60, 500)]
bag = [(640, 250), (1200, 230), (1200, 1180), (620, 1170)]
mask = Image.new("L", im.size, 0)
d = ImageDraw.Draw(mask); d.polygon(poly, fill=255); d.polygon(bag, fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(20))
sharp = im.filter(ImageFilter.UnsharpMask(radius=2.4, percent=110, threshold=2))
soft = ImageEnhance.Brightness(im.filter(ImageFilter.GaussianBlur(6))).enhance(0.88)
im = Image.composite(sharp, soft, mask)
im = grade(im, contrast=1.12, sat=1.22)
im = crop34(im, 600, 800, 1200).resize((W, H), Image.LANCZOS)
vignette(im, 0.3).save(OUT / "antojo-cafe.jpg", quality=93)

# 3) Tres presentaciones sobre blanco: blancos limpios para fundir con papel (multiply)
im = Image.open(SRC / "tres-bolsas.jpg").convert("RGB")
im = warm(im, 1.03, 1.0, 0.95)
im = ImageEnhance.Contrast(im).enhance(1.1)
im = ImageEnhance.Color(im).enhance(1.15)
im = im.point(lambda v: 255 if v > 232 else min(255, int(v * 1.04)))
im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
im = im.filter(ImageFilter.UnsharpMask(radius=2.5, percent=80, threshold=3))
im.save(OUT / "tres-bolsas.jpg", quality=93)

# 4) Textura de papel
random.seed(7)
base = Image.new("RGB", (W, H), (241, 230, 211))
noise = Image.effect_noise((W // 6, H // 6), 30).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(12))
grain = Image.effect_noise((W, H), 18)
paper = Image.blend(base, Image.merge("RGB", (noise, noise, noise)), 0.06)
paper = Image.blend(paper, Image.merge("RGB", (grain, grain, grain)), 0.035)
d = ImageDraw.Draw(paper)
for _ in range(260):
    x, y = random.randint(0, W), random.randint(0, H)
    l = random.randint(6, 26)
    c = random.choice([(226, 211, 186), (249, 242, 230)])
    d.line((x, y, x + random.randint(-l, l), y + random.randint(-4, 4)), fill=c, width=1)
paper = vignette(paper, 0.08)
paper.save(OUT / "papel.jpg", quality=92)
print("ok")
