/**
 * gen_font.mjs -- Convert Hylia Serif TTF to LVGL 9 C fonts.
 *
 * Wraps the locally-installed lv_font_conv CLI to emit three sizes used by
 * sheikah_theme.h:
 *   hylia_serif_16.c  (small caps labels / footer)
 *   hylia_serif_20.c  (SK_FONT_LARGE -- panel titles, rune name)
 *   hylia_serif_28.c  (SK_FONT_TITLE  -- big headings, standby prompt)
 *
 * - bpp 4  : smooth anti-aliased edges, cheap on Flash.
 * - range 0x20-0x7F : full ASCII (Hylia Serif covers it); titles use UPPERCASE.
 * - --no-compress : LVGL 9 renders uncompressed bitmaps faster on ESP32-C3.
 * - The C variable name equals the output basename (e.g. hylia_serif_28).
 *
 * Usage: node gen_font.mjs
 */

import { execFileSync } from 'child_process';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const HERE = dirname(fileURLToPath(import.meta.url));
const FONT_TTF = String.raw`D:\2.Project\zelda-hyrule-ui\packages\core\assets\fonts\HyliaSerif.ttf`;
const OUT_DIR = join(HERE, '..', 'main', 'font');
const CLI = join(HERE, 'node_modules', 'lv_font_conv', 'lv_font_conv.js');

mkdirSync(OUT_DIR, { recursive: true });

const SIZES = [16, 20, 28];

for (const size of SIZES) {
    const outName = `hylia_serif_${size}.c`;
    const outPath = join(OUT_DIR, outName);
    const args = [
        CLI,
        '--font', FONT_TTF,
        '--size', String(size),
        '--bpp', '4',
        '--format', 'lvgl',
        '--no-compress',
        '--range', '0x20-0x7F',
        '--lv-font-name', `hylia_serif_${size}`,
        '--lv-include', 'lvgl.h',
        '-o', outPath,
    ];
    console.log(`Generating ${outName} (${size}px)...`);
    try {
        execFileSync(process.execPath, args, { stdio: 'inherit' });
    } catch (err) {
        console.error(`FAILED: ${outName}`, err.message);
        process.exit(1);
    }
}

console.log('\nFont conversion done -> ' + OUT_DIR);
