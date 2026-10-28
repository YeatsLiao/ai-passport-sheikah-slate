# assets 资产地图

按「谁读它、能不能重生成」分四层，改动任何一层前先看这张表。

```
assets/
├── raw/         ① 上游原料：通常由生成脚本读，不进固件；地图原图评审直接读取 maps；2026-10-28 起按游戏内容分类
│   ├── 01_runes/        16  符文与能力：7 枚符文图标、Gallery 实机截图 6、符文基底
│   ├── 02_ui/           93  界面件：按键18、分类图5+5、字形17、希卡文字42、纹章、参考条5
│   ├── 03_compendium/  505  图鉴内容：BOTW 图标390、大师模式5、掉落材料34、模型18、艺术图9、截图与参考31、变体18
│   ├── 04_equipment/    35  玩家装备：starter 24 张图标、林克立绘、背包 SVG10
│   ├── 05_world/        23  场景：地图10、石板11、符文基座1、纹理1
│   ├── 06_audio/         2  现成菜单音效（mp3）
│   ├── 07_fonts/         4  Calamity 字体（woff/woff2）
│   ├── 99_archive/     528  非目标与溯源：TOTK 510、大师模式 5、他作 2、各仓库说明 10
│   └── _index/               content_map.csv（旧→新映射+SHA-256）、import_manifest.json
├── gen/         ② 生成物：构建与原型直接读，可整目录重跑
│   ├── firmware/            28 张 320×240 / 小物件 PNG，img_to_c.py 的输入
│   └── prototype/           110 项 Web 导出素材（103 PNG + 7 SVG，含两张停用的旧剪影）
├── data/        ③ 数据源 JSON
├── audio/       ④ 只剩 prototype/ 两段现成MP3（starter 原件）；合成 wav 不入库
└── manifest.json  固件图源清单（名称/尺寸/来源），配 gen/firmware 使用
```

管线输入的 25 张原图（13 图标 + 12 模型）现分布在 `raw/01_runes/icons/`（7 枚符文）、`raw/02_ui/crest/`
（希卡之眼）、`raw/02_ui/categories/`（5 张分类图）、`raw/03_compendium/models/`（模型渲染）与
`raw/05_world/slate/`（石板），具体路径写在 `tools/build_real_assets.py` 的 `ORIGINAL_ICONS` / `ORIGINAL_CUTS`。
文件名一个没改，脚本恢复后按名对名即可重新指向。

> 2026-10-28 清理编译产物时 `tools/` 与 `tests/` 丢失（git 只恢复了被跟踪的部分），下表中“谁读”的脚本
> 在恢复前不可执行；搬迁前每条旧路径都记在 `raw/_index/content_map.csv` 里，可直接据此改路径或回滚。

| 目录 | 谁读 | 能否重生成 | 进固件 |
|---|---|---|---|
| `raw/01_runes/` | `build_real_assets.py`（7 枚符文图标）；Gallery/基底暂无人读 | 否（需重新下载） | 否 |
| `raw/02_ui/` | `build_real_assets.py`（希卡之眼与 5 张分类图）；按键/字形/希卡文字暂未集成 | 否 | 否 |
| `raw/03_compendium/` | `build_real_assets.py`（模型剪影）；390 张 BOTW 图标暂无读者 | 否 | 否 |
| `raw/04_equipment/` | `import_compendium_assets.py`（starter 24 张、林克立绘、背包 SVG） | 可从本地来源再导入，原件保留 | 否 |
| `raw/05_world/` | Web 地图页读取 4 张截图并裁出中部地图；`crop_botw_maps.py`（地图）、`build_real_assets.py`（石板） | 否 | 否 |
| `raw/06_audio/`、`raw/07_fonts/` | `import_compendium_assets.py` 导入到 `audio/prototype/`、`prototype/fonts/` | 是（从 starter 原件导出） | 否 |
| `raw/99_archive/` | 无读者，纯溯源留档（TOTK/大师模式/他作/仓库说明） | 否 | 否 |
| `raw/_index/` | 人工查阅；`verify_assets.py` 读 `import_manifest.json` | manifest 是（`--archive` 模式） | 否 |
| `gen/firmware/` | `tools/img_to_c.py`、`tools/gen_catalog.py` | 是（`gen_assets.py`） | 是（转成 `main/img/*.c`） |
| `gen/prototype/` | `prototype/js/app.js` 的 `IMG()` | 是（见下） | 否 |
| `data/trial_subjects.json` | `tools/gen_catalog.py` | 否（手写） | 是（转成 `catalog.c`） |
| `data/inventory.json` | 校验与原型数据导出 | 是（从归档的静态 items.ts 生成） | 否 |
| `data/compendium_*.json`、`quest_data.json` | 暂无人读，抓取留存 | 否 | 否 |
| `audio/*.wav` | `tools/gen_audio.py`、`prototype/js/app.js` | 是（`gen_synth.py`，2026-10-28 起产物不入库） | 是（转成 `sfx_data.c`，已随固件保留） |
| `audio/prototype/*.mp3` | Web 菜单与装备操作 | 是（从starter原件导出，不重编码） | 否 |
| `prototype/fonts/*.woff2`（仓库根下） | Web HUD文字 | 是（从starter字体原件导出） | 否 |

重新生成：

