/* Sheikah Slate · AI Passport 可点击原型
   纯静态：哈希路由 + 示例进度。没有运行时 API 请求，没有持久化。
   装备元数据由本地归档生成；展示外部名称与描述时统一转义。 */

const IMG = n => `../assets/gen/prototype/${n}`;   /* 原型贴片 */
const FW = n => `../assets/gen/firmware/${n}`;     /* 固件图源（程序绘制，原型里只借少数张） */
const screenEl = document.getElementById('screen');
const shellEl = document.getElementById('screenShell');
const railEl = document.getElementById('railNav');

/* 视差：鼠标在屏幕内移动时给各层一个很小的位移，近层比远层动得多。 */
screenEl.addEventListener('pointermove', e => {
  const r = screenEl.getBoundingClientRect();
  screenEl.style.setProperty('--mx', (((e.clientX - r.left) / r.width - .5) * 2).toFixed(3));
  screenEl.style.setProperty('--my', (((e.clientY - r.top) / r.height - .5) * 2).toFixed(3));
});
screenEl.addEventListener('pointerleave', () => {
  screenEl.style.setProperty('--mx', '0');
  screenEl.style.setProperty('--my', '0');
});

const state = {
  focus: 0,
  runeIndex: 0,
  bomb: { placed: false, type: 'ROUND', done: false },
  magnet: { grabbed: false, moved: false, done: false },
  stasis: { frozen: false, hits: 0, remaining: 10, done: false },
  cryonis: { count: 0, done: false },
  camera: { sel: 0, shots: [false, false, false, false, false], done: false },
  map: { index: 0, zoom: 1, x: 0, y: 0 },
  compCat: 'creatures',
  inventory: {
    category: 'weapons', pages: { weapons: 0, shields: 0, armors: 0 }, selected: {},
    equipped: { weapon: null, shield: null, head: null, body: null, legs: null },
    textId: null, textPage: 0
  },
  logTab: 'main',
  albumOpen: null,
  albumDeleted: [],
  albumShots: [],
  settings: { brightness: 5, volume: 3, scanlines: true, sfx: true }
};

/* ---------------- audio ---------------- */
/* 菜单使用 starter 归档的现成音效；其他玩法保留原有 wav，未核实为游戏原版。
   音量跟随「系统 · 音量」档位，Web 音效切换不影响固件。 */
const SFX_FILES = {
  move: 'prototype/select.mp3', ok: 'prototype/action.mp3', back: 'prototype/select.mp3',
  boom: 'bomb_boom.wav', shutter: 'shutter.wav', place: 'bomb_place.wav',
  complete: 'complete.wav', found: 'found.wav', hit: 'hit.wav',
  freeze: 'stasis_freeze.wav', unfreeze: 'stasis_unfreeze.wav', shatter: 'shatter.wav',
  cryonis: 'cryonis_activate.wav', magnet: 'magnesis_activate.wav', activate: 'prototype/action.mp3'
};
const sfxCache = {};

function beep(kind) {
  if (!state.settings.sfx || state.settings.volume === 0) return;
  const name = SFX_FILES[kind] ? kind : 'move';
  if (!sfxCache[name]) {
    const a = new Audio('../assets/audio/' + SFX_FILES[name]);
    a.preload = 'auto';
    sfxCache[name] = a;
  }
  /* 同一音效连续触发时克隆一份，避免打断上一声。 */
  const node = sfxCache[name].cloneNode();
  node.volume = Math.min(1, 0.10 + state.settings.volume * 0.10);
  const p = node.play();
  if (p && p.catch) p.catch(() => { /* 未获得播放许可时静默 */ });
}


