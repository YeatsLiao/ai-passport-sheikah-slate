/* 原型展示数据与《旷野之息》剧情梗概：没有后端、没有存档，刷新或点击「重置原型状态」即复原。 */

const RUNES = [
  { id: 'bomb',      short: 'ROUND BOMB', label: 'REMOTE BOMB', cn: '远程炸弹 · 圆形', icon: 'rune_bomb.png',  kind: 'ROUND',
    desc: '调整投掷力度后抛出圆弹，观察落地滚动，在岩石附近遥控引爆。',
    en_desc: 'Adjust the throw, watch the bomb roll down the slope, then detonate near the rocks.',
    stats: [['TYPE', 'ROUND'], ['COOLDOWN', '2.5 s']] },
  { id: 'bomb_cube', short: 'CUBE BOMB',  label: 'REMOTE BOMB', cn: '远程炸弹 · 方形', icon: 'rune_cube.png', kind: 'CUBE',
    desc: '方炸弹停在落点，放到移动平台上可随平台运送，在高处岩石旁遥控引爆。',
    en_desc: 'Stays where placed. Ride a moving platform to detonate beside the raised rocks.',
    stats: [['TYPE', 'CUBE'], ['COOLDOWN', '2.5 s']] },
  { id: 'magnet',  short: 'MAGNET',   label: 'MAGNESIS',     cn: '磁力抓取',       icon: 'rune_magnet.png',  kind: 'METAL',
    desc: '抓住金属铁板，搬到断口上方，让两端搭稳桥台形成通路。',
    en_desc: 'Grab the metal slab and bridge the gap, resting both ends securely on the banks.',
    stats: [['RANGE', '12 m'], ['TARGET', 'METAL']] },
  { id: 'stasis',  short: 'STASIS',   label: 'STASIS',       cn: '静止器',         icon: 'rune_stasis.png',  kind: 'FREEZE',
    desc: '让物体短暂静止。冻结期间连续击打可积蓄势能，解除时一次释放。',
    en_desc: 'Freezes objects in time. Strike while frozen to store energy, released all at once on unfreeze.',
    stats: [['LIMIT', '10 s'], ['MAX HIT', '6']] },
  { id: 'cryonis', short: 'CRYONIS',  label: 'CRYONIS',      cn: '制冰器',         icon: 'rune_cryonis.png', kind: 'ICE',
    desc: '在水面升起冰柱，可作为踏脚石或顶起闸门。最多同时存在三根。',
    en_desc: 'Raises ice pillars from water — stepstones or gate lifts. Up to three at once.',
    stats: [['LIMIT', '3'], ['COOLDOWN', '0.8 s']] },
  { id: 'camera',  short: 'CAMERA',   label: 'CAMERA',       cn: '照相机 · 图鉴',   icon: 'rune_camera.png',  kind: 'LENS',
    desc: '平移与缩放取景，避开遮挡后拍摄识别目标。本轮仅临时预览，相册后续讨论。',
    en_desc: 'Pan and zoom to photograph unobstructed subjects. Temporary preview only; album work is deferred.',
    stats: [['ALBUM', '8 / 8'], ['TARGET', '5']] },
  { id: 'cycle',  short: 'MASTER CYCLE', label: 'MASTER CYCLE ZERO', cn: '大师摩托 Zero', icon: 'rune_master_cycle_zero.png', kind: 'CYCLE', scene: 'rune_scene_cycle.jpg',
    desc: '英杰所赠的希卡科技摩托车，可在平原与坡地高速穿行。',
    en_desc: 'A Sheikah motorcycle gifted by the Champions — swift travel across plains and slopes.',
    stats: [['SOURCE', 'DLC'], ['USE', 'SUMMON']] },
  { id: 'amiibo', short: 'AMIIBO', label: 'AMIIBO', cn: 'amiibo 读取', icon: 'rune_amiibo.png', kind: 'AMIIBO', scene: 'rune_scene_amiibo.png',
    desc: '读取 amiibo，召唤材料、装备与宝藏。每日每只限用一次。',
    en_desc: 'Scan amiibo to summon materials, gear and treasure. Once per figure per day.',
    stats: [['LIMIT', '1 / DAY'], ['TYPE', 'FIGURE']] },
  { id: 'sensor', short: 'SENSOR', label: 'SHEIKAH SENSOR', cn: '希卡感应器', icon: 'rune_sheikah_sensor.png', kind: 'SENSOR', scene: 'rune_scene_sensor.png',
    desc: '探测附近未被发现的神庙。靠近目标时，感应器以信号强弱提示接近方向。',
    en_desc: 'Detects undiscovered shrines nearby. Signals strengthen as you move toward the target.',
    stats: [['RANGE', '100 m'], ['TARGET', 'SHRINE']] }
];

