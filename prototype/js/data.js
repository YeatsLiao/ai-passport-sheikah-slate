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
    stats: [['ALBUM', '8 / 8'], ['TARGET', '5']] }
];

const RUNE_BY_ID = Object.fromEntries(RUNES.map(r => [r.id, r]));

// 分类封面用该分类的代表性图鉴照片，右上角贴官方分类图标（来源见 README「图鉴素材来源」）
const COMP_CATS = [
  { id: 'creatures',  label: 'CREATURES',  cn: '生物', cover: 'cp_horse.png',          art: 'cat_creatures.png', have: 12, total: 83 },
  { id: 'monsters',   label: 'MONSTERS',   cn: '怪物', cover: 'cp_bokoblin.png',       art: 'cat_monsters.png',  have: 9,  total: 81 },
  { id: 'materials',  label: 'MATERIALS',  cn: '材料', cover: 'cp_apple.png',          art: 'cat_materials.png', have: 21, total: 36 },
  { id: 'equipment',  label: 'EQUIPMENT',  cn: '装备', cover: 'cp_master_sword.png',   art: 'cat_equipment.png', have: 7,  total: 185 },
  { id: 'treasures',  label: 'TREASURE',   cn: '宝物', cover: 'cp_treasure_chest.png', art: 'cat_treasures.png', have: 3,  total: 4 }
];