/* ---------------- routing ---------------- */
const routeHash = () => (location.hash && !['#', '#/'].includes(location.hash) ? location.hash : '#/map');
const routeParts = () => routeHash().replace(/^#\//, '').split('/');

function go(hash) {
  if (routeHash() === hash) { render(); return; }
  location.hash = hash;
}

function back() {
  const p = routeParts();
  if (p[0] === 'rune') return go('#/runes');
  if (p[0] === 'inventory') return go(p[2] ? '#/inventory/' + state.inventory.category : '#/runes');
  if (p[0] === 'compendium') {
    if (p[2] !== undefined) return go('#/compendium/' + p[1]);
    if (p[1]) return go('#/compendium');
    return go('#/standby');
  }
  if (p[0] === 'log') return go(p[1] ? '#/log' : '#/standby');
  if (p[0] === 'album') return go(p[1] ? '#/album' : '#/system');
  if (p[0] === 'system' || p[0] === 'runes') return go('#/standby');
  return go('#/runes');
}

/* ---------------- chrome ---------------- */
const TABS = [
  ['inventory', 'EQUIP'],
  ['runes', 'RUNES'],
  ['map', 'MAP'],
  ['compendium', 'COMPENDIUM'],
  ['log', 'LOG'],
  ['system', 'SYSTEM']
];

function topbar(active) {
  return `<header class="topbar">
    <nav class="tabs" aria-label="主导航">${TABS.map(([id, label]) => `
      <button class="tab ${active === id ? 'on' : ''}" data-action="go:#/${id}" data-focus aria-current="${active === id ? 'page' : 'false'}">
        <b>${label}</b>
      </button>`).join('')}</nav>
  </header>`;
}

function footer(left, right = '长按 OK 返回') {
  return `<footer class="footer"><span>${left}</span><span class="muted">${right}</span></footer>`;
}

function sceneTop(rune, stat) {
  return `<div class="scene-top">
    <button class="back-tab" data-action="back" data-focus>◀ BACK</button>
    <div class="rune-tag"><img src="${IMG(rune.icon)}" alt=""><b>${rune.label}</b></div>
    <span class="scene-stat">${stat}</span>
  </div>`;
}

/* ---------------- standby ---------------- */
function viewStandby() {
  return `<div class="standby">
    <img class="sb-puppet a" src="${IMG('cut_skywatcher.png')}" alt="">
    <img class="sb-slate" src="${IMG('cut_slate.png')}" alt="">
    <img class="sb-eye" src="${IMG('eye.png')}" alt="">
    <div class="sb-clock">09:41</div>
    <div class="sb-date">SAT · 10.26 · HYRULE</div>
    <div class="sb-battery"><span class="batt"><i style="width:99%"></i></span>99%</div>
    <button class="sb-prompt" data-action="go:#/runes" data-focus data-start>PRESS OK TO ACTIVATE</button>
    <div class="sb-brand">AI PASSPORT · SHEIKAH SLATE</div>
  </div>`;
}

/* ---------------- runes ---------------- */
function viewRunes() {
  const r = RUNES[state.runeIndex];
  return topbar('runes') + `<div class="body runes-body">
    <div class="rune-left">
      <div class="section-label">RUNE SELECT <em>${String(RUNES.length).padStart(2, '0')}</em></div>
      <div class="rune-grid">${RUNES.map((x, i) => `
        <button class="rune-tile ${i === state.runeIndex ? 'sel' : ''}" data-action="pick:${i}" data-focus ${i === state.runeIndex ? 'data-start' : ''}>
          <span class="num">0${i + 1}</span>
          <img src="${IMG(x.icon)}" alt="">
          <b>${x.short}</b>
        </button>`).join('')}</div>
    </div>
    <aside class="detail-card">
      <div class="eyebrow">RUNE ${String(state.runeIndex + 1).padStart(2, '0')}</div>
      <h2>${r.label}</h2>
      <div class="cn">${r.cn}</div>
      <div class="rule"></div>
      <p>${r.desc}</p>
      <div class="stats">${r.stats.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>
      <button class="btn-primary" data-action="enter-rune" data-focus>USE RUNE</button>
    </aside>
  </div>` + footer('<b>▲▼</b> 选择符文　<b>OK</b> 使用');
}

/* ---------------- rune scenes ---------------- */
function viewRune(id) {
  const rune = RUNE_BY_ID[id] || RUNE_BY_ID.bomb;
  switch (rune.id) {
    case 'bomb':
    case 'bomb_cube': return viewBomb(rune);
    case 'magnet': return viewMagnet(rune);
    case 'stasis': return viewStasis(rune);
    case 'cryonis': return viewCryonis(rune);
    case 'camera': return viewCamera(rune);
    case 'cycle':
    case 'amiibo':
    case 'sensor': return viewRuneInfo(rune);
    default: return viewRunes();
  }
}

/* 大师摩托 / amiibo / 希卡感应器：原型暂未做试炼玩法，用场景图 + 信息卡占位。 */
function viewRuneInfo(rune) {
  return topbar('runes') + `<div class="body story-body scene-body">
    <div class="scene" style="background-image:url(${IMG(rune.scene)})"></div>
    <div class="scene-shade"></div>
    <div class="story-meta"><span>RUNE ${rune.short}</span><span>原型占位 · 无试炼玩法</span></div>
    <h2>${rune.label}</h2>
    <div class="story-subtitle">${rune.cn}</div>
    <article class="story-page">
      <p>${rune.desc}</p>
      <p style="color:#a8cdd4;margin-top:6px">此符文在本原型中暂无试炼玩法，仅作界面演示。选中后回到符文页。</p>
    </article>
    <div class="story-controls">
      <button data-action="back" data-start>返回符文页</button>
    </div>
  </div>` + footer('<b>OK</b> 返回', `${rune.short} · 原型占位`);
}

function viewBomb(rune) {
  const b = state.bomb;
  /* 圆/方炸弹是两个符文入口，但共用这套玩法；换形态时清掉上一次的放置与完成状态。 */
  if (b.type !== rune.kind) { b.type = rune.kind; b.placed = false; b.done = false; }
  const bombImg = b.type === 'ROUND' ? 'bomb_round.png' : 'bomb_cube.png';
  return `<div class="body scene-body">
    <div class="scene" id="scene" style="background-image:url(${IMG('rune_scene_bomb.png')})"></div>
    <div class="scene-shade"></div>
    <img class="puppet far drift slow" src="${IMG('cut_decayed.png')}" alt="" style="right:12px;bottom:110px;width:46px">
    <img class="puppet mid drift" src="${IMG('cut_bokoblin.png')}" alt="" style="left:130px;bottom:46px;width:68px">
    <img class="puppet near drift slow" src="${IMG('cut_moblin_big.png')}" alt="" style="left:-50px;bottom:-4px;width:158px">
    ${sceneTop(rune, b.done ? 'TRIAL CLEAR' : b.placed ? 'ARMED' : 'STANDBY')}
    ${b.done ? '<div class="badge-done">TRIAL COMPLETE</div>' : ''}
    <img class="actor wall ${b.done ? 'gone' : ''}" src="${FW('wall.png')}" alt="" style="right:26px;bottom:44px">
    <div class="aim ${b.done ? 'hidden' : 'hot'}" style="right:34px;bottom:42px"></div>
    <img class="actor bomb ${b.placed ? 'in' : ''}" src="${FW(bombImg)}" alt="" style="right:90px;bottom:50px">
    <div id="blastLayer"></div>
    <div class="msg">${b.done ? '岩石已破坏，通往神庙的道路开启。'
      : b.placed ? '炸弹已放置。再按「引爆」即可起爆。'
        : '先「放置炸弹」，再「引爆」破坏岩石。'}</div>
    <div class="chiprow">
      <button class="chip ${b.placed ? 'on' : ''}" data-action="${b.done ? 'bomb:reset' : 'bomb:place'}" data-focus data-start ${b.placed ? 'disabled' : ''}>${b.done ? '重新试炼' : '放置炸弹'}</button>
      <button class="chip" data-action="bomb:blast" data-focus ${b.placed ? '' : 'disabled'}>引爆</button>
    </div>
  </div>` + footer('<b>▲▼</b> 选择　<b>OK</b> 执行');
}

function viewMagnet(rune) {
  const m = state.magnet;
  const crateLeft = (m.done || m.moved) ? 98 : 244;
  const crateBottom = m.done ? 66 : m.moved ? 96 : 58;
  return `<div class="body scene-body">
    <div class="scene" id="scene" style="background-image:url(${IMG('rune_scene_magnet.png')})"></div>
    <div class="scene-shade"></div>
    <img class="puppet far drift slow" src="${IMG('cut_keese.png')}" alt="" style="right:8px;top:42px;width:56px">
    <img class="puppet mid drift" src="${IMG('cut_lizalfos_big.png')}" alt="" style="right:50px;bottom:40px;width:94px">
    <img class="puppet near drift slow" src="${IMG('cut_bokoblin.png')}" alt="" style="left:-66px;bottom:-4px;width:156px">
    ${sceneTop(rune, m.done ? 'TRIAL CLEAR' : m.grabbed ? 'LOCKED ON' : 'STANDBY')}
    ${m.done ? '<div class="badge-done">TRIAL COMPLETE</div>' : ''}
    <img class="actor gate" src="${FW('gate.png')}" alt="" style="left:14px;bottom:58px;${m.done ? 'transform:translateY(-34px);opacity:.4' : ''}">
    <div class="plate-mark" style="left:92px;bottom:56px"></div>
    <img class="actor crate ${m.grabbed && !m.done ? 'in' : ''}" src="${FW('crate.png')}" alt="" style="left:${crateLeft}px;bottom:${crateBottom}px;${m.grabbed && !m.done ? 'filter:drop-shadow(0 0 9px rgba(127,233,255,.9))' : ''}">
    <div class="msg">${m.done ? '压力板被压住，闸门开启。'
      : m.moved ? '金属箱悬在压力板上方，按「放下」。'
        : m.grabbed ? '金属箱已锁定。按「移动」把它带到压力板上方。'
          : '用磁力抓住右侧金属箱，把它放到压力板上。'}</div>
    <div class="chiprow">
      <button class="chip ${m.grabbed ? 'on' : ''}" data-action="${m.done ? 'magnet:reset' : 'magnet:grab'}" data-focus data-start>${m.done ? '重新试炼' : '抓取'}</button>
      <button class="chip ${m.moved ? 'on' : ''}" data-action="magnet:move" data-focus ${m.grabbed && !m.done ? '' : 'disabled'}>移动</button>
      <button class="chip" data-action="magnet:drop" data-focus ${m.moved && !m.done ? '' : 'disabled'}>放下</button>
    </div>
  </div>` + footer('<b>▲▼</b> 选择　<b>OK</b> 执行');
}

function viewStasis(rune) {
  const s = state.stasis;
  const pips = Array.from({ length: 6 }, (_, i) => `<i class="${i < s.hits ? 'on' : ''}"></i>`).join('');
  return `<div class="body scene-body">
    <div class="scene ${s.frozen ? 'frozen-scene' : ''}" id="scene" style="background-image:url(${IMG('rune_scene_stasis.png')})"></div>
    <div class="scene-shade"></div>
    <img class="puppet far drift slow" src="${IMG('cut_decayed.png')}" alt="" style="right:6px;bottom:112px;width:44px">
    <img class="puppet mid drift slow" src="${IMG('cut_lynel.png')}" alt="" style="right:96px;bottom:58px;width:86px">
    <img class="puppet near drift slow" src="${IMG('cut_hinox.png')}" alt="" style="left:-62px;bottom:-6px;width:152px">
    ${sceneTop(rune, s.done ? 'TRIAL CLEAR' : s.frozen ? 'TIME LOCKED' : 'STANDBY')}
    ${s.frozen ? `<div class="stasis-timer"><div class="bar"><i id="stasisBar" style="width:${s.remaining * 10}%"></i></div><span id="stasisTime">${s.remaining.toFixed(1)} s</span></div>
      <div class="pips">${pips}</div>` : ''}
    ${s.done ? '<div class="badge-done">TRIAL COMPLETE</div>' : ''}
    <div class="aim ${s.done ? 'hidden' : ''}" style="right:54px;bottom:44px"></div>
    <img class="actor boulder ${s.frozen ? 'frozen' : ''}" src="${IMG('cut_talus.png')}" alt="" style="right:46px;bottom:44px;${s.done ? 'transform:translateX(40px) rotate(18deg);opacity:.45' : ''}">
    <div class="msg">${s.done ? '势能释放，岩石巨人撞开了堵路的墙。'
      : s.frozen ? '已冻结。按「击打」积蓄势能（最多 6 次），或直接「释放」。'
        : '先冻结岩石巨人，再击打积蓄势能，最后释放。'}</div>
    <div class="chiprow">
      <button class="chip ${s.frozen ? 'on' : ''}" data-action="${s.done ? 'stasis:reset' : 'stasis:freeze'}" data-focus data-start ${s.frozen ? 'disabled' : ''}>${s.done ? '重新试炼' : '时停'}</button>
      <button class="chip" data-action="stasis:hit" data-focus ${s.frozen ? '' : 'disabled'}>击打</button>
      <button class="chip" data-action="stasis:release" data-focus ${s.frozen ? '' : 'disabled'}>释放</button>
    </div>
  </div>` + footer('<b>▲▼</b> 选择　<b>OK</b> 执行');
}

const ICE_SLOTS = [52, 110, 168];
function viewCryonis(rune) {
  const c = state.cryonis;
  return `<div class="body scene-body">
    <div class="scene" id="scene" style="background-image:url(${IMG('rune_scene_cryonis.png')});background-position:center 62%"></div>
    <div class="scene-shade"></div>
    <div class="waterline"></div>
    <img class="puppet mid drift" src="${IMG('cut_wizzrobe.png')}" alt="" style="left:4px;bottom:58px;width:66px">
    <img class="puppet far drift slow" src="${IMG('cut_skywatcher.png')}" alt="" style="right:-16px;bottom:102px;width:96px">
    <img class="puppet near drift slow" src="${IMG('cut_keese.png')}" alt="" style="left:-52px;top:8px;width:146px">
    ${sceneTop(rune, c.done ? 'TRIAL CLEAR' : `PILLARS ${c.count}/3`)}
    ${c.done ? '<div class="badge-done">TRIAL COMPLETE</div>' : ''}
    ${ICE_SLOTS.map((x, i) => `
      <div class="slot" style="left:${x}px;bottom:56px"></div>
      ${i < c.count ? `<div class="pillar" style="left:${x}px;bottom:56px"></div>` : ''}`).join('')}
    <div class="msg">${c.done ? '冰柱已架成通路，可以跨过水面。'
      : c.count >= 3 ? '三根冰柱就位，按「跨越」完成试炼。'
        : '在水面升起三根冰柱，搭出可通行的路。'}</div>
    <div class="chiprow">
      <button class="chip" data-action="${c.done ? 'cryonis:reset' : 'cryonis:create'}" data-focus data-start ${c.count >= 3 && !c.done ? 'disabled' : ''}>${c.done ? '重新试炼' : '造冰'}</button>
      <button class="chip" data-action="cryonis:break" data-focus ${c.count === 0 || c.done ? 'disabled' : ''}>碎冰</button>
      <button class="chip" data-action="cryonis:cross" data-focus ${c.count >= 3 && !c.done ? '' : 'disabled'}>跨越</button>
    </div>
  </div>` + footer('<b>▲▼</b> 选择　<b>OK</b> 执行');
}

/* 取景框里的缩略图是 96px；big 是写进相册后详情页用的 280px 图，没大图就回落。 */
const CAM_TARGETS = [
  { x: 26, y: 30, img: 'pic_nightshade.png', big: 'cp_blue_nightshade.png', name: 'BLUE NIGHTSHADE' },
  { x: 112, y: 12, img: 'pic_bass.png', big: 'cp_hyrule_bass.png', name: 'HYLIAN BASS' },
  { x: 196, y: 34, img: 'pic_chuchu.png', name: 'CHUCHU' },
  { x: 58, y: 76, img: 'mat_amber.png', name: 'AMBER' },
  { x: 152, y: 82, img: 'pic_mastersword.png', big: 'cp_master_sword.png', name: 'MASTER SWORD' }
];

function viewCamera(rune) {
  const c = state.camera;
  const got = c.shots.filter(Boolean).length;
  return `<div class="body scene-body">
    <div class="scene" id="scene" style="background-image:url(${IMG('rune_scene_camera.png')})"></div>
    <div class="scene-shade"></div>
    ${sceneTop(rune, `REGISTERED ${got}/5`)}
    ${c.done ? '<div class="badge-done">TRIAL COMPLETE</div>' : ''}
    <div class="viewfinder">
      <span class="vf-corner tr"></span><span class="vf-corner bl"></span>
      <div class="vf-grid"></div>
      <span class="vf-reticle"></span>
      <div class="vf-hud"><span class="rec">REC</span><span>F2.8 · 1/120</span></div>
      ${CAM_TARGETS.map((t, i) => `
        <button class="target ${c.shots[i] ? 'shot' : ''} ${c.sel === i ? 'sel' : ''}" data-action="camera:pick:${i}" data-focus style="left:${t.x}px;top:${t.y}px">
          <img src="${IMG(t.img)}" alt="">
          <span class="lock"><i></i><i></i><i></i><i></i></span>
          ${c.shots[i] ? '<span class="mark">✓</span>' : ''}
        </button>`).join('')}
    </div>
    <div class="msg">${c.done ? '五个目标全部登记，图鉴已更新。'
      : c.shots[c.sel] ? '这个目标已登记。切换目标或直接拍摄下一个。'
        : `取景框对准 ${CAM_TARGETS[c.sel].name}，按「快门」登记。`}</div>
    <div class="chiprow">
      <button class="chip" data-action="camera:shoot" data-focus data-start ${c.done || c.shots[c.sel] ? 'disabled' : ''}>快门</button>
      <button class="chip" data-action="camera:next" data-focus>切换目标</button>
      <button class="chip" data-action="camera:album" data-focus>相册 ${albumItems().length}</button>
    </div>
  </div>` + footer('<b>▲▼</b> 目标　<b>OK</b> 快门');
}

/* ---------------- map ---------------- */
/* 只截取游戏截图中部地图；裁切框排除石质边框、上下菜单与边缘 HUD。
   size 为原图尺寸，crop 为原图像素坐标 [x, y, 宽, 高]；raw 文件保持不变。 */
const MAP_IMAGES = [
  { file: 'botw_map_great_plateau.jpg', name: '初始台地', label: 'GREAT PLATEAU', size: [1800, 1013], crop: [210, 120, 1320, 780] },
  { file: 'botw_map_ui_full.jpg', name: '海拉鲁平原', label: 'HYRULE FIELD', size: [1920, 1080], crop: [230, 170, 1420, 700] },
  { file: 'botw_map_central.jpg', name: '中央海拉鲁', label: 'CENTRAL HYRULE', size: [1110, 624], crop: [135, 100, 820, 380] },
  { file: 'botw_map_northeast.jpg', name: '阿卡莱', label: 'AKKALA', size: [1280, 720], crop: [180, 100, 920, 480] }
];
const mapImageURL = image => `../assets/raw/05_world/maps/${image.file}`;

function viewMap() {
  const image = MAP_IMAGES[state.map.index];
  return topbar('map') + `<div class="body map-body">
    <div class="map-viewport" id="mapViewport" role="region" aria-label="${image.name}地图">
      <div class="map-crop" id="mapCrop">
        <img class="map-image" id="mapImage" src="${mapImageURL(image)}" alt="《旷野之息》${image.name}中部地图" draggable="false">
      </div>
      <p class="map-error" id="mapError" role="alert" hidden>地图加载失败，请刷新页面。</p>
    </div>
    <div class="map-hud"><span id="mapCaption" aria-live="polite"></span><output id="mapZoom" aria-label="地图序号与缩放倍率"></output></div>
    <div class="map-controls" aria-label="地图操作">
      <button class="chip" data-action="map:step:-1" data-focus title="上一张（←）">◀ 上一张</button>
      <button class="chip" data-action="map:step:1" data-focus data-start title="下一张（→）">下一张 ▶</button>
      <button class="chip" data-action="map:zoom:-0.5" data-focus aria-label="缩小地图">− 缩小</button>
      <button class="chip" data-action="map:zoom:0.5" data-focus aria-label="放大地图">＋ 放大</button>
      <button class="chip" data-action="map:reset" data-focus title="恢复裁切全图（0）">复位</button>
    </div>
  </div>` + footer('<b>▲▼</b> 选择　<b>OK</b> 确认', '←→ 切图 · 长按 OK 返回');
}

function updateMapView() {
  const m = state.map;
  const image = MAP_IMAGES[m.index];
  const img = document.getElementById('mapImage');
  if (!img) return;
  if (img.getAttribute('src') !== mapImageURL(image)) {
    document.getElementById('mapError').hidden = true;
    img.src = mapImageURL(image);
    img.alt = `《旷野之息》${image.name}中部地图`;
  }
  /* 地图限定在原有 body 内。先裁掉截图外框，再等比铺满；拖动也不能露出裁切外内容。 */
  const viewport = document.getElementById('mapViewport');
  const width = viewport.clientWidth;
  const height = viewport.clientHeight;
  const [x, y, cropWidth, cropHeight] = image.crop;
  const scale = Math.max(width / cropWidth, height / cropHeight);
  const w = cropWidth * scale, h = cropHeight * scale;
  const maxX = Math.max(0, (w * m.zoom - width) / 2);
  const maxY = Math.max(0, (h * m.zoom - height) / 2);
  m.x = Math.max(-maxX, Math.min(maxX, m.x));
  m.y = Math.max(-maxY, Math.min(maxY, m.y));
  const crop = document.getElementById('mapCrop');
  crop.style.width = `${w}px`;
  crop.style.height = `${h}px`;
  crop.style.left = `${(width - w) / 2}px`;
  crop.style.top = `${(height - h) / 2}px`;
  crop.style.transform = `translate(${m.x}px, ${m.y}px) scale(${m.zoom})`;
  img.style.width = `${image.size[0] * scale}px`;
  img.style.height = `${image.size[1] * scale}px`;
  img.style.left = `${-x * scale}px`;
  img.style.top = `${-y * scale}px`;
  viewport.classList.toggle('zoomed', m.zoom > 1);
  viewport.setAttribute('aria-label', `${image.name}地图`);
  document.getElementById('mapCaption').textContent = `${image.name} · ${image.label}`;
  document.getElementById('mapZoom').textContent = `${m.index + 1}/${MAP_IMAGES.length} · ${Math.round(m.zoom * 100)}%`;
  screenEl.querySelector('[data-action="map:zoom:-0.5"]').disabled = m.zoom <= 1;
  screenEl.querySelector('[data-action="map:zoom:0.5"]').disabled = m.zoom >= 4;
}

/* ---------------- inventory ---------------- */
const INV_CATS = [
  { id: 'weapons', label: 'WEAPONS', icon: 'inventory/sword.svg' },
  { id: 'shields', label: 'SHIELDS', icon: 'inventory/shield.svg' },
  { id: 'armors', label: 'ARMOR', icon: 'inventory/armor.svg' }
];
const INV_BY_ID = Object.fromEntries(INVENTORY_ITEMS.map(item => [item.id, item]));
const INV_PAGE_SIZE = 20;
const INV_BONUS = { normal: 'NO SPECIAL EFFECT', swimming: 'SWIM SPEED UP', climbing: 'CLIMBING SPEED UP', fire: 'FLAME GUARD' };
const INV_BONUS_ICONS = { swimming: 'inventory/water.svg', climbing: 'inventory/mountain.svg', fire: 'inventory/fire.svg' };
const INV_SLOT = { weapon: 'WEAPON', shield: 'SHIELD', head: 'HEAD', body: 'BODY', legs: 'LEGS' };
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const inventoryItems = category => INVENTORY_ITEMS.filter(item => item.category === category);
const isEquipped = item => state.inventory.equipped[item.slot] === item.id;
const inventoryStat = item => item.slot === 'weapon' ? 'ATTACK' : item.slot === 'shield' ? 'GUARD' : 'DEFENSE';

function inventoryDefense() {
  return ['head', 'body', 'legs'].reduce((sum, slot) => sum + (INV_BY_ID[state.inventory.equipped[slot]]?.value || 0), 0);
}

function inventorySummary() {
  const slots = state.inventory.equipped;
  return `<div class="inv-summary" aria-label="当前装备">
    ${Object.keys(INV_SLOT).map(slot => {
      const item = INV_BY_ID[slots[slot]];
      return `<span title="${INV_SLOT[slot]} · ${esc(item?.name || '未装备')}" aria-label="${INV_SLOT[slot]} · ${esc(item?.name || '未装备')}">
        <em>${INV_SLOT[slot]}</em>${item ? `<img src="${IMG(item.img)}" alt="${esc(item.name)}">` : '<i>—</i>'}</span>`;
    }).join('')}
    <b>DEF ${inventoryDefense()}</b></div>`;
}

function inventoryPreview(item) {
  const inv = state.inventory;
  if (inv.textId !== item.id) { inv.textId = item.id; inv.textPage = 0; }
  const pages = inventoryTextPages(item.description);
  inv.textPage = Math.max(0, Math.min(inv.textPage, pages.length - 1));
  const current = INV_BY_ID[inv.equipped[item.slot]];
  return `<span class="inv-eyebrow">${INV_SLOT[item.slot]} ${isEquipped(item) ? '· EQUIPPED' : '· IN POUCH'}</span>
    <h2>${esc(item.name)}</h2>
    <div class="inv-stat"><span>${inventoryStat(item)}</span><b>${current?.value || 0} <em>→</em> ${item.value}</b></div>
    <span class="inv-bonus">${INV_BONUS_ICONS[item.bonus] ? `<img src="${IMG(INV_BONUS_ICONS[item.bonus])}" alt="">` : ''}${INV_BONUS[item.bonus] || 'NO SPECIAL EFFECT'}</span>
    <p class="inv-description">${esc(pages[inv.textPage])}</p>
    <div class="inv-pager"><button data-action="inv:text:-1" ${inv.textPage === 0 ? 'disabled' : ''} aria-label="说明上一页"><img class="inv-page-arrow previous" src="${IMG('inventory/arrow.svg')}" alt=""></button>
      <span>${inv.textPage + 1} / ${pages.length}</span>
      <button data-action="inv:text:1" ${inv.textPage === pages.length - 1 ? 'disabled' : ''} aria-label="说明下一页"><img class="inv-page-arrow" src="${IMG('inventory/arrow.svg')}" alt=""></button></div>`;
}

/* 详情固定每页四行，保留全部文字，避免小屏幕长描述被裁掉。 */
function inventoryTextPages(text) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && line.length + word.length + 1 > 32) { lines.push(line); line = ''; }
    line += (line ? ' ' : '') + word;
  }
  if (line) lines.push(line);
  const pages = [];
  for (let i = 0; i < lines.length; i += 4) pages.push(lines.slice(i, i + 4).join('\n'));
  return pages.length ? pages : [''];
}