const RUNE_BY_ID = Object.fromEntries(RUNES.map(r => [r.id, r]));


/* 完整任务数据(15 主线 + 76 支线)移入 quest-data.js,由 index.html 先行引入。 */

const ALBUM = [
  { id: 'a1',  img: 'album_01.png', big: 'bg_field.png',     title: 'GUARDIAN AMBUSH', cn: '守护者伏击', time: '01:20', place: 'HYRULE FIELD',   no: 'No.001' },
  { id: 'a2',  img: 'album_02.png', big: 'bg_shrine.png',    title: 'RUNE PEDESTAL',   cn: '符文基座',   time: '08:12', place: 'GREAT PLATEAU',  no: 'No.002' },
  { id: 'a3',  img: 'album_03.png', big: 'bg_abbey.png',     title: 'EASTERN ABBEY',   cn: '东修道院',   time: '12:30', place: 'HYRULE FIELD',   no: 'No.003' },
  // big 是详情页满屏展示的大图：用 280px 图鉴照而不是 96px 缩略图，避免放大后发糊。
  { id: 'a4',  img: 'album_04.png', big: 'cp_hyrule_bass.png', title: 'HYLIAN BASS',    cn: '海拉鲁鲈鱼', time: '09:12', place: 'GREAT PLATEAU',  no: 'No.004' },
  { id: 'a5',  img: 'album_05.png', big: 'cp_master_sword.png', title: 'MASTER SWORD', cn: '大师之剑', time: '06:40', place: 'KOROK FOREST',   no: 'No.005' },
  { id: 'a6',  img: 'album_06.png', big: 'bg_molduga.png',   title: 'MOLDUGA',         cn: '莫尔德拉吉克', time: '14:22', place: 'GERUDO DESERT', no: 'No.006' },
  { id: 'a7',  img: 'album_07.png', big: 'cp_hylian_shield.png', title: 'HYLIAN SHIELD', cn: '海利亚盾',  time: '15:05', place: 'HYRULE CASTLE',  no: 'No.007' },
  { id: 'a8',  img: 'album_08.png', big: 'bg_temple.png',    title: 'TEMPLE OF TIME',  cn: '时之神殿',   time: '17:48', place: 'GREAT PLATEAU',  no: 'No.008' },
  { id: 'a9',  img: 'album_09.png', big: 'cp_bokoblin.png',  title: 'BOKOBLIN',        cn: '波克布林',   time: '20:11', place: 'HYRULE FIELD',   no: 'No.009' },
  { id: 'a10', img: 'album_10.png', big: 'bg_destroyed.png',title: 'DESTROYED GUARDIAN', cn: '守护者残骸', time: '21:03', place: 'HYRULE FIELD', no: 'No.010' },
  { id: 'a11', img: 'album_11.png', big: 'cut_guardian_big.png', title: 'GUARDIAN STALKER', cn: '守护者步行者', time: '22:16', place: 'CENTRAL HYRULE', no: 'No.011' },
  { id: 'a12', img: 'album_12.png', big: 'bg_art.png',      title: 'GUARDIAN ARTWORK', cn: '守护者艺术图', time: '23:00', place: 'ARCHIVE',      no: 'No.012' }
];