```bash
python tools/gen_assets.py               # 程序绘制 -> gen/firmware，并写 manifest.json（原 raw/imagegen 已不存在）
python tools/img_to_c.py                 # gen/firmware -> main/img/*.c + img_all.h + images.cmake
python tools/build_real_assets.py        # 旧素材完整生成后，用 raw 里的 25 张管线输入覆盖导出
python tools/build_real_assets.py --originals-only # 仅导出13张真实图标、12张原色模型，不改背景/照片
python tools/import_compendium_assets.py --archive # 首次全量归档；只读同级来源，不生成缩略图
python tools/import_compendium_assets.py # 项目内raw -> 图鉴/装备素材与数据、菜单MP3、HUD字体
python tools/import_compendium_assets.py --link-only # 仅原样导出透明林克立绘
python tools/import_assets.py            # 旧批量导入入口；raw/imagegen 已移除，保留仅为兼容（按 manifest 尺寸归一化）
python tools/verify_assets.py            # 只读检查：归档哈希、装备数据、固件与原型引用、25张管线输入、ui-pack零自重复
python tools/verify_assets.py --duplicates # 附：列出 assets/ 全树同字节分组，人工判断是否该合并
python tools/verify_assets.py --source-root D:/Project # 可选：与本地来源再次逐文件对照
```

约定：

- `gen/prototype/` 原则上只提交原型真正引用的图。两张旧 `sil_*.png` 目前仍留存；地图从 `raw/05_world/maps/` 读取游戏截图，仅裁取中部地图，不再使用剪影或模型贴片。
- 新增固件图必须同时进 `manifest.json`，否则 `img_to_c.py` 会漏掉它。
- 原图全部在 `raw/`，并按游戏内容分为 01_runes…07_fonts 七类，非目标内容（TOTK/大师模式/他作）与各仓库说明统一放在 `99_archive/`。
  2026-10-28 的搬迁旧→新逐文件映射（含 SHA-256）在 `raw/_index/content_map.csv`；字节完全相同的 11 个副本
  （8 张装备图标、古代轴/核心/螺丝、符文基座）已移入 `build/_trash/2026-10-28-raw-dedup/`，`raw/` 内不再有重复内容。
  未集成的 UI 素材在 `raw/02_ui/`，备用装备图标在 `raw/03_compendium/variants/`；API 的全部版本只归档，图鉴仍保留24条示例。归档不是全游戏条目完整性认证。
- `raw/03_compendium/BOTW/` 的 390 张 BOTW 图标尚未按图鉴五类（生物/材料/怪物/装备/宝物）细分：缺离线可用的分类清单，待补，不靠文件名猜。
- 运行时仅使用所需产物：24张图鉴照片、5张分类图标、24张装备缩略图，以及林克立绘与7个SVG（分类/效果/箭头）；全量图片不转成固件 C 数组。
- starter 的 `src/assets/bg.png` 实际为透明林克立绘，不是背景纹理。导出到 `gen/prototype/inventory/bg.png` 时逐字节复制，保留原尺寸及Alpha；Web使用独立图片等比显示，不能再转RGB或拉伸到320×240。该来源没有可替换的全身服装图，当前林克外观固定。
- starter 的 `src/assets/` 全部19个文件已归档。菜单实际使用 `sounds/select.mp3`（移动/返回）和 `sounds/action.mp3`（确认/装备/入口激活），效果图使用water/mountain/fire，翻页使用arrow；其余原件继续留在素材库。
- 现成菜单音效原样导出到 `audio/prototype/`，不变调；未核实游戏原版出处，不能冒称原版提取。其他玩法暂无已确认的替代音源，仍用既有合成wav；这不影响固件音效。
- `--archive` 支持 `--source-root` 或 `BOTW_ASSET_ROOT`；先预检再复制，同内容跳过，异内容冲突失败，不自动删除目标或修改来源。默认生成模式只读项目内素材；分类图固定读 `raw/02_ui/categories/`。
- 原文件名和目录原样保留，包括撇号、加号及 `master_mode-BOTW`；不同游戏同名图不会互相覆盖。清单包含原图、元数据及原仓库的说明/许可文件。
- 来源与许可见仓库根目录 `README.md`「素材来源与权利」。API 代码 MIT；hyrule-compendium 仅 package.json 标注 ISC；starter 未声明许可。代码许可不授权 Nintendo 游戏图片，不随固件或公开发行包分发。

可选校验测试：`python -m unittest discover -s tests -p test_asset_import.py -v`，夹具只写build，不操作真实来源目录。
当前按用户要求不运行自动化测试，也不操作浏览器或截图；仅执行离线素材导出并保持本地服务启动。此前的报告不代表新增图标、音效与首屏排序已验收。

本次原图替换：7张符文图（含圆/方炸弹及未开放的amiibo）、5张图鉴分类图、希卡之眼，以及12张原色模型贴片。11张图标逐字节复制，时停/制冰仅将纯白背景转透明；模型仅处理留白、等比缩小及石板原图的纯色外背景，不重绘主体、不改原色。具体对应关系（已按新结构指向 `raw/01_runes/icons/`、`raw/02_ui/`、`raw/03_compendium/models/`、`raw/05_world/slate/`）在 `build_real_assets.py` 的 `ORIGINAL_ICONS` / `ORIGINAL_CUTS`。

Web不再引用固件绘制的符文与眼形图；无对应图的MAP/LOG/SYSTEM顶部入口使用文字。地图页从 4 张游戏截图中裁出中部地图，放入原有 320×240 石板的地图区域，切图控件也在屏幕内；截图外框、上下菜单与边缘 HUD 不参与显示，原文件不变。地名及中央提示仍属于截图内容，不宣称为可交互控件，详见 `docs/prototype/pages.md`。箱子、闸门、冰柱、炸弹实体及爆炸帧仍保留既有占位，不冒称完成全原版替换；装备图、CODEX照片、相机交互与固件均不变。
