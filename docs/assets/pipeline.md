# 素材管线

## 四层

```
assets/
├── raw/           上游原件，只给 tools/assets 读；按游戏内容分类
│   ├── 01_runes/ 02_ui/ 03_compendium/ 04_equipment/ 05_world/ 06_audio/ 07_fonts/
│   ├── 99_archive/  TOTK、大师模式、他作、各仓库说明（无读者）
│   └── _index/      content_map.csv、import_manifest.json、README.md
├── gen/           生成物，构建与原型直接读，可整目录重跑
│   ├── firmware/  28 张 320×240 / 小物件 PNG，tools/gen/img_to_c.py 的输入
│   └── prototype/ 110 项 Web 导出素材（103 PNG + 7 SVG，含两张停用旧剪影）
├── data/          数据源 JSON（固件只编生成好的 catalog.c）
└── audio/         prototype/ 两段现成 MP3；合成 wav 不入库（gen_synth.py 可重建）
```

`manifest.json` 是固件图源清单，`README.md` 是资产地图（分层、谁读、能否重生成）。

## 25 张管线输入

文件名不随分类调整而改，脚本恢复后按名对名即可指向：

| 数量 | 内容 | 位置 |
|---|---|---|
| 7 | 符文图标 | `raw/01_runes/icons/` |
| 1 | 希卡之眼纹章 | `raw/02_ui/crest/` |
| 5 | 图鉴分类图 | `raw/02_ui/categories/` |
| 11 | 怪物模型渲染 | `raw/03_compendium/models/` |
| 1 | 石板渲染 | `raw/05_world/slate/` |

## 脚本读写

| 脚本 | 读 | 写 |
|---|---|---|
| `tools/gen/gen_assets.py` | 无（程序绘制） | `assets/gen/firmware/` |
| `tools/gen/img_to_c.py` | `assets/gen/firmware/` | `firmware/main/img/*.c` + `img_all.h` |
| `tools/gen/gen_synth.py` | 无（合成） | `assets/audio/*.wav`（不入库） |
| `tools/gen/gen_audio.py` | `assets/audio/*.wav` | `firmware/main/audio/sfx_data.{c,h}`（需先跑 gen_synth） |
| `tools/web/gen_font.mjs` | Hylia Serif TTF | `firmware/main/font/hylia_serif_{16,20,28}.c` |
| `tools/assets/build_real_assets.py` | 25 张管线输入 | `assets/gen/prototype/` |
| `tools/assets/import_compendium_assets.py` | `assets/raw/`、`assets/data/` | `assets/gen/prototype`、`assets/data`、`prototype/js/inventory-data.js` |
| `tools/assets/verify_assets.py` | 全 `assets/` | 无（只读校验） |

`tools/assets/` 下 5 个脚本与 `tools/gen/gen_catalog.py` 目前在 2026-10-28 的清理事故中缺失，
恢复时按 [tools/README.md](../../tools/README.md) 落位。

## 重生成顺序

```bash
python tools/gen/gen_assets.py           # 程序绘制 -> assets/gen/firmware
python tools/assets/build_real_assets.py --originals-only   # 只用 25 张输入覆盖，不改背景/照片
python tools/assets/import_compendium_assets.py             # 图鉴/装备数据与原型素材
python tools/gen/gen_catalog.py          # assets/data/trial_subjects.json -> firmware/main/game/catalog.c
python tools/gen/gen_synth.py            # 合成 14 段玩法 wav -> assets/audio（不入库）
python tools/gen/gen_audio.py            # wav -> firmware/main/audio/sfx_data.c
node   tools/web/gen_font.mjs            # 字体（先 npm --prefix tools/web install）
python tools/gen/img_to_c.py             # assets/gen/firmware -> firmware/main/img/*.c
python tools/assets/verify_assets.py     # 只读校验
```

`img_to_c.py` 缺素材直接报错；`gen_audio.py` 缺 wav 也直接失败，不生成全 NULL 的静音表；
所以 2026-10-28 把合成 wav 移出库后，重跑必须先 `gen_synth.py`。
`svg_to_png.mjs` 仍是硬编码旧路径的留档脚本，未纳入管线。

## 校验与测试

```bash
python tools/assets/verify_assets.py                # 归档哈希 / 28 固件图 / 110 原型素材 / 24 装备 / 25 输入 / raw 零重复
python tools/assets/verify_assets.py --duplicates   # 列出 assets/ 全树同字节分组，人工判断
python tools/assets/verify_assets.py --source-root D:/Project   # 与本地来源逐文件对照
python -m unittest discover -s tests -p test_asset_import.py -v # 素材导入测试（tests/ 待恢复）
```

当前按用户要求不运行自动化测试；以上命令仅作为可选工具，不构成「已通过」的声明。