const ROUTES = [
  {
    "hash": "#/inventory",
    "cn": "装备",
    "label": "EQUIP",
    "number": "01",
    "parent": null
  },
  {
    "hash": "#/inventory/weapons",
    "cn": "武器",
    "label": "WEAPONS",
    "parent": "#/inventory"
  },
  {
    "hash": "#/inventory/shields",
    "cn": "盾牌",
    "label": "SHIELDS",
    "parent": "#/inventory"
  },
  {
    "hash": "#/inventory/armors",
    "cn": "防具",
    "label": "ARMOR",
    "parent": "#/inventory"
  },
  {
    "hash": "#/runes",
    "cn": "符文",
    "label": "RUNES",
    "number": "02",
    "parent": null
  },
  {
    "hash": "#/rune/bomb",
    "cn": "圆形炸弹",
    "label": "ROUND BOMB",
    "parent": "#/runes"
  },
  {
    "hash": "#/rune/bomb_cube",
    "cn": "方形炸弹",
    "label": "CUBE BOMB",
    "parent": "#/runes"
  },
  {
    "hash": "#/rune/magnet",
    "cn": "磁力抓取",
    "label": "MAGNESIS",
    "parent": "#/runes"
  },
  {
    "hash": "#/rune/stasis",
    "cn": "静止器",
    "label": "STASIS",
    "parent": "#/runes"
  },
  {
    "hash": "#/rune/cryonis",
    "cn": "制冰器",
    "label": "CRYONIS",
    "parent": "#/runes"
  },
  {
    "hash": "#/rune/camera",
    "cn": "照相机",
    "label": "CAMERA",
    "parent": "#/runes"
  },
  {
    "hash": "#/rune/cycle",
    "cn": "大师摩托 Zero",
    "label": "MASTER CYCLE ZERO",
    "parent": "#/runes"
  },
  {
    "hash": "#/rune/amiibo",
    "cn": "amiibo",
    "label": "amiibo",
    "parent": "#/runes"
  },
  {
    "hash": "#/rune/sensor",
    "cn": "希卡感应器",
    "label": "SHEIKAH SENSOR",
    "parent": "#/runes"
  },
  {
    "hash": "#/map",
    "cn": "地图",
    "label": "MAP",
    "number": "03",
    "parent": null
  },
  {
    "hash": "#/compendium",
    "cn": "海拉鲁图鉴",
    "label": "COMPENDIUM",
    "number": "04",
    "parent": null
  },
  {
    "hash": "#/compendium/creatures",
    "cn": "生物",
    "label": "CREATURES",
    "parent": "#/compendium"
  },
  {
    "hash": "#/compendium/monsters",
    "cn": "怪物",
    "label": "MONSTERS",
    "parent": "#/compendium"
  },
  {
    "hash": "#/compendium/materials",
    "cn": "材料",
    "label": "MATERIALS",
    "parent": "#/compendium"
  },
  {
    "hash": "#/compendium/equipment",
    "cn": "装备",
    "label": "EQUIPMENT",
    "parent": "#/compendium"
  },
  {
    "hash": "#/compendium/treasures",
    "cn": "宝物",
    "label": "TREASURE",
    "parent": "#/compendium"
  },
  {
    "hash": "#/log",
    "cn": "冒险日志",
    "label": "LOG",
    "number": "05",
    "parent": null
  },
  {
    "hash": "#/log/main",
    "cn": "主线",
    "label": "MAIN",
    "parent": "#/log"
  },
  {
    "hash": "#/log/shrine",
    "cn": "神庙挑战",
    "label": "SHRINE",
    "parent": "#/log"
  },
  {
    "hash": "#/log/side",
    "cn": "迷你挑战",
    "label": "SIDE",
    "parent": "#/log"
  },
  {
    "hash": "#/system",
    "cn": "系统",
    "label": "SYSTEM",
    "number": "06",
    "parent": null
  },
  {
    "hash": "#/album",
    "cn": "相册",
    "label": "ALBUM",
    "parent": "#/system"
  },
  {
    "hash": "#/standby",
    "cn": "待机",
    "label": "STANDBY",
    "number": "07",
    "parent": null
  }
];
