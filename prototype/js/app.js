/* Sheikah Slate · AI Passport 可点击原型
   纯静态：哈希路由 + 示例进度。没有运行时 API 请求，没有持久化。
   装备元数据由本地归档生成；展示外部名称与描述时统一转义。 */

const L = (cn,en) => state.lang === 'cn' ? cn : en;
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
  lang: (localStorage.getItem('slate-lang') || 'cn'),
  focus: 0,
  runeIndex: 0,
  bomb: { placed: false, type: 'ROUND', done: false },
  magnet: { grabbed: false, moved: false, done: false },
  stasis: { frozen: false, hits: 0, remaining: 10, done: false },
  cryonis: { count: 0, done: false },
  camera: { sel: 0, shots: [false, false, false, false, false], done: false },
  cycle: { phase: 'idle', speed: 0, dist: 0 },
  amiibo: { sel: 0, phase: 'idle', got: null },
  sensor: { phase: 'idle', d: 120, done: false },
  map: { zoom: 1, x: 0, y: 0, selection: 'StartPoint', region: 'plateau', filter: 'all', mode: 'browse', follow: false, pinned: null, discovered: ['StartPoint','Tower07'] },
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

/* ---------------- i18n ---------------- */
/* 全局中英切换：UI 静态文案走 LANG 字典（t()），数据侧名称/描述按字段取双语。 */
const LANG = {
  cn: {
    recorded: '已登记',
    tab_inventory: '装备', tab_runes: '符文', tab_map: '地图', tab_compendium: '图鉴', tab_log: '日志', tab_system: '系统',
    hold_back: '长按 OK 返回',
    press_ok: '按 OK 启动',
    back: '返回',
    type: '类型', cooldown: '冷却', use_rune: '使用符文', locked: '未解锁',
    sys_title: '系统', brightness: '亮度', volume: '音量', scanlines: '扫描线', sfx: '按键音',
    album: '相册', about: '关于', standby: '待机', adjust: '调整 / 切换',
    map_prev: '◀ 上一张', map_next: '下一张 ▶', map_zoom_out: '缩小', map_zoom_in: '+ 放大', map_reset: '复位',
    map_foot_l: '▲▼ 选择　OK 确认', map_foot_r: '→ 切图 · 长按 OK 返回',
    map_error: '地图加载失败，请刷新页面。',
    comp_title: '海拉鲁图鉴', comp_creatures: '生物', comp_monsters: '怪物', comp_materials: '材料', comp_equipment: '装备', comp_treasure: '宝物',
    comp_foot_l: '分类　OK 打开', comp_prev: '◀ 上一个', comp_next: '下一个 ▶', comp_list: '返回列表', comp_overview: '分类总览',
    comp_cat_foot: '◀ 返回分类　OK 查看条目', comp_entry_foot: '◀▶ 切换条目　OK 返回',
    not_recorded: '未记录', unrecorded: '未记录',
    quest_prev: '上一个', quest_next: '下一个', quest_list: '返回目录', quest_foot: '选择　OK 确认', hold_back_short: '长按返回',
    log_title: '冒险日志', log_main: '主线', log_shrine: '神庙挑战', log_side: '迷你挑战', log_foot_l: '▲▼ 选择　OK 查看',
    album_title: '相册', album_new: '新',
    album_foot: '照片　OK 查看', photo_no: '编号', photo_time: '时间', photo_place: '地点', photo_close: '关闭', photo_delete: '删除',
    equip: '装备', unequip: '卸下', equipped: '已装备', unequipped: '已卸下',
    inv_foot: '选择　OK 装备 / 卸下', inv_page_prev: '上一页', inv_page_next: '下一页',
    slot_weapon: '武器', slot_shield: '盾', slot_head: '头', slot_body: '身', slot_legs: '腿',
    slot_empty: '未装备', stat_attack: '攻击', stat_guard: '防御', stat_defense: '防御',
    bonus_normal: '无特殊效果', bonus_swimming: '游泳速度提升', bonus_climbing: '攀爬速度提升', bonus_fire: '耐火守护',
    lang_label: '语言', lang_cn: '简体中文', lang_en: 'ENGLISH',
    scanlines_note: '扫描线质感叠加', sfx_note: '界面音效反馈',
    sys_battery: '电量', sys_uptime: '运行', sys_storage: '存储',
    use_rune_foot: '▲▼ 选择符文　OK 使用',
    rune_select: '符文选择',
    scene_hold: '长按 OK 返回',
    photo_title: '照片', about_toast: 'AI Passport · Sheikah Slate',
    rune_placeholder: '原型占位 · 无试炼玩法', rune_placeholder_note: '此符文在本原型中暂无试炼玩法，仅作界面演示。选中后回到符文页。', back_to_runes: '返回符文页',
    trial_complete: '已登记全部目标',
    bomb_done: '岩石已破坏，通往神庙的道路开启。', bomb_placed: '炸弹已放置。再按「引爆」即可起爆。', bomb_idle: '先「放置炸弹」，再「引爆」破坏岩石。',
    magnet_done: '压力板被压住，闸门开启。', magnet_moved: '金属箱悬在压力板上方，按「放下」。', magnet_grabbed: '金属箱已锁定。按「移动」把它带到压力板上方。', magnet_idle: '用磁力抓住右侧金属箱，把它放到压力板上。',
    stasis_done: '势能释放，岩石巨人撞开了堵路的墙。', stasis_frozen: '已冻结。按「击打」积蓄势能（最多 6 次），或直接「释放」。', stasis_idle: '先冻结岩石巨人，再击打积蓄势能，最后释放。',
    cryonis_done: '冰柱已架成通路，可以跨过水面。', cryonis_full: '三根冰柱就位，按「跨越」完成试炼。', cryonis_idle: '在水面升起三根冰柱，搭出可通行的路。',
    camera_done: '五个目标全部登记，图鉴已更新。', camera_shot: '这个目标已登记。切换目标或直接拍摄下一个。', camera_aim: '取景框对准', camera_shoot_note: '按「快门」登记',
    scene_retry: '重新试炼', scene_place_bomb: '放置炸弹', scene_detonate: '引爆', scene_grab: '抓取', scene_move: '移动', scene_drop: '放下',
    scene_freeze: '时停', scene_hit: '击打', scene_release: '释放', scene_ice: '造冰', scene_break: '碎冰', scene_cross: '跨越',
    scene_shoot: '快门', scene_switch: '切换目标', scene_album: '相册', scene_foot: '▲▼ 选择　OK 执行', camera_foot: '▲▼ 目标　OK 快门',
    cycle_summon: '召唤', cycle_accel: '加速', cycle_speed: '速度', cycle_dist: '距离',
    cycle_idle: '英杰摩托停驻于此。召唤后骑乘，一路加速冲向终点。',
    cycle_riding: '持续加速，驶向远方终点。',
    cycle_done: '抵达终点，骑行试炼完成。',
    amiibo_select: '选择要读取的 amiibo，按「读取」召唤。',
    amiibo_scanning: '正在读取 amiibo…',
    amiibo_done: '读取完成，获得物品。',
    amiibo_scan: '读取', amiibo_again: '重新读取',
    sensor_scan: '扫描', sensor_advance: '前进', sensor_idle: '感应器待命。扫描周围，寻找未被发现的神庙。',
    sensor_found: '感应到神庙。跟随方向前进。',
    sensor_near: '感应增强——神庙就在前方！',
    sensor_done: '发现神庙！感应器试炼完成。'
  },
  en: {
    recorded: 'RECORDED',
    tab_inventory: 'EQUIP', tab_runes: 'RUNES', tab_map: 'MAP', tab_compendium: 'COMPENDIUM', tab_log: 'LOG', tab_system: 'SYSTEM',
    hold_back: 'HOLD OK TO GO BACK',
    press_ok: 'PRESS OK TO ACTIVATE',
    back: 'BACK',
    type: 'TYPE', cooldown: 'COOLDOWN', use_rune: 'USE RUNE', locked: 'LOCKED',
    sys_title: 'SYSTEM', brightness: 'BRIGHTNESS', volume: 'VOLUME', scanlines: 'SCANLINES', sfx: 'SOUND FX',
    album: 'ALBUM', about: 'ABOUT', standby: 'STANDBY', adjust: 'OK ADJUST / TOGGLE',
    map_prev: '◀ PREV', map_next: 'NEXT ▶', map_zoom_out: 'ZOOM –', map_zoom_in: '+ ZOOM', map_reset: 'RESET',
    map_foot_l: '▲▼ SELECT　OK CONFIRM', map_foot_r: '→ SWITCH · HOLD OK BACK',
    map_error: 'Failed to load the map. Please refresh.',
    comp_title: 'HYRULE COMPENDIUM', comp_creatures: 'CREATURES', comp_monsters: 'MONSTERS', comp_materials: 'MATERIALS', comp_equipment: 'EQUIPMENT', comp_treasure: 'TREASURE',
    comp_foot_l: 'SELECT　OK OPEN', comp_prev: '◀ PREV', comp_next: 'NEXT ▶', comp_list: 'LIST', comp_overview: 'OVERVIEW',
    comp_cat_foot: '◀ BACK TO CATEGORY　OK VIEW', comp_entry_foot: '◀▶ SWITCH ENTRY　OK BACK',
    not_recorded: 'UNRECORDED', unrecorded: 'UNRECORDED',
    quest_prev: 'PREV', quest_next: 'NEXT', quest_list: 'BACK TO LIST', quest_foot: 'SELECT　OK CONFIRM', hold_back_short: 'HOLD BACK',
    log_title: 'ADVENTURE LOG', log_main: 'MAIN', log_shrine: 'SHRINE', log_side: 'SIDE', log_foot_l: '▲▼ SELECT　OK VIEW',
    album_title: 'ALBUM', album_new: 'NEW',
    album_foot: 'PHOTO　OK VIEW', photo_no: 'NO', photo_time: 'TIME', photo_place: 'PLACE', photo_close: 'CLOSE', photo_delete: 'DELETE',
    equip: 'EQUIP', unequip: 'UNEQUIP', equipped: 'EQUIPPED', unequipped: 'UNEQUIPPED',
    inv_foot: 'SELECT　OK EQUIP / UNEQUIP', inv_page_prev: 'PREV PAGE', inv_page_next: 'NEXT PAGE',
    slot_weapon: 'WEAPON', slot_shield: 'SHIELD', slot_head: 'HEAD', slot_body: 'BODY', slot_legs: 'LEGS',
    slot_empty: 'EMPTY', stat_attack: 'ATTACK', stat_guard: 'GUARD', stat_defense: 'DEFENSE',
    bonus_normal: 'NO SPECIAL EFFECT', bonus_swimming: 'SWIM SPEED UP', bonus_climbing: 'CLIMBING SPEED UP', bonus_fire: 'FLAME GUARD',
    lang_label: 'LANGUAGE', lang_cn: '简体中文', lang_en: 'ENGLISH',
    scanlines_note: 'CRT OVERLAY', sfx_note: 'UI SOUND EFFECTS',
    sys_battery: 'BATTERY', sys_uptime: 'UPTIME', sys_storage: 'STORAGE',
    use_rune_foot: '▲▼ SELECT RUNE　OK USE',
    rune_select: 'RUNE SELECT',
    scene_hold: 'HOLD OK TO GO BACK',
    photo_title: 'PHOTO', about_toast: 'AI Passport · Sheikah Slate',
    rune_placeholder: 'PLACEHOLDER · NO TRIAL', rune_placeholder_note: 'This rune has no interactive trial in the prototype — display only. Select to return to the rune list.', back_to_runes: 'BACK TO RUNES',
    trial_complete: 'ALL SUBJECTS REGISTERED',
    bomb_done: 'The rocks are destroyed — the path to the shrine is open.', bomb_placed: 'Bomb placed. Press DETONATE to blow it up.', bomb_idle: 'Place a bomb, then detonate it to break the rocks.',
    magnet_done: 'The pressure plate is pressed — the gate is open.', magnet_moved: 'The metal crate hovers above the plate. Press DROP.', magnet_grabbed: 'Crate locked. Press MOVE to bring it over the plate.', magnet_idle: 'Grab the metal crate on the right and set it on the pressure plate.',
    stasis_done: 'Energy released — the rock giant smashed the blocked wall.', stasis_frozen: 'Frozen. Hit to store energy (up to 6), or release it.', stasis_idle: 'Freeze the rock giant, hit it to build energy, then release.',
    cryonis_done: 'Ice pillars form a path across the water.', cryonis_full: 'Three pillars in place. Press CROSS to finish.', cryonis_idle: 'Raise three ice pillars to make a passable path.',
    camera_done: 'All five targets registered — compendium updated.', camera_shot: 'Already registered. Switch target or shoot the next one.', camera_aim: 'Aim at', camera_shoot_note: 'and press SHOOT to register',
    scene_retry: 'RETRY', scene_place_bomb: 'PLACE BOMB', scene_detonate: 'DETONATE', scene_grab: 'GRAB', scene_move: 'MOVE', scene_drop: 'DROP',
    scene_freeze: 'FREEZE', scene_hit: 'HIT', scene_release: 'RELEASE', scene_ice: 'ICE', scene_break: 'BREAK', scene_cross: 'CROSS',
    scene_shoot: 'SHOOT', scene_switch: 'NEXT TARGET', scene_album: 'ALBUM', scene_foot: '▲▼ SELECT　OK ACT', camera_foot: '▲▼ TARGET　OK SHOOT',
    cycle_summon: 'SUMMON', cycle_accel: 'ACCEL', cycle_speed: 'SPEED', cycle_dist: 'DIST',
    cycle_idle: 'The Champion motorcycle waits. Summon it, ride, and race to the finish.',
    cycle_riding: 'Keep accelerating and ride toward the distant finish.',
    cycle_done: 'Finish line reached — riding trial complete.',
    amiibo_select: 'Pick an amiibo figure and press SCAN to summon.',
    amiibo_scanning: 'Scanning amiibo…',
    amiibo_done: 'Scan complete — items obtained.',
    amiibo_scan: 'SCAN', amiibo_again: 'SCAN AGAIN',
    sensor_scan: 'SCAN', sensor_advance: 'ADVANCE', sensor_idle: 'Sensor on standby. Scan the area for an undiscovered shrine.',
    sensor_found: 'Shrine detected. Follow the bearing.',
    sensor_near: 'Signal strengthening — the shrine is right ahead!',
    sensor_done: 'Shrine found! Sensor trial complete.'
  }
};
const t = k => (LANG[state.lang] && LANG[state.lang][k] !== undefined) ? LANG[state.lang][k] : (LANG.cn[k] ?? k);

