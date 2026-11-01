"""Generate device-only resources/data/fonts; never edits prototype inputs. No compiler/flasher.
Usage: python -B tools/build_offline_pack.py [--fonts]
Requires existing Pillow, Node; --fonts requires existing lv_font_conv. No installs/network.
"""
from pathlib import Path
import argparse,array,io,json,math,struct,subprocess,zlib,hashlib,wave
from PIL import Image,ImageOps,ImageEnhance
ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'assets/gen/prototype'
OUT=ROOT/'assets/gen/firmware/offline'
CODE=ROOT/'firmware/main/offline'
STEP=[7,8,9,10,11,12,13,14,16,17,19,21,23,25,28,31,34,37,41,45,50,55,60,66,73,80,88,97,107,118,130,143,157,173,190,209,230,253,279,307,337,371,408,449,494,544,598,658,724,796,876,963,1060,1166,1282,1411,1552,1707,1878,2066,2272,2499,2749,3024,3327,3660,4026,4428,4871,5358,5894,6484,7132,7845,8630,9493,10442,11487,12635,13899,15289,16818,18500,20350,22385,24623,27086,29794,32767]
INDEX=[-1,-1,-1,-1,2,4,6,8,-1,-1,-1,-1,2,4,6,8]
def adpcm(samples):
 out=bytearray();predictor=0;index=0;pending=0
 for i,target in enumerate(samples):
  step=STEP[index];diff=target-predictor;code=8 if diff<0 else 0;diff=abs(diff);delta=step>>3
  for bit,threshold in [(4,step),(2,step>>1),(1,step>>2)]:
   if diff>=threshold:code|=bit;diff-=threshold;delta+=threshold
  predictor=max(-32768,min(32767,predictor+(-delta if code&8 else delta)));index=max(0,min(88,index+INDEX[code]))
  if i%2:out.append(pending|(code<<4))
  else:pending=code
 if len(samples)%2:out.append(pending)
 return b'ADP1'+struct.pack('<II',16000,len(samples))+out

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--fonts',action='store_true');args=parser.parse_args()
 data=json.loads(subprocess.check_output(['node',str(ROOT/'tools/export_offline_data.mjs')],cwd=ROOT))
 comp=[dict(e,category=i) for i,c in enumerate(data['COMP_CATS']) for e in data['COMP_ENTRIES'][c['id']]]
 quests=[dict(e,category=i) for i,c in enumerate(['main','shrine','side']) for e in data['QUESTS'][c]]
 inv=data['INVENTORY_ITEMS'];places=data['MAP_PLACES']
 if [len(comp),len(quests),len(inv),len(places)]!=[394,152,24,177]:raise ValueError('Unexpected source counts')
 if len(data['ALBUM'])!=12 or len(data['RUNES'])!=9:raise ValueError('Unexpected prototype album/rune counts')
 resources={};sources={}
 def add(name,payload,w=0,h=0,fmt=0,source=''):
  if name in resources:return
  if len(name.encode())>=64:raise ValueError(name)
  resources[name]=(payload,w,h,fmt);sources[name]=str(source)
 def raster(name,im,w,h,alpha=False,source=''):
  im=im.resize((w,h),Image.Resampling.LANCZOS)
  if alpha:
   # LVGL RGB565A8: a packed RGB565 plane, followed by full 8-bit alpha.
   # Preserve transparency while saving 25% over ARGB8888; panel output is RGB565.
   rgba=im.convert('RGBA');rgb=rgba.convert('RGB').tobytes();payload=bytearray()
   for i in range(0,len(rgb),3):payload+=struct.pack('<H',((rgb[i]>>3)<<11)|((rgb[i+1]>>2)<<5)|(rgb[i+2]>>3))
   payload+=rgba.getchannel('A').tobytes();fmt=4
  else:
   rgb=im.convert('RGB').tobytes();payload=bytearray()
   for i in range(0,len(rgb),3):payload+=struct.pack('<H',((rgb[i]>>3)<<11)|((rgb[i+1]>>2)<<5)|(rgb[i+2]>>3))
   fmt=1
  add(name,bytes(payload),w,h,fmt,source)
 for lang,filename,size in [('cn','BotW_Simplified_Chinese_Logo.png',(200,72)),('en','BotW_English_Logo.png',(200,72))]:
  src=ROOT/'assets/raw/02_ui'/filename;im=ImageOps.contain(Image.open(src).convert('RGBA'),size,Image.Resampling.LANCZOS)
  canvas=Image.new('RGBA',size);canvas.alpha_composite(im,((size[0]-im.width)//2,(size[1]-im.height)//2));raster('ui/title_'+lang,canvas,*size,True,str(src.relative_to(ROOT)))
 raster('ui/eye',Image.open(ART/'eye.png'),96,96,True,'assets/gen/prototype/eye.png')
 # Switchable screen backgrounds: four 160x120 RGB565 plates the app upscales 2x.
 # Native raster, never JPEG (full-screen decode needs ~150KB contiguous heap the C3 lacks);
 # half resolution keeps four switchable plates within the budget of one full-res image.
 for i,src in enumerate(sorted((ROOT/'assets/gen/prototype/backgrounds').glob('bg_*.png'))):
  raster(f'ui/bg{i}',Image.open(src).convert('RGB'),160,120,False,str(src.relative_to(ROOT)))
 # Six live canvases: five clean JPEG plates and one code-drawn black/gold canvas.
 for i,letter in enumerate('EFGHI'):
  src=OUT/'standby/sources'/f'{letter}.png';size=(320,240) if i<3 else (240,320)
  im=ImageOps.fit(Image.open(src).convert('RGB'),size,Image.Resampling.LANCZOS)
  buf=io.BytesIO();im.save(buf,format='JPEG',quality=82,optimize=True,progressive=False)
  add(f'standby/{i}.jpg',buf.getvalue(),*size,3,src.relative_to(ROOT))
 env=Image.open(ART/'rune-environments-v2.png');ew,eh=env.size
 for i in range(9):
  # Exclude the atlas's white separators. The prototype overscans its cells to hide them.
  src=ART/'rune-environments-v2.png';im=env.crop((round((i%3)*ew/3)+12,round((i//3)*eh/3)+12,round((i%3+1)*ew/3)-12,round((i//3+1)*eh/3)-12))
  # Cube play needs a quiet backdrop: the original cell contains painted platforms
  # that compete with the real moving platform. Reuse the empty shrine environment.
  if i==1:im=env.crop((12,12,round(ew/3)-12,round(eh/3)-12))
  if i==2:src=ART/'magnet-shrine-side-v5.png';im=Image.open(src)
  im=ImageEnhance.Color(im.convert('RGB')).enhance(.78 if i==1 else .94)
  im=ImageEnhance.Brightness(im).enhance(.64 if i==1 else .82)
  raster(f'scene/{i}',im,320,198,source=src.relative_to(ROOT))
 atlas=Image.open(ART/'rune-sprites-v2.png')
 regions={0:(42,40,273,295),1:(353,32,586,304),3:(965,34,1253,300),5:(299,338,650,612),6:(666,384,940,608),7:(975,344,1231,607),8:(40,639,292,914),9:(314,688,615,881),10:(651,688,942,903),11:(983,640,1214,905),12:(100,910,223,1242),13:(333,981,596,1203),15:(921,901,1249,1241)}
 for cell,box in regions.items():
  size={5:(62,48),6:(67,67),7:(67,67),15:(96,96)}.get(cell,(48,48))
  im=atlas.crop(box);canvas=Image.new('RGBA',size);im.thumbnail(size,Image.Resampling.LANCZOS);canvas.alpha_composite(im,((size[0]-im.width)//2,size[1]-im.height));raster(f'sprite/{cell}',canvas,*size,True,'assets/gen/prototype/rune-sprites-v2.png')
 for cell,file,box,size in [(4,'cryonis-pillar-clean-v3.png',(197,93,868,1446),(55,66)),(14,'link-side-clean-v3.png',(302,101,710,1477),(18,52)),(2,'magnet-metal-plate-v5.png',(35,240,2140,480),(148,17))]:
  im=Image.open(ART/file).crop(box)
  if cell==4:
   im=ImageOps.contain(im,size,Image.Resampling.LANCZOS);canvas=Image.new('RGBA',size);canvas.alpha_composite(im,((size[0]-im.width)//2,size[1]-im.height));im=canvas
  raster(f'sprite/{cell}',im,*size,True,'assets/gen/prototype/'+file)
 # New device-only raster derivatives. Keep source proportions and common foot anchors.
 road=OUT/'sources/cycle-road-v2.png';im=Image.open(road).convert('RGBA');bounds=im.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
 raster('world/road',im.crop(bounds),896,64,True,str(road.relative_to(ROOT)))
 poses=OUT/'sources/link-actions-v2.png';im=Image.open(poses).convert('RGBA')
 for frame in range(4):
  part=im.crop((round(frame*im.width/4),0,round((frame+1)*im.width/4),im.height));bounds=part.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox();part=part.crop(bounds);part.thumbnail((32,52),Image.Resampling.LANCZOS)
  canvas=Image.new('RGBA',(32,52));canvas.alpha_composite(part,((32-part.width)//2,52-part.height));raster(f'link/{frame}',canvas,32,52,True,str(poses.relative_to(ROOT)))
 portrait=ART/'inventory/bg.png';im=Image.open(portrait).convert('RGBA');im.thumbnail((64,144),Image.Resampling.LANCZOS);canvas=Image.new('RGBA',(64,144));canvas.alpha_composite(im,((64-im.width)//2,144-im.height));raster('ui/link',canvas,64,144,True,str(portrait.relative_to(ROOT)))
 for i in range(5):
  for zoom,size in enumerate([19,25,38]):
   part=atlas.crop(regions[8+i]);part.thumbnail((size,size),Image.Resampling.LANCZOS);canvas=Image.new('RGBA',(size,size));canvas.alpha_composite(part,((size-part.width)//2,size-part.height));raster(f'camera/{i}_{zoom}',canvas,size,size,True,'assets/gen/prototype/rune-sprites-v2.png')
 raster('fx/beam',Image.open(ART/'rune-effects-v4.png').crop((0,445,443,887)),8,64,True,'assets/gen/prototype/rune-effects-v4.png')
 raster('fx/summon',Image.open(ART/'rune-effects-v4.png').crop(data['RUNE_FX']['beam']),28,76,True,'assets/gen/prototype/rune-effects-v4.png')
 fx_sizes={'blast0':(74,74),'blast1':(74,74),'blast2':(74,74),'blast3':(74,74),'shadow':(44,6),'reveal':(96,70),'reward':(64,64)}
 for name,size in fx_sizes.items():
  src=ART/'rune-effects-v4.png';raster('fx/'+name,Image.open(src).crop(data['RUNE_FX'][name]),*size,True,str(src.relative_to(ROOT)))
 kit_sizes={'gate':(18,79),'shore':(42,22),'force':(96,14),'destination':(25,25),'splash':(60,36),'bank':(104,25),'plinth':(70,13),'road':(286,18)}
 for name,size in kit_sizes.items():
  src=ART/'rune-world-kit-v4.png';raster('world/'+('ground' if name=='road' else name),Image.open(src).crop(data['RUNE_KIT'][name]),*size,True,str(src.relative_to(ROOT)))
 for i,cat in enumerate(data['INV_CATS']):
  src=ART/cat['icon'];png=subprocess.check_output(['node',str(ROOT/'tools/web/device_svg.mjs'),str(src),'20'])
  im=ImageOps.contain(Image.open(io.BytesIO(png)).convert('RGBA'),(20,20));canvas=Image.new('RGBA',(20,20));canvas.alpha_composite(im,((20-im.width)//2,(20-im.height)//2));raster(f'ui/category{i}',canvas,20,20,True,str(src.relative_to(ROOT)))
 for i,rune in enumerate(data['RUNES']):
  src=ART/rune['icon'];im=Image.open(src).convert('RGBA') if i!=8 else atlas.crop(regions[15])
  icon=ImageOps.contain(im,(26,26),Image.Resampling.LANCZOS);canvas=Image.new('RGBA',(26,26));canvas.alpha_composite(icon,((26-icon.width)//2,(26-icon.height)//2));raster(f'ui/rune{i}',canvas,26,26,True,str((src if i!=8 else ART/'rune-sprites-v2.png').relative_to(ROOT)))
 for i,item in enumerate(data['ALBUM']):
  for variant,file,size in [('thumb',item['img'],(72,40)),('big',item['big'],(320,240))]:
   src=ART/file;original=Image.open(src).convert('RGB')
   if variant=='big':
    fitted=ImageOps.contain(original,size,Image.Resampling.LANCZOS);im=Image.new('RGB',size,(6,21,30));im.paste(fitted,((size[0]-fitted.width)//2,(size[1]-fitted.height)//2))
   else:im=ImageOps.fit(original,size,Image.Resampling.LANCZOS)
   buf=io.BytesIO();im.save(buf,format='JPEG',quality=68,optimize=True,progressive=False);add(f'album/{i}/{variant}.jpg',buf.getvalue(),*size,3,str(src.relative_to(ROOT)))
 # All photos remain independent small JPEGs; current page only is decoded by LVGL.
 for e in comp+inv:
  file=e['img'];p=ART/file
  if not p.is_file():raise FileNotFoundError(p)
  im=Image.open(p).convert('RGBA');bg=Image.new('RGBA',im.size,(10,20,28,255));bg.alpha_composite(im);im=ImageOps.fit(bg.convert('RGB'),(88,88),Image.Resampling.LANCZOS)
  buf=io.BytesIO();im.save(buf,format='JPEG',quality=62,optimize=True,progressive=False);add('photo/'+file+'.jpg',buf.getvalue(),88,88,3,str(p.relative_to(ROOT)))
 # Equipment is transparent UI art, not a photo. Pre-size separate native
 # rasters for slots, rewards and previews; never transform a streaming JPEG.
 for e in inv:
  file=e['img'];p=ART/file
  original=Image.open(p).convert('RGBA')
  for size in (24,32,44):
   icon=ImageOps.contain(original,(size,size),Image.Resampling.LANCZOS)
   canvas=Image.new('RGBA',(size,size),(0,0,0,0))
   canvas.alpha_composite(icon,((size-icon.width)//2,(size-icon.height)//2))
   raster(f'equip/{size}/{file}',canvas,size,size,True,str(p.relative_to(ROOT)))
 for name,file in [('shrine','BotW_White_Sheikah_Eye_Symbol.png'),('tower','BotW_Main_Quest_Sprite.png'),('place','BotW_Key_Item_Icon.png')]:
  src=ROOT/'assets/raw/02_ui/glyphs'/file;raster('map/'+name,Image.open(src),12,12,True,str(src.relative_to(ROOT)))
 mapfile=ROOT/'assets/raw/05_world/maps/botw-map-base.webp';im=Image.open(mapfile)
 for level,size in enumerate([(384,320),(768,640),(1536,1280)]):
  layer=im.resize(size,Image.Resampling.LANCZOS)
  for y in range(0,size[1],64):
   for x in range(0,size[0],64):
    tile=layer.crop((x,y,x+64,y+64)).convert('RGB');buf=io.BytesIO();tile.save(buf,format='JPEG',quality=62,optimize=True);add(f'map/{level}_{x//64}_{y//64}.jpg',buf.getvalue(),64,64,3,str(mapfile.relative_to(ROOT)))
 # Original wave bytes remain untouched; derive mono16k IMA stream for device.
 audio={kind:ROOT/'assets/audio/prototype/botw'/file for kind,file in data['SFX_FILES'].items()}
 for kind,p in audio.items():
  if kind in data['SFX_FILES']:
   with wave.open(str(p)) as w:
    if w.getsampwidth()!=2 or w.getframerate()!=48000:raise ValueError('Expected source 48k PCM16: '+str(p))
    channels=w.getnchannels();a=array.array('h',w.readframes(w.getnframes()))
   stride=channels*3;samples=[sum(a[i:i+stride])//len(a[i:i+stride]) for i in range(0,len(a),stride)]
   peak=max(1,max(map(abs,samples)));gain=min(4,26000/peak);samples=[max(-32768,min(32767,round(v*gain))) for v in samples]
   add('audio/'+kind,adpcm(samples),source=str(p.relative_to(ROOT)))
 # Bilingual read-only C data, category IDs stable, strings never copied wholesale to heap.
 def q(s):return json.dumps(str(s or ''),ensure_ascii=False)
 lines=['/* Generated by tools/build_offline_pack.py. */','#include "offline.h"']
 for name,field in [('of_rune_cn','cn'),('of_rune_en','label'),('of_rune_desc_cn','desc'),('of_rune_desc_en','en_desc')]:
  lines.append('const char *'+name+'[9]={'+','.join(q(e.get(field,e.get('desc',''))) for e in data['RUNES'])+'};')
 lines.append('const char *of_rune_tile_cn[9]={'+','.join(q(data['RUNE_TILE_CN'].get(e['short'],e['short'])) for e in data['RUNES'])+'};')
 for array_name,items in [('of_comp',comp),('of_quests',quests),('of_inventory',inv)]:
  lines.append(f'const of_item_t {array_name}[{len(items)}]={{')
  for e in items:
   cn=e.get('cn',e.get('name'));en=e.get('title',e.get('name'));cnbody=e.get('cn_desc',e.get('description_cn',e.get('desc','')));enbody=e.get('en_desc',e.get('description',e.get('desc','')))
   cat=e.get('category',0)
   if isinstance(cat,str):cat={'weapons':0,'shields':1,'armors':2}.get(cat,2)
   lines.append('{'+','.join([q(cn),q(en),q(cnbody),q(enbody),q('photo/'+e['img']+'.jpg') if e.get('img') else 'NULL',str(cat),str({'weapon':0,'shield':1,'head':2,'body':3,'legs':4}.get(e.get('slot'),0)),str(e.get('value',0))])+'},')
  lines.append('};')
 camera_files=['blue_nightshade.png','hyrule_bass.png','chuchu.png','ore_deposit.png','master_sword.png']
 camera_ids=[next(i for i,e in enumerate(comp) if e['img']==file) for file in camera_files]
 lines.append('const uint16_t of_camera_subjects[5]={'+','.join(map(str,camera_ids))+'};')
 lines.append('const of_album_t of_album[12]={')
 for i,e in enumerate(data['ALBUM']):
  place_cn=e.get('place_cn') or data['PLACE_CN'].get(e['place']) or data['PLACE_CN'].get(e['place'].title())
  if not place_cn:raise ValueError('Missing album place translation: '+e['place'])
  lines.append('{'+','.join(map(q,[e['cn'],e['title'],e['time'],place_cn,e['place'],e['no'],f'album/{i}/thumb.jpg',f'album/{i}/big.jpg']))+'},')
 lines.append('};')
 m=data['MAGNET_BRIDGE'];c=data['CYCLE_CONTACT']
 lines.append('const of_geometry_t of_geometry={'+','.join(str(m[k]) for k in ['half','surfaceOffset','left','right','top','support'])+','+','.join(str(c[k]) for k in ['height','wheelY','wheelRadius','axle','rockGround','rockRadius'])+'};')
 lines.append('const int16_t of_ice_sites[5]={'+','.join(map(str,data['ICE_SITES']))+'};')
 gifts=[next(i for i,e in enumerate(inv) if e['id']==f['item']) for f in data['EXTRA_FIGURES']]
 lines.append('const uint8_t of_amiibo_gifts[3]={'+','.join(map(str,gifts))+'};')
 lines.append('const of_place_t of_places[177]={')
 for e in places:lines.append('{'+','.join([q(e['cn']),q(e['en']),q(e['kind']),str(round((e['x']+6000)/12000*768)),str(round((e['z']+5000)/10000*640))])+'},')
 lines.append('};')
 generated='\n'.join(lines)+'\n'
 # Pack only after all sources validated and size computed; no partial oversized output.
 names=sorted(resources);offset=(16+84*len(names)+3)&~3;index=bytearray();body=bytearray();manifest=[]
 for name in names:
  payload,w,h,fmt=resources[name];index+=struct.pack('<64sIIHHII',name.encode(),offset,len(payload),w,h,fmt,zlib.crc32(payload));manifest.append(dict(name=name,bytes=len(payload),source=sources[name],sha256=hashlib.sha256(payload).hexdigest()))
  body+=payload;pad=(-len(payload))%4;body+=b'\0'*pad;offset+=len(payload)+pad
 pack=b'SLATEPK1'+struct.pack('<II',len(names),zlib.crc32(index))+index+body
 if len(pack)>0x3f0000:raise ValueError(f'Resource pack {len(pack)} exceeds 0x3f0000; tune asset budget explicitly')
 OUT.mkdir(parents=True,exist_ok=True);CODE.mkdir(exist_ok=True);(CODE/'fonts').mkdir(exist_ok=True)
 (OUT/'resources.bin').write_bytes(pack);(OUT/'manifest.json').write_text(json.dumps(dict(schema=1,bytes=len(pack),budget=0x3f0000,entries=manifest),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 (CODE/'data.c').write_text(generated+f'const uint32_t of_pack_index_crc = {zlib.crc32(index)}u;\n',encoding='utf-8')
 if args.fonts:
  text=generated+'\n'.join(p.read_text(encoding='utf-8') for p in list(CODE.glob('*.c'))+list((CODE/'fonts').glob('*.c')) if p.name!='data.c')
  symbols=''.join(sorted(set(c for c in text if ord(c)>127)))
  cli=ROOT/'tools/node_modules/lv_font_conv/lv_font_conv.js'
  if not cli.exists():cli=ROOT/'tools/web/node_modules/lv_font_conv/lv_font_conv.js'
  if not cli.exists():raise FileNotFoundError('Existing lv_font_conv not found; no automatic install')
  for size in [10,12,14,16,28,40,52]:
   numeric=size>=28
   font_path=CODE/'fonts'/('font_clock.c' if size==28 else f'font_clock_{size}.c' if numeric else f'font_{size}.c')
   command=['node',str(cli),'--size',str(size),'--bpp','4','--format','lvgl','--lv-font-name',f'of_clock_{size}' if numeric else f'of_chinese_{size}','--font',str(ROOT/'prototype/fonts/HyliaSerifBeta-Regular.ttf'),'--range','0x2d,0x30-0x3a' if numeric else '0x20-0x7e']
   if not numeric:command+=['--font',str(ROOT/'assets/raw/07_fonts/SourceHanSansSC-Medium.otf'),'--symbols',symbols]
   subprocess.run(command+['-o',str(font_path)],check=True)
   font=font_path.read_text(encoding='utf-8')
   start=font.index('#ifdef LV_LVGL_H_INCLUDE_SIMPLE');end=font.index('#endif',start)+len('#endif')
   font=font[:start]+'#include "lvgl.h"'+font[end:]
   font=font.replace(next(line for line in font.splitlines() if ' * Opts:' in line),' * Generated from repository fonts; see tools/build_offline_pack.py for options.')
   font_path.write_text(font,encoding='utf-8')
 print(f'Device pack: {len(pack):,} / {0x3f0000:,} bytes; {len(names)} assets. Data: 394/152/24/177. Original assets unchanged.')
if __name__=='__main__':main()
