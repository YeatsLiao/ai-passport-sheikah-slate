/* Full-map viewer: drag, inspect points and zoom. No registration or option menus. */
const mapName=p=>state.lang==='cn'?(p.cn||p.en):p.en;
const mapKind=k=>L({shrine:'神庙',tower:'希卡塔',stable:'驿站',village:'聚落',shop:'商店',landmark:'地标'}[k],{shrine:'SHRINE',tower:'TOWER',stable:'STABLE',village:'SETTLEMENT',shop:'SHOP',landmark:'LANDMARK'}[k]);
function mapPlaceIcon(kind) {
  const file=kind==='tower'?'BotW_Main_Quest_Sprite.png':kind==='shrine'?'BotW_White_Sheikah_Eye_Symbol.png':'BotW_Key_Item_Icon.png';
  return `<img class="map-place-icon" src="../assets/raw/02_ui/glyphs/${file}" alt="">`;
}
function mapPlaces(){return MAP_PLACES;}
function mapCurrent(){return MAP_PLACES.find(p=>p.id===state.map.selection||p.gameId===state.map.selection)||MAP_PLACES[0];}
function mapBrowseActive(){return routeParts()[0]==='map';}
function viewMap(){
  const p=mapCurrent();state.map.selection=p.id;
  return topbar('map')+`<div class="body map-body">
    <div class="map-viewport" id="mapViewport" role="region" aria-label="${L('海拉鲁地图','Map of Hyrule')}">
      <div class="map-crop" id="mapCrop"><img class="map-image" id="mapImage" src="../assets/raw/05_world/maps/botw-map-base.webp" alt="${L('海拉鲁完整地图','Full map of Hyrule')}" draggable="false"></div>
      <div class="map-markers" id="mapMarkers">${MAP_PLACES.map(place=>`<button class="map-marker" data-place="${place.id}" data-action="map:select:${place.id}" title="${mapName(place)}" aria-label="${mapName(place)}">${mapPlaceIcon(place.kind)}</button>`).join('')}</div>
      <p class="map-error" id="mapError" role="alert" hidden>${t('map_error')}</p>
    </div>
    <div class="map-hud"><span>${L('海拉鲁','HYRULE')} · ${MAP_PLACES.length} ${L('点位','PLACES')}</span><output id="mapZoom"></output></div>
    <div class="map-place-card" aria-live="polite"><strong id="mapPlaceName"></strong><span id="mapPlaceStatus"></span></div>
    <div class="map-simple-controls"><button class="chip" data-action="map:zoom:-1" aria-label="${L('缩小','Zoom out')}">−</button><button class="chip" data-action="map:zoom:1" aria-label="${L('放大','Zoom in')}">＋</button><button class="chip" data-action="map:reset">${L('全图','ALL')}</button></div>
  </div>`+footer(L('▲▼ 左右移动 · OK 切换','▲▼ pan left/right · OK switch'),L('拖动浏览 · 长按返回','DRAG · HOLD OK BACK'));
}
function updateMapView(){
  if(!document.getElementById('mapImage'))return;
  const m=state.map,v=document.getElementById('mapViewport'),w=v.clientWidth,h=v.clientHeight;
  const scale=Math.min(w/12000,h/10000)*m.zoom,iw=12000*scale,ih=10000*scale;
  let p=mapCurrent(),left=(w-iw)/2+m.x,top=(h-ih)/2+m.y;
  if(m.follow){left=w/2-(p.x+6000)*scale;top=h/2-(p.z+5000)*scale;}
  left=iw<=w?(w-iw)/2:Math.max(w-iw,Math.min(0,left));top=ih<=h?(h-ih)/2:Math.max(h-ih,Math.min(0,top));
  m.x=left-(w-iw)/2;m.y=top-(h-ih)/2;
  if(m.pickNearest){p=MAP_PLACES.reduce((a,b)=>Math.hypot(left+(a.x+6000)*scale-w/2,top+(a.z+5000)*scale-h/2)<Math.hypot(left+(b.x+6000)*scale-w/2,top+(b.z+5000)*scale-h/2)?a:b);m.selection=p.id;m.pickNearest=false;}
  Object.assign(document.getElementById('mapCrop').style,{left:left+'px',top:top+'px',width:iw+'px',height:ih+'px',transform:'none'});
  Object.assign(document.getElementById('mapImage').style,{left:'0',top:'0',width:'100%',height:'100%'});
  const size=Math.min(11,3+Math.sqrt(m.zoom)*2);
  document.querySelectorAll('.map-marker').forEach(node=>{
    const place=MAP_PLACES[Number(node.dataset.index)]||MAP_PLACES.find(p=>p.id===node.dataset.place);
    node.dataset.index=String(MAP_PLACES.indexOf(place));
    const x=left+(place.x+6000)*scale,y=top+(place.z+5000)*scale,selected=place.id===p.id;
    Object.assign(node.style,{left:x+'px',top:y+'px',width:(size+5)+'px',height:(size+5)+'px'});
    node.style.setProperty('--point-size',(size+(selected?3:0))+'px');
    node.classList.toggle('selected',selected);node.setAttribute('aria-pressed',String(selected));
    node.hidden=x< -15||x>w+15||y< -15||y>h+15;
  });
  document.getElementById('mapZoom').textContent=m.zoom+'×';
  document.getElementById('mapPlaceName').textContent=mapName(p);
  document.getElementById('mapPlaceStatus').textContent=mapKind(p.kind)+' · '+Math.round(p.x)+', '+Math.round(p.z);
  v.classList.toggle('zoomed',m.zoom>1);
}
function mapNavigate(dir){
  const m=state.map;m.follow=false;
  if((m.control||'x')==='zoom'){mapAction('zoom',-dir,true);return;}
  m[(m.control||'x')==='x'?'x':'y']-=dir*14;
  m.pickNearest=true;updateMapView();
}
function mapAction(kind,arg,silent=false){
  const m=state.map;
  if(mapDrag)endMapDrag({pointerId:mapDrag.id});
  if(kind==='control'){const modes=['x','y','zoom'];m.control=modes[(modes.indexOf(m.control||'x')+1)%3];updateMapView();updateInputHint();return;}
  if(kind==='select'){
    if(!MAP_PLACES.some(p=>p.id===arg))return;
    m.selection=arg;m.follow=false;
  }else if(kind==='zoom'){
    const old=m.zoom,levels=[1,2,4,8,16];
    m.zoom=arg?Math.max(1,Math.min(16,old*(Number(arg)>0?2:.5))):levels[(levels.indexOf(old)+1)%levels.length];
    m.x*=m.zoom/old;m.y*=m.zoom/old;
  }else if(kind==='reset'){m.zoom=1;m.x=m.y=0;m.follow=false;}
  else if(kind==='step'){mapNavigate(Number(arg));return;}
  else return;
  updateMapView();if(!silent)beep('ok');
}
function discoverSensorShrine(){if(!state.map.discovered.includes('Dungeon079'))state.map.discovered.push('Dungeon079');}
function showSensorMap(){const p=MAP_PLACES.find(p=>p.gameId==='Dungeon079');if(p)Object.assign(state.map,{selection:p.id,zoom:8,follow:true});go('#/map');}