function viewInventory(category, id) {
  const inv = state.inventory;
  category = INV_CATS.some(cat => cat.id === category) ? category : inv.category;
  inv.category = category;
  const items = inventoryItems(category);
  const detail = items.find(item => item.id === id);
  if (id && !detail) history.replaceState(null, '', '#/inventory/' + category);
  if (detail) {
    inv.pages[category] = Math.floor(items.indexOf(detail) / INV_PAGE_SIZE);
    inv.selected[category] = detail.id;
  }
  const pageCount = Math.ceil(items.length / INV_PAGE_SIZE);
  inv.pages[category] = Math.max(0, Math.min(pageCount - 1, inv.pages[category]));
  const page = inv.pages[category];
  const visible = items.slice(page * INV_PAGE_SIZE, (page + 1) * INV_PAGE_SIZE);
  const selected = visible.find(item => item.id === inv.selected[category]) || visible[0];
  inv.selected[category] = selected.id;
  return topbar('inventory') + `<div class="body inventory-body">
    <div class="inv-columns"><section class="inv-storage">
      <nav class="inv-categories" aria-label="装备分类">${INV_CATS.map(cat => `<button class="${category === cat.id ? 'on' : ''}"
        data-action="go:#/inventory/${cat.id}" data-focus title="${cat.label}" aria-label="${cat.label}" aria-pressed="${category === cat.id}"><img src="${IMG(cat.icon)}" alt=""></button>`).join('')}</nav>
      <div class="inv-grid">${visible.map(item => `<button class="inv-cell ${isEquipped(item) ? 'equipped' : ''} ${selected.id === item.id ? 'sel' : ''}"
        data-action="inv:equip:${item.id}" data-item="${item.id}" data-focus ${selected.id === item.id ? 'data-start' : ''}
        title="${esc(item.name)} · ${isEquipped(item) ? '卸下' : '装备'}" aria-pressed="${isEquipped(item)}" aria-label="${esc(item.name)} · ${isEquipped(item) ? '卸下' : '装备'}">
        <img class="inv-item-art" src="${IMG(item.img)}" alt="">${INV_BONUS_ICONS[item.bonus] ? `<img class="inv-cell-bonus" src="${IMG(INV_BONUS_ICONS[item.bonus])}" alt="${INV_BONUS[item.bonus]}">` : ''}<b>${item.value}</b>
      </button>`).join('')}${Array.from({ length: INV_PAGE_SIZE - visible.length }, () => '<span class="inv-cell empty" aria-hidden="true"></span>').join('')}</div>
      <div class="inv-pager"><button data-action="inv:page:-1" ${page === 0 ? 'disabled' : ''} aria-label="上一页"><img class="inv-page-arrow previous" src="${IMG('inventory/arrow.svg')}" alt=""></button>
        <span>${String(page + 1).padStart(2, '0')} / ${String(pageCount).padStart(2, '0')}</span>
        <button data-action="inv:page:1" ${page === pageCount - 1 ? 'disabled' : ''} aria-label="下一页"><img class="inv-page-arrow" src="${IMG('inventory/arrow.svg')}" alt=""></button></div>
    </section><aside class="inv-character" aria-label="林克与装备说明">
      <img class="inv-link" src="${IMG('inventory/bg.png')}?v=link-original" alt="林克立绘（固定外观）">
      <div class="inv-stamina" aria-hidden="true"></div>
      <div class="inv-hearts" aria-hidden="true"><img src="${IMG('heart_icon.png')}" alt=""><img src="${IMG('heart_icon.png')}" alt=""><img src="${IMG('heart_icon.png')}" alt=""></div>
      <section class="inv-preview" id="inventoryPreview">${inventoryPreview(selected)}</section>
    </aside></div>
    ${inventorySummary()}
  </div>` + footer('<b>▲▼</b> 选择　<b>OK</b> 装备 / 卸下', '长按 OK 返回');
}

