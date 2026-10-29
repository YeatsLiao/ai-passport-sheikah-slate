/* Referenced game art v2: cell mapping is shared by every rune renderer. */
const RUNE_ART_READY={scenes:true,sprites:true};
const RUNE_FALLBACKS=['rune_bomb.png','rune_cube.png','magnesis-bridge-v1.png','cut_talus.png','ability-atlas-v1.png','rune_master_cycle_zero.png','treasure_chest.png','treasure_chest.png','pic_nightshade.png','pic_bass.png','pic_chuchu.png','mat_amber.png','pic_mastersword.png','cp_apple.png','inventory/bg.png'];
const fallbackRuneImage=cell=>cell===15?'../assets/raw/01_runes/gallery/reference_sensor_shrine.png':IMG(RUNE_FALLBACKS[cell]);
const RUNE_CLEAN_SPRITES={
  4:{file:'cryonis-pillar-clean-v3.png',image:[1024,1536],box:[197,93,868,1446],foot:.98},
  14:{file:'link-side-clean-v3.png',image:[1024,1536],box:[302,101,710,1477],foot:.95}
};
// Tight source regions exclude neighboring props without moving the sprite or editing pixels.
const RUNE_ATLAS_REGIONS={
  0:[42,40,273,295],1:[353,32,586,304],2:[640,90,949,280],3:[965,34,1253,300],
  5:[299,338,650,612],6:[666,384,940,608],7:[975,344,1231,607],
  8:[40,639,292,914],9:[314,688,615,881],10:[651,688,942,903],11:[983,640,1214,905],
  12:[100,910,223,1242],13:[333,981,596,1203],15:[921,901,1249,1241]
};
function runeAtlasClip(cell) {
  const box=RUNE_ATLAS_REGIONS[cell];
  if(!box) return 'none';
  const size=1254/4,x=cell%4*size,y=Math.floor(cell/4)*size;
  return `inset(${(box[1]-y)/size*100}% ${(x+size-box[2])/size*100}% ${(y+size-box[3])/size*100}% ${(box[0]-x)/size*100}%)`;
}
const RUNE_SCENE_CELLS={bomb:0,bomb_cube:1,magnet:2,stasis:3,cryonis:4,camera:5,cycle:6,amiibo:7,sensor:8};
function runeSceneStyle(id) {
  if(!RUNE_ART_READY.scenes) {const file=id==='cycle'?'rune_scene_cycle.jpg':'rune_scene_'+(id==='bomb_cube'?'bomb':id)+'.png';return `background-image:url(${IMG(file)});background-size:cover;background-position:center`;}
  const cell=RUNE_SCENE_CELLS[id]??0;
  return `background-image:url(${IMG('rune-environments-v2.png')});background-size:312% 312%;background-position:${cell%3*50}% ${Math.floor(cell/3)*50}%`;
}
function runeSpriteStyle(cell,width,height=width) {
  if(!RUNE_ART_READY.sprites) return `background-image:url(${fallbackRuneImage(cell)});background-repeat:no-repeat;background-size:contain;background-position:center`;
  const clean=RUNE_CLEAN_SPRITES[cell];
  if(clean) {
    const [x0,y0,x1,y1]=clean.box;
    const scale=height*clean.foot/(y1-y0);
    const size=`${clean.image[0]*scale}px ${clean.image[1]*scale}px`;
    const position=`${width/2-(x0+x1)/2*scale}px ${height*clean.foot-y1*scale}px`;
    const url=`url(${IMG(clean.file)})`;
    // The same alpha mask suppresses faint generated fringe, without altering the source PNG.
    return `clip-path:none;background-image:${url};background-repeat:no-repeat;background-size:${size};background-position:${position};mask-image:${url};mask-repeat:no-repeat;mask-size:${size};mask-position:${position}`;
  }
  const region=RUNE_ATLAS_REGIONS[cell];
  if(region) {
    const [x,y,r,b]=region,bw=r-x,bh=b-y;
    const fit=Math.min(width/bw,height/bh);
    const sx=cell===2?width/bw:fit,sy=cell===2?height/bh:fit;
    const padX=(width-bw*sx)/2,padY=(height-bh*sy)/2;
    const size=`${1254*sx}px ${1254*sy}px`,pos=`${padX-x*sx}px ${padY-y*sy}px`;
    const url=`url(${IMG('rune-sprites-v2.png')})`;
    return `clip-path:inset(${padY}px ${padX}px);background-image:${url};background-repeat:no-repeat;background-size:${size};background-position:${pos};mask-image:${url};mask-repeat:no-repeat;mask-size:${size};mask-position:${pos}`;
  }
  // Sample a complete cell into the intended prop rectangle; never crop off heads or ice tops.
  // The motorcycle slightly exceeds its cell, so sample a 10% larger transparent margin.
  const scale=cell===5?320/352:1;
  const bw=width*4*scale,bh=height*4*scale;
  const px=width/2-(cell%4+.5)*width*scale,py=height/2-(Math.floor(cell/4)+.5)*height*scale;
  return `clip-path:${runeAtlasClip(cell)};mask-image:none;background-image:url(${IMG('rune-sprites-v2.png')});background-repeat:no-repeat;background-size:${bw}px ${bh}px;background-position:${px}px ${py}px`;
}
function setRuneSprite(node,cell,width,height=width) {
  if(!node) return;
  const key=cell+':'+width+':'+height+':'+RUNE_ART_READY.sprites;
  if(node.dataset.art===key) return;
  node.dataset.art=key;
  const styles=runeSpriteStyle(cell,width,height);
  for(const part of styles.split(';')) {
    const at=part.indexOf(':');
    if(at>0) node.style.setProperty(part.slice(0,at),part.slice(at+1));
  }
}