/* Original game audio is managed by sound.js. */

/* ---------------- routing ---------------- */
const routeHash = () => (location.hash && !['#', '#/'].includes(location.hash) ? location.hash : '#/home');
const routeParts = () => routeHash().replace(/^#\//, '').split('/');

function go(hash) {
  rememberInputPage();
  inputUI.dialog=null;inputUI.edit=null;
  if (routeHash() === hash) { render(); return; }
  location.hash = hash;
}

function back() {
  beep('back');
  if(inputUI.dialog)return closeInputMenu();
  const p = routeParts();
  if(p[0]==='home')return go('#/standby');
  if (p[0] === 'map') return go('#/home');
  if (p[0] === 'rune' && RUNE_GAMES.has(p[1])) return pauseRuneGame();
  if (p[0] === 'rune') return go('#/runes');
  if (p[0] === 'inventory') return go('#/home');
  if (p[0] === 'compendium') {
    if (p[2] !== undefined) return go('#/compendium/' + p[1]);
    if (p[1]) return go('#/compendium');
    return go('#/home');
  }
  if (p[0] === 'log') return go(p[2] ? `#/log/${logTabId(p[1])}` : '#/home');
  if (p[0] === 'album') return go(p[1] ? '#/album' : '#/system');
  if (p[0] === 'system' || p[0] === 'runes') return go('#/home');
  return go('#/runes');
}

/* ---------------- chrome ---------------- */
const TABS = [
  ['inventory', 'tab_inventory'],
  ['runes', 'tab_runes'],
  ['map', 'tab_map'],
  ['compendium', 'tab_compendium'],
  ['log', 'tab_log'],
  ['system', 'tab_system']
];

function topbar(active) {
  return `<header class="topbar">
    <nav class="tabs" aria-label="${t('tab_inventory')}">${TABS.map(([id, key]) => `
      <button class="tab ${active === id ? 'on' : ''}" data-action="go:#/${id}" data-focus aria-current="${active === id ? 'page' : 'false'}">
        <b>${t(key)}</b>
      </button>`).join('')}</nav>
  </header>`;
}

function footer(left, right = t('hold_back')) {
  return `<footer class="footer"><span>${left}</span><span class="muted">${right}</span></footer>`;
}

function sceneTop(rune, stat) {
  return `<div class="scene-top">
    <button class="back-tab" data-action="back" data-focus>◀ ${t('back')}</button>
    <div class="rune-tag"><img src="${IMG(rune.id==='sensor'?'eye.png':rune.icon)}" alt=""><b>${state.lang === 'cn' ? rune.cn : rune.label}</b></div>
    <span class="scene-stat">${stat}</span>
  </div>`;
}

/* ---------------- standby ---------------- */
function viewStandby() {
  return `<div class="standby">
    <img class="sb-puppet a" src="${IMG('cut_skywatcher.png')}" alt="">
    <img class="sb-slate" src="${IMG('cut_slate.png')}" alt="">
    <img class="sb-title ${state.lang === 'cn' ? 'cn' : 'en'}" src="../assets/raw/02_ui/${state.lang === 'cn' ? 'BotW_Simplified_Chinese_Logo.png' : 'BotW_English_Logo.png'}" alt="${state.lang === 'cn' ? '塞尔达传说 旷野之息' : 'The Legend of Zelda: Breath of the Wild'}">
    <img class="sb-eye" src="${IMG('eye.png')}" alt="">
    <div class="sb-clock">09:41</div>
    <div class="sb-date">${state.lang === 'cn' ? '周六 · 10.26 · 海拉鲁' : 'SAT · 10.26 · HYRULE'}</div>
    <div class="sb-battery" role="img" aria-label="${t('sys_battery')} 99%"><span class="sb-battery-art" aria-hidden="true"></span><span aria-hidden="true">99%</span></div>
    <button class="sb-prompt" data-action="go:#/home" data-focus data-start>${t('press_ok')}</button>
    <div class="sb-brand">AI PASSPORT · SHEIKAH SLATE</div>
  </div>`;
}

/* ---------------- runes ---------------- */
function viewRunes() {
  const r = RUNES[state.runeIndex];
  return topbar('runes') + `<div class="body runes-body">
    <div class="rune-left">
      <div class="section-label">${t('rune_select')}</div>
      <div class="rune-grid">${RUNES.map((x, i) => `
        <button class="rune-tile ${i === state.runeIndex ? 'sel' : ''}" data-action="pick:${i}" data-focus ${i === state.runeIndex ? 'data-start' : ''}>
          <span class="num">0${i + 1}</span>
          ${x.id==='sensor'?`<span class="rune-select-art" style="${runeSpriteStyle(15,32)}"></span>`:`<img src="${IMG(x.icon)}" alt="">`}
          <b>${state.lang === 'cn' ? (RUNE_TILE_CN[x.short] || x.short) : x.short}</b>
        </button>`).join('')}</div>
    </div>
    <aside class="detail-card">
      <div class="eyebrow">${state.lang === 'cn' ? `符文 ${String(state.runeIndex + 1).padStart(2, '0')}` : `RUNE ${String(state.runeIndex + 1).padStart(2, '0')}`}</div>
      <h2>${state.lang === 'cn' ? r.cn : r.label}</h2>
      <div class="rule"></div>
      <p>${state.lang === 'cn' ? r.desc : (r.en_desc || r.desc)}</p>
      <div class="stats">${r.stats.map(([k, v]) => `<div><span>${state.lang === 'cn' ? (RUNE_STAT_CN[k] || k) : k}</span><b>${state.lang === 'cn' ? (RUNE_STAT_VAL_CN[v] || v) : v}</b></div>`).join('')}</div>
      <button class="btn-primary" data-action="enter-rune" data-focus>${t('use_rune')}</button>
    </aside>
  </div>` + footer(t('use_rune_foot'));
}

/* ---------------- rune scenes ---------------- */
function viewRune(id) {
  return viewRuneGame(RUNE_GAMES.has(id) ? id : 'bomb');
}

/* 相机示例目标；拍照同时更新图鉴登记与相册。 */
const CAM_TARGETS = [
  { x: 26, y: 30, img: 'pic_nightshade.png', big: 'cp_blue_nightshade.png', name: 'BLUE NIGHTSHADE', cn: '蓝夜光草' },
  { x: 112, y: 12, img: 'pic_bass.png', big: 'cp_hyrule_bass.png', name: 'HYLIAN BASS', cn: '海拉鲁鲈鱼' },
  { x: 196, y: 34, img: 'pic_chuchu.png', name: 'CHUCHU', cn: '丘丘' },
  { x: 58, y: 76, img: 'mat_amber.png', name: 'AMBER', cn: '琥珀' },
  { x: 152, y: 82, img: 'pic_mastersword.png', big: 'cp_master_sword.png', name: 'MASTER SWORD', cn: '大师之剑' }
];

function viewCamera(rune) {
  const c = state.camera;
  const got = c.shots.filter(Boolean).length;
  return `<div class="body scene-body">
    <div class="scene" id="scene" style="background-image:url(${IMG('rune_scene_camera.png')})"></div>
    <div class="scene-shade"></div>
    ${sceneTop(rune, state.lang === 'cn' ? `已登记 ${got}/5` : `REGISTERED ${got}/5`)}
    ${c.done ? `<div class="badge-done">${t('trial_complete')}</div>` : ''}
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
    <div class="msg">${c.done ? t('camera_done')
      : c.shots[c.sel] ? t('camera_shot')
        : `${t('camera_aim')} ${state.lang === 'cn' ? CAM_TARGETS[c.sel].cn : CAM_TARGETS[c.sel].name}，${t('camera_shoot_note')}`}</div>
    <div class="chiprow">
      <button class="chip" data-action="camera:shoot" data-focus data-start ${c.done || c.shots[c.sel] ? 'disabled' : ''}>${t('scene_shoot')}</button>
      <button class="chip" data-action="camera:next" data-focus>${t('scene_switch')}</button>
      <button class="chip" data-action="camera:album" data-focus>${t('scene_album')} ${albumItems().length}</button>
    </div>
  </div>` + footer(t('camera_foot'));
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
const RUNE_STAT_CN = { TYPE: '类型', COOLDOWN: '冷却', RANGE: '范围', TARGET: '目标', LIMIT: '上限', 'MAX HIT': '最多击打', ALBUM: '相册', SOURCE: '来源', USE: '使用' };
const RUNE_STAT_VAL_CN = { ROUND: '圆形', CUBE: '方形', METAL: '金属', '1 / DAY': '每日 1 次', FIGURE: '手办', ANYWHERE: '任意地点', SUMMON: '召唤', SHRINE: '神庙' };
const RUNE_TILE_CN = { 'ROUND BOMB': '圆炸弹', 'CUBE BOMB': '方炸弹', MAGNET: '磁力抓取', STASIS: '静止器', CRYONIS: '制冰器', CAMERA: '照相机', 'MASTER CYCLE': '大师摩托', AMIIBO: 'amiibo 读取', SENSOR: '希卡感应器' };
const PLACE_CN = {
  'Hyrule Field': '海拉鲁平原', 'Satori Mountain': '萨托利山', 'Hebra Mountains': '海布拉山脉', 'Greater Hyrule': '海拉鲁全境',
  'Gerudo Desert': '格鲁德沙漠', 'Akkala Highlands': '阿卡莱高地', 'East Necluda': '东内克拉达', 'Eldin Canyon': '埃尔丁峡谷',
  'Faron Grasslands': '费罗尼草原', 'Great Hyrule Forest': '海拉鲁大森林', 'Hyrule Ridge': '海拉鲁山脊', 'Lanayru Great Spring': '拉聂耳大泉',
  'Lanayru Sea': '拉聂耳海', 'Lanayru Wetlands': '拉聂耳湿地', 'Necluda Sea': '内克拉达海', 'Tabantha Frontier': '塔班萨边境', 'West Necluda': '西内克拉达',
  'Death Mountain': '死亡之山', 'Deep Akkala': '阿卡莱深处', 'Divine Beast Vah Medoh': '神兽 瓦·梅德', 'Divine Beast Vah Naboris': '神兽 瓦·纳波利斯',
  'Divine Beast Vah Rudania': '神兽 瓦·鲁达尼亚', 'Divine Beast Vah Ruta': '神兽 瓦·鲁塔', 'Eldin Mountains': '埃尔丁山脉', 'Faron': '费罗尼',
  'Gerudo Highlands': '格鲁德高地', 'Gerudo Town': '格鲁德小镇', 'Hyrule Castle': '海拉鲁城堡', 'Kakariko Village': '卡卡利科村',
  'Lake Hylia': '海利亚湖', 'Mount Lanayru': '拉聂耳山', 'Yiga Clan Hideout': '依盖队基地',
  'HYRULE FIELD': '海拉鲁平原', 'GREAT PLATEAU': '初始台地', 'KOROK FOREST': '克洛格森林', 'HYRULE CASTLE': '海拉鲁城堡',
  'CENTRAL HYRULE': '中央海拉鲁', 'ARCHIVE': '档案库'
};
const placeCn = s => PLACE_CN[s] || s;
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* 装备中文名复用图鉴 equipment 分类的译名映射。 */
const COMP_CN = {};
for (const catKey of Object.keys(COMP_ENTRIES)) {
  for (const e of COMP_ENTRIES[catKey]) COMP_CN[e.name.toLowerCase()] = e.cn;
}
/* 图鉴未收录的防具装备中文名：直接按物品 id 映射。 */
const INV_CN = {
  tree_branch: '树枝', ancient_short_sword: '古代短剑', dragonbone_boko_club: '龙骨波克棒', feathered_edge: '羽刃',
  flameblade: '火焰剑', soldiers_broadsword: '士兵之剑', royal_claymore: '王族双手剑', master_sword: '大师之剑',
  wooden_shield: '木盾', travelers_shield: '旅人盾', gerudo_shield: '格鲁德盾', ancient_shield: '古代盾',
  zora_helm: '卓拉头盔', zora_armor: '卓拉盔甲', zora_greaves: '卓拉护胫',
  climbers_bandanna: '攀爬头巾', climbing_gear: '攀爬服', climbing_boots: '攀爬鞋',
  flamebreaker_helm: '防火头盔', flamebreaker_armor: '防火盔甲', flamebreaker_boots: '防火靴',
  cap_of_the_hero: '勇者之帽', champions_tunic: '英杰服', hylian_trousers: '海利亚裤子'
};
const invName = item => item ? (state.lang === 'cn' ? (INV_CN[item.id] || COMP_CN[item.name.toLowerCase()] || item.name) : item.name) : '';
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
      return `<span title="${t('slot_' + slot)} · ${esc(invName(item) || t('slot_empty'))}" aria-label="${t('slot_' + slot)} · ${esc(invName(item) || t('slot_empty'))}">
        <em>${t('slot_' + slot)}</em>${item ? `<img src="${IMG(item.img)}" alt="${esc(invName(item))}">` : '<i>—</i>'}</span>`;
    }).join('')}
    <b>${t('stat_defense')} ${inventoryDefense()}</b></div>`;
}

function inventoryPreview(item) {
  const inv = state.inventory;
  if (inv.textId !== item.id) { inv.textId = item.id; inv.textPage = 0; }
  const pages = inventoryTextPages(state.lang === 'cn' ? (item.description_cn || item.description) : item.description);
  inv.textPage = Math.max(0, Math.min(inv.textPage, pages.length - 1));
  const current = INV_BY_ID[inv.equipped[item.slot]];
  return `<span class="inv-eyebrow">${t('slot_' + item.slot)} ${isEquipped(item) ? (state.lang === 'cn' ? '· 已装备' : '· EQUIPPED') : (state.lang === 'cn' ? '· 随身携带' : '· IN POUCH')}</span>
    <h2>${esc(invName(item))}</h2>
    <div class="inv-stat"><span>${t('stat_' + inventoryStat(item).toLowerCase())}</span><b>${current?.value || 0} <em>→</em> ${item.value}</b></div>
    <span class="inv-bonus">${INV_BONUS_ICONS[item.bonus] ? `<img src="${IMG(INV_BONUS_ICONS[item.bonus])}" alt="">` : ''}${t('bonus_' + (item.bonus || 'normal'))}</span>
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
        title="${esc(invName(item))} · ${isEquipped(item) ? t('unequip') : t('equip')}" aria-pressed="${isEquipped(item)}" aria-label="${esc(invName(item))} · ${isEquipped(item) ? t('unequip') : t('equip')}">
        <img class="inv-item-art" src="${IMG(item.img)}" alt="">${state.inventory.rewards?.[item.id] ? `<span class="inv-reward">+${state.inventory.rewards[item.id]}</span>` : ''}${INV_BONUS_ICONS[item.bonus] ? `<img class="inv-cell-bonus" src="${IMG(INV_BONUS_ICONS[item.bonus])}" alt="${INV_BONUS[item.bonus]}">` : ''}<b>${item.value}</b>
      </button>`).join('')}${Array.from({ length: INV_PAGE_SIZE - visible.length }, () => '<span class="inv-cell empty" aria-hidden="true"></span>').join('')}</div>
      <div class="inv-pager"><button data-action="inv:page:-1" ${page === 0 ? 'disabled' : ''} aria-label="${t('inv_page_prev')}"><img class="inv-page-arrow previous" src="${IMG('inventory/arrow.svg')}" alt=""></button>
        <span>${String(page + 1).padStart(2, '0')} / ${String(pageCount).padStart(2, '0')}</span>
        <button data-action="inv:page:1" ${page === pageCount - 1 ? 'disabled' : ''} aria-label="${t('inv_page_next')}"><img class="inv-page-arrow" src="${IMG('inventory/arrow.svg')}" alt=""></button></div>
    </section><aside class="inv-character" aria-label="林克与装备说明">
      <img class="inv-link" src="${IMG('inventory/bg.png')}?v=link-original" alt="林克立绘（固定外观）">
      <div class="inv-stamina" aria-hidden="true"></div>
      <div class="inv-hearts" aria-hidden="true"><img src="${IMG('heart_icon.png')}" alt=""><img src="${IMG('heart_icon.png')}" alt=""><img src="${IMG('heart_icon.png')}" alt=""></div>
      <section class="inv-preview" id="inventoryPreview">${inventoryPreview(selected)}</section>
    </aside></div>
    ${inventorySummary()}
  </div>` + footer(`<b>▲▼</b> ${t('inv_foot')}`);
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
    render(); beep(isEquipped(item)?'equip':'unequip');
    toast((isEquipped(item) ? t('equipped') : t('unequipped')) + ' · ' + invName(item));
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
    <div class="comp-head"><h3>${t('comp_title')}</h3><span>${have} / ${total} · ${Math.round(have / total * 100)}%</span></div>
    <div class="comp-grid">${COMP_CATS.map((c, i) => `
      <button class="comp-tile ${i === 0 ? 'span2' : ''}" data-action="comp:${c.id}" data-focus ${i === 0 ? 'data-start' : ''}>
        <img class="cover" src="${IMG(c.cover)}" alt="">
        <img class="art" src="${IMG(c.art)}" alt="">
        <b>${state.lang === 'cn' ? c.cn : c.label}</b>
        <span>${state.lang === 'cn' ? `${c.have}/${c.total}` : `${c.have}/${c.total}`}</span>
        <div class="bar"><i style="width:${Math.round(c.have / c.total * 100)}%"></i></div>
      </button>`).join('')}</div>
  </div>` + footer(t('comp_foot_l'));
}

function viewCompendiumCat(catId) {
  const cat = COMP_CATS.find(c => c.id === catId) || COMP_CATS[0];
  state.compCat = cat.id;
  const entries = COMP_ENTRIES[cat.id] || [];
  return topbar('compendium') + `<div class="body comp-body comp-category">
    <div class="comp-head"><span class="head-left"><button class="back-tab" data-action="back" data-focus>◀ ${t('back')}</button><img class="cat-mark" src="${IMG(cat.art)}" alt=""><h3>${state.lang === 'cn' ? cat.cn : cat.label}</h3></span><span>${cat.have}/${cat.total} ${t('recorded')}</span></div>
    <div class="entry-list">${entries.map((e, i) => `
      <button class="entry-row" data-action="entry:${cat.id}:${i}" data-focus ${i === 0 ? 'data-start' : ''}>
        <span class="no">#${e.no}</span>
        ${e.got ? `<img src="${IMG(e.thumb || e.img)}" alt="">` : `<span class="unknown"><img src="${IMG(cat.art)}" alt=""></span>`}
        <span class="name"><b>${e.got ? (state.lang === 'cn' ? e.cn : e.name) : '???'}${e.mm ? `<i class="mm-dot">M</i>` : ''}</b>${e.got ? `<span></span>` : `<span>${t('not_recorded')}</span>`}</span>
        <span class="state ${e.got ? 'ok' : ''}">${e.got ? (state.lang === 'cn' ? '✓ 已登记' : '✓ RECORDED') : (state.lang === 'cn' ? '— 未发现' : '— NOT FOUND')}</span>
      </button>`).join('')}</div>
    <div class="comp-foot">
      <div class="row"><span>${t('recorded')}</span><b>${cat.have} / ${cat.total}</b></div>
      <div class="bar"><i style="width:${Math.round(cat.have / cat.total * 100)}%"></i></div>
      <p>${state.lang === 'cn' ? ('全量条目 · ' + cat.cn + ' 共 ' + cat.total + ' 条' + (cat.id === 'monsters' ? ' · 含大师模式金色怪' : '')) : ('ALL ENTRIES · ' + cat.total + (cat.id === 'monsters' ? ' · INCL. MASTER MODE GOLD' : ''))}</p>
    </div>
  </div>` + footer(t('comp_cat_foot'));
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
    <div class="comp-head"><h3>${state.lang === 'cn' ? '图鉴条目' : 'ENTRY'} #${e.no}</h3><span>${state.lang === 'cn' ? cat.cn : cat.label} · ${seq}/${total}</span></div>
    <div class="entry-detail">
      <div class="entry-art ${e.got ? '' : 'unknown'}"><img src="${IMG(e.got ? e.img : cat.art)}" alt=""></div>
      <div class="entry-info">
        <h2>${e.got ? (state.lang === 'cn' ? e.cn : e.name) : '???'}${e.mm ? `<i class="mm-badge">${state.lang === 'cn' ? '大师模式' : 'MASTER'}</i>` : ''}</h2>
        <div class="cn">${state.lang === 'cn' ? '' : esc(e.cn)}</div>
        <p>${state.lang === 'cn' ? (e.cn_desc || e.desc) : e.desc}</p>
        ${e.got && e.meta ? `<div class="entry-fact"><span>${e.meta[0]}</span><b>${state.lang === 'cn' ? placeCn(e.meta[1]) : e.meta[1]}</b></div>` : ''}
        <div class="entry-meta">
          <span class="stamp ${e.got ? '' : 'miss'}">${e.got ? (state.lang === 'cn' ? '已登记' : 'REGISTERED') : (state.lang === 'cn' ? '未发现' : 'NOT FOUND')}</span>
          ${e.mm ? `<span class="mm-stamp">${state.lang === 'cn' ? '大师模式' : 'MASTER MODE'}</span>` : ''}
          ${e.stat ? `<span class="entry-stat">${e.thumb ? `<img src="${IMG(e.thumb)}" alt="">` : ''}<b>${e.stat[0]}</b> ${e.stat[1]}</span>` : ''}
        </div>
      </div>
    </div>
    <div class="chiprow">
      <button class="chip" data-action="entry:${cat.id}:${i - 1}" data-focus ${prev ? '' : 'disabled'} aria-label="${t('comp_prev')}">${t('comp_prev')}</button>
      <button class="chip" data-action="back" data-focus data-start>${t('comp_list')}</button>
      <button class="chip" data-action="comp:${cat.id}" data-focus>${t('comp_overview')}</button>
      <button class="chip" data-action="entry:${cat.id}:${i + 1}" data-focus ${next ? '' : 'disabled'} aria-label="${t('comp_next')}">${t('comp_next')}</button>
    </div>
  </div>` + footer(t('comp_entry_foot'), `${seq} / ${total}`);
}

