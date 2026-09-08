/**
 * svg_to_png.mjs -- Render zelda-hyrule-ui SVG icons to transparent PNGs.
 *
 * Pipeline: SVG (resvg, zoom by viewBox -> correct aspect) -> sharp resize
 *           (fit:'contain', transparent pad) -> assets/images/*.png  (RGBA)
 *
 * - Alpha is PRESERVED (icons composite over the dark-blue slate background).
 * - `filter="url(...)"` attributes are stripped (glow is added at runtime by
 *   LVGL shadow, so baked blur filters are unnecessary and clip-prone).
 * - `fill="var(--x, FALLBACK)"`: if a fillColor override is given it wins,
 *   otherwise the SVG's own fallback color is kept.
 *
 * Usage: node svg_to_png.mjs
 */

import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const SVG_DIR = String.raw`D:\2.Project\zelda-hyrule-ui\packages\core\assets\svg`;
const OUT_DIR = String.raw`D:\2.Project\ai-passport-sheikah-slate\assets\images`;

mkdirSync(OUT_DIR, { recursive: true });

// [svgFile, outName, targetW, targetH, fillColorOverride|null]
const conversions = [
    // 待机页希卡之眼 (亮希卡蓝)
    ['sheikah-symbol.svg',       'sheikah_eye.png',    150, 150, '#59D8FF'],
    // 符文轮盘 5 个能力符文 (保留原版 #00BFFA)
    ['ability-round-bomb.svg',   'rune_bomb.png',       56,  56, null],
    ['ability-magnesis.svg',     'rune_magnet.png',     56,  56, null],
    ['ability-stasis.svg',       'rune_stasis.png',     56,  56, null],
    ['ability-cryonis.svg',      'rune_cryonis.png',    56,  56, null],
    ['ability-camera.svg',       'rune_camera.png',     56,  56, null],
    // 冒险记录轮盘图标 (统一符文青)
    ['quest-icon-main.svg',      'rune_quest.png',      56,  56, '#00BFFA'],
    // 图鉴分类图标 (保留各自青色)
    ['compendium-creatures.svg', 'comp_creatures.png',  28,  28, null],
    ['compendium-enemies.svg',   'comp_monsters.png',   28,  28, null],
    ['compendium-materials.svg', 'comp_materials.png',  28,  28, null],
    ['compendium-weapons.svg',   'comp_equipment.png',  28,  28, null],
    ['compendium-treasure.svg',  'comp_treasures.png',  28,  28, null],
    // 任务页装饰图标 (金色)
    ['quest-icon-main.svg',      'quest_main.png',      24,  24, null],
    // 标题角饰 / 面板四角 (tan)
    ['title-ornament-left.svg',  'ornament_left.png',   24,  22, null],
    ['title-ornament-right.svg', 'ornament_right.png',  24,  22, null],
    ['item-corner.svg',          'corner.png',          12,  12, null],
];

const SCALE = 6; // supersampling factor for crisp downscale

function parseViewBox(svgText) {
    const m = svgText.match(/viewBox="([\d.eE+-]+)[\s,]+([\d.eE+-]+)[\s,]+([\d.eE+-]+)[\s,]+([\d.eE+-]+)"/);
    if (!m) return null;
    return { w: parseFloat(m[3]), h: parseFloat(m[4]) };
}

for (const [svgFile, outName, tw, th, fillColor] of conversions) {
    const svgPath = join(SVG_DIR, svgFile);
    let svgText;
    try {
        svgText = readFileSync(svgPath, 'utf-8');
    } catch {
        console.log(`SKIP: ${svgFile} not found`);
        continue;
    }

    // Strip glow/blur filters (added at runtime via LVGL shadow instead)
    svgText = svgText.replace(/\sfilter="url\([^)]*\)"/g, '');

    // Resolve CSS-variable fills
    if (fillColor) {
        svgText = svgText.replace(/var\(\s*--[\w-]+\s*,\s*[^)]*?\s*\)/g, fillColor);
    } else {
        svgText = svgText.replace(/var\(\s*--[\w-]+\s*,\s*([^)]*?)\s*\)/g, '$1');
    }

    const vb = parseViewBox(svgText);
    if (!vb || vb.w <= 0) {
        console.log(`SKIP: ${svgFile} has no usable viewBox`);
        continue;
    }

    // Render at zoom so output width = tw*SCALE, aspect preserved from viewBox
    const zoom = (tw * SCALE) / vb.w;
    const resvg = new Resvg(svgText, {
        fitTo: { mode: 'zoom', value: zoom },
        background: 'rgba(0, 0, 0, 0)',
        font: { loadSystemFonts: false },
    });
    const pngBuffer = resvg.render().asPng();

    // Downscale to target box, preserving aspect, padding with transparency
    const result = await sharp(pngBuffer)
        .resize(tw, th, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
            kernel: sharp.kernel.lanczos3,
        })
        .png()
        .toBuffer();

    writeFileSync(join(OUT_DIR, outName), result);
    console.log(`OK: ${svgFile} -> ${outName} (${tw}x${th})`);
}

console.log('\nSVG rendering done.');
