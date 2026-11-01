# tools 管线

每个脚本干什么、归哪组，看下面的分组总览。日常操作只需要根目录两个双击入口。

## 快速入口（双击即用）

| 入口 | 用途 |
|---|---|
| [`screenshot.cmd`](../screenshot.cmd) | 实机截图（保存到 `screenshots/` 并打开），可 `-Port COM4` 指定端口 |
| [`sync-time.cmd`](../sync-time.cmd) | USB 一键校时（电脑 UTC → 设备北京时间） |

两者共用 [`device/serial_connection.ps1`](device/serial_connection.ps1) 做环境与端口发现（找带 pyserial 的 Python、选 ESP 设备），不安装依赖。

## 分组总览

| 组 | 脚本 | 用途 |
|---|---|---|
| **device/ 设备通信** | `capture_screen.py` + `.ps1` | 向设备 USB 控制台要 320×240 截图并存 PNG |
| | `sync_time.py` + `.ps1` | USB 校时协议（握手 → 设置 → 核对回复） |
| | `serial_connection.ps1` | 共用的 Python/pyserial 与端口发现，不单独运行 |
| **资源包** | [`build_offline_pack.py`](pack/build_offline_pack.py) | 生成设备资源包 resources.bin、字库与 data.c（`--fonts` 含字库） |
| | [`export_offline_data.mjs`](pack/export_offline_data.mjs) | 从原型 JS 提取常量数据供上者使用 |
| **数据与译名** | [`gen_compendium_js.py`](compendium/gen_compendium_js.py) + `compendium/cn_*.py` ×4 | 生成图鉴 compendium-data.js（⚠ 见下方风险） |
| | [`gen_quest_js.py`](quest/gen_quest_js.py) + `quest/quest_data_*.py` ×3 | 生成冒险日志 quest-data.js（152 条） |
| | [`gen_map_places.py`](gen_map_places.py) | 生成地图 177 点位 map-data.js |
| | [`import_botw_sfx.py`](import_botw_sfx.py) | 原版 WAV 按清单导入并生成映射 |
| | [`fetch_map_reference.py`](fetch_map_reference.py) | 下载无 HUD 地图原图 |
| **gen/ 遗留管线** | `gen_assets.py` | 程序绘制旧固件图源 PNG（链路已停用，产物仍被原型借用） |
| | `gen_synth.py` | 合成希卡风音效 WAV |
| **web 工具（tools 根）** | `device_svg.mjs` | 原型 SVG 图标 → PNG（资源包使用） |
| | `svg_to_png.mjs` | 通用 SVG → PNG 转换，显式传参 |

## 路径约定

- `tools/*.py` 用 `parents[1]` 定位仓库根；`tools/gen/`、`tools/device/` 深一层（`parents[2]`，.ps1 多套一层 `Split-Path`）。
- **移动任何脚本必须同步改它的根定位层数**；兄弟导入簇要整组搬（cn_*.py ↔ gen_compendium_js.py、quest_data_*.py ↔ gen_quest_js.py、device/ 五件互为兄弟）。
- `build_offline_pack.py` 另外按 `tools/node_modules/lv_font_conv` 与 `tools/web/device_svg.mjs` 定位依赖。

## 数据与译名

### 图鉴（gen_compendium_js.py）

读 `compendium/compendium_all.json`（官方 API 389 条）+ `compendium/cn_*.py` 四个中文名模块 + 大师模式 5 条，生成 `prototype/js/compendium-data.js`。

> ⚠ **当前不可安全再生成**：已提交的 compendium-data.js 含 389 条 `cn_desc` 中文图鉴描述，其数据源不在仓库内（`compendium_all.json` 与 `cn_*.py` 都没有），重跑生成器会全部丢失。先补齐 cn_desc 数据源再重新生成；2026-11-01 曾实测复现此丢失（详见 RISKS）。

### 冒险日志（gen_quest_js.py）

[`gen_quest_js.py`](quest/gen_quest_js.py) 读取同目录三个中文任务源与 [`quest_translations_en.json`](quest/quest_translations_en.json)（以精确英文标题关联的英文梗概与地点），生成 [`prototype/js/quest-data.js`](../prototype/js/quest-data.js)。

