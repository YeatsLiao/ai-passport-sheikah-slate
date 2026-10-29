/* 三键能力演示：状态独立于固件；参数为原型表现值。 */
const abilityStates = {};
const L = (cn,en) => state.lang === 'cn' ? cn : en;
function abilityState(id) {
  return abilityStates[id] ||= {x:1, y:0, held:false, placed:false, blast:false, ice:[], hits:0, frozen:false, fuel:100, riding:false, scanned:false, distance:6, bearing:0, signal:0, token:0};
}
function abilityAction(id, action) {
  const a = abilityState(id);
  const redraw = () => { if (routeParts()[0] === 'rune' && routeParts()[1] === id) render(); };
  if (action === 'reset') { a.token++; delete abilityStates[id]; redraw(); return; }
  if (action === 'left') a.x = (a.x + 4) % 5;
  if (action === 'right') a.x = (a.x + 1) % 5;
  if (action === 'height') a.y = (a.y + 1) % 3;
  if (action === 'grab') a.held = !a.held;
  if (action === 'place') { a.placed = true; a.blast = false; if(id === 'bomb') a.x = Math.min(4,a.x+1); }
  if (action === 'blast') { a.placed = false; a.blast = true; }
  if (action === 'freeze') {
    a.frozen = true; a.hits = 0;
    const token = ++a.token;
    setTimeout(() => { if(a.token === token && a.frozen) { a.frozen=false; a.x=Math.min(4,a.x+Math.ceil(a.hits/2)); redraw(); } },10000);
  }
  if (action === 'hit') a.hits = Math.min(6,a.hits+1);
  if (action === 'release') { a.frozen=false; a.token++; a.x=Math.min(4,a.x+Math.ceil(a.hits/2)); }
  if (action === 'ice') {
    const i=a.ice.indexOf(a.x);
    if(i>=0) a.ice.splice(i,1); else { if(a.ice.length===3) a.ice.shift(); a.ice.push(a.x); }
  }
  if (action === 'summon') { a.placed=true; a.riding=false; }
  if (action === 'ride') a.riding=!a.riding;
  if (action === 'accelerate') { a.fuel=Math.max(0,a.fuel-10); a.x=(a.x+1)%5; if(!a.fuel) a.riding=false; }
  if (action === 'refuel') a.fuel=Math.min(100,a.fuel+25);
  if (action === 'scan') a.scanned=true;
  if (action === 'turn') a.bearing=(a.bearing+1)%4;
  if (action === 'walk') { a.distance=Math.max(0,Math.min(9,a.distance+(a.bearing===0?-1:1))); a.signal=a.bearing===0?4:1; }
  beep('ok'); redraw();
}
// New raster atlas: generated style assets, not extracted Nintendo game assets.
function abilitySprite(cell, x, bottom, size, extra='') {
  return `<span class="ability-sprite" aria-hidden="true" style="left:${x}px;bottom:${bottom}px;width:${size}px;height:${size}px;background-position:${(cell%4)*100/3}% ${Math.floor(cell/4)*100}%;${extra}"></span>`;
}
function viewAbility(id) {
  const rune=RUNE_BY_ID[id] || RUNE_BY_ID.bomb;
  id=rune.id;
  if (RUNE_GAMES.has(id)) return viewRuneGame(id);
  if(id==='camera') return topbar('runes')+viewCamera(rune);
  const a=abilityState(id), x=35+a.x*48;
  let art='', note='', status='', controls=[];
  const control=(action,cn,en,disabled=false)=>controls.push(`<button class="chip" data-focus ${controls.length===0?'data-start':''} data-action="ability:${id}:${action}" ${disabled?'disabled':''}>${L(cn,en)}</button>`);
  const aim=`<div class="aim hot" style="left:${x}px;bottom:62px"></div>`;
  if(id==='bomb'||id==='bomb_cube') {
    art=aim+(a.placed?abilitySprite(id==='bomb'?0:1,x,53,32):'')+(a.blast?abilitySprite(7,x-16,40,68,'animation:explode .65s ease-out both'):'');
    status=L(a.blast?'已引爆':a.placed?'遥控连接':'选择落点',a.blast?'DETONATED':a.placed?'LINKED':'PLACE');
    note=id==='bomb'?L('圆弹会沿斜坡滚动；放置后遥控引爆。','Round bombs roll down slopes. Place, then detonate.'):L('方弹停在落点，适合精确放置。','Cube bombs stay where placed.');
    control('left','落点 −','POSITION −',a.placed);control('right','落点 +','POSITION +',a.placed);control('place','放置','PLACE',a.placed);control('blast','引爆','DETONATE',!a.placed);
  } else if(id==='magnet') {
    art=abilitySprite(2,x,56+a.y*23,48,a.held?'filter:drop-shadow(0 0 7px #7fe9ff)':'');
    status=L(a.held?'磁力连接':'搜索金属',a.held?'GRABBED':'METAL SEARCH');
    note=L('抓取金属箱后可左右移动、升降，再放下。','Grab the metal crate, move or lift it, then release.');
    control('grab',a.held?'放下':'抓取',a.held?'RELEASE':'GRAB');control('left','左移','LEFT',!a.held);control('right','右移','RIGHT',!a.held);control('height','升降','HEIGHT',!a.held);
  } else if(id==='stasis') {
    art=abilitySprite(3,x,54,60,a.frozen?'filter:sepia(1) saturate(3) drop-shadow(0 0 8px #fbd85a)':'')+`<div class="pips">${Array.from({length:6},(_,i)=>`<i class="${i<a.hits?'on':''}"></i>`).join('')}</div>`;
    status=L(a.frozen?'时间锁定':'时间流动',a.frozen?'TIME LOCK':'TIME FLOW');
    note=L('击打积蓄势能；十秒后自动释放，也可主动解除。','Strike to store energy. Release manually or after 10 seconds.');
    control('freeze','锁定','LOCK',a.frozen);control('hit',`击打 ${a.hits}/6`,`HIT ${a.hits}/6`,!a.frozen);control('release','解除','RELEASE',!a.frozen);
  } else if(id==='cryonis') {
    art=aim+a.ice.map(i=>abilitySprite(4,35+i*48,50,60)).join('');
    status=L(`冰柱 ${a.ice.length}/3`,`PILLARS ${a.ice.length}/3`);
    note=L('选水面造冰，选冰柱碎冰；第四根替换最早的一根。','Create on water; shatter a selected pillar. A fourth replaces the oldest.');
    control('left','选点 −','TARGET −');control('right','选点 +','TARGET +');control('ice',a.ice.includes(a.x)?'碎冰':'造冰',a.ice.includes(a.x)?'SHATTER':'CREATE');
  } else if(id==='cycle') {
    art=a.placed?abilitySprite(5,x-20,43,100):aim;
    status=L(`燃料 ${a.fuel}%`,`FUEL ${a.fuel}%`);
    note=L('召唤后骑乘、加速；下车后投入材料补充燃料。','Summon, mount and accelerate. Dismount to refuel.');
    control('summon','召唤','SUMMON',a.riding);control('ride',a.riding?'下车':'骑乘',a.riding?'DISMOUNT':'MOUNT',!a.placed||!a.fuel);control('accelerate','加速','ACCELERATE',!a.riding);control('refuel','投入材料','REFUEL',a.riding||!a.placed||a.fuel===100);
  } else if(id==='amiibo') {
    art=a.scanned?abilitySprite(6,132,51,64):'<div class="amiibo-base"><img src="'+IMG(rune.icon)+'" alt=""></div>';
    status=L(a.scanned?'补给已落下':'等待读取',a.scanned?'SUPPLIES DROPPED':'READY TO SCAN');
    note=L('模拟读取 amiibo，在选定位置降下补给宝箱。','Simulate an amiibo scan to summon a supply chest.');
    control('scan','模拟读取','SIMULATE SCAN',a.scanned);
  } else if(id==='sensor') {
    art=`<div class="sensor-ring ${a.signal?'on':''}"><i></i><i></i><i></i></div>`;
    status=L(a.distance===0?'已到达神庙':`信号 ${'▮'.repeat(a.signal)}${'▯'.repeat(4-a.signal)}`,a.distance===0?'SHRINE REACHED':`SIGNAL ${a.signal}/4`);
    note=L('转向并向前探索；朝目标移动时信号增强。','Turn and explore. The signal strengthens toward the target.');
    control('turn',`转向 · ${['北','东','南','西'][a.bearing]}`,`TURN · ${['N','E','S','W'][a.bearing]}`);control('walk','向前探索','WALK',a.distance===0);
  }
  control('reset','重置','RESET');
  const background = rune.scene || `rune_scene_${id==='bomb_cube'?'bomb':id}.png`;
  return topbar('runes')+`<div class="body scene-body"><div class="scene" style="background-image:url(${IMG(background)})"></div><div class="scene-shade"></div>${sceneTop(rune,status)}${art}<div class="msg">${note}</div><div class="chiprow ability-controls">${controls.join('')}</div></div>`+footer(t('scene_foot'));
}