function syncInventoryPreview() {
  const preview = document.getElementById('inventoryPreview');
  const element = focusables()[state.focus];
  const item = INV_BY_ID[element?.dataset.item];
  if (!preview || !item) return;
  const changed = state.inventory.textId !== item.id;
  state.inventory.selected[item.category] = item.id;
  if (routeParts()[2] && routeParts()[2] !== item.id) {
    history.replaceState(null, '', '#/inventory/' + item.category);
  }
  if (changed) preview.innerHTML = inventoryPreview(item);
  screenEl.querySelectorAll('.inv-cell[data-item]').forEach(cell => cell.classList.toggle('sel', cell.dataset.item === item.id));
}

function inventoryAction(kind, value) {
  const inv = state.inventory;
  if (kind === 'page') {
    const items = inventoryItems(inv.category);
    const page = inv.pages[inv.category] + Number(value);
    if (!Number.isInteger(page) || page < 0 || page >= Math.ceil(items.length / INV_PAGE_SIZE)) return;
    inv.pages[inv.category] = page;
    inv.selected[inv.category] = items[page * INV_PAGE_SIZE].id;
    if (routeParts()[2]) history.replaceState(null, '', '#/inventory/' + inv.category);
    focusKey = 'inv:equip:' + inv.selected[inv.category];
    render(); beep('move');
  } else if (kind === 'equip') {
    const item = INV_BY_ID[value];
    if (!item || routeParts()[0] !== 'inventory' || item.category !== inv.category || inv.selected[item.category] !== item.id) return;
    inv.equipped[item.slot] = isEquipped(item) ? null : item.id;
    render(); beep('ok');
    toast(isEquipped(item) ? '已装备 · ' + item.name : '已卸下 · ' + item.name);
  } else if (kind === 'text') {
    const item = INV_BY_ID[inv.textId];
    if (!item) return;
    const next = inv.textPage + Number(value);
    if (!Number.isInteger(next) || next < 0 || next >= inventoryTextPages(item.description).length) return;
    inv.textPage = next;
    render(); beep('move');
  }
}

