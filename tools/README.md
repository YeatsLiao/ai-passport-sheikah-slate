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

> 这 5 个脚本在 2026-10-28 清理事故中丢失，恢复时按上表落到 `tools/assets/`；
> 路径以 `assets/raw/_index/content_map.csv` 为准。

## gen

| 脚本 | 读 | 写 |
|---|---|---|
| `gen_assets.py` | 无（程序绘制） | `assets/gen/firmware/` |
| `img_to_c.py` | `assets/gen/firmware/` | `firmware/main/img/*.c`、`img_all.h` |
| `gen_synth.py` | 无（合成波形） | `assets/audio/*.wav` |
| `gen_audio.py` | `assets/audio/*.wav` | `firmware/main/audio/sfx_data.{c,h}` |

`gen_catalog.py`（`assets/data/trial_subjects.json` → `firmware/main/game/catalog.c`）同样属于本组，目前也待恢复。

## web

| 脚本 | 说明 |
|---|---|
| `gen_font.mjs` | Hylia Serif TTF → `firmware/main/font/hylia_serif_{16,20,28}.c`；依赖 `npm --prefix tools/web install` |
| `svg_to_png.mjs` | 早期栅格化脚本，源/目标仍是硬编码的 `D:\2.Project\...` 旧路径，仅作留档，未纳入当前管线 |

## 顺序

素材侧：`gen_assets` → `build_real_assets` → `import_compendium_assets` → `verify_assets`。
固件侧：`gen_catalog` / `gen_audio` / `gen_font` → `img_to_c`。
原型侧：`import_compendium_assets` 同时刷新 `prototype/js/inventory-data.js` 与数据 JSON。
