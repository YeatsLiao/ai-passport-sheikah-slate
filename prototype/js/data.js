/* 原型展示数据与《旷野之息》剧情梗概：没有后端、没有存档，刷新或点击「重置原型状态」即复原。 */

const RUNES = [
  { id: 'bomb',      short: 'ROUND BOMB', label: 'REMOTE BOMB', cn: '远程炸弹 · 圆形', icon: 'rune_bomb.png',  kind: 'ROUND',
    desc: '圆炸弹会顺坡滚动，适合投进洞口或敌群。放置后再次确认即可引爆。',
    stats: [['TYPE', 'ROUND'], ['COOLDOWN', '2.5 s']] },
  { id: 'bomb_cube', short: 'CUBE BOMB',  label: 'REMOTE BOMB', cn: '远程炸弹 · 方形', icon: 'rune_cube.png', kind: 'CUBE',
    desc: '方炸弹落地后停在原地，适合精确炸开裂纹石墙。与圆炸弹共用同一套操作。',
    stats: [['TYPE', 'CUBE'], ['COOLDOWN', '2.5 s']] },
  { id: 'magnet',  short: 'MAGNET',   label: 'MAGNESIS',     cn: '磁力抓取',       icon: 'rune_magnet.png',  kind: 'METAL',
    desc: '抓住并移动金属物体。举高后可越过障碍，放下时可压住压力板。',
    stats: [['RANGE', '12 m'], ['TARGET', 'METAL']] },
  { id: 'stasis',  short: 'STASIS',   label: 'STASIS',       cn: '静止器',         icon: 'rune_stasis.png',  kind: 'FREEZE',
    desc: '让物体短暂静止。冻结期间连续击打可积蓄势能，解除时一次释放。',
    stats: [['LIMIT', '10 s'], ['MAX HIT', '6']] },
  { id: 'cryonis', short: 'CRYONIS',  label: 'CRYONIS',      cn: '制冰器',         icon: 'rune_cryonis.png', kind: 'ICE',
    desc: '在水面升起冰柱，可作为踏脚石或顶起闸门。最多同时存在三根。',
    stats: [['LIMIT', '3'], ['COOLDOWN', '0.8 s']] },
  { id: 'camera',  short: 'CAMERA',   label: 'CAMERA',       cn: '照相机 · 图鉴',   icon: 'rune_camera.png',  kind: 'LENS',
    desc: '拍下生物、怪物与素材，登记进海拉鲁图鉴。已拍目标会打上标记。',
    stats: [['ALBUM', '8 / 8'], ['TARGET', '5']] },
  { id: 'cycle',  short: 'MASTER CYCLE', label: 'MASTER CYCLE ZERO', cn: '大师摩托', icon: 'rune_master_cycle_zero.png', kind: 'CYCLE', scene: 'rune_scene_cycle.jpg',
    desc: '英杰所赠的希卡科技摩托车，可在平原与坡地高速穿行。',
    stats: [['SOURCE', 'DLC'], ['USE', 'ANYWHERE']] },
  { id: 'amiibo', short: 'AMIIBO', label: 'AMIIBO', cn: 'amiibo 读取', icon: 'rune_amiibo.png', kind: 'AMIIBO', scene: 'rune_scene_amiibo.png',
    desc: '读取 amiibo，召唤材料、装备与宝藏。每日每只限用一次。',
    stats: [['LIMIT', '1 / DAY'], ['TYPE', 'FIGURE']] },
  { id: 'sensor', short: 'SENSOR', label: 'SHEIKAH SENSOR', cn: '希卡感应器 · 访问神庙', icon: 'rune_sheikah_sensor.png', kind: 'SENSOR', scene: 'rune_scene_sensor.png',
    desc: '探测附近未被发现的神庙。靠近目标时，感应器发出声音并指出方向。',
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
  { hash: '#/inventory',         label: '01 · EQUIP',       note: '装备 / 换装' },
  { hash: '#/runes',             label: '02 · RUNES',       note: '符文' },
  { hash: '#/rune/bomb',         label: '  · ROUND BOMB',    note: '圆炸弹' },
  { hash: '#/rune/bomb_cube',    label: '  · CUBE BOMB',     note: '方炸弹' },
  { hash: '#/rune/magnet',       label: '  · MAGNESIS',      note: '磁力' },
  { hash: '#/rune/stasis',       label: '  · STASIS',        note: '静止' },
  { hash: '#/rune/cryonis',      label: '  · CRYONIS',       note: '制冰' },
  { hash: '#/rune/camera',       label: '  · CAMERA',        note: '相机' },
  { hash: '#/rune/cycle',        label: '  · CYCLE',         note: '大师摩托' },
  { hash: '#/rune/amiibo',       label: '  · AMIIBO',        note: 'amiibo' },
  { hash: '#/rune/sensor',       label: '  · SENSOR',        note: '希卡感应器' },
  { hash: '#/map',               label: '03 · MAP',         note: '地图' },
  { hash: '#/compendium',        label: '04 · COMPENDIUM',  note: '海拉鲁图鉴' },
  { hash: '#/compendium/creatures', label: '  · CREATURES', note: '生物' },
  { hash: '#/log',               label: '05 · LOG',         note: '旷野故事' },
  { hash: '#/system',            label: '06 · SYSTEM',      note: '系统' },
  { hash: '#/album',             label: '  · ALBUM',         note: '相册' },
  { hash: '#/standby',           label: '07 · STANDBY',     note: '待机' }
];