/* ---------------- adventure log ---------------- */
const LOG_TABS = ['main', 'shrine', 'side'];
const logTabId = id => LOG_TABS.includes(id) ? id : 'main';

function viewLog() {
  const tab = logTabId(state.logTab);
  const list = QUESTS[tab];
  return topbar('log') + `<div class="body log-body">
    <div class="log-tabs">
      ${LOG_TABS.map(id => `
        <button class="log-tab ${tab === id ? 'on' : ''}" data-action="logtab:${id}" data-focus aria-pressed="${tab === id}" ${tab === id ? 'data-start' : ''}>${t(`log_${id}`)} ${QUESTS[id].length}</button>`).join('')}
    </div>
    <div class="story-intro"><b>${t('log_title')}</b></div>
    <div class="quest-list">${list.map((q, i) => `
      <button class="quest-row" data-action="quest:${tab}:${q.id}" data-focus>
        <span class="q-number">${String(i + 1).padStart(2, '0')}</span>
        <span class="q-main"><b>${esc(state.lang === 'cn' ? q.cn : q.title)}</b></span>
        <span class="q-pages">${esc(state.lang === 'cn' ? q.loc : (q.loc_en || ''))}</span>
      </button>`).join('')}</div>
  </div>` + footer(t('log_foot_l'), '');
}

