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
  map: { sel: null, pinned: false, legend: false },
  compCat: 'creatures',
  inventory: {
    category: 'weapons', pages: { weapons: 0, shields: 0, armors: 0 }, selected: {},
    equipped: { weapon: null, shield: null, head: null, body: null, legs: null },
    textId: null, textPage: 0
  },
  logTab: 'main',
  logPages: {},
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
const routeHash = () => (location.hash && !['#', '#/'].includes(location.hash) ? location.hash : '#/inventory');
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
      <div class="section-label">RUNE SELECT <em>06</em></div>
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
    default: return viewRunes();
  }
}

function viewBomb(rune) {
  const b = state.bomb;
  /* 圆/方炸弹是两个符文入口，但共用这套玩法；换形态时清掉上一次的放置与完成状态。 */
  if (b.type !== rune.kind) { b.type = rune.kind; b.placed = false; b.done = false; }
  const bombImg = b.type === 'ROUND' ? 'bomb_round.png' : 'bomb_cube.png';
  return `<div class="body scene-body">
    <div class="scene" id="scene" style="background-image:url(${IMG('bg_abbey.png')})"></div>
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
    <div class="scene" id="scene" style="background-image:url(${IMG('bg_shrine.png')})"></div>
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
    <div class="scene ${s.frozen ? 'frozen-scene' : ''}" id="scene" style="background-image:url(${IMG('bg_destroyed.png')})"></div>
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
    <div class="scene" id="scene" style="background-image:url(${IMG('bg_ancient.png')});background-position:center 62%"></div>
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
    <div class="scene" id="scene" style="background-image:url(${IMG('bg_scope.png')})"></div>
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
const MAP_PINS = [
  { id: 'shrine', label: 'GREAT PLATEAU SHRINE', sub: 'SHRINE · 120 m', x: 27, y: 31, kind: 'shrine' },
  { id: 'tower',  label: 'CENTRAL TOWER',        sub: 'SHEIKAH TOWER · 1.2 km', x: 64, y: 24, kind: 'tower' },
  { id: 'stable', label: 'OUTSKIRT STABLE',      sub: 'STABLE · 640 m', x: 41, y: 69, kind: 'stable' },
  { id: 'player', label: 'CURRENT POSITION',     sub: 'GREAT PLATEAU · 12:40', x: 57, y: 52, kind: 'player' }
];

function viewMap() {
  const m = state.map;
  const pin = m.sel !== null ? MAP_PINS[m.sel] : null;
  return topbar('map') + `<div class="body map-body">
    <svg class="map-art" viewBox="0 0 320 198" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <radialGradient id="mapGlow" cx="52%" cy="42%" r="72%">
          <stop offset="0" stop-color="#0d3038"/><stop offset="1" stop-color="#041014"/>
        </radialGradient>
        <linearGradient id="mapWater" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#0b4150"/><stop offset="1" stop-color="#062430"/>
        </linearGradient>
      </defs>
      <rect width="320" height="198" fill="url(#mapGlow)"/>
      <g stroke="rgba(126,232,255,.07)" stroke-width=".5">
        <path d="M0 40H320M0 80H320M0 120H320M0 160H320M40 0V198M80 0V198M120 0V198M160 0V198M200 0V198M240 0V198M280 0V198"/>
      </g>
      <g fill="none" stroke="rgba(126,232,255,.15)" stroke-width=".7">
        <path d="M-10 62C40 40 70 78 110 58S180 20 230 46S300 70 334 50"/>
        <path d="M-10 78C40 56 74 92 112 72S182 36 232 62S302 84 334 64"/>
        <path d="M-10 110C50 94 90 124 140 106S220 78 270 100S314 116 334 108"/>
      </g>
      <path d="M0 118C44 106 66 128 96 124S150 104 190 116S258 148 320 132V198H0Z" fill="rgba(9,41,48,.5)"/>
      <path d="M196 112C210 104 238 110 246 126C254 142 238 156 218 154C198 152 184 126 196 112Z" fill="url(#mapWater)" stroke="rgba(126,232,255,.35)" stroke-width=".8"/>
      <path d="M0 96C30 92 52 100 72 96S110 86 132 92" fill="none" stroke="#0d4a58" stroke-width="3" opacity=".8"/>
      <path d="M28 198C36 160 52 140 88 128S150 116 176 96" fill="none" stroke="rgba(230,197,131,.3)" stroke-width="1.2" stroke-dasharray="3 4"/>
      <path d="M320 96C270 92 240 80 216 62" fill="none" stroke="rgba(230,197,131,.22)" stroke-width="1.2" stroke-dasharray="3 4"/>
      <g font-family="Georgia,serif" font-size="4.6" letter-spacing="1.4" fill="#4e7d87">
        <text x="18" y="30">HYRULE FIELD</text>
        <text x="104" y="128">GREAT PLATEAU</text>
        <text x="208" y="126">LAKE HYLIA</text>
      </g>
      <g fill="rgba(127,233,255,.45)">
        <circle cx="34" cy="170" r=".9"/><circle cx="150" cy="44" r=".9"/><circle cx="286" cy="150" r=".9"/>
      </g>
    </svg>
    <img class="puppet far drift map-pup" src="${IMG('cut_skywatcher.png')}" alt="" style="left:232px;top:26px;width:78px">
    <img class="puppet far map-pup" src="${IMG('cut_guardian_big.png')}" alt="" style="left:26px;top:92px;width:62px;opacity:.24">
    <div class="map-hud"><span>CENTRAL HYRULE</span><span>12:40 · CLEAR</span></div>
    ${m.legend ? `<div class="map-legend">
      <div><i class="lg-shrine"></i>SHRINE</div>
      <div><i class="lg-tower"></i>TOWER</div>
      <div><i class="lg-stable"></i>STABLE</div>
      <div><i class="lg-you"></i>YOU</div>
    </div>` : ''}
    ${MAP_PINS.map((p, i) => `
      <button class="map-pin ${p.kind} ${m.sel === i ? 'on' : ''}" data-action="map:sel:${i}" data-focus style="left:${p.x}%;top:${p.y}%" aria-label="${p.label}"><i></i></button>`).join('')}
    ${m.pinned ? '<div class="map-waypoint" style="left:57%;top:52%"><span>◆</span></div>' : ''}
    <div class="map-info ${pin ? '' : 'hint'}">
      ${pin ? `<span><b>${pin.label}</b><em>${pin.sub}</em></span><button class="chip mini" data-action="map:pin" data-focus>${m.pinned ? 'TRACKED' : 'TRACK'}</button>` : '<span>选择一个标记查看详情</span>'}
    </div>
    <div class="chiprow">
      <button class="chip ${m.pinned ? 'on' : ''}" data-action="map:pin" data-focus data-start>${m.pinned ? '已设标记' : '设标记'}</button>
      <button class="chip" data-action="map:clear" data-focus>清除</button>
      <button class="chip ${m.legend ? 'on' : ''}" data-action="map:legend" data-focus>图例</button>
    </div>
  </div>` + footer('<b>▲▼</b> 目标　<b>OK</b> 查看');
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
    <div class="inv-heading"><b>01 · INVENTORY</b><span>${INV_CATS.find(cat => cat.id === category).label} · ${items.length}</span></div>
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
        <span class="name"><b>${e.got ? e.name : '???'}</b><span>${e.got ? e.cn : '未记录'}</span></span>
        <span class="state ${e.got ? 'ok' : ''}">${e.got ? '✓ 已登记' : '— 未发现'}</span>
      </button>`).join('')}</div>
    <div class="comp-foot">
      <div class="row"><span>RECORDED</span><b>${cat.have} / ${cat.total}</b></div>
      <div class="bar"><i style="width:${Math.round(cat.have / cat.total * 100)}%"></i></div>
      <p>用相机符文对准目标即可登记条目 · 原型仅收录代表性条目</p>
    </div>
  </div>` + footer('<b>◀</b> 返回分类　<b>OK</b> 查看条目');
}

function viewEntry(catId, idx) {
  const cat = COMP_CATS.find(c => c.id === catId) || COMP_CATS[0];
  const e = (COMP_ENTRIES[cat.id] || [])[idx] || (COMP_ENTRIES[cat.id] || [])[0];
  if (!e) return viewCompendiumCat(cat.id);
  return topbar('compendium') + `<div class="body comp-body">
    <div class="comp-head"><h3>ENTRY #${e.no}</h3><span>${cat.label}</span></div>
    <div class="entry-detail">
      <div class="entry-art ${e.got ? '' : 'unknown'}"><img src="${IMG(e.got ? e.img : cat.art)}" alt=""></div>
      <div class="entry-info">
        <h2>${e.got ? e.name : '???'}</h2>
        <div class="cn">${e.got ? e.cn : 'UNRECORDED'}</div>
        <p>${e.desc}</p>
        ${e.got && e.meta ? `<div class="entry-fact"><span>${e.meta[0]}</span><b>${e.meta[1]}</b></div>` : ''}
        <div class="entry-meta">
          <span class="stamp ${e.got ? '' : 'miss'}">${e.got ? 'REGISTERED' : 'NOT FOUND'}</span>
          ${e.stat ? `<span class="entry-stat">${e.thumb ? `<img src="${IMG(e.thumb)}" alt="">` : ''}<b>${e.stat[0]}</b> ${e.stat[1]}</span>` : ''}
        </div>
      </div>
    </div>
    <div class="chiprow">
      <button class="chip" data-action="back" data-focus data-start>◀ 返回列表</button>
      <button class="chip" data-action="comp:${cat.id}" data-focus>分类总览</button>
    </div>
  </div>` + footer('<b>OK</b> 返回');
}

/* ---------------- adventure log ---------------- */
function viewLog() {
  const tab = state.logTab === 'side' ? 'side' : 'main';
  const list = QUESTS[tab];
  return topbar('log') + `<div class="body log-body">
    <div class="log-tabs">
      ${[['main', '主线故事 · MAIN'], ['side', '支线故事 · SIDE']].map(([id, label]) => `
        <button class="log-tab ${tab === id ? 'on' : ''}" data-action="logtab:${id}" data-focus aria-pressed="${tab === id}" ${tab === id ? 'data-start' : ''}>${label}</button>`).join('')}
    </div>
    <div class="story-intro"><b>BREATH OF THE WILD</b><span>${tab === 'main' ? '四章主线梗概' : '四则支线精选'} · 含剧透</span></div>
    ${list.map((q, i) => `
      <button class="quest-row" data-action="quest:${tab}:${q.id}" data-focus>
        <span class="q-number">${String(i + 1).padStart(2, '0')}</span>
        <span class="q-main"><b>${esc(q.cn)}</b><span>${esc(q.title)}</span></span>
        <span class="q-pages">${q.pages.length} 页</span>
      </button>`).join('')}
  </div>` + footer('<b>▲▼</b> 故事　<b>OK</b> 阅读', '自写剧情梗概');
}

function viewQuest(tabId, id) {
  const tab = tabId === 'side' ? 'side' : 'main';
  const list = QUESTS[tab];
  const q = list.find(x => x.id === id) || list[0];
  if (tabId !== tab || id !== q.id) history.replaceState(null, '', `#/log/${tab}/${q.id}`);
  state.logTab = tab;
  const page = Math.max(0, Math.min(state.logPages[q.id] || 0, q.pages.length - 1));
  state.logPages[q.id] = page;
  const part = q.pages[page];
  return topbar('log') + `<div class="body story-body">
    <div class="story-meta"><span>${tab === 'main' ? '主线' : '支线'} ${String(list.indexOf(q) + 1).padStart(2, '0')} / 04</span><span>剧情梗概 · 含剧透</span></div>
    <h2>${esc(q.cn)}</h2>
    <div class="story-subtitle">${esc(q.title)}</div>
    <article class="story-page" aria-label="${esc(part.heading)}">
      <h3>${esc(part.heading)}</h3>
      <p>${esc(part.text)}</p>
    </article>
    <div class="story-controls">
      <button data-action="storypage:-1" ${page === 0 ? 'disabled' : ''} aria-label="故事上一页">上一页</button>
      <button data-action="back" ${page === q.pages.length - 1 ? 'data-start' : ''}>返回目录</button>
      <button data-action="storypage:1" ${page === q.pages.length - 1 ? 'disabled' : 'data-start'} aria-label="故事下一页">下一页</button>
    </div>
  </div>` + footer('<b>▲▼</b> 选择　<b>OK</b> 确认', `${page + 1} / ${q.pages.length} 页 · 长按返回`);
}

