# BotW UI 素材包（未集成）· assets/raw/zeldawiki-ui-pack

> 采集日期：2026-10-28。Zelda Wiki（zeldawiki.wiki，CDN：cdn.wikimg.net）与本地截图裁剪。
> 素材版权归 Nintendo；Zelda Wiki 素材遵循 CC BY-NC-SA 3.0。仅作本地开发/实验用途。
> 本目录是 `raw/` 上游原料层：只归档、不进构建，`prototype/` 与 `assets/gen/` 都不读这里。

## 与管线输入的关系

| 位置 | 定位 | 内容 |
|---|---|---|
| `raw/zeldawiki/`、`raw/zeldawiki-runes/`、`raw/hyrule-compendium/images/icons/` | **管线输入**（只读） | `build_real_assets.py` 与 `import_compendium_assets.py` 实际读取的 25 张原图 |
| `assets/raw/zeldawiki-ui-pack/` | **未集成素材归档**（本目录） | 已下载但页面尚未使用的 UI 素材，将来要用再从 `raw` 取 |

原 `assets/zeldawiki-original/` 曾达 140 个文件，其中 74 个与 `assets/raw/` 已有归档逐字节相同；
2026-10-28 先拆分，随后确认 25 张管线输入在 `raw/` 中全部有同字节副本，直接合并进 `raw/` 并移除该目录。

## 目录清单（104 个文件）

| 目录 | 内容 | 数量 |
|---|---|---|
| `ui/buttons/` | 控制器按键字形 43×40（A/B/L/R/ZL/ZR/+/−/D-Pad/左右摇杆/方向键/Home/Power/水平箭头） | 18 |
| `ui/categories/` | 装备与道具类 wiki 图标（弓/盾/剑/心/星/食物/材料/钥匙/心容器/半心/主线任务） | 11 |
| `ui/symbols/` | 白色希卡之眼 634×585 | 1 |
| `ui/categories_in_game/` | 自 `BotW_Hyrule_Compendium.png` 图鉴页顶栏裁出的游戏内分类字形 60×38 | 5 |
| `ui/reference/` | 自 `assets/raw/maps/botw_map_ui_full.jpg` 裁切的 Runes/Map/Album tab 与整条 topbar | 4 |
| `sheikahtext/` | 希卡文字 SVG 字形（A–Z、0–9、`!`/`？`/`-`、空格、语言图） | 41 |
| `equipment/` | 装备透明图标 144×144 全套，与原型 `eq_*` 一一对应 | 24 |

用途现状：全部**尚未接入原型**。`ui/categories_in_game/` 与 `ui/categories/` 是两套互为备选的图鉴分类字形；`equipment/` 是 starter 装备图之外的第二套渲染，prototype 目前仍用 starter 那套。

## 去重记录

以下文件已在别处有逐字节相同的副本，本包不再保存：

| 文件 | 已有位置 |
|---|---|
| `BotW_Crest_of_the_Sheikah_Symbol.png` | `raw/zeldawiki/sheikahtext/`（管线输入） |
| `BotW_Scope.png`、`BotW_Sheikah_Slate_Icon.png`、`BotW_Sheikah_Slate_Symbol.png` | `raw/zeldawiki/slate/` |
| `heart.png`、`search.png`、`sort.png`、`zeldaicon.png` | `raw/hyrule-compendium/images/icons/` |
| `rune_sheikah_sensor.png`、`rune_master_cycle_zero.png` | `raw/zeldawiki-runes/icons/`（管线输入也在这里） |
| `BotW_Wizzrobe_Concept_Artwork.png` | `raw/zeldawiki/monsters/` |

## 明确缺失项

- **MAP / LOG / SYSTEM / ALBUM 的独立按钮字形**：Zelda Wiki 无此文件（Special:FilePath 探测 20+ 候选名全部 404）；游戏 UI 本身以文字标签呈现。原型顶栏因此使用纯文字。
- **图钉 / 标记（Stamp / Map Pin / Waypoint）**：wiki 无独立文件。
- **Move / Zoom 等操作提示字形**：无独立字形，只能用 `ui/buttons/` 的方向箭头替代。
- **希卡文字 `..`（句点）字形**：Special:FilePath 不接受该文件名，无法取回。

## 重新下载

`python tools/download_botw_ui_icons.py` —— 清单内的 URL、子目录、文件名就是这里的来源记录；脚本已指向本目录，不会写回管线输入区。