function viewQuest(tabId, id) {
  const tab = logTabId(tabId);
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
    <div class="story-meta"><span>${t(`log_${tab}`)} ${seq} / ${total}</span><span>${esc(state.lang === 'cn' ? q.loc : (q.loc_en || q.title))} · ${state.lang === 'cn' ? '剧情梗概' : 'SUMMARY'}</span></div>
    <h2>${esc(state.lang === 'cn' ? q.cn : q.title)}</h2>

    <article class="story-page" aria-label="${esc(state.lang === 'cn' ? q.cn : q.title)}">
      <p>${esc(state.lang === 'cn' ? q.desc : q.en_desc)}</p>
    </article>
    <div class="story-controls">
      <button data-action="quest:${tab}:${prevId}" ${prev ? '' : 'disabled'} aria-label="${t('quest_prev')}">${t('quest_prev')}</button>
      <button data-action="back" data-start>${t('quest_list')}</button>
      <button data-action="quest:${tab}:${nextId}" ${next ? '' : 'disabled'} aria-label="${t('quest_next')}">${t('quest_next')}</button>
    </div>
  </div>` + footer(`<b>▲▼</b> ${t('quest_foot')}`, `${seq} / ${total} · ${t('hold_back_short')}`);
}

/* ---------------- system ---------------- */
function meter(level, max) {
  return `<span class="meter">${Array.from({ length: max }, (_, i) => `<i class="${i < level ? 'on' : ''}"></i>`).join('')}</span>`;
}

function viewSystem() {
  const s = state.settings;
  return topbar('system') + `<div class="body sys-body">
    <div class="sys-title"><h2>${t('sys_title')}</h2></div>
    <button class="sys-row" data-action="set:brightness" data-focus data-start>
      <span class="lab">${t('brightness')}</span>${meter(s.brightness, 5)}<span class="val">${s.brightness * 20}%</span>
    </button>
    <button class="sys-row" data-action="set:volume" data-focus>
      <span class="lab">${t('volume')}</span>${meter(s.volume, 5)}<span class="val">${s.volume * 20}%</span>
    </button>
    <button class="sys-row" data-action="set:scanlines" data-focus>
      <span class="lab">${t('scanlines')}</span><span class="muted" style="flex:1;font-size:5.5px">${t('scanlines_note')}</span>
      <span class="toggle ${s.scanlines ? 'on' : ''}"><i></i></span>
    </button>
    <button class="sys-row" data-action="set:sfx" data-focus>
      <span class="lab">${t('sfx')}</span><span class="muted" style="flex:1;font-size:5.5px">${t('sfx_note')}</span>
      <span class="toggle ${s.sfx ? 'on' : ''}"><i></i></span>
    </button>
    <button class="sys-row" data-action="lang:toggle" data-focus>
      <span class="lab">${t('lang_label')}</span><span class="muted" style="flex:1;font-size:5.5px">${state.lang === 'cn' ? t('lang_cn') : t('lang_en')}</span>
      <span class="toggle on"><i></i></span>
    </button>
    <div class="sys-actions">
      <button class="chip" data-action="go:#/album" data-focus>${t('album')}</button>
      <button class="chip" data-action="sys:about" data-focus>${t('about')}</button>
      <button class="chip" data-action="go:#/standby" data-focus>${t('standby')}</button>
    </div>
    <div class="sys-meta">${t('sys_battery')} <b>99%</b> · ${t('sys_uptime')} <b>01:24</b> · ${t('sys_storage')} <b>2.1 / 8 MB</b></div>
  </div>` + footer(`<b>OK</b> ${t('adjust')}`);
}

/* ---------------- album ---------------- */
function albumItems() {
  return [...state.albumShots, ...ALBUM.filter(a => !state.albumDeleted.includes(a.id))];
}

function viewAlbum() {
  const items = albumItems();
  const slots = 12;
  return topbar('system') + `<div class="body album-body">
    <div class="comp-head"><h3>${t('album_title')}</h3><span>${Math.min(items.length, slots)} / ${slots} ${state.lang === 'cn' ? '张照片' : 'PHOTOS'}</span></div>
    <div class="album-grid">${Array.from({ length: slots }, (_, i) => {
      const a = items[i];
      return a
        ? `<button class="photo" data-action="album:open:${a.id}" data-focus ${i === 0 ? 'data-start' : ''}>
             <img class="bg" src="${IMG(a.img)}" alt="">
             <span class="no">${a.no}</span>
             ${a.fresh ? `<span class="new">${t('album_new')}</span>` : ''}
             <span class="meta">${a.time}</span>
           </button>`
        : `<div class="photo empty">+</div>`;
    }).join('')}</div>
    <div class="album-note"><span>${state.lang === 'cn' ? '相机符文 · 希卡石板' : 'CAMERA RUNE · SHEIKAH SLATE'}</span><b>${(2.1 + state.albumShots.length * 0.2).toFixed(1)} / 8 MB</b></div>
  </div>` + footer(`<b>▲▼</b> ${t('album_foot')}`);
}

function viewAlbumModal() {
  const a = albumItems().find(x => x.id === state.albumOpen);
  if (!a) return '';
  return `<div class="photo-modal">
    <div class="big"><img class="bg" src="${IMG(a.big)}" alt=""></div>
    <div class="info">
      <h3>${state.lang === 'cn' ? a.cn : a.title}</h3>
      <div class="cn"></div>
      <dl>
        <dt>${t('photo_no')}</dt><dd>${a.no}</dd>
        <dt>${t('photo_time')}</dt><dd>${a.time}</dd>
        <dt>${t('photo_place')}</dt><dd>${state.lang === 'cn' ? (a.place_cn || placeCn(a.place)) : a.place}</dd>
      </dl>
      <div class="chiprow">
        <button class="chip" data-action="album:close" data-focus data-start>${t('photo_close')}</button>
        <button class="chip" data-action="album:delete:${a.id}" data-focus>${t('photo_delete')}</button>
      </div>
    </div>
  </div>`;
}

/* ---------------- render ---------------- */
let railLanguage = null;
let prevHash = null;
let focusKey = null;
function render() {
  rememberInputPage();
  buildRail();
  document.getElementById('languageBtn').textContent = state.lang === 'cn' ? '语言 · 简体中文' : 'LANGUAGE · ENGLISH';
  document.documentElement.lang = state.lang === 'cn' ? 'zh-CN' : 'en';
  const p = routeParts();
  const hash = routeHash();
  if(prevHash&&prevHash!==hash){if(inputUI.edit)state.settings[inputUI.edit.key]=inputUI.edit.before;inputUI.edit=null;inputUI.dialog=null;}
  const sameRoute = prevHash === hash;
  const isMap = p[0] === 'map';
  if (mapDrag) endMapDrag({ pointerId: mapDrag.id });
  document.body.classList.toggle('map-mode', isMap);
  let html = '';
  switch (p[0]) {
    case 'home': html = viewHome(); break;
    case 'runes': html = viewRunes(); break;
    case 'map': html = viewMap(); break;
    case 'inventory': html = viewInventory(p[1], p[2]); break;
    case 'rune': html = viewRune(p[1] || 'bomb'); break;
    case 'compendium':
      html = p[2] !== undefined ? viewEntry(p[1], Number(p[2])) : p[1] ? viewCompendiumCat(p[1]) : viewCompendium();
      break;
    case 'log':
      if (p[1]) {
        state.logTab = logTabId(p[1]);
        if (!p[2] && p[1] !== state.logTab) history.replaceState(null, '', `#/log/${state.logTab}`);
      }
      html = p[2] ? viewQuest(p[1], p[2]) : viewLog();
      break;
    case 'system': html = viewSystem(); break;
    case 'album':
      state.albumOpen = p[1] || null;
      html = viewAlbum() + (p[1] ? viewAlbumModal() : '');
      break;
    default: html = viewStandby();
  }
  screenEl.innerHTML = html + inputDialogHTML() + '<div class="focus-frame" id="focusFrame"></div><div class="wipe" id="wipe"></div>';
  screenEl.style.filter = `brightness(${(0.55 + state.settings.brightness * 0.09).toFixed(3)})`;
  if (isMap) updateMapView();
  document.body.classList.toggle('no-scan', !state.settings.scanlines);
  /* 同一页内重绘（调亮度、切换目标等）时把选中位置留在原处，不要跳回顶部。 */
  initFocus(inputUI.dialog?null:(sameRoute ? focusKey : inputUI.memory.get(hash)?.key));
  restoreInputPage();
  updateInputHint();
  updateRail();
  document.body.classList.toggle('rune-playing', Boolean(gameInputActive()));
  syncRuneGame();

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
  const scope = screenEl.querySelector('.input-dialog') || screenEl.querySelector('.map-dialog') || screenEl.querySelector('.game-pause') || screenEl.querySelector('.photo-modal') || screenEl;
  return [...scope.querySelectorAll('[data-action]:not([disabled])')].filter(n=>!n.closest('.tabs')&&!n.hidden);
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
  previewRuneFocus();
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
  const matches = ROUTES.filter(r=>h===r.hash || h.startsWith(r.hash+'/')).sort((a,b)=>b.hash.length-a.hash.length);
  const selected = matches[0];
  railEl.querySelectorAll('a').forEach(a=>{
    const on = selected && a.getAttribute('href') === selected.hash;
    a.classList.toggle('on', Boolean(on));
    a.classList.toggle('branch', Boolean(selected && a.getAttribute('href')===selected.parent));
    if (on) { a.setAttribute('aria-current','page'); a.scrollIntoView({block:'nearest'}); }
    else a.removeAttribute('aria-current');
  });
}

