# 素材来源与许可

## 固件素材

背景、符文图标、互动物体、拍摄目标、爆炸帧由 `tools/gen/gen_assets.py` 程序绘制；
两张场景底图由 ImageGen 生成后离线缩放到 320×240。固件素材**不是游戏解包素材**。

玩法音效为 Python 合成（`tools/gen/gen_synth.py` 产出 wav，`tools/gen/gen_audio.py` 转成 C 数组），不是原版音频。
14 段合成 wav 已在 2026-10-28 作为生成物移出库（`build/_trash/2026-10-28-audio-synth/`），
需要时重跑 `gen_synth.py` 即可重建；固件里已转好的 `sfx_data.c` 保留不变。
Hylia Serif 字体与希卡之眼沿用此前仓库，其来源声明不能证明为原版解包。

## 中文字体

2026-10-29：按用户要求统一原型所有可排版中文，采用 Adobe 思源黑体简体中文 Medium（Source Han Sans SC Medium，字体内版本 2.005），作为贴近《旷野之息》正文黑体观感的替代；不是游戏提取或已核实的实机同款字体。英文继续沿用 Hylia Serif；图片内的文字不参与字体替换。

- [Adobe 官方字体原件](https://github.com/adobe-fonts/source-han-sans/blob/release/OTF/SimplifiedChinese/SourceHanSansSC-Medium.otf)保存于 `assets/raw/07_fonts/SourceHanSansSC-Medium.otf`，不裁剪字形，原型 CSS 直接引用。
- [官方许可证](https://github.com/adobe-fonts/source-han-sans/blob/release/LICENSE.txt)为 SIL OFL 1.1，本地副本为 `assets/raw/07_fonts/SourceHanSans-LICENSE.txt`；分发该字体时须保留版权与许可声明。
- 参考[中文排版分析](https://www.gcores.com/articles/121967)：游戏地名标题与正文存在不同字体处理；本原型按用户要求统一中文，采用同一 Medium 黑体，不将综艺体扩展到小字号正文。
- 静态字形核对：原型 13 个 HTML/CSS/JS 文件包含的 1,878 个不同汉字及中日韩标点均有对应字形；这不等同于浏览器加载、排版或用户验收。完整字体约 16.5 MB，首次加载仍可能短暂显示后备字体。

## Web 原型素材

原型使用 `assets/raw/` 派生的 `assets/gen/prototype/`，由 `tools/assets/build_real_assets.py` 加工。
该目录仅存在于本机，不应随固件或发行包分发。

| 仓库（与本项目同级目录） | 许可 | 取用内容 | 归档与用途 |
|---|---|---|---|
| `Hyrule-Compendium-API` | 代码 MIT | 整个 `images/`：BotW 390、TotK 510、大师模式 5 张 PNG | 归档 907 个文件；运行时仅选 24 张 BotW 图鉴照片 |
| `hyrule-compendium` | 仅 package.json 标注 ISC | 整个 `images/` 的 12 张辅助图片 | 归档 14 个文件；运行时取 5 张分类图标 |
| `zelda-botw-starter` | 未声明 | `public/items/`、`src/assets/`、`src/data/items*.ts` | 归档 47 个文件；运行时用 24 件装备、林克立绘、7 个 SVG、字体、2 段菜单音效 |
| `react-sheikah-ui` | MIT | 无游戏素材 | 仅作 UI 参考，脚本未读取 |
| Zelda Wiki（UI 包） | CC BY-NC-SA 3.0 | 按键、分类、字形、希卡文字等界面件 | `assets/raw/02_ui/`，多数尚未接入原型 |

- 菜单用的 `select.mp3` / `action.mp3` 来自 starter，该仓库没有提供独立作者、游戏提取出处或授权说明，
  因此只标为「第三方现成音效」，不冒称已核实的原版音频。
- Calamity HUD 字体同样来自 starter（未声明许可），运行副本位于 `prototype/fonts/`，未编译进固件。
- `assets/raw/03_compendium/variants/`：16 张是同一批装备的非 starter 版本（144px），另 2 张是
  Chuchu 的 Model_2/Model_3，均留作备用。
- 字节重复的副本未重复保存，见 `assets/raw/_index/content_map.csv` 中 `action=byte-identical` 的 12 行。

## 图鉴数据

- 条目编号取自 Hyrule-Compendium-API 的 BOTW 分类数据，与游戏内图鉴编号一致
  （生物 83 + 怪物 81 + 材料 36 + 装备 185 + 宝物 4 = 389 条）。
- 原型每类只收录 5 条（宝物 4 条），分类进度写的是真实总数，列表页脚注明「仅收录代表性条目」。
- `zelda-botw-starter` 没有海利亚盾的透明图标，该条目回落为图鉴照片。
- 共归档 968 个文件、约 100.07 MiB；文件数量不等于图鉴条目数量。TotK 与大师模式仅归档，
  海拉鲁图鉴保持现有 24 条示例；归档不等于全游戏条目完整性认证。

## 任务数据

2026-10-29 核对范围：BotW 冒险日志的本体、两弹 DLC 与《异度之刃 2》联动任务清单，不包含克洛格收集、独立神庙地点或 amiibo 掉落清单。

- 主线名称与 DLC 分类：[Zelda Wiki 主线清单](https://zeldawiki.wiki/wiki/Main_Quests_in_Breath_of_the_Wild)。
- 迷你挑战与两弹 DLC：[Zelda Wiki 迷你挑战清单](https://zeldawiki.wiki/wiki/Side_Quests_in_Breath_of_the_Wild)；联动的触发条件、红色流星方向和标题见 [联动任务](https://zeldawiki.wiki/wiki/Xenoblade_Chronicles_2)。
- 神庙挑战英文名称与目标：[Zelda Central](https://zeldacentral.com/games/breath-of-the-wild/shrine-quests/)；中文攻略译名参考 [17173 收录的清单](https://news.17173.com/z/zeldabotw/content/01102023/135006330.shtml)。
- 既有中文名沿用数据源中的 Zelda Wiki 译名记录；新增神庙和 DLC 中文名采用社区译名，尚未逐条核对官方字形，以源记录尾部 `*` 和生成代码注释注明。不能据此宣称全部标题已获官方确认。
- 中英文梗概为项目自行概述与翻译，不复制游戏任务日志。标题及游戏相关内容的权利不因代码许可而改变。

数量、稳定编号与生成流程统一见 [原型任务数据](../../tools/README.md#原型任务数据)。此次扩充仅接入 HTML 原型，未修改固件任务实现。

## 溯源文件

- `assets/raw/_index/import_manifest.json`：三仓库当初的归档清单（源路径、目标路径、SHA-256、来源版本），
  记录的是 2026-10-28 重排**之前**的结构。
- `assets/raw/_index/content_map.csv`：重排的旧→新逐文件映射与哈希。
- `assets/raw/99_archive/sources/`：来源仓库的 README / LICENSE / package.json 原件。
- `assets/manifest.json`：固件图源清单（名称、尺寸、来源）。

代码的 MIT 许可不覆盖 Nintendo 相关素材权利；本项目仅用于学习与展示。

## 原型能力位图图集

2026-10-29，经用户明确允许生成塞尔达风格缺失素材，使用 imagegen 生成 `assets/gen/prototype/ability-atlas-v1.png`，带透明背景，4 列 × 2 行。
依次为圆炸弹、方炸弹、金属箱、石块、冰柱、古代摩托、宝箱、爆炸效果。通过 CSS 图集定位展示，没有改动八项能力的既有背景图。
这是为本项目生成的风格素材，不是 Nintendo 原作提取，也不声明其与实机物件完全一致。原作符文图标及既有背景继续使用原文件。

## 待机标题与电量素材

2026-10-29 按用户纠正，待机页停用生成的 `battery-sheikah-v1.png`，不再猜测生成电量图标。旧文件保留，当前页面不引用。

- `assets/raw/02_ui/totk_battery_hud_reference.jpg`：来自 [Gaming Reinvented 的实机预览报道](https://gamingreinvented.com/news/tears-of-the-kingdom-previews-reveal-tons-of-new-info/)，[原截图](https://gamingreinvented.com/wp-content/uploads/2023/04/BatteryIcons.jpg)。CSS 仅取画面中的三格能量槽显示，不重画，不修改下载原文件；当前取样框为原图 [149,185,52,27]，显示 17×9，排除外层灰色截图底框。该 HUD 来自《王国之泪》，按用户提供的电池参考用于本原型；不是《旷野之息》原生电量 HUD。
- `assets/raw/02_ui/BotW_English_Logo.png`：来自 [Zelda Wiki 英文标题文件页](https://zeldawiki.wiki/wiki/File:BotW_English_Logo.png)，文件历史记录来自 E3 Press Kit 后经社区透明处理、缩小；不声明当前文件是未加工原版提取。
- `assets/raw/02_ui/BotW_Simplified_Chinese_Logo.png`：来自 [Zelda Wiki 简体中文标题文件页](https://zeldawiki.wiki/wiki/File:BotW_Simplified_Chinese_Logo.png)，页面注明由繁体标题和视频重建，由 Htwretched 获取并提供给 Zelda Wiki；保留此署名，不声明为官方简体源文件。

中英文标题随语言切换，保留希卡背景与时钟。上述均为有出处的现有图像，非本项目生成图；版权仍属于原权利人，归档不等于公开发行授权。

## 磁力铁板

2026-10-29，用户选择将磁力玩法改为搬铁板搭桥。使用 imagegen 以现有原作截图 `assets/raw/01_runes/gallery/gallery_magnesis_effect.png` 为参考，生成透明铁板位图 `assets/gen/prototype/magnesis-bridge-v1.png`，保留暗铁材质、浮雕纹理与斜视板面。该图为参考生成，不冒称原作提取；未改动磁力原背景。

## 九项符文场景与透明物件 v2

2026-10-29，用户明确要求全部符文重新参考实机生图，替代截图拼贴和带底色图鉴贴片；此项授权替代先前“保留符文原背景”的限制，不改变其他页面背景。

- `assets/gen/prototype/rune-environments-v2.png`：九场景图集，3×3，顺序为圆弹、方弹、磁力、时停、制冰、相机、摩托、amiibo、感应器。imagegen 参考原作磁力截图及神庙实机截图生成；显示时略缩小各格取样范围，避开生成图的白色分隔线，不修改源图。
- `assets/gen/prototype/rune-sprites-v2.png`：4×4 RGBA 透明物件图集，包含炸弹、铁板、石块、冰柱、带骑手摩托、开/关宝箱、五个拍摄目标、补给、林克与神庙。生成后核对具备透明通道，按格显示，不再把有底色的图鉴缩略图当场景物件。
- 原作参考：既有 `assets/raw/01_runes/gallery/gallery_magnesis_effect.png`；新增 `reference_sensor_shrine.png` 来源为 [Zelda Wiki Namika Ozz Shrine 文件页](https://zeldawiki.wiki/wiki/File:BotW_Namika_Ozz_Shrine.png)，[原图](https://cdn.wikimg.net/en/zeldawiki/images/c/ca/BotW_Namika_Ozz_Shrine.png)。amiibo 掉落构图另查阅 [Nintendo Life 实机报道](https://www.nintendolife.com/news/2016/12/the_legend_of_zelda_30th_anniversary_amiibo_provide_food_and_goodies_in_breath_of_the_wild)，其图片下载返回 403，未保存，也未作为 imagegen 文件输入。

两张图集为参考生成素材，不冒称原作提取。旧图未删除。原首轮并行生成请求未取得结果，之后串行重试取得上述实际文件。渲染映射统一在 `prototype/js/rune-art.js`，仅文件存在并完成静态核对后启用；未做浏览器截图或运行验收。

## 冰柱与林克独立透明素材 v3

2026-10-29，用户指出制冰画面冰柱旁和林克周围存在杂边。核对 v2 图集后，发现冰柱格混入摩托边缘、林克格混入邻近神庙，固定格位取样会显示残片。
使用 imagegen 以原 v2 图集为参考分别隔离并清理单一主体，新增 `cryonis-pillar-clean-v3.png` 与 `link-side-clean-v3.png`，原图集保留。
`rune-art.js` 中格位 4/14 改用上述独立 PNG，按主体边界及脚底比例显示，并以同图 alpha 遮罩抑制淡色边缘。这里只读测量 alpha，不用脚本修改图片像素；未改变关卡规则。

## 宝箱与补给取样边界修正

2026-10-29，用户指出 amiibo 宝箱旁残片。只读检查 alpha 连通区域确认 v2 闭箱格左侧混入摩托残片；在 `rune-art.js` 为闭箱、开箱、苹果补给限定主体取样区域，以 CSS clip-path 排除邻格内容。保留 PNG 原文件、显示大小和动画锚点，不重新生成或修改图片像素。


## 场景与 HUD 补件 v4

2026-10-29，用户在全原型排查后授权执行。使用内置 imagegen（非 CLI），生成并保存三张 RGBA 位图，原有已认可背景、冰柱和林克保留。生成图不是原作提取。

- `assets/gen/prototype/rune-world-kit-v4.png`：石质岸台、磁力桥台、机关门、高台、草土地面、终点装置、水花和静止器箭头。参考 `assets/raw/01_runes/gallery/gallery_magnesis_effect.png` 的实机材质与机关。
- `assets/gen/prototype/rune-effects-v4.png`：四阶段炸弹爆炸、召唤光柱、落地阴影、希卡激活波纹、奖励光效；参考同一实机截图的能量颜色和画面风格。
- `assets/gen/prototype/slate-hud-kit-v4.png`：用户已明确否决，当前原型零引用；恢复此前界面样式。生成内容原为按钮、面板、选中角标、取景框、精力环、装备/加成图标、地图图标、信号。另参考 `assets/raw/02_ui/reference/topbar_ingame.png`。这是参考生成的统一组件，不冒称逐像素复刻原生 HUD。
- 三图通过实际源区域取样，保留 PNG alpha，不用脚本编辑像素；排版、点击、物理判定和动画时钟仍由代码负责。旧 SVG 与样式未清理，装备图标已按用户要求全部恢复原引用，地图图标使用既有游戏 PNG；HUD 图集不启用。
- 最终提示词与组件顺序见 [v4 提示词](../../tools/rune-art-v4-prompts.md)。

地图底图 `assets/raw/05_world/maps/botw-map-base.webp` 来自 [ZeldaMods Object Map](https://objmap.zeldamods.org/) 的 [base.png 资源](https://objmap.zeldamods.org/game_files/maptex/base.png)：服务器实际返回 WebP，保存时使用真实格式扩展名，3000×2500、1,204,518 字节，未编辑像素。分段下载后通过 PIL verify 完整校验；下载方法见 [工具说明](../../tools/README.md#地图原图下载)。

地点坐标原料 `assets/raw/05_world/maps/locations-game-source.yml` 来自 [leoetlino/botw 的 Static.mubin.yml](https://github.com/leoetlino/botw/blob/master/Map/MainField/Static.mubin.yml)。首版使用 LocationMarker 中 StartPoint、Tower07、Dungeon038/041/009/065/079 的 X/Z 坐标；底图与坐标按 Object Map 的 ±6000 X、±5000 Z 范围映射。地点中文名沿用社区译名，不声明已核对官方字形。

原图和游戏内容权利仍属于原权利人；当前仅原型展示，未提交、推送或发布。


### v2 图集取样修正

用户截图显示磁力铁板串入邻格、摄影目标下方残片。当前为全部在用 v2 主体定义实际源矩形，保留原文件，只调整 CSS 取样、边界裁切与同图 alpha 遮罩；不把固定四等分格位视为主体边界。磁力每帧不再重置背景位置。道路仍引用 v4 游戏参考纹理，仅细化几何片段以改善接缝；地图原游戏 PNG 图标明确限制尺寸。未新生图或编辑图片像素，未做浏览器截图。


## 简化全图地点数据

2026-10-29 用户要求取消复杂地图操作。底图与坐标仍用前述游戏原图和 Static.mubin；地点全量显示当前原料中的 177 个命名主要点位，含本体神庙 120、希卡塔 15，不把此数量宣称为包含全部 DLC、克洛格和宝箱的全游戏点位。

- `location-names-game.json`：来自 [ZeldaMods LocationMarker 文本资源](https://objmap.zeldamods.org/game_files/text/StaticMsg/LocationMarker.json)，原游戏英文名称。
- `location-names-multilingual.html`：来自 [BotW Text Dump / StaticMsg](https://sh0wer1ee.github.io/BotwText/page/StaticMsg.html)，按 MessageID 提取 CNzh/USen 地点名称；仅作为游戏文本转储来源，不把社区站点当作 Nintendo 官方发布。
- 生成脚本只连接原始地点 ID、坐标与中英名称，177 条均具备中文名，未编造位置。网页只展示名称、类别、坐标，不复制大段游戏文本。


## BotW 原版音效

2026-10-29 用户提供已解压的 `assets/raw/06_audio/Miscellaneous/`。来源为 [The Sounds Resource / Switch BotW Miscellaneous Sounds](https://sounds.spriters-resource.com/nintendo_switch/thelegendofzeldabreathofthewild/asset/405753/)，页面上传者 Random Talking Bush；命令行下载曾返回 403 人机验证，随后使用用户手动取得的文件，未绕过网站验证。

已执行 `python -B tools/import_botw_sfx.py assets/raw/06_audio/Miscellaneous`，选择复制 39 段游戏 WAV 到 `assets/audio/prototype/botw/`，原文件保留，不剪辑、不合成、不修改字节。`manifest.json` 保存来源页面、包内路径、事件候选名、字节数和 SHA-256。当前导入总计 11,264,692 字节，均为 48kHz PCM；启动音为 6 声道，其余为单/双声道。核对 RIFF/WAVE、PCM 参数与源复制 SHA-256，不代表已经试听或完成浏览器播放验收。

`prototype/js/sound.js` 接入菜单光标、背包选择、确认/取消、石板开关、装备/卸下、相机、感应器、制冰、amiibo、完成提示及原炸弹出现/爆炸。语义映射依据原始文件名，为原型事件适配，不宣称时机、混音及音量已逐项复刻实机。连续选择限频 85ms、最多六路播放，音量/静音跟随设置，静音或窗口失焦会停止正在播放的声音。旧 starter MP3 与缺失的合成 WAV 映射已停用，不修改固件音频。

物品展示阶段新增第一包 `GetItemSound/SYS_ItemGet_Common.wav`；收取使用 UI 确认音。删除宝箱落地时误用的确认音，移除磁力/静止器的通用锁定替代。未取得的实体音效保持静默，不伪造替代音。

游戏音频的权利仍属于原权利人，资源站可下载不等于公开分发授权。


### 磁力与静止器专用音效补齐进度

已进一步核对：现有第一包 `ExpressionSound/BitaLock_Timer03.wav` 是静止器倒计时音，已原字节导入，最后约 1.683 秒触发，暂停或提前解除会停止；未试听确认混音。

磁力的 SE_MagneCatch_Catch/Moving/Stop/Disappear、静止器 Bitalock_Start_02/Hit_06/End_06/07/08、木质宝箱 TboxFieldWood_Open，以及碎冰 IceMakerBlock_Crush，已在 [Miscellaneous Sounds (2 / 3)](https://sounds.spriters-resource.com/nintendo_switch/thelegendofzeldabreathofthewild/asset/405754/) 文件清单确认。用户已提供第二包，以上 12 段全部原字节导入并接入动作：木质宝箱开盖、碎冰、磁力抓取/移动/停手/解除、静止器启动/逐次击打/第六下满蓄力/分三档释放。磁力移动音循环播放，停手、暂停、返回、重试及失焦时停止。导入状态见 `tools/botw-rune-sfx-pending.json`（保留原路径作为清单）。宝箱落地、摩托实体声音尚未确认对应源文件，未伪造替代。

导入器对第二包明确路径作可选识别；将第二包合并到原 Miscellaneous 目录后重新运行导入命令。脚本生成 `prototype/js/sound-files.js`，仅收录本次确实导入的文件，HTML 先加载该映射再加载播放器，兼容 file:// 打开。暂停、返回与重试停止磁力移动/静止器倒计时；隐藏页面停止所有播放。未进行自动化测试或浏览器试听。

### 磁力关重构素材 v5

2026-10-29 用户确认重做磁力关构图与交互。使用 imagegen，以仓库现有实机截图 `assets/gen/prototype/rune_scene_magnet.png` 为游戏材质参考，生成 `magnet-shrine-side-v5.png`（两岸整合的神庙场景）与 `magnet-metal-plate-v5.png`（透明横向铁板，另参考新场景视角）。这两张是参考游戏生成的素材，不是实机原图；原图保留。透明 PNG 原字节保存，仅运行时限定采样范围并叠加同图 alpha 掩膜抑制半透明边缘。替换范围仅磁力关；场景直接使用 PNG，未以 SVG/CSS 绘制桥岸和铁板。

2026-10-30 完成音可听度修正：原 Sys_Challenge_Complete.wav 峰值为 1691/32768；保留原件，生成 Sys_Challenge_Complete-audible.wav 播放副本，16-bit PCM 每个样本乘 10，声道/采样率/时长不变，无削波（峰值 16910）。只切换完成声映射，完成时停止其他音效。未浏览器试听。
