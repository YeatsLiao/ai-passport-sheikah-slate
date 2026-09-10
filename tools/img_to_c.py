#!/usr/bin/env python3
"""
img_to_c.py -- Convert PNG images to LVGL 9 C arrays.

Two output formats:
  * ARGB8888 (icons, with alpha)  -- straight (non-premultiplied) alpha,
                                     memory byte order B, G, R, A.
                                     Verified against LVGL 9.5
                                     argb8888_image_blend() -> lv_color_24_16_mix():
                                       c1[0]=B, c1[1]=G, c1[2]=R, src[x+3]=A
                                       result = src*alpha + dst*(1-alpha)
  * RGB565   (opaque background)  -- LITTLE-endian (LVGL native lv_color16_t).
                                     Verified against LVGL 9.5 rgb565_image_blend():
                                     opaque RGB565 source is lv_memcpy'd verbatim into
                                     the native little-endian draw buffer; esp_lvgl_port
                                     then calls lv_draw_sw_rgb565_swap() at flush time to
                                     emit the big-endian order the ST7789 SPI panel wants.
                                     So the stored bytes must be little-endian, NOT big.

Usage:
    python img_to_c.py

Requirements:
    pip install Pillow

Output:
    main/img/<var>.c   -- lv_image_dsc_t + pixel data
    main/img/img_all.h -- extern declarations
"""

import struct
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow not installed. Run: pip install Pillow")
    sys.exit(1)

# (source_png, c_var_name, target_w, target_h, fmt)
#   fmt: 'a' = ARGB8888 (alpha), 'r' = RGB565 (opaque, big-endian)
IMAGES = [
    # ---- 待机页: 希卡之眼 ----
    ("sheikah_eye.png",       "img_sheikah_eye",    150, 150, 'a'),
    # ---- 符文轮盘 (8 格, 56x56) ----
    ("rune_bomb.png",         "img_rune_bomb",       56,  56, 'a'),
    ("rune_magnet.png",       "img_rune_magnet",     56,  56, 'a'),
    ("rune_stasis.png",       "img_rune_stasis",     56,  56, 'a'),
    ("rune_cryonis.png",      "img_rune_cryonis",    56,  56, 'a'),
    ("rune_camera.png",       "img_rune_camera",     56,  56, 'a'),
    ("rune_compendium.png",   "img_rune_compendium", 56,  56, 'a'),
    ("rune_quest.png",        "img_rune_quest",      56,  56, 'a'),
    ("rune_settings.png",     "img_rune_settings",   56,  56, 'a'),
    # ---- 图鉴分类图标 (28x28) ----
    ("comp_creatures.png",    "img_comp_creatures",  28,  28, 'a'),
    ("comp_monsters.png",     "img_comp_monsters",   28,  28, 'a'),
    ("comp_materials.png",    "img_comp_materials",  28,  28, 'a'),
    ("comp_equipment.png",    "img_comp_equipment",  28,  28, 'a'),
    ("comp_treasures.png",    "img_comp_treasures",  28,  28, 'a'),
    # ---- 任务图标 (24x24) ----
    ("quest_main.png",        "img_quest_main",      24,  24, 'a'),
    # ---- 装饰: 标题角饰 / 面板四角 (tan) ----
    ("ornament_left.png",     "img_ornament_left",   24,  22, 'a'),
    ("ornament_right.png",    "img_ornament_right",  24,  22, 'a'),
    ("corner.png",            "img_corner",          12,  12, 'a'),
    # ---- 游戏原版轮盘框架装饰 (希卡青) ----
    ("selector_center.png",   "img_selector_center", 36,  36, 'a'),
    ("selector_top.png",      "img_selector_top",    30,  30, 'a'),
    ("selector_left.png",     "img_selector_left",   22,  26, 'a'),
    ("selector_right.png",    "img_selector_right",  26,  26, 'a'),
    # ---- 扫描线侧边装饰 ----
    ("scanline_side.png",     "img_scanline_side",   10, 180, 'a'),
    # ---- 背景 (240x320, RGB565) ----
    ("slate_bg.png",          "img_slate_bg",       240, 320, 'r'),
]