/* ---------------- actions ---------------- */
function run(action) {
  const [verb, ...rest] = action.split(':');
  if (verb === 'ui') {inputAction(rest);return;}
  if (verb === 'game') { runeGameAction(rest[0]); return; }
  switch (verb) {
    case 'go': {
      const target = rest.join(':');
      /* 从待机进入符文页时给一声石板启动音。 */
      beep(routeParts()[0]==='standby'?'startup':'page');
      go(target);
      break;
    }
    case 'back': back(); break;
    case 'pick':
      state.runeIndex = Number(rest[0]);
      go('#/rune/'+RUNES[state.runeIndex].id);beep('activate');break;
    case 'enter-rune':
      go('#/rune/' + RUNES[state.runeIndex].id); beep('activate'); break;

    case 'camera': cameraAction(rest[0], rest[1]); break;

    case 'inv': if(rest[0]==='equip')inventoryMenu(rest[1]);else inventoryAction(rest[0],rest[1]);break;
    case 'comp': go('#/compendium/' + rest.join(':')); break;
    case 'entry': go(`#/compendium/${rest[0]}/${rest[1]}`); break;
    case 'map': mapAction(rest[0], rest[1]); break;
    case 'logtab':
      state.logTab = logTabId(rest[0]);
      go(`#/log/${state.logTab}`); beep('ok'); break;
    case 'quest': go(`#/log/${rest[0]}/${rest[1]}`); break;

    case 'set': if(['brightness','volume'].includes(rest[0]))inputAction(['edit',rest[0]]);else sysAction(rest[0]);break;
    case 'lang': if (rest[0] === 'toggle') toggleLang(); break;
    case 'sys': about(); break;

    case 'album': if(rest[0]==='delete')inputAction(['delete-photo',rest[1]]);else albumAction(rest[0],rest[1]);break;
    default: break;
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
    if (c.shots[idx]) { toast(L('这个目标已经登记过了。', 'This subject is already registered.'), 'warn'); beep('back'); return; }
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
      title: t.name, cn: t.cn, time: 'NOW', place: 'GREAT PLATEAU', fresh: true
    });
    render(); beep('shutter');
    const flash = document.createElement('div');
    flash.className = 'flash';
    screenEl.appendChild(flash);
    setTimeout(() => flash.remove(), 340);
    if (c.done) setTimeout(() => beep('complete'), 280);
  }
}


