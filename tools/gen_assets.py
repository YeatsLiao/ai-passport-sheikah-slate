#!/usr/bin/env python3
"""
gen_assets.py -- Procedurally generate assets that have no game SVG source:
  * rune_compendium.png  (open book / codex, Sheikah cyan, glow)
  * rune_settings.png    (gear, Sheikah cyan, glow)
  * slate_bg.png         (240x320 dark-blue background: gradient + center
                          glow + vignette + scanlines)

Rendered at high supersample then downscaled (LANCZOS) for crisp edges.
Usage: python gen_assets.py
"""

import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

OUT = Path(__file__).parent.parent / "assets" / "images"
OUT.mkdir(parents=True, exist_ok=True)

RUNE_CYAN = (0, 191, 250, 255)      # #00BFFA -- matches game ability runes
SS = 6                               # supersample factor


def _pt(cx, cy, r, a):
    return (cx + r * math.cos(a), cy + r * math.sin(a))


def add_glow(img, strength=0.55, radius_factor=0.055):
    """Composite a blurred, dimmed copy UNDER the crisp icon."""
    glow = img.filter(ImageFilter.GaussianBlur(radius=img.width * radius_factor))
    a = glow.getchannel('A').point(lambda p: int(p * strength))
    glow.putalpha(a)
    return Image.alpha_composite(glow, img)


def make_gear(size_px, color=RUNE_CYAN):
    W = size_px * SS
    img = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = cy = W / 2
    r_hole = W * 0.135
    r_root = W * 0.30
    r_tip = W * 0.415
    n = 8
    for i in range(n):
        a = 2 * math.pi * i / n - math.pi / 2
        ha = (2 * math.pi / n) * 0.32
        d.polygon([
            _pt(cx, cy, r_root, a - ha),
            _pt(cx, cy, r_tip, a - ha * 0.55),
            _pt(cx, cy, r_tip, a + ha * 0.55),
            _pt(cx, cy, r_root, a + ha),
        ], fill=color)
    d.ellipse([cx - r_root, cy - r_root, cx + r_root, cy + r_root], fill=color)
    d.ellipse([cx - r_hole, cy - r_hole, cx + r_hole, cy + r_hole], fill=(0, 0, 0, 0))
    img = add_glow(img)
    return img.resize((size_px, size_px), Image.LANCZOS)


def make_book(size_px, color=RUNE_CYAN):
    W = size_px * SS
    img = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = cy = W / 2
    hw = W * 0.37          # half width
    hh = W * 0.27          # half height
    gap = W * 0.028        # spine half-gap
    # Two page quads slanting up at the outer edges (open book)
    left = [(cx - gap, cy - hh * 0.72), (cx - hw, cy - hh),
            (cx - hw, cy + hh * 0.80), (cx - gap, cy + hh)]
    right = [(cx + gap, cy - hh * 0.72), (cx + hw, cy - hh),
             (cx + hw, cy + hh * 0.80), (cx + gap, cy + hh)]
    d.polygon(left, fill=color)
    d.polygon(right, fill=color)
    # Spine
    d.line([(cx, cy - hh * 0.72), (cx, cy + hh)], fill=color, width=int(W * 0.045))
    # Page grooves (transparent) to suggest pages
    for k in (0.30, 0.52):
        yy = cy - hh * 0.2 + hh * k
        d.line([(cx - hw * 0.82, yy - hh * 0.10), (cx - gap * 1.6, yy)],
               fill=(0, 0, 0, 0), width=int(W * 0.022))
        d.line([(cx + gap * 1.6, yy), (cx + hw * 0.82, yy - hh * 0.10)],
               fill=(0, 0, 0, 0), width=int(W * 0.022))
    img = add_glow(img)
    return img.resize((size_px, size_px), Image.LANCZOS)


def make_bg(w=240, h=320):
    img = Image.new('RGB', (w, h))
    px = img.load()
    top = (7, 13, 27)
    mid = (14, 30, 56)
    bot = (6, 11, 24)
    cx, cy = w / 2.0, h * 0.40
    maxd = math.hypot(cx, h - cy)

    def grad(t):
        if t < 0.5:
            k = t / 0.5
            return tuple(top[i] + (mid[i] - top[i]) * k for i in range(3))
        k = (t - 0.5) / 0.5
        return tuple(mid[i] + (bot[i] - mid[i]) * k for i in range(3))

    for y in range(h):
        t = y / h
        base = grad(t)
        for x in range(w):
            dist = math.hypot(x - cx, y - cy) / maxd
            glow = max(0.0, 1.0 - dist) * 16.0          # center lift
            vig = 1.0 - 0.42 * dist * dist              # corner darkening
            r = (base[0] + glow) * vig
            g = (base[1] + glow) * vig
            b = (base[2] + glow * 1.25) * vig
            if y % 3 == 0:                              # scanlines
                r *= 1.07; g *= 1.07; b *= 1.07
            px[x, y] = (max(0, min(255, int(r))),
                        max(0, min(255, int(g))),
                        max(0, min(255, int(b))))
    return img


def main():
    print("Generating rune_settings.png (gear)...")
    make_gear(56).save(OUT / "rune_settings.png")
    print("Generating rune_compendium.png (book)...")
    make_book(56).save(OUT / "rune_compendium.png")
    print("Generating slate_bg.png (240x320 background)...")
    make_bg().save(OUT / "slate_bg.png")
    print("Done ->", OUT)


if __name__ == '__main__':
    main()
