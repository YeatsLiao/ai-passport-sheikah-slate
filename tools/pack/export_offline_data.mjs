// Repository-owned const data only; no prototype application or browser code executes.
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../../',import.meta.url),context={};vm.createContext(context);
const result={};
function literal(file,name){
 const text=fs.readFileSync(new URL(file,root),'utf8');
 const match=new RegExp('(?:^|\\n)const '+name+'\\s*=\\s*').exec(text);
 if(!match)throw new Error('Missing prototype constant: '+name);
 const start=match.index+match[0].length,stack=[];let quote=null;
 if(!'{['.includes(text[start]))throw new Error('Expected literal object/array: '+name);
 for(let i=start;i<text.length;i++){
  const c=text[i];
  if(quote){if(c==='\\')i++;else if(c===quote)quote=null;continue;}
  if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
  if(c==='/'&&text[i+1]==='/'){i=text.indexOf('\n',i);if(i<0)break;continue;}
  if(c==='/'&&text[i+1]==='*'){i=text.indexOf('*/',i+2);if(i<0)break;i++;continue;}
  if(c==='{'||c==='[')stack.push(c==='{'?'}':']');
  else if(c==='}'||c===']'){
   if(stack.pop()!==c)throw new Error('Unbalanced constant: '+name);
   if(!stack.length)return vm.runInNewContext('('+text.slice(start,i+1)+')',{}, {timeout:1000});
  }
 }
 throw new Error('Unterminated prototype constant: '+name);
}
for(const [file,names] of [['compendium-data',['COMP_CATS','COMP_ENTRIES']],['inventory-data',['INVENTORY_ITEMS']],['quest-data',['QUESTS']],['map-data',['MAP_PLACES']]]){
 const text=fs.readFileSync(new URL(`prototype/js/${file}.js`,root),'utf8');
 vm.runInContext(text+';globalThis.EXPORT={'+names.map(n=>`${n}:${n}`).join(',')+'}',context,{timeout:3000});
 Object.assign(result,context.EXPORT);
}
// Reuse only the literal equipment-name dictionary, never execute app.js.
const app=fs.readFileSync(new URL('prototype/js/app.js',root),'utf8');
const names=app.match(/const INV_CN = (\{[\s\S]*?\n\});/);
if(!names)throw new Error('Equipment translation dictionary not found');
const cn=vm.runInNewContext('('+names[1]+')',{}, {timeout:1000});
const all=Object.values(result.COMP_ENTRIES).flat();
for(const item of result.INVENTORY_ITEMS)item.cn=cn[item.id]||all.find(e=>e.name.toLowerCase()===item.name.toLowerCase())?.cn||item.name;
// Export the current prototype's sound dictionary, including its explicit
// overrides. Do not substitute a different completion cue on the device.
const soundFiles=fs.readFileSync(new URL('prototype/js/sound-files.js',root),'utf8');
const sound=fs.readFileSync(new URL('prototype/js/sound.js',root),'utf8');
const override=sound.match(/const SFX_FILES=(\{[^\n]+\});/);
if(!override)throw new Error('Prototype sound mapping not found');
result.SFX_FILES=vm.runInNewContext(soundFiles+';('+override[1]+')',{}, {timeout:1000});
for(const name of ['ALBUM','RUNES'])result[name]=literal('prototype/js/data.js',name);
for(const name of ['INV_CATS','INV_BONUS_ICONS','RUNE_TILE_CN','PLACE_CN'])result[name]=literal('prototype/js/app.js',name);
for(const name of ['RUNE_KIT','RUNE_FX'])result[name]=literal('prototype/js/rune-art.js',name);
result.MAGNET_BRIDGE=literal('prototype/js/rune-games.js','MAGNET_BRIDGE');
for(const name of ['EXTRA_FIGURES','CYCLE_CONTACT','ICE_SITES','CYCLE_GAPS'])result[name]=literal('prototype/js/rune-extras.js',name);
process.stdout.write(JSON.stringify(result));