function toggleLang() {
  state.lang = state.lang === 'cn' ? 'en' : 'cn';
  try { localStorage.setItem('slate-lang', state.lang); } catch (e) { /* 无持久化也不影响 */ }
  render(); beep('ok');
}

function sysAction(kind) {
  const s = state.settings;
  if (kind === 'brightness') s.brightness = s.brightness >= 5 ? 1 : s.brightness + 1;
  if (kind === 'volume') s.volume = s.volume >= 5 ? 0 : s.volume + 1;
  if (kind === 'scanlines') s.scanlines = !s.scanlines;
  if (kind === 'sfx') s.sfx = !s.sfx;
  if(!s.sfx||!s.volume)stopSfx();
  render();beep(['scanlines','sfx'].includes(kind)?(s[kind]?'switch_on':'switch_off'):'ok');
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
  if (!e.target.closest('#mapViewport') || e.target.closest('.map-marker') || !mapBrowseActive() || state.map.zoom <= 1 || e.button !== 0 || !e.isPrimary) return;
  e.preventDefault();
  mapDrag = { id: e.pointerId, x: e.clientX, y: e.clientY, panX: state.map.x, panY: state.map.y };
  screenEl.setPointerCapture(e.pointerId);
  screenEl.classList.add('map-dragging');
});
screenEl.addEventListener('pointermove', e => {
  if (!mapDrag || e.pointerId !== mapDrag.id) return;
  const scale = screenEl.getBoundingClientRect().width / 320;
  state.map.follow = false;
  state.map.pickNearest = true;
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
  if (i < 0) {if(el.closest('.tabs')&&!screenEl.querySelector('.input-dialog,.game-pause,.photo-modal'))run(el.dataset.action);return;}
  state.focus = i; paintFocus();
  run(el.dataset.action);
});

