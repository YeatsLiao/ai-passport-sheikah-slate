# tools 管线

脚本按「改动了什么」分组，都不属于某一端的运行时。仓库根用 `parents[2]` / `../..` 定位，
移动本目录里的脚本要同步改这个层数。

```
tools/
├── assets/     素材入库与校验：raw -> gen、归档、去重检查
├── gen/        生成固件源码：gen -> firmware/main/*.c
├── web/        Node 工具：字体、SVG 栅格化
└── .gitignore  node_modules/
```

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

## gen

| 脚本 | 读 | 写 |
|---|---|---|
| `gen_assets.py` | 无（程序绘制） | `assets/gen/firmware/` |
| `img_to_c.py` | `assets/gen/firmware/` | `firmware/main/img/*.c`、`img_all.h` |
| `gen_synth.py` | 无（合成波形） | `assets/audio/*.wav` |
| `gen_audio.py` | `assets/audio/*.wav` | `firmware/main/audio/sfx_data.{c,h}` |

`gen_catalog.py`（`assets/data/trial_subjects.json` → `firmware/main/game/catalog.c`）的预期恢复位置在本组；状态见 [R1](../docs/context/RISKS.md#r1)。

## web

| 脚本 | 说明 |
|---|---|
| `gen_font.mjs` | Hylia Serif TTF → `firmware/main/font/hylia_serif_{16,20,28}.c`；依赖 `npm --prefix tools/web install` |
| `svg_to_png.mjs` | 原说明记载源/目标为硬编码旧路径，仅作留档；涉及该工具时先核对实际路径，未纳入当前管线 |

## 原型任务数据

[`gen_quest_js.py`](gen_quest_js.py) 读取同目录的三个中文任务源，以及 [`quest_translations_en.json`](quest_translations_en.json)（以精确英文标题关联的英文梗概与地点），生成 [`prototype/js/quest-data.js`](../prototype/js/quest-data.js)。

- [`quest_data_main.py`](quest_data_main.py)：主线 20 条 = 本体 15 + 英杰之诗 5。
- [`quest_data_shrine.py`](quest_data_shrine.py)：神庙挑战 42 条，不是全部神庙地点清单；DLC 神庙试炼包含在英杰之诗任务中。
- [`quest_data_side.py`](quest_data_side.py)：迷你挑战 90 条 = 本体 76 + 剑之试炼 DLC 7 + 英杰之诗 DLC 6 +《异度之刃 2》联动 1。

合计 152 条（本体 133 + DLC 18 + 联动 1）。本体编号 `m1–m15`、`s1–s76` 保持原顺序；追加 `m16–m20`、`s77–s90`，神庙为 `sh1–sh42`。这些是项目路由编号，不是官方任务编号。
源记录的第五字段可选，表示内容包；生成物统一带 `pack`：`base`、`master_trials`、`champions_ballad`、`xenoblade`。未标注的旧记录默认 `base`。新增记录不能重排既有条目，以免破坏链接。

脚本通过自身路径定位仓库，不使用个人设备绝对路径；当前中文数据源为简体，无需安装依赖，可选 `zhconv` 用于繁体转换。从仓库根执行 `python -B tools/gen_quest_js.py` 重新生成，不直接编辑生成物。写入前会校验分类/内容包数量、任务标题与 ID 唯一、英文 JSON 重复键与双语字段完整性；失败不覆盖现有产物。
中文标题尾部 `*` 表示社区译名待官方字形核实，生成时转为代码注释，不显示在页面。来源及梗概边界见 [任务数据来源](../docs/assets/provenance.md#任务数据)。

## 顺序

执行顺序与命令统一见 [素材管线](../docs/assets/pipeline.md#重生成顺序)，前置条件与验证见 [RUNBOOK](../docs/context/RUNBOOK.md#素材加工与校验)。本文件只维护工具职责与读写位置，不作为已执行成功的证明。


## 地图原图下载

`fetch_map_reference.py` 显式下载 ZeldaMods 的无 HUD 原图，不是原型运行依赖。需要现有 Python/Pillow 与 curl；不自动安装。输入为固定公开 URL，输出为 `assets/raw/05_world/maps/botw-map-base.webp`，按已核对的总长度分段下载，在系统临时目录缓存分段；校验长度与 PIL verify 后写入完整原字节，不编辑图像像素。URL 和来源见 [素材记录](../docs/assets/provenance.md#场景与-hud-补件-v4)。仅在需要重新获取素材时从根目录执行 `python -B tools/fetch_map_reference.py`。


## 原型地图点位

`python -B tools/gen_map_places.py` 从 `assets/raw/05_world/maps/locations-game-source.yml` 的 LocationMarker、`location-names-game.json` 和 `location-names-multilingual.html` 中提取命名点位与中英名称，生成 `prototype/js/map-data.js`。只使用有名称的 LocationMarker，按坐标排序；当前 177 条，包含本体神庙 120、塔 15。不会生成克洛格、宝箱或补猜 DLC 坐标。使用已存在的 PyYAML，不自动安装依赖；来源见 [素材记录](../docs/assets/provenance.md#简化全图地点数据)。