/* ---------------- compendium ---------------- */
function viewCompendium() {
  const have = COMP_CATS.reduce((n, c) => n + c.have, 0);
  const total = COMP_CATS.reduce((n, c) => n + c.total, 0);
  return topbar('compendium') + `<div class="body comp-body">
    <div class="comp-head"><h3>HYRULE COMPENDIUM</h3><span>${have} / ${total} · ${Math.round(have / total * 100)}%</span></div>
    <div class="comp-grid">${COMP_CATS.map((c, i) => `
      <button class="comp-tile ${i === 0 ? 'span2' : ''}" data-action="comp:${c.id}" data-focus ${i === 0 ? 'data-start' : ''}>
        <img class="cover" src="${IMG(c.cover)}" alt="">
        <img class="art" src="${IMG(c.art)}" alt="">
        <b>${c.label}</b>
        <span>${c.cn} · ${c.have}/${c.total}</span>
        <div class="bar"><i style="width:${Math.round(c.have / c.total * 100)}%"></i></div>
      </button>`).join('')}</div>
  </div>` + footer('<b>▲▼</b> 分类　<b>OK</b> 打开');
}

function viewCompendiumCat(catId) {
  const cat = COMP_CATS.find(c => c.id === catId) || COMP_CATS[0];
  state.compCat = cat.id;
  const entries = COMP_ENTRIES[cat.id] || [];
  return topbar('compendium') + `<div class="body comp-body">
    <div class="comp-head"><span class="head-left"><button class="back-tab" data-action="back" data-focus>◀ BACK</button><img class="cat-mark" src="${IMG(cat.art)}" alt=""><h3>${cat.label}</h3></span><span>${cat.have}/${cat.total} RECORDED</span></div>
    <div class="entry-list">${entries.map((e, i) => `
      <button class="entry-row" data-action="entry:${cat.id}:${i}" data-focus ${i === 0 ? 'data-start' : ''}>
        <span class="no">#${e.no}</span>
        ${e.got ? `<img src="${IMG(e.thumb || e.img)}" alt="">` : `<span class="unknown"><img src="${IMG(cat.art)}" alt=""></span>`}
        <span class="name"><b>${e.got ? e.name : '???'}${e.mm ? `<i class="mm-dot">M</i>` : ''}</b><span>${e.got ? e.cn : '未记录'}</span></span>
        <span class="state ${e.got ? 'ok' : ''}">${e.got ? '✓ 已登记' : '— 未发现'}</span>
      </button>`).join('')}</div>
    <div class="comp-foot">
      <div class="row"><span>RECORDED</span><b>${cat.have} / ${cat.total}</b></div>
      <div class="bar"><i style="width:${Math.round(cat.have / cat.total * 100)}%"></i></div>
      <p>全量条目 · ${cat.cn}共 ${cat.total} 条${cat.id === 'monsters' ? ' · 含大师模式金色怪' : ''}</p>
    </div>
  </div>` + footer('<b>◀</b> 返回分类　<b>OK</b> 查看条目');
}

function viewEntry(catId, idx) {
  const cat = COMP_CATS.find(c => c.id === catId) || COMP_CATS[0];
  const list = COMP_ENTRIES[cat.id] || [];
  const e = list[idx] || list[0];
  if (!e) return viewCompendiumCat(cat.id);
  const i = list.indexOf(e);
  const prev = list[i - 1];
  const next = list[i + 1];
  const seq = String(i + 1).padStart(2, '0');
  const total = String(list.length);
  return topbar('compendium') + `<div class="body comp-body">
    <div class="comp-head"><h3>ENTRY #${e.no}</h3><span>${cat.label} · ${seq}/${total}</span></div>
    <div class="entry-detail">
      <div class="entry-art ${e.got ? '' : 'unknown'}"><img src="${IMG(e.got ? e.img : cat.art)}" alt=""></div>
      <div class="entry-info">
        <h2>${e.got ? e.name : '???'}${e.mm ? `<i class="mm-badge">MASTER</i>` : ''}</h2>
        <div class="cn">${e.got ? e.cn : 'UNRECORDED'}</div>
        <p>${e.desc}</p>
        ${e.got && e.meta ? `<div class="entry-fact"><span>${e.meta[0]}</span><b>${e.meta[1]}</b></div>` : ''}
        <div class="entry-meta">
          <span class="stamp ${e.got ? '' : 'miss'}">${e.got ? 'REGISTERED' : 'NOT FOUND'}</span>
          ${e.mm ? `<span class="mm-stamp">MASTER MODE</span>` : ''}
          ${e.stat ? `<span class="entry-stat">${e.thumb ? `<img src="${IMG(e.thumb)}" alt="">` : ''}<b>${e.stat[0]}</b> ${e.stat[1]}</span>` : ''}
        </div>
      </div>
    </div>
    <div class="chiprow">
      <button class="chip" data-action="entry:${cat.id}:${i - 1}" data-focus ${prev ? '' : 'disabled'} aria-label="上一个条目">◀ 上一个</button>
      <button class="chip" data-action="back" data-focus data-start>返回列表</button>
      <button class="chip" data-action="comp:${cat.id}" data-focus>分类总览</button>
      <button class="chip" data-action="entry:${cat.id}:${i + 1}" data-focus ${next ? '' : 'disabled'} aria-label="下一个条目">下一个 ▶</button>
    </div>
  </div>` + footer('<b>◀▶</b> 切换条目　<b>OK</b> 返回', `${seq} / ${total}`);
}

/* ---------------- adventure log ---------------- */
function viewLog() {
  const tab = state.logTab === 'side' ? 'side' : 'main';
  const list = QUESTS[tab];
  const total = String(list.length);
  return topbar('log') + `<div class="body log-body">
    <div class="log-tabs">
      ${[['main', '主线 · MAIN'], ['side', '支线 · SIDE']].map(([id, label]) => `
        <button class="log-tab ${tab === id ? 'on' : ''}" data-action="logtab:${id}" data-focus aria-pressed="${tab === id}" ${tab === id ? 'data-start' : ''}>${label}</button>`).join('')}
    </div>
    <div class="story-intro"><b>ADVENTURE LOG</b><span>${tab === 'main' ? '主线任务 ' + total + ' 条' : '迷你挑战 ' + total + ' 条'} · 含剧透</span></div>
    <div class="quest-list">${list.map((q, i) => `
      <button class="quest-row" data-action="quest:${tab}:${q.id}" data-focus>
        <span class="q-number">${String(i + 1).padStart(2, '0')}</span>
        <span class="q-main"><b>${esc(q.cn)}</b><span>${esc(q.title)}</span></span>
        <span class="q-pages">${esc(q.loc)}</span>
      </button>`).join('')}</div>
  </div>` + footer('<b>▲▼</b> 选择　<b>OK</b> 查看', '完整任务清单 · 自写梗概');
}

function viewQuest(tabId, id) {
  const tab = tabId === 'side' ? 'side' : 'main';
  const list = QUESTS[tab];
  const q = list.find(x => x.id === id) || list[0];
  if (tabId !== tab || id !== q.id) history.replaceState(null, '', `#/log/${tab}/${q.id}`);
  state.logTab = tab;
  const idx = list.indexOf(q);
  const prev = list[idx - 1];
  const next = list[idx + 1];
  const prevId = prev ? prev.id : '';
  const nextId = next ? next.id : '';
  const seq = String(idx + 1).padStart(2, '0');
  const total = String(list.length);
  return topbar('log') + `<div class="body story-body">
    <div class="story-meta"><span>${tab === 'main' ? '主线' : '迷你挑战'} ${seq} / ${total}</span><span>${esc(q.loc)} · 剧情梗概</span></div>
    <h2>${esc(q.cn)}</h2>
    <div class="story-subtitle">${esc(q.title)}</div>
    <article class="story-page" aria-label="${esc(q.cn)}">
      <p>${esc(q.desc)}</p>
    </article>
    <div class="story-controls">
      <button data-action="quest:${tab}:${prevId}" ${prev ? '' : 'disabled'} aria-label="上一个任务">上一个</button>
      <button data-action="back" data-start>返回目录</button>
      <button data-action="quest:${tab}:${nextId}" ${next ? '' : 'disabled'} aria-label="下一个任务">下一个</button>
    </div>
  </div>` + footer('<b>▲▼</b> 选择　<b>OK</b> 确认', `${seq} / ${total} · 长按返回`);
}

