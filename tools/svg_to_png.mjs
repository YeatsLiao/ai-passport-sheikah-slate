/**
 * svg_to_png.mjs -- Render SVG icons to PNG using @resvg/resvg-js + sharp
 * 
 * Converts zelda-hyrule-ui SVGs to properly sized PNGs on black background.
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

// [svgFile, outputName, targetW, targetH, fillColor]
const conversions = [
    ['sheikah-symbol.svg',      'sheikah_eye.png',  240, 240, '#3CD3FC'],
    ['ability-round-bomb.svg',  'rune_bomb.png',     96,  96, '#00BFFA'],
    ['ability-magnesis.svg',    'rune_magnet.png',   96,  96, '#00BFFA'],
    ['ability-stasis.svg',      'rune_stasis.png',   96,  96, '#00BFFA'],
    ['ability-cryonis.svg',     'rune_cryonis.png',  96,  96, '#00BFFA'],
    ['ability-camera.svg',      'rune_camera.png',   96,  96, '#00BFFA'],
];

const SCALE = 4; // supersampling for quality

for (const [svgFile, outName, tw, th, fillColor] of conversions) {
    const svgPath = join(SVG_DIR, svgFile);
    let svgText;
    try {
        svgText = readFileSync(svgPath, 'utf-8');
    } catch {
        console.log(`SKIP: ${svgFile} not found`);
        continue;
    }

    // Replace CSS variable fills with actual colors
    svgText = svgText.replace(/fill="var\([^)]+\)"/g, `fill="${fillColor}"`);

    // Render at high resolution using resvg
    const renderW = tw * SCALE;
    const renderH = th * SCALE;

    const opts = {
        fitTo: { mode: 'width', value: renderW },
        font: { loadSystemFonts: false },
    };

    const resvg = new Resvg(svgText, opts);
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // Resize to target size with sharp, composite onto black background
    const result = await sharp(pngBuffer)
        .resize(tw, th, { kernel: sharp.kernel.lanczos3 })
        .flatten({ background: { r: 0, g: 0, b: 0 } })
        .png()
        .toBuffer();

    const outPath = join(OUT_DIR, outName);
    writeFileSync(outPath, result);
    console.log(`OK: ${svgFile} -> ${outName} (${tw}x${th})`);
}

console.log('\nAll done!');