let pressedRoute = null;
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
  if (holdTimer !== null) return;
  longFired = false;
  pressedRoute = routeHash();
  clearTimeout(holdTimer);
  startHoldBar();
  holdTimer = setTimeout(() => { longFired = true; stopHoldBar(); if(pressedRoute===routeHash())back(); }, HOLD_MS);
}
function okUp() {
  if (holdTimer === null) return;
  clearTimeout(holdTimer);
  holdTimer = null;
  stopHoldBar();
  if (!longFired && pressedRoute===routeHash()) { if(inputPrimary()){} else if (mapBrowseActive()) mapAction('control'); else if (gameInputActive()) gamePrimary(); else activateFocused(); }
  longFired = false;
}

/* 方向键支持按住连续移动：先走一格，停顿 380 ms 后每 96 ms 一格。 */
let navDelay = null;
let navTimer = null;
function startNav(dir) {
  stopNav();
  document.querySelector(`[data-key="${dir < 0 ? 'UP' : 'DOWN'}"]`).classList.add('pressed');
  if(inputNavigate(dir)){navDelay=setTimeout(()=>{navTimer=setInterval(()=>inputNavigate(dir),120);},380);return;}
  if (mapBrowseActive()) { mapNavigate(dir);navDelay=setTimeout(()=>{navTimer=setInterval(()=>mapNavigate(dir),96);},380);return; }
  if (gameInputActive()) { gameSetDirection(dir); return; }
  moveFocus(dir);
  navDelay = setTimeout(() => {
    navTimer = setInterval(() => moveFocus(dir, true), 96);
  }, 380);
}
function stopNav() {
  gameSetDirection(0);
  document.querySelectorAll('.key.pressed').forEach(k => k.classList.remove('pressed'));
  clearTimeout(navDelay);
  clearInterval(navTimer);
  navDelay = null;
  navTimer = null;
}

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.key === 'Enter' && e.target.closest('.rail')) return;
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
  stopSfx();
  clearTimeout(holdTimer); holdTimer = null; longFired = true;
  stopHoldBar();
  if (mapDrag) endMapDrag({ pointerId: mapDrag.id });
  if (gameInputActive()) pauseRuneGame();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {stopSfx();if(gameInputActive()) { stopNav(); pauseRuneGame(); }}
});