/* ---------------- system ---------------- */
function meter(level, max) {
  return `<span class="meter">${Array.from({ length: max }, (_, i) => `<i class="${i < level ? 'on' : ''}"></i>`).join('')}</span>`;
}

function viewSystem() {
  const s = state.settings;
  return topbar('system') + `<div class="body sys-body">
    <div class="sys-title"><h2>SYSTEM</h2></div>
    <button class="sys-row" data-action="set:brightness" data-focus data-start>
      <span class="lab">亮度</span>${meter(s.brightness, 5)}<span class="val">${s.brightness * 20}%</span>
    </button>
    <button class="sys-row" data-action="set:volume" data-focus>
      <span class="lab">音量</span>${meter(s.volume, 5)}<span class="val">${s.volume * 20}%</span>
    </button>
    <button class="sys-row" data-action="set:scanlines" data-focus>
      <span class="lab">扫描线</span><span class="muted" style="flex:1;font-size:5.5px">CRT 质感叠加</span>
      <span class="toggle ${s.scanlines ? 'on' : ''}"><i></i></span>
    </button>
    <button class="sys-row" data-action="set:sfx" data-focus>
      <span class="lab">按键音</span><span class="muted" style="flex:1;font-size:5.5px">UI 反馈音效</span>
      <span class="toggle ${s.sfx ? 'on' : ''}"><i></i></span>
    </button>
    <div class="sys-actions">
      <button class="chip" data-action="go:#/album" data-focus>相册</button>
      <button class="chip" data-action="sys:about" data-focus>关于</button>
      <button class="chip" data-action="go:#/standby" data-focus>待机</button>
    </div>
    <div class="sys-meta">电量 <b>99%</b> · 运行 <b>01:24</b> · 存储 <b>2.1 / 8 MB</b></div>
  </div>` + footer('<b>OK</b> 调整 / 切换');
}

/* ---------------- album ---------------- */
function albumItems() {
  return [...state.albumShots, ...ALBUM.filter(a => !state.albumDeleted.includes(a.id))];
}

function viewAlbum() {
  const items = albumItems();
  const slots = 12;
  return topbar('system') + `<div class="body album-body">
    <div class="comp-head"><h3>CAMERA ALBUM</h3><span>${Math.min(items.length, slots)} / ${slots} PHOTOS</span></div>
    <div class="album-grid">${Array.from({ length: slots }, (_, i) => {
      const a = items[i];
      return a
        ? `<button class="photo" data-action="album:open:${a.id}" data-focus ${i === 0 ? 'data-start' : ''}>
             <img class="bg" src="${IMG(a.img)}" alt="">
             <span class="no">${a.no}</span>
             ${a.fresh ? '<span class="new">NEW</span>' : ''}
             <span class="meta">${a.time}</span>
           </button>`
        : `<div class="photo empty">+</div>`;
    }).join('')}</div>
    <div class="album-note"><span>CAMERA RUNE · SHEIKAH SLATE</span><b>${(2.1 + state.albumShots.length * 0.2).toFixed(1)} / 8 MB</b></div>
  </div>` + footer('<b>▲▼</b> 照片　<b>OK</b> 查看');
}

function viewAlbumModal() {
  const a = albumItems().find(x => x.id === state.albumOpen);
  if (!a) return '';
  return `<div class="photo-modal">
    <div class="big"><img class="bg" src="${IMG(a.big)}" alt=""></div>
    <div class="info">
      <h3>${a.title}</h3>
      <div class="cn">${a.cn}</div>
      <dl>
        <dt>编号</dt><dd>${a.no}</dd>
        <dt>时间</dt><dd>${a.time}</dd>
        <dt>地点</dt><dd>${a.place}</dd>
      </dl>
      <div class="chiprow">
        <button class="chip" data-action="album:close" data-focus data-start>关闭</button>
        <button class="chip" data-action="album:delete:${a.id}" data-focus>删除</button>
      </div>
    </div>
  </div>`;
}