// no = 原版图鉴编号；thumb 为装备列表用的官方透明图标（无则回落到照片）
const COMP_ENTRIES = {
  creatures: [
    { no: '001', name: 'HORSE', cn: '马', img: 'cp_horse.png', got: true, meta: ['栖息地', '海拉鲁平原 · 草原'],
      desc: '海拉鲁各地常见的骑乘动物。野马需要悄悄接近，抓住缰绳后反复安抚才能骑乘。' },
    { no: '032', name: 'BLUE SPARROW', cn: '蓝雀', img: 'cp_blue_sparrow.png', got: true, meta: ['栖息地', '城镇 · 草原'],
      desc: '城镇与草原上随处可见的小鸟。受惊时会立刻振翅飞走，是练习拍照的好对象。' },
    { no: '041', name: 'BRIGHT-CHESTED DUCK', cn: '亮胸鸭', img: 'cp_bright_chested_duck.png', got: true, meta: ['栖息地', '河川 · 池塘'],
      desc: '栖息在河川与池塘的水鸟。胸前羽毛颜色鲜亮，受惊后会贴着水面低飞。' },
    { no: '048', name: 'HYRULE BASS', cn: '海拉鲁鲈鱼', img: 'cp_hyrule_bass.png', got: true, meta: ['栖息地', '河湖浅滩'],
      desc: '河湖浅滩最常见的小型鱼。肉质清淡，是旅行者最容易取得的食材。' },
    { no: '083', name: 'FIREPROOF LIZARD', cn: '耐火蜥蜴', img: 'cp_fireproof_lizard.png', got: true, meta: ['栖息地', '火山地带'],
      desc: '栖息在火山地带的蜥蜴。鳞片能隔绝高温，与怪物材料同煮可获得耐火效果。' }
  ],
  monsters: [
    { no: '103', name: 'BOKOBLIN', cn: '波克布林', img: 'cp_bokoblin.png', got: true, meta: ['出没', '营地 · 夜间'],
      desc: '最常见的营地怪物。会使用旅人武器，夜间视力更好，发现入侵者会吹响号角。' },
    { no: '108', name: 'MOBLIN', cn: '莫力布林', img: 'cp_moblin.png', got: true, meta: ['出没', '营地 · 平原'],
      desc: '体型远大于波克布林的营地头目。挥动巨大武器时破绽很大，但一击足以致命。' },
    { no: '113', name: 'LIZALFOS', cn: '蜥蜴战士', img: 'cp_lizalfos.png', got: true, meta: ['出没', '草丛 · 水边'],
      desc: '行动敏捷的蜥蜴型怪物。会潜伏在草丛与水边，擅长突然袭击。' },
    { no: '121', name: 'LYNEL', cn: '莱尼尔', img: 'cp_lynel.png', got: true, meta: ['出没', '平原 · 高地'],
      desc: '被称为人马的上位怪物。会用弓箭与巨剑，是海拉鲁最危险的敌人之一。' },
    { no: '147', name: 'HINOX', cn: '西诺克斯', img: 'cp_hinox.png', got: true, meta: ['出没', '平原 · 森林'],
      desc: '在平原上沉睡的独眼巨人。眼睛被击中前几乎无法造成伤害，倒地时才是进攻的机会。' }
  ],
  materials: [
    { no: '165', name: 'APPLE', cn: '苹果', img: 'cp_apple.png', got: true, meta: ['效果', '回复 1 颗心'],
      desc: '海拉鲁最常见的果实。直接食用可恢复少量体力，烤过之后效果更好。' },
    { no: '167', name: 'WILDBERRY', cn: '野莓', img: 'cp_wildberry.png', got: true, meta: ['效果', '回复 1/2 颗心'],
      desc: '成串生长在灌木上的红色小果。酸味强烈，常用于制作果酱与料理。' },
    { no: '168', name: 'HEARTY DURIAN', cn: '榴莲', img: 'cp_hearty_durian.png', got: true, meta: ['效果', '大幅回复体力'],
      desc: '气味浓烈的大型果实。果肉能大幅恢复体力，是珍贵的料理素材。' },
    { no: '174', name: 'HYLIAN SHROOM', cn: '海拉鲁蘑菇', img: 'cp_hylian_shroom.png', got: true, meta: ['效果', '回复 1/2 颗心'],
      desc: '森林与草原上随处可采的蘑菇。味道温和，适合与各种食材同煮。' },
    { no: '198', name: 'BLUE NIGHTSHADE', cn: '蓝色夜光草', img: 'cp_blue_nightshade.png', got: true, meta: ['效果', '料理 · 药剂素材'],
      desc: '夜里泛着幽蓝微光的草叶。安静地贴在林地阴影里，是料理与药物的常用素材。' }
  ],
  equipment: [
    { no: '201', name: 'MASTER SWORD', cn: '大师之剑', img: 'cp_master_sword.png', got: true,
      thumb: 'eq_master_sword.png', stat: ['ATK', '30'],
      desc: '退魔之剑。插在克洛格森林的台座上，只有被剑选中的人才能拔出。' },
    { no: '208', name: "SOLDIER'S BROADSWORD", cn: '士兵的阔剑', img: 'cp_soldiers_broadsword.png', got: true,
      thumb: 'eq_soldiers_broadsword.png', stat: ['ATK', '14'],
      desc: '曾守护海拉鲁城堡的士兵所用之剑。剑身结实，专为讨伐怪物打造。' },
    { no: '218', name: 'ANCIENT SHORT SWORD', cn: '古代短剑', img: 'cp_ancient_short_sword.png', got: true,
      thumb: 'eq_ancient_short_sword.png', stat: ['ATK', '40'],
      desc: '以失传的古代技术锻造的短剑。出鞘时刃部才显现，锋利程度超过金属剑。' },
    { no: '257', name: 'ROYAL CLAYMORE', cn: '王族双手剑', img: 'cp_royal_claymore.png', got: true,
      thumb: 'eq_royal_claymore.png', stat: ['ATK', '52'],
      desc: '配发给海拉鲁王族近卫的双手剑。沉重的一击足以粉碎敌人的身体与意志。' },
    { no: '354', name: 'HYLIAN SHIELD', cn: '海利亚盾', img: 'cp_hylian_shield.png', got: true,
      stat: ['DEF', '90'],
      desc: '海拉鲁王室的传家宝。能挡住大多数攻击，是盾牌中的巅峰。' }
  ],
  treasures: [
    { no: '386', name: 'TREASURE CHEST', cn: '宝箱', img: 'cp_treasure_chest.png', got: true, meta: ['发现', '遗迹 · 怪物营地'],
      desc: '散布在海拉鲁各地的宝箱。里面可能装着武器、素材或稀有装备。' },
    { no: '387', name: 'ORE DEPOSIT', cn: '矿床', img: 'cp_ore_deposit.png', got: true, meta: ['发现', '岩壁 · 洞窟'],
      desc: '敲碎后可获得燧石与各类矿石。用炸弹能一次开采整片矿脉。' },
    { no: '388', name: 'RARE ORE DEPOSIT', cn: '稀有矿床', img: 'cp_rare_ore_deposit.png', got: false,
      desc: '尚未记录这条图鉴。用相机对准矿床拍下照片，即可补全条目。' },
    { no: '389', name: 'LUMINOUS ORE DEPOSIT', cn: '夜光矿床', img: 'cp_luminous_ore_deposit.png', got: true, meta: ['发现', '洞窟 · 夜间'],
      desc: '在黑暗中散发青白光芒的矿床。开采后可获得夜光石。' }
  ]
};

