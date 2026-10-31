// Convert only requested existing prototype SVGs; PNG bytes go to stdout.
import {Resvg} from '@resvg/resvg-js';
import fs from 'node:fs';
const [file,size]=process.argv.slice(2);
if(!file||!/^\d+$/.test(size))throw new Error('Usage: device_svg.mjs FILE SIZE');
const svg=fs.readFileSync(file,'utf8');
process.stdout.write(new Resvg(svg,{fitTo:{mode:'width',value:Number(size)}}).render().asPng());