/* ---------------- render ---------------- */
let prevHash = null;
let focusKey = null;
function render() {
  clearStasisClock();
  const p = routeParts();
  const hash = routeHash();
  const sameRoute = prevHash === hash;
  const isMap = p[0] === 'map';
  if (mapDrag) endMapDrag({ pointerId: mapDrag.id });
  document.body.classList.toggle('map-mode', isMap);
  let html = '';
  switch (p[0]) {
    case 'runes': html = viewRunes(); break;
    case 'map': html = viewMap(); break;
    case 'inventory': html = viewInventory(p[1], p[2]); break;
    case 'rune': html = viewRune(p[1] || 'bomb'); break;
    case 'compendium':
      html = p[2] !== undefined ? viewEntry(p[1], Number(p[2])) : p[1] ? viewCompendiumCat(p[1]) : viewCompendium();
      break;
    case 'log': html = p[2] ? viewQuest(p[1], p[2]) : viewLog(); break;
    case 'system': html = viewSystem(); break;
    case 'album':
      state.albumOpen = p[1] || null;
      html = viewAlbum() + (p[1] ? viewAlbumModal() : '');
      break;
    default: html = viewStandby();
  }
  screenEl.innerHTML = html + '<div class="focus-frame" id="focusFrame"></div><div class="wipe" id="wipe"></div>';
  screenEl.style.filter = `brightness(${(0.55 + state.settings.brightness * 0.09).toFixed(3)})`;
  if (isMap) updateMapView();
  document.body.classList.toggle('no-scan', !state.settings.scanlines);
  /* 同一页内重绘（调亮度、切换目标等）时把选中位置留在原处，不要跳回顶部。 */
  initFocus(sameRoute ? focusKey : null);
  updateRail();
  if (p[0] === 'rune' && p[1] === 'stasis' && state.stasis.frozen) startStasisClock();

  /* 换页：只有哈希真的变了才扫光；从别的页面进入符文时额外闪一次光圈。 */
  if (prevHash !== null && prevHash !== hash) {
    runWipe();
    const from = prevHash.replace(/^#\//, '').split('/')[0];
    if (p[0] === 'rune' && from !== 'rune') flashBoot();
  }
  prevHash = hash;
}

function runWipe() {
  const w = document.getElementById('wipe');
  if (!w) return;
  w.classList.remove('run');
  void w.offsetWidth;
  w.classList.add('run');
}

function flashBoot() {
  const f = document.createElement('div');
  f.className = 'boot-flash';
  screenEl.appendChild(f);
  setTimeout(() => f.remove(), 380);
}

function focusables() {
  /* 照片详情是盖在上面的弹层：打开时焦点只在弹层里循环，不能落到被盖住的列表上。 */
  const scope = screenEl.querySelector('.photo-modal') || screenEl;
  return [...scope.querySelectorAll('[data-action]:not([disabled])')];
}

function initFocus(key) {
  const els = focusables();
  let idx = key ? els.findIndex(el => el.dataset.action === key) : -1;
  if (idx < 0) idx = els.findIndex(el => el.hasAttribute('data-start'));
  state.focus = idx >= 0 ? idx : 0;
  paintFocus(false);
}

function paintFocus(pop = true) {
  const els = focusables();
  if (!els.length) return;
  state.focus = (state.focus + els.length) % els.length;
  focusKey = els[state.focus].dataset.action || null;
  syncInventoryPreview();
  const el = els[state.focus];
  if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  placeFocus(pop);
}

/* 选中框绘制在覆盖层上，坐标要除以屏幕当前缩放（--scale）。 */
function placeFocus(pop) {
  const frame = document.getElementById('focusFrame');
  if (!frame) return;
  const el = focusables()[state.focus];
  if (!el) { frame.classList.remove('on'); return; }
  const sr = screenEl.getBoundingClientRect();
  const s = sr.width / 320 || 1;
  const r = el.getBoundingClientRect();
  const pad = 2;
  const x = Math.max(0, (r.left - sr.left) / s - pad);
  const y = Math.max(0, (r.top - sr.top) / s - pad);
  const w = Math.min(320 - x, r.width / s + pad * 2);
  const h = Math.min(240 - y, r.height / s + pad * 2);
  frame.style.left = x + 'px';
  frame.style.top = y + 'px';
  frame.style.width = w + 'px';
  frame.style.height = h + 'px';
  frame.classList.add('on');
  if (pop) {
    frame.classList.remove('pop');
    void frame.offsetWidth;
    frame.classList.add('pop');
  }
}

function moveFocus(delta, silent) {
  state.focus += delta;
  paintFocus();
  if (!silent) beep('move');
}

function activateFocused() {
  const el = focusables()[state.focus];
  if (el) el.click();
}

function updateRail() {
  const h = routeHash();
  [...railEl.querySelectorAll('a')].forEach(a => {
    const target = a.getAttribute('href');
    const on = h === target || (target !== '#/runes' && target !== '#/standby' && h.startsWith(target + '/'));
    a.classList.toggle('on', on);
  });
}

/* ---------------- actions ---------------- */
function run(action) {
  const [verb, ...rest] = action.split(':');
  switch (verb) {
    case 'go': {
      const target = rest.join(':');
      /* 从待机进入符文页时给一声石板启动音。 */
      if (target === '#/runes' && routeParts()[0] === 'standby') beep('activate');
      go(target);
      break;
    }
    case 'back': back(); break;
    case 'pick':
      state.runeIndex = Number(rest[0]);
      render(); beep('ok'); break;
    case 'enter-rune':
      go('#/rune/' + RUNES[state.runeIndex].id); beep('activate'); break;

    case 'bomb': bombAction(rest[0], rest[1]); break;
    case 'magnet': magnetAction(rest[0]); break;
    case 'stasis': stasisAction(rest[0]); break;
    case 'cryonis': cryonisAction(rest[0]); break;
    case 'camera': cameraAction(rest[0], rest[1]); break;

    case 'inv': inventoryAction(rest[0], rest[1]); break;
    case 'comp': go('#/compendium/' + rest.join(':')); break;
    case 'entry': go(`#/compendium/${rest[0]}/${rest[1]}`); break;
    case 'map': mapAction(rest[0], rest[1]); break;
    case 'logtab': state.logTab = rest[0] === 'side' ? 'side' : 'main'; render(); beep('ok'); break;
    case 'quest': go(`#/log/${rest[0]}/${rest[1]}`); break;

    case 'set': sysAction(rest[0]); break;
    case 'sys': about(); break;

    case 'album': albumAction(rest[0], rest[1]); break;
    default: break;
  }
}

function bombAction(kind, arg) {
  const b = state.bomb;
  if (kind === 'place') {
    if (b.placed || b.done) return;
    b.placed = true; render(); beep('place');
  } else if (kind === 'reset') {
    b.placed = false; b.done = false; render(); beep('back');
  } else if (kind === 'blast') {
    if (b.done) return;
    if (!b.placed) { toast('先把炸弹放下。', 'warn'); beep('back'); return; }
    b.placed = false; b.done = true;
    render();
    playBlast();
    beep('boom');
    setTimeout(() => beep('complete'), 420);
  }
}

function playBlast() {
  const layer = screenEl.querySelector('#blastLayer');
  const scene = screenEl.querySelector('#scene');
  if (!layer) return;
  scene && scene.classList.add('shake');
  shellEl.animate(
    [{ transform: 'translate(0,0)' }, { transform: 'translate(-2px,1px)' }, { transform: 'translate(2px,-1px)' }, { transform: 'translate(0,0)' }],
    { duration: 280, easing: 'ease-out' }
  );
  [0, 1, 2, 3].forEach((f, i) => setTimeout(() => {
    layer.innerHTML = `<img class="blast" src="${FW('blast_' + f + '.png')}" alt="" style="right:52px;bottom:16px">`;
  }, i * 80));
  setTimeout(() => { layer.innerHTML = ''; }, 520);
}

function magnetAction(kind) {
  const m = state.magnet;
  if (kind === 'reset') { m.grabbed = false; m.moved = false; m.done = false; render(); beep('back'); return; }
  if (m.done) return;
  if (kind === 'grab') {
    if (!m.grabbed) { m.grabbed = true; m.moved = false; render(); beep('magnet'); }
  } else if (kind === 'move') {
    if (!m.grabbed) return toast('先抓取金属箱。', 'warn');
    m.moved = true; render(); beep('ok');
  } else if (kind === 'drop') {
    if (!m.grabbed) return toast('先抓取金属箱。', 'warn');
    if (!m.moved) return toast('先把它移动到压力板上方。', 'warn');
    m.done = true; render(); beep('complete');
  }
}

function stasisAction(kind) {
  const s = state.stasis;
  if (kind === 'reset') {
    clearStasisClock(); s.frozen = false; s.hits = 0; s.remaining = 10; s.done = false;
    render(); beep('back'); return;
  }
  if (s.done) return;
  if (kind === 'freeze') {
    if (s.frozen) return;
    s.frozen = true; s.hits = 0; s.remaining = 10;
    render(); beep('freeze');
  } else if (kind === 'hit') {
    if (!s.frozen) return toast('先冻结岩石。', 'warn');
    if (s.hits >= 6) return toast('势能已满，按「释放」。', 'warn');
    s.hits += 1; render(); beep('hit');
  } else if (kind === 'release') {
    if (!s.frozen) return toast('先冻结岩石。', 'warn');
    s.frozen = false; s.done = true;
    render(); beep('boom');
    setTimeout(() => beep('complete'), 420);
    const scene = screenEl.querySelector('#scene');
    scene && scene.classList.add('shake');
  }
}

let stasisTimer = null;
function startStasisClock() {
  clearStasisClock();
  stasisTimer = setInterval(() => {
    const s = state.stasis;
    if (!s.frozen) return clearStasisClock();
    s.remaining = Math.max(0, s.remaining - 0.1);
    const bar = document.getElementById('stasisBar');
    const label = document.getElementById('stasisTime');
    if (bar) bar.style.width = (s.remaining * 10) + '%';
    if (label) label.textContent = s.remaining.toFixed(1) + ' s';
    if (s.remaining <= 0) { s.frozen = false; clearStasisClock(); render(); beep('unfreeze'); }
  }, 100);
}
function clearStasisClock() { if (stasisTimer) { clearInterval(stasisTimer); stasisTimer = null; } }

function cryonisAction(kind) {
  const c = state.cryonis;
  if (kind === 'reset') { c.count = 0; c.done = false; render(); beep('back'); return; }
  if (c.done) return;
  if (kind === 'create') {
    if (c.count >= 3) return;
    c.count += 1; render(); beep('cryonis');
  } else if (kind === 'break') {
    if (c.count <= 0) return;
    c.count -= 1; render(); beep('shatter');
  } else if (kind === 'cross') {
    if (c.count < 3) return toast('需要三根冰柱才能跨过去。', 'warn');
    c.done = true; render(); beep('complete');
  }
}

function cameraAction(kind, arg) {
  const c = state.camera;
  if (kind === 'pick') {
    c.sel = Number(arg); render(); beep('move'); return;
  }
  if (kind === 'next') {
    c.sel = (c.sel + 1) % CAM_TARGETS.length; render(); beep('move'); return;
  }
  if (kind === 'album') { go('#/album'); return; }
  if (kind === 'shoot') {
    const idx = c.sel;
    const t = CAM_TARGETS[idx];
    if (c.shots[idx]) { toast('这个目标已经登记过了。', 'warn'); beep('back'); return; }
    c.shots[idx] = true;
    c.done = c.shots.every(Boolean);
    /* 拍完自动切到下一个未登记目标，连着拍不用来回切换。 */
    if (!c.done) {
      const next = c.shots.findIndex(v => !v);
      if (next >= 0) c.sel = next;
    }
    /* 快门会把照片写进相册，相机符文与相册因此是同一个数据流。 */
    state.albumShots.unshift({
      id: 'shot' + idx, no: 'NEW', img: t.img, big: t.big || t.img,
      title: t.name, cn: 'CAMERA RUNE · 新登记', time: 'NOW', place: 'GREAT PLATEAU', fresh: true
    });
    render(); beep('shutter');
    const flash = document.createElement('div');
    flash.className = 'flash';
    screenEl.appendChild(flash);
    setTimeout(() => flash.remove(), 340);
    if (c.done) setTimeout(() => beep('complete'), 280);
  }
}

function mapAction(kind, arg, silent = false) {
  if (mapDrag) endMapDrag({ pointerId: mapDrag.id });
  const m = state.map;
  if (kind === 'step') {
    const index = (m.index + Number(arg) + MAP_IMAGES.length) % MAP_IMAGES.length;
    if (!Number.isInteger(index) || !MAP_IMAGES[index]) return;
    m.index = index;
    m.zoom = 1; m.x = 0; m.y = 0;
  } else if (kind === 'zoom') {
    const zoom = Math.max(1, Math.min(4, m.zoom + Number(arg)));
    if (!Number.isFinite(zoom)) return;
    m.x *= zoom / m.zoom; m.y *= zoom / m.zoom;
    m.zoom = zoom;
  } else if (kind === 'reset') {
    m.zoom = 1; m.x = 0; m.y = 0;
  } else return;
  updateMapView();
  initFocus(focusKey);
  if (!silent) beep(kind === 'step' ? 'move' : 'ok');
}

function sysAction(kind) {
  const s = state.settings;
  if (kind === 'brightness') s.brightness = s.brightness >= 5 ? 1 : s.brightness + 1;
  if (kind === 'volume') s.volume = s.volume >= 5 ? 0 : s.volume + 1;
  if (kind === 'scanlines') s.scanlines = !s.scanlines;
  if (kind === 'sfx') s.sfx = !s.sfx;
  render(); beep('ok');
}

function about() {
  toast('AI Passport · Sheikah Slate');
  beep('ok');
}

function albumAction(kind, id) {
  if (kind === 'open') { go('#/album/' + id); beep('ok'); return; }
  if (kind === 'close') { go('#/album'); beep('back'); return; }
  if (kind === 'delete') {
    if (id.startsWith('shot')) {
      state.albumShots = state.albumShots.filter(s => s.id !== id);
    } else if (!state.albumDeleted.includes(id)) {
      state.albumDeleted.push(id);
    }
    state.albumOpen = null; go('#/album'); beep('back');
  }
}

function toast(text, kind) {
  /* 先清掉旧提示，避免连续操作时叠成一团。 */
  screenEl.querySelectorAll('.toast').forEach(t => t.remove());
  const el = document.createElement('div');
  el.className = 'toast' + (kind === 'warn' ? ' warn' : '');
  el.textContent = text;
  screenEl.appendChild(el);
  requestAnimationFrame(() => el.classList.add('on'));
  setTimeout(() => {
    el.classList.remove('on');
    setTimeout(() => el.remove(), 220);
  }, 1700);
}

/* ---------------- input ---------------- */
let mapDrag = null;
screenEl.addEventListener('error', e => {
  if (e.target.id === 'mapImage') document.getElementById('mapError').hidden = false;
}, true);
screenEl.addEventListener('load', e => {
  if (e.target.id === 'mapImage') document.getElementById('mapError').hidden = true;
}, true);
screenEl.addEventListener('wheel', e => {
  if (!e.target.closest('#mapViewport') || e.ctrlKey || !e.deltaY) return;
  e.preventDefault();
  mapAction('zoom', e.deltaY < 0 ? 0.25 : -0.25, true);
}, { passive: false });
screenEl.addEventListener('pointerdown', e => {
  if (!e.target.closest('#mapViewport') || state.map.zoom <= 1 || e.button !== 0 || !e.isPrimary) return;
  e.preventDefault();
  mapDrag = { id: e.pointerId, x: e.clientX, y: e.clientY, panX: state.map.x, panY: state.map.y };
  screenEl.setPointerCapture(e.pointerId);
  screenEl.classList.add('map-dragging');
});
screenEl.addEventListener('pointermove', e => {
  if (!mapDrag || e.pointerId !== mapDrag.id) return;
  const scale = screenEl.getBoundingClientRect().width / 320;
  state.map.x = mapDrag.panX + (e.clientX - mapDrag.x) / scale;
  state.map.y = mapDrag.panY + (e.clientY - mapDrag.y) / scale;
  updateMapView();
});
function endMapDrag(e) {
  if (mapDrag && e.pointerId !== mapDrag.id) return;
  mapDrag = null;
  screenEl.classList.remove('map-dragging');
  if (screenEl.hasPointerCapture(e.pointerId)) screenEl.releasePointerCapture(e.pointerId);
}
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => screenEl.addEventListener(type, endMapDrag));