document.querySelectorAll('.key').forEach(btn => {
  const key = btn.dataset.key;
  if (key === 'OK') {
    btn.addEventListener('pointerdown', e => { e.preventDefault(); btn.setPointerCapture(e.pointerId); okDown(); });
    btn.addEventListener('pointerup', okUp);

    btn.addEventListener('pointercancel', () => { clearTimeout(holdTimer); holdTimer = null; stopHoldBar(); });
  } else {
    const dir = key === 'UP' ? -1 : 1;
    btn.addEventListener('pointerdown', e => { e.preventDefault(); btn.setPointerCapture(e.pointerId); startNav(dir); });
    btn.addEventListener('pointerup', stopNav);

    btn.addEventListener('pointercancel', stopNav);
  }
});

/* ---------------- boot ---------------- */
function buildRail() {
  if (railLanguage === state.lang) return;
  railLanguage = state.lang;
  const link = r => `<a href="${r.hash}"><span>${r.number ? r.number+' · ' : ''}${state.lang === 'cn' ? r.cn : r.label}</span></a>`;
  railEl.innerHTML = '<ul class="rail-list">'+ROUTES.filter(r=>!r.parent).map(r=>{
    const children = ROUTES.filter(c=>c.parent===r.hash);
    return '<li>'+link(r)+(children.length?'<ul class="rail-children">'+children.map(c=>'<li>'+link(c)+'</li>').join('')+'</ul>':'')+'</li>';
  }).join('')+'</ul>';
  document.querySelector('.rail-foot p').textContent = state.lang === 'cn' ? '↑ ↓ 选择 · Enter 确认 · 长按 Enter 返回' : '↑ ↓ SELECT · ENTER CONFIRM · HOLD ENTER BACK';
  document.getElementById('resetBtn').textContent = state.lang === 'cn' ? '重置原型状态' : 'RESET PROTOTYPE';
}

railEl.addEventListener('click', e => {
  const link = e.target.closest('a');
  if (link) link.blur();
});
document.getElementById('languageBtn').addEventListener('click', toggleLang);
document.getElementById('resetBtn').addEventListener('click', () => location.reload());

function fit() {
  const device = document.getElementById('device');
  const stage = getComputedStyle(document.querySelector('.stage'));
  const rail = document.querySelector('.rail');
  const railWidth = getComputedStyle(rail).display === 'none' ? 0 : rail.getBoundingClientRect().width;
  const shell = document.getElementById('screenShell');
  const chromeW = device.offsetWidth - shell.offsetWidth;
  const chromeH = device.offsetHeight - shell.offsetHeight;
  const maxW = window.innerWidth - parseFloat(stage.paddingLeft) - parseFloat(stage.paddingRight) - chromeW - railWidth - (railWidth ? parseFloat(stage.gap) : 0);
  const maxH = window.innerHeight - parseFloat(stage.paddingTop) - parseFloat(stage.paddingBottom) - chromeH;
  const scale = Math.max(.4, Math.min(maxW / 320, maxH / 240));
  document.documentElement.style.setProperty('--scale', scale.toFixed(3));
  document.documentElement.style.setProperty('--device-height', device.getBoundingClientRect().height + 'px');
  placeFocus(false);
}

window.addEventListener('hashchange', render);
window.addEventListener('resize', fit);

buildRail();
fit();
render();
/* 字体是 swap 加载的，就位后重新量一次选中框位置。 */
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => placeFocus(false));

