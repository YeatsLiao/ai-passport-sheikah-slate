#!/usr/bin/env python3
"""
img_to_c.py -- Convert PNG images to LVGL 9 C arrays (RGB565, big-endian for SPI)

Usage:
    python img_to_c.py [--all]

Requirements:
    pip install Pillow

Output:
    main/img/<name>.c  -- lv_img_dsc_t with RGB565 pixel data
    main/img/img_<name>.h -- extern declarations

LVGL 9 image descriptor header (12 bytes):
    magic_hi, magic_lo, w_lo, w_hi, h_lo, h_hi, stride_lo, stride_hi, stride_pad_lo, stride_pad_hi, reserved_lo, reserved_hi

    magic_lo = (width << 9) | (height << 19) | (stride << 3) | cf
    magic_hi = (stride >> 13) & 0x7
    cf for RGB565 = 0x09
"""

import struct
import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("ERROR: Pillow not installed. Run: pip install Pillow")
    sys.exit(1)

# Image definitions: (source_png, c_var_name, target_w, target_h)
IMAGES = [
    ("sheikah_eye.png",  "img_sheikah_eye",  120, 120),
    ("rune_bomb.png",    "img_rune_bomb",     48,  48),
    ("rune_magnet.png",  "img_rune_magnet",   48,  48),
    ("rune_stasis.png",  "img_rune_stasis",   48,  48),
    ("rune_cryonis.png", "img_rune_cryonis",  48,  48),
    ("rune_camera.png",  "img_rune_camera",   48,  48),
]

ASSETS_DIR = Path(__file__).parent.parent / "assets" / "images"
OUT_DIR    = Path(__file__).parent.parent / "main" / "img"

CF_RGB565 = 0x09


def make_lvgl_header(w, h, stride):
    """Build LVGL 9 image descriptor header (12 bytes).
    
    Layout:
      uint32_t cf;       // 4 bytes (color format + magic + w/h/stride)
      uint32_t stride;   // 4 bytes
      uint32_t reserved; // 4 bytes (zero)
    """
    # cf field: LVGL 9 packs everything here but we only set cf value.
    # The lv_image_set_src() reads header.{w,h,stride} separately.
    cf = CF_RGB565
    return struct.pack('<III', cf, stride, 0)


def convert_image(src_path, var_name, tw, th):
    """Convert one PNG to LVGL RGB565 C array."""
    print(f"  Converting {src_path.name} -> {var_name} ({tw}x{th})...")

    img = Image.open(src_path).convert('RGBA')
    img = img.resize((tw, th), Image.LANCZOS)

    stride = tw * 2  # RGB565 = 2 bytes per pixel
    header = make_lvgl_header(tw, th, stride)

    pixels = bytearray()
    for y in range(th):
        for x in range(tw):
            r, g, b, a = img.getpixel((x, y))
            # Pre-multiply alpha into RGB for RGB565 (no alpha channel)
            if a < 255:
                f = a / 255.0
                r = int(r * f)
                g = int(g * f)
                b = int(b * f)
            # RGB565 big-endian (for SPI swap_bytes=true in esp_lvgl_port)
            rgb565 = ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3)
            pixels += struct.pack('>H', rgb565)

    # Write .c file
    c_path = OUT_DIR / f"{var_name}.c"
    with open(c_path, 'w') as f:
        f.write(f'// Auto-generated from {src_path.name} -- DO NOT EDIT\n')
        f.write(f'// Source: {tw}x{th} RGB565 big-endian, {len(pixels)} bytes\n')
        f.write('#include "lvgl.h"\n\n')

        # Pixel data array only (header is in the descriptor struct)
        f.write(f'static const uint8_t {var_name}_map[] = {{\n')
        for i in range(0, len(pixels), 16):
            chunk = pixels[i:i+16]
            f.write('    ' + ', '.join(f'0x{b:02X}' for b in chunk) + ',\n')
        f.write('};\n\n')

        # Image descriptor with explicit fields (LVGL 9 style)
        f.write(f'const lv_image_dsc_t {var_name} = {{\n')
        f.write(f'    .header.cf = LV_COLOR_FORMAT_RGB565,\n')
        f.write(f'    .header.w = {tw},\n')
        f.write(f'    .header.h = {th},\n')
        f.write(f'    .header.stride = {stride},\n')
        f.write(f'    .data_size = {len(pixels)},\n')
        f.write(f'    .data = {var_name}_map,\n')
        f.write(f'}};\n')

    print(f"    -> {c_path} ({len(pixels) + len(header)} bytes)")
    return var_name, tw, th


def write_master_header(image_list):
    """Write img_all.h with all extern declarations."""
    h_path = OUT_DIR / "img_all.h"
    with open(h_path, 'w') as f:
        f.write('// Auto-generated image declarations -- DO NOT EDIT\n')
        f.write('#pragma once\n')
        f.write('#include "lvgl.h"\n\n')
        for var_name, w, h in image_list:
            f.write(f'extern const lv_image_dsc_t {var_name};  // {w}x{h}\n')
    print(f"  -> {h_path}")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    results = []

    print(f"Assets dir: {ASSETS_DIR}")
    print(f"Output dir: {OUT_DIR}")
    print()

    for src_name, var_name, tw, th in IMAGES:
        src_path = ASSETS_DIR / src_name
        if not src_path.exists():
            print(f"  SKIP {src_name} (not found)")
            continue
        r = convert_image(src_path, var_name, tw, th)
        results.append(r)

    print()
    write_master_header(results)
    print(f"\nDone! Generated {len(results)} image C files.")
    print(f"Total pixel data: ~{sum(w*h*2 for _,w,h in results) // 1024}KB")


if __name__ == '__main__':
    main()