/* 鼠标悬停也跟随选择：评审时移上去就能看到选中态，不必先点一下。 */
let hoverRAF = 0;
let lastHoverSound = 0;
screenEl.addEventListener('pointerover', e => {
  const el = e.target.closest('[data-action]:not([disabled])');
  if (!el) return;
  const i = focusables().indexOf(el);
  if (i < 0 || i === state.focus) return;
  cancelAnimationFrame(hoverRAF);
  hoverRAF = requestAnimationFrame(() => {
    state.focus = i;
    paintFocus();
    const now = performance.now();
    if (now - lastHoverSound > 90) { beep('move'); lastHoverSound = now; }
  });
});

/* 鼠标移入只预览，点击或短按 OK 才装备；触屏不依赖悬停。 */
screenEl.addEventListener('pointerover', e => {
  if (e.pointerType !== 'mouse') return;
  const cell = e.target.closest('.inv-cell[data-item]');
  if (!cell || cell.contains(e.relatedTarget)) return;
  const index = focusables().indexOf(cell);
  if (index < 0 || index === state.focus) return;
  state.focus = index;
  paintFocus();
});

screenEl.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const els = focusables();
  const i = els.indexOf(el);
  if (i < 0) return;
  state.focus = i; paintFocus();
  run(el.dataset.action);
});

let holdTimer = null;
let holdRAF = 0;
let holdStart = 0;
let longFired = false;
const HOLD_MS = 650;

function startHoldBar() {
  const key = document.querySelector('.key.ok');
  if (!key) return;
  const bar = key.querySelector('.hold');
  key.classList.add('holding');
  if (!bar) return;
  holdStart = performance.now();
  cancelAnimationFrame(holdRAF);
  const step = now => {
    const t = Math.min(1, (now - holdStart) / HOLD_MS);
    bar.style.width = (t * 100).toFixed(1) + '%';
    if (t < 1 && holdTimer) holdRAF = requestAnimationFrame(step);
  };
  holdRAF = requestAnimationFrame(step);
}

function stopHoldBar() {
  cancelAnimationFrame(holdRAF);
  const key = document.querySelector('.key.ok');
  if (!key) return;
  key.classList.remove('holding');
  const bar = key.querySelector('.hold');
  if (bar) bar.style.width = '0';
}

function okDown() {
  longFired = false;
  clearTimeout(holdTimer);
  startHoldBar();
  holdTimer = setTimeout(() => { longFired = true; stopHoldBar(); back(); beep('back'); }, HOLD_MS);
}
function okUp() {
  clearTimeout(holdTimer);
  holdTimer = null;
  stopHoldBar();
  if (!longFired) activateFocused();
  longFired = false;
}

/* 方向键支持按住连续移动：先走一格，停顿 380 ms 后每 96 ms 一格。 */
let navDelay = null;
let navTimer = null;
function startNav(dir) {
  moveFocus(dir);
  stopNav();
  navDelay = setTimeout(() => {
    navTimer = setInterval(() => moveFocus(dir, true), 96);
  }, 380);
}
function stopNav() {
  clearTimeout(navDelay);
  clearInterval(navTimer);
  navDelay = null;
  navTimer = null;
}

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'Enter' && e.target.closest('.rail a, #resetBtn')) return;
  if (routeParts()[0] === 'map') {
    const actions = { ArrowLeft: ['step', -1], ArrowRight: ['step', 1], '+': ['zoom', 0.5], '=': ['zoom', 0.5], '-': ['zoom', -0.5], '0': ['reset'] };
    if (actions[e.key]) { e.preventDefault(); if (!e.repeat) mapAction(...actions[e.key]); return; }
  }
  if (e.repeat) { if (['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) e.preventDefault(); return; }
  if (e.key === 'ArrowUp') { e.preventDefault(); startNav(-1); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); startNav(1); }
  else if (e.key === 'Enter') { e.preventDefault(); okDown(); }
  else if (e.key === 'Escape' || e.key === 'Backspace') { e.preventDefault(); back(); beep('back'); }
});
document.addEventListener('keyup', e => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') stopNav();
  if (e.key === 'Enter' && holdTimer !== null) { e.preventDefault(); okUp(); }
});
window.addEventListener('blur', () => {
  stopNav();
  clearTimeout(holdTimer); holdTimer = null; longFired = true;
  stopHoldBar();
  if (mapDrag) endMapDrag({ pointerId: mapDrag.id });
});

document.querySelectorAll('.key').forEach(btn => {
  const key = btn.dataset.key;
  if (key === 'OK') {
    btn.addEventListener('pointerdown', okDown);
    btn.addEventListener('pointerup', okUp);
    btn.addEventListener('pointerleave', () => { clearTimeout(holdTimer); holdTimer = null; stopHoldBar(); });
    btn.addEventListener('pointercancel', () => { clearTimeout(holdTimer); holdTimer = null; stopHoldBar(); });
  } else {
    const dir = key === 'UP' ? -1 : 1;
    btn.addEventListener('pointerdown', () => startNav(dir));
    btn.addEventListener('pointerup', stopNav);
    btn.addEventListener('pointerleave', stopNav);
    btn.addEventListener('pointercancel', stopNav);
  }
});

/* ---------------- boot ---------------- */
function buildRail() {
  railEl.innerHTML = ROUTES.map(r => `<a href="${r.hash}"><span>${r.label}</span><em>${r.note}</em></a>`).join('');
}
document.getElementById('resetBtn').addEventListener('click', () => location.reload());

function fit() {
  const rail = window.innerWidth > 1000 ? 300 : 30;
  const maxW = Math.min(window.innerWidth - rail, 320 * 2.2);
  const maxH = window.innerHeight - 200;
  const s = Math.max(0.8, Math.min(2.2, maxW / 320, maxH / 240));
  document.documentElement.style.setProperty('--scale', s.toFixed(3));
}

window.addEventListener('hashchange', render);
window.addEventListener('resize', fit);

buildRail();
fit();
render();
/* 字体是 swap 加载的，就位后重新量一次选中框位置。 */
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => placeFocus(false));