ASSETS_DIR = Path(__file__).parent.parent / "assets" / "images"
OUT_DIR    = Path(__file__).parent.parent / "main" / "img"


def convert_argb8888(img, tw, th):
    """RGBA -> ARGB8888 straight alpha, byte order B,G,R,A."""
    img = img.convert('RGBA').resize((tw, th), Image.LANCZOS)
    px = img.load()
    data = bytearray()
    for y in range(th):
        for x in range(tw):
            r, g, b, a = px[x, y]
            data += bytes((b, g, r, a))
    return data, tw * 4, "LV_COLOR_FORMAT_ARGB8888"


def convert_rgb565(img, tw, th):
    """RGB -> RGB565 little-endian (LVGL native lv_color16_t; opaque)."""
    img = img.convert('RGB').resize((tw, th), Image.LANCZOS)
    px = img.load()
    data = bytearray()
    for y in range(th):
        for x in range(tw):
            r, g, b = px[x, y]
            rgb565 = ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3)
            data += struct.pack('<H', rgb565)
    return data, tw * 2, "LV_COLOR_FORMAT_RGB565"


def convert_image(src_path, var_name, tw, th, fmt):
    print(f"  {src_path.name} -> {var_name} ({tw}x{th}, "
          f"{'ARGB8888' if fmt == 'a' else 'RGB565'})...")
    img = Image.open(src_path)
    if fmt == 'a':
        pixels, stride, cf = convert_argb8888(img, tw, th)
    else:
        pixels, stride, cf = convert_rgb565(img, tw, th)

    c_path = OUT_DIR / f"{var_name}.c"
    with open(c_path, 'w') as f:
        f.write(f'// Auto-generated from {src_path.name} -- DO NOT EDIT\n')
        f.write(f'// {tw}x{th} {cf}, {len(pixels)} bytes\n')
        f.write('#include "lvgl.h"\n\n')
        f.write(f'#ifndef LV_ATTRIBUTE_MEM_ALIGN\n#define LV_ATTRIBUTE_MEM_ALIGN\n#endif\n\n')
        f.write(f'static const LV_ATTRIBUTE_MEM_ALIGN uint8_t {var_name}_map[] = {{\n')
        for i in range(0, len(pixels), 16):
            chunk = pixels[i:i + 16]
            f.write('    ' + ', '.join(f'0x{b:02X}' for b in chunk) + ',\n')
        f.write('};\n\n')
        f.write(f'const lv_image_dsc_t {var_name} = {{\n')
        f.write(f'    .header.cf = {cf},\n')
        f.write(f'    .header.w = {tw},\n')
        f.write(f'    .header.h = {th},\n')
        f.write(f'    .header.stride = {stride},\n')
        f.write(f'    .data_size = {len(pixels)},\n')
        f.write(f'    .data = {var_name}_map,\n')
        f.write(f'}};\n')
    print(f"    -> {c_path.name} ({len(pixels)} bytes)")
    return var_name, tw, th


def write_master_header(image_list):
    h_path = OUT_DIR / "img_all.h"
    with open(h_path, 'w') as f:
        f.write('// Auto-generated image declarations -- DO NOT EDIT\n')
        f.write('#pragma once\n')
        f.write('#include "lvgl.h"\n\n')
        for var_name, w, h in image_list:
            f.write(f'extern const lv_image_dsc_t {var_name};  // {w}x{h}\n')
    print(f"  -> {h_path.name}")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    total = 0
    print(f"Assets: {ASSETS_DIR}\nOutput: {OUT_DIR}\n")
    for src_name, var_name, tw, th, fmt in IMAGES:
        src_path = ASSETS_DIR / src_name
        if not src_path.exists():
            print(f"  SKIP {src_name} (not found)")
            continue
        results.append(convert_image(src_path, var_name, tw, th, fmt))
        total += tw * th * (4 if fmt == 'a' else 2)
    print()
    write_master_header(results)
    print(f"\nDone! {len(results)} images, ~{total // 1024}KB pixel data.")


if __name__ == '__main__':
    main()