/* 主线按叙事归为四章，支线选四则完整故事；均为自写梗概，不是游戏原文或任务完成条件。
   主线标题为本原型的章节名；支线包含两则神庙挑战。每页独立分段，适配小屏阅读。 */
const QUESTS = {
  main: [
    { id: 'm1', title: 'A KINGDOM LOST', cn: '王国陷落，勇者苏醒', pages: [
      { heading: '百年前的灾厄', text: '为迎战即将复苏的灾厄盖侬，海拉鲁王国发掘古代希卡族的守护者与四神兽。塞尔达公主、近卫骑士林克和四位英杰共同备战，却没料到盖侬会反过来控制这些兵器。城堡陷落，国王与英杰牺牲。' },
      { heading: '沉睡的一百年', text: '林克在保护塞尔达时身受重伤，被送入复苏神庙沉睡。百年后，他在公主的呼唤中醒来，失去了过去的记忆。他带着希卡石板走出神庙，看到的已是遍布遗迹、怪物与野草的海拉鲁。' },
      { heading: '离开初始台地', text: '神秘老人引导林克完成台地上的四座神庙，随后表明自己是海拉鲁国王的亡灵。塞尔达仍在城堡中压制盖侬，但她的力量正在衰弱。国王交出滑翔帆，请林克寻找英帕，救出公主。' }
    ] },
    { id: 'm2', title: 'MEMORIES OF ZELDA', cn: '找回记忆，理解公主', pages: [
      { heading: '照片里的过去', text: '林克在卡卡利科村见到英帕，得知自己与塞尔达的使命。随后，他来到哈特诺古代研究所，由普尔亚恢复石板的相机等功能。相册中的旧照片成为线索，引导他回到百年前曾与公主同行的地方。' },
      { heading: '无法回应的祈祷', text: '记忆中的塞尔达热爱古代技术研究，却始终无法唤醒王室传承的封印之力。父王的期待与自己的挫败让她倍感痛苦。她起初疏远林克，后来逐渐理解这位沉默骑士背负的压力，两人建立了信任。' },
      { heading: '守护的决心', text: '灾厄降临后，塞尔达在守护濒死的林克时终于觉醒力量，挡住守护者。她安排林克接受治疗，把受损的大师之剑托付给德库树，随后独自走向城堡。林克找回的，是她坚持守护海拉鲁一百年的决心。' }
    ] },
    { id: 'm3', title: 'THE FOUR CHAMPIONS', cn: '解放神兽，送别英杰', pages: [
      { heading: '卓拉与鼓隆的危机', text: '林克与希多王子合作，登上引发暴雨的水之神兽，击败水咒盖侬，让米法的灵魂得到解脱。在死亡之山，他又与阿沅并肩前进，进入火之神兽，战胜火咒盖侬，重逢英杰达尔克尔。' },
      { heading: '利特与格鲁德的盟友', text: '在利特村，林克与特巴迎击盘旋空中的风之神兽，击败风咒盖侬，解放力巴尔。在格鲁德地区，他夺回雷鸣头盔，与璐菊接近雷之神兽，再战胜雷咒盖侬，让乌尔波扎摆脱囚禁。' },
      { heading: '百年之后的援护', text: '四位英杰把自己的力量交给林克，并驾驶恢复控制的神兽瞄准海拉鲁城堡。他们未能在百年前完成的使命，将由幸存的朋友继续。四地探索没有固定顺序；每一次告别，也让林克重新获得盟友。' },
      { heading: '森林中的退魔之剑', text: '林克还可以穿过迷失森林，在德库树面前接受生命力的考验，拔出大师之剑。它与英杰的援护让决战更有把握，但解放四神兽和取得大师之剑都不是进入城堡的硬性前提。这里讲述的是完整探索后的故事路线。' }
    ] },
    { id: 'm4', title: 'THE CALAMITY ENDS', cn: '终结灾厄，走向明天', pages: [
      { heading: '重返海拉鲁城堡', text: '林克穿过被怨念与守护者占据的城堡，来到灾厄盖侬面前。已经解放的神兽在英杰操纵下发动远程攻击，削弱盖侬。随后，林克独自迎战这个由怨念与古代机械拼合而成的敌人。' },
      { heading: '最后的封印', text: '灾厄盖侬倒下后，怨念化作巨大的魔兽盖侬，出现在海拉鲁平原。塞尔达把光之弓交给林克，并帮助显露敌人的弱点。林克骑马射击，在最后一箭命中后，公主现身，以封印之力结束这场灾厄。' },
      { heading: '重逢与重建', text: '塞尔达终于与林克重逢，国王和四位英杰的灵魂安然离去。找齐相关记忆后的额外结局中，两人准备前往卓拉领地调查神兽的异常，并着手恢复海拉鲁。王国尚未重建，新的生活却已经开始。' }
    ] }
  ],
  side: [
    { id: 's1', title: 'HYLIAN HOMEOWNER', cn: '在哈特诺安一个家', pages: [
      { heading: '即将被拆掉的旧屋', text: '在哈特诺村，林克遇到准备拆除一栋空屋的建筑队。他与樱达谈好条件，交付木柴和卢比，买下房子。对于醒来后一直漂泊的勇者而言，这不只是一次交易，而是终于有了可以回去的地方。' },
      { heading: '把空屋变成家', text: '林克继续请建筑队添置床铺、灯具和装备展示架，整理庭院。房子渐渐有了生活的模样。它不会替林克击败盖侬，却为旅途留下一个安稳的落脚点；建筑师松达也将离开这里，前往阿卡莱展开新的工程。' }
    ] },
    { id: 's2', title: 'FROM THE GROUND UP', cn: '从一块荒地到一始村', pages: [
      { heading: '松达的新工程', text: '松达来到阿卡莱，在湖中的岩台上建设聚落。林克为他运来木柴，并到各地邀请居民：鼓隆族提供力气，格鲁德族带来裁缝手艺，利特族经营商店，卓拉族主持婚礼。荒地逐步变成了热闹的一始村。' },
      { heading: '不同族群成为邻居', text: '建设过程中，松达与格鲁德裁缝帕伍达相爱。林克邀请樱达等朋友参加婚礼，见证两人的结合。从送木柴、找工人到一场婚礼，这条支线让重建不再是遥远的口号，而是一群人真正开始共同生活。' }
    ] },
    { id: 's3', title: 'THE STOLEN HEIRLOOM', cn: '被盗宝珠背后的父亲', pages: [
      { heading: '卡卡利科村的秘密', text: '在帮助村民之后，林克发现英帕家保管的宝珠被偷走了。调查将他引向守卫多朗。多朗曾是依盖队成员，为了家人离开组织；依盖队杀害他的妻子，又以两个女儿的安全胁迫他继续传递情报。' },
      { heading: '不再屈从恐惧', text: '林克夜里跟随多朗，在村外撞见他与依盖队干部对峙，并击败来犯者。失窃宝珠被放回台座，一座隐藏神庙出现。神庙挑战之外，这也是一个父亲试图摆脱过去、保护女儿的故事。' }
    ] },
    { id: 's4', title: 'STRANDED ON EVENTIDE', cn: '孤岛上的从零开始', pages: [
      { heading: '暂时放下所有装备', text: '林克踏上赛哈特诺岛时，神庙试炼暂时收走了他的装备与物资。他必须依靠岛上的树枝、食物和希卡石板求生，在怪物营地与西诺克斯附近寻找三颗宝珠，再设法把它们送到各自的台座。' },
      { heading: '勇气不在背包里', text: '三颗宝珠归位后，试炼结束，原有装备归还，隐藏的神庙向林克开放。这场冒险没有改变王国的大局，却让他再次证明：即使失去积攒的武器，观察、耐心与临机应变，仍能带他走出困境。' }
    ] }
  ]
};

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
  { hash: '#/map',               label: '03 · MAP',         note: '地图' },
  { hash: '#/compendium',        label: '04 · COMPENDIUM',  note: '海拉鲁图鉴' },
  { hash: '#/compendium/creatures', label: '  · CREATURES', note: '生物' },
  { hash: '#/log',               label: '05 · LOG',         note: '旷野故事' },
  { hash: '#/system',            label: '06 · SYSTEM',      note: '系统' },
  { hash: '#/album',             label: '  · ALBUM',         note: '相册' },
  { hash: '#/standby',           label: '07 · STANDBY',     note: '待机' }
];