function storyPageAction(direction) {
  const [route, tab, id] = routeParts();
  if (route !== 'log' || !['main', 'side'].includes(tab)) return;
  const q = QUESTS[tab].find(item => item.id === id);
  const delta = Number(direction);
  if (!q || ![-1, 1].includes(delta)) return;
  const next = (state.logPages[q.id] || 0) + delta;
  if (next < 0 || next >= q.pages.length) return;
  state.logPages[q.id] = next;
  render(); beep('move');
}

/* ---------------- system ---------------- */
function meter(level, max) {
  return `<span class="meter">${Array.from({ length: max }, (_, i) => `<i class="${i < level ? 'on' : ''}"></i>`).join('')}</span>`;
}

function viewSystem() {
  const s = state.settings;
  return topbar('system') + `<div class="body sys-body">
    <div class="sys-title"><h2>SYSTEM</h2><span>v0.9.0 · PROTOTYPE</span></div>
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
    <div class="sys-meta">电量 <b>99%</b> · 运行 <b>01:24</b> · 存储 <b>2.1 / 8 MB</b><br>以上数值均为原型假数据，不会写入设备。</div>
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
    case 'storypage': storyPageAction(rest[0]); break;

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

function mapAction(kind, arg) {
  const m = state.map;
  if (kind === 'sel') m.sel = Number(arg);
  else if (kind === 'pin') m.pinned = !m.pinned;
  else if (kind === 'clear') { m.sel = null; m.pinned = false; }
  else if (kind === 'legend') m.legend = !m.legend;
  render(); beep('ok');
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
  toast('Sheikah Slate v0.9 · 假数据原型 · 无网络请求');
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
  if (e.repeat) return;
  if (e.key === 'ArrowUp') { e.preventDefault(); startNav(-1); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); startNav(1); }
  else if (e.key === 'Enter') { e.preventDefault(); okDown(); }
  else if (e.key === 'Escape' || e.key === 'Backspace') { e.preventDefault(); back(); beep('back'); }
});
document.addEventListener('keyup', e => {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') stopNav();
  if (e.key === 'Enter') { e.preventDefault(); okUp(); }
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