- [`quest_data_main.py`](quest_data_main.py)：主线 20 条 = 本体 15 + 英杰之诗 5。
- [`quest_data_shrine.py`](quest_data_shrine.py)：神庙挑战 42 条，不是全部神庙地点清单；DLC 神庙试炼包含在英杰之诗任务中。
- [`quest_data_side.py`](quest_data_side.py)：迷你挑战 90 条 = 本体 76 + 剑之试炼 DLC 7 + 英杰之诗 DLC 6 +《异度之刃 2》联动 1。

合计 152 条（本体 133 + DLC 18 + 联动 1）。本体编号 `m1–m15`、`s1–s76` 保持原顺序；追加 `m16–m20`、`s77–s90`，神庙为 `sh1–sh42`。这些是项目路由编号，不是官方任务编号。
源记录的第五字段可选，表示内容包；生成物统一带 `pack`：`base`、`master_trials`、`champions_ballad`、`xenoblade`。未标注的旧记录默认 `base`。新增记录不能重排既有条目，以免破坏链接。

脚本通过自身路径定位仓库；当前中文数据源为简体，无需安装依赖，可选 `zhconv` 用于繁体转换。从仓库根执行 `python -B tools/quest/gen_quest_js.py` 重新生成，不直接编辑生成物。写入前会校验分类/内容包数量、任务标题与 ID 唯一、英文 JSON 重复键与双语字段完整性；失败不覆盖现有产物。
中文标题尾部 `*` 表示社区译名待官方字形核实，生成时转为代码注释，不显示在页面。来源及梗概边界见 [任务数据来源](../docs/assets/provenance.md#任务数据)。

### 地图点位（gen_map_places.py）

`python -B tools/map/gen_map_places.py` 从 `assets/raw/05_world/maps/locations-game-source.yml` 的 LocationMarker、`location-names-game.json` 和 `location-names-multilingual.html` 提取命名点位与中英名称，生成 `prototype/js/map-data.js`。只使用有名称的 LocationMarker，按坐标排序；当前 177 条（本体神庙 120、塔 15），不生成克洛格、宝箱或补猜 DLC 坐标。使用已有 PyYAML，不自动安装；来源见 [素材记录](../docs/assets/provenance.md#简化全图地点数据)。

### 地图原图下载（fetch_map_reference.py）

`python -B tools/map/fetch_map_reference.py` 下载 ZeldaMods 无 HUD 原图到 `assets/raw/05_world/maps/botw-map-base.webp`。需要现有 Python/Pillow 与 curl，不自动安装；分段下载、校验长度与 PIL verify 后写完整原字节，不编辑像素。URL 与来源见 [素材记录](../docs/assets/provenance.md#场景与-hud-补件-v4)。

### 音效导入（import_botw_sfx.py）

`python -B tools/sfx/import_botw_sfx.py ZIP_OR_EXTRACTED_DIRECTORY` 从用户取得的 BotW 音效 ZIP 或解压目录按明确路径选择 27 段必选与 12 段第二包可选原作 WAV，复制到 `assets/audio/botw/` 并生成来源、字节数与 SHA-256 清单；播放映射写到 `prototype/js/sound-files.js`。存在不同文件时停止，不处理未知文件。第二包缺件路径列在 `botw-rune-sfx-pending.json`；后续导入仍使用合并后的 Miscellaneous 目录。来源见 [音效来源](../docs/assets/provenance.md#botw-原版音效)。

摩托原声增量导入：`python -B tools/sfx/import_motorcycle_sfx.py EXTRACTED_GameROMMotorcycle_DIRECTORY`。输入四段启动/引擎/起跳/落地 WAV 与 MotorcycleEngine_LOOP.txt；输出原字节副本、按原循环点截取的引擎循环 WAV，并合并来源清单与播放映射。若先重跑基础导入器，应随后重跑此增量导入器，最后生成设备资源包。原件不修改，已存在不同字节则停止。

## 资源包（build_offline_pack.py + export_offline_data.mjs）

`python -B tools/pack/build_offline_pack.py --fonts` 使用 `export_offline_data.mjs` 读取原型常量数据，生成设备资源包 resources.bin、394/152/24/177 条数据、固定 12 张相册、10/12/14/16px 双语字库与 28/40/52px 数字字库，不编译不烧录。地图生成三层，照片目标预生成三档；4 张可切换背景取自 `assets/gen/prototype/backgrounds/`。不联网、不装依赖；输出、格式、分区与验证范围见 [V1 实现说明](../docs/hardware/offline-v1.md#资源生成与布局)。只更新图片/音频可省略 `--fonts`；UI 文案或字体字符变化后必须带 `--fonts` 重新生成，app 与 pack 索引 CRC 需匹配。

派生物含 24 件装备的 24/32/44px 三套 RGB565A8 透明图、320×198 场景与原型效果；`web/device_svg.mjs` 用现有 @resvg/resvg-js 转换 SVG 图标。声音映射从原型 `sound-files.js` 与 `sound.js` 的 `SFX_FILES` 字典提取，含显式覆盖。待机画布输入为 `assets/gen/firmware/offline/standby/sources/E.png`～`I.png` 无字背景（J 由固件绘制），来源提示词见同目录上级 `provenance.json`。

## 设备通信：USB 校时与截图

**校时**：双击 [sync-time.cmd](../sync-time.cmd)，或 `python tools/device/sync_time.py --port COM4`。先握手，再核对带随机标识的设置成功回复；不联网、不复位、不烧录。需关闭其他串口工具；协议与断电限制见 [设备校时](../docs/hardware/offline-v1.md#usb-一键校时)。

**截图**：双击 [screenshot.cmd](../screenshot.cmd)，或 `python tools/device/capture_screen.py --port COM4`。向设备 USB 控制台发送截图命令，接收 RGB565 像素存 PNG，成功保存到根目录 `screenshots/` 并打开；不覆盖已有文件。2026-10-31 起先发 `SLATE_SCREENSHOT_PING` 核对就绪回复（启动日志应含 `USB ready: FAP_SCREENSHOT_V1 + screenshot`）；设备须烧录带 USB 驱动修复的固件，电脑端修改不能修复旧固件。用法与限制见 [设备截图](../docs/hardware/offline-v1.md#usb-截图)。

## assets（当前缺脚本，待恢复）

| 脚本 | 做什么 | 读 | 写 |
|---|---|---|---|
| `build_real_assets.py` | 25 张管线输入 → 原型贴片；`--originals-only` 只导 13 图标 + 12 模型 | `assets/raw/01_runes|02_ui|03_compendium|05_world` | `assets/gen/prototype/` |
| `import_compendium_assets.py` | `--archive` 全量归档；默认从 raw 生成图鉴/装备素材与数据 | `assets/raw/04_equipment` 等 | `assets/gen/prototype`、`assets/data`、`prototype/js` |
| `import_assets.py` | 自备图按 manifest 尺寸归一化（原 `raw/imagegen` 已移除） | `assets/manifest.json` | `assets/gen/firmware/` |
| `crop_botw_maps.py` | 地图去 UI 裁切 | `assets/raw/05_world/maps/` | 同名目录 |
| `verify_assets.py` | 只读校验：归档哈希、28 固件图、110 原型素材、24 装备、25 管线输入、raw 零重复 | 全 `assets/` | 无 |

> 上表保留恢复落位和输入输出约定；当前缺失证据与保护措施统一见 [R1](../docs/context/RISKS.md#r1)。
> 仅在恢复和追溯路径时查 `assets/raw/_index/content_map.csv`，不默认读取。

## gen / web

| 脚本 | 读 | 写 |
|---|---|---|
| `gen/gen_assets.py` | 无（程序绘制） | `assets/gen/firmware/`（顶层图源 PNG；原型借用，旧固件转换链路已停用） |
| `gen/gen_synth.py` | 无（合成波形） | `assets/audio/*.wav` |

旧固件 C 数组生成器 `img_to_c.py`、`gen_audio.py`（及 web 组的 `gen_font.mjs`、未恢复的 `gen_catalog.py`）已随 2026-10-31 死代码清理删除（tag `firmware-legacy`）。

| web 脚本 | 说明 |
|---|---|
| `device_svg.mjs` | 原型 SVG 图标 → PNG，供资源包使用 |
| `svg_to_png.mjs` | 独立转换工具，显式传入输入/输出目录，不参与原型运行 |

## 顺序

执行顺序与命令统一见 [素材管线](../docs/assets/pipeline.md#重生成顺序)，前置条件与验证见 [RUNBOOK](../docs/context/RUNBOOK.md#素材加工与校验)。本文件只维护工具职责与读写位置，不作为已执行成功的证明。