// Source rectangles are measured from the generated PNGs, not assumed grid cells.
// Each crop is independently clipped; adjacent props can never leak into the view.
const RUNE_KIT={
  shore:[22,353,576,511],bank:[580,353,1062,512],gate:[1068,79,1301,512],plinth:[1315,301,1648,510],
  road:[20,675,774,833],cycleRoad:[90,700,710,820],destination:[784,569,975,837],splash:[1017,641,1319,824],force:[1320,623,1665,835]
};
const RUNE_FX={
  blast0:[42,100,405,435],blast1:[410,0,885,460],blast2:[885,0,1348,490],blast3:[1350,75,1774,435],
  beam:[0,445,443,887],shadow:[443,700,866,858],reveal:[872,500,1334,887],reward:[1340,433,1774,887]
};
function rasterRegionStyle(file,size,box,width,height) {
  const [x,y,right,bottom]=box,sx=width/(right-x),sy=height/(bottom-y);
  return `background-image:url(${IMG(file)});background-repeat:no-repeat;background-size:${size[0]*sx}px ${size[1]*sy}px;background-position:${-x*sx}px ${-y*sy}px;clip-path:inset(0)`;
}
function runeKitStyle(name,width,height) {return rasterRegionStyle('rune-world-kit-v4.png',[1672,941],RUNE_KIT[name],width,height);}
function setRuneRegion(node,group,name,width,height) {
  if(!node) return;
  const key=group+name+':'+width+':'+height;
  if(node.dataset.region===key) return;
  node.dataset.region=key;
  const styles=group==='world'?runeKitStyle(name,width,height):rasterRegionStyle('rune-effects-v4.png',[1774,887],RUNE_FX[name],width,height);
  for(const part of styles.split(';')) {const at=part.indexOf(':');if(at>0)node.style.setProperty(part.slice(0,at),part.slice(at+1));}
}
function paintRuneBlast(node,remaining,width=74) {
  const frame=Math.min(3,Math.floor(Math.max(0,.6-remaining)/.15));
  setRuneRegion(node,'fx','blast'+frame,width,width);
}
