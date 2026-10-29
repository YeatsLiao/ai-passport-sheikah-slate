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

工具输入输出与恢复落位统一见 [tools/README.md](../../tools/README.md)；缺失脚本与测试的当前证据见 [R1](../context/RISKS.md#r1)。本文件只维护分层与操作顺序，不复制工具清单。

## 重生成顺序

以下保留既有顺序作为恢复后的操作依据，2026-10-29 本轮未执行。当前不能整段运行：先按 [RUNBOOK](../context/RUNBOOK.md#素材加工与校验) 核对对应脚本、输入、依赖与输出覆盖范围；只有任务授权涉及的步骤才执行。

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
python tools/assets/verify_assets.py --source-root "<本地来源目录>" # 替换占位符后再执行
```

历史素材导入测试记录使用 `python -m unittest discover -s tests -p test_asset_import.py -v`；测试源当前缺失，恢复后的实际位置待核实，不作为可直接运行的步骤。

验证限制以 [项目规则](../../AGENTS.md#验证与授权边界) 为准；以上命令及历史覆盖数量不构成当前「已通过」的声明。
