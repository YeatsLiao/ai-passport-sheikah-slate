# raw 索引与溯源

`assets/raw/` 自 2026-10-28 起不再按「素材来自哪个仓库」分类，改为按**游戏里的内容**分类。
来源信息没有丢，全部落在这里。同日 `03_compendium` 二次拍平：`materials`/`monsters`/`_reference`/`_variants`
四个目录合并为同级用途目录，旧→新见 `compendium_map.csv`。

## 目录约定

| 目录 | 装什么 | 文件数 |
|---|---|---|
| `01_runes/` | 符文与能力：7 枚符文图标、Gallery 实机截图、符文基底 | 16 |
| `02_ui/` | 界面件：按键字形、分类图（原始/实机）、字形、希卡文字、希卡之眼纹章、参考条 | 93 |
| `03_compendium/` | 图鉴内容：BOTW 图标 390、大师模式 5、掉落材料 34、怪物模型 18、艺术图 9、截图与参考 31、变体 18 | 505 |
| `04_equipment/` | 玩家装备：starter 24 张图标、林克立绘、背包 SVG 10 | 35 |
| `05_world/` | 场景：地图 10、石板渲染 11、符文基座 1、纹理 1 | 23 |
| `06_audio/` | 现成菜单音效 mp3 | 2 |
| `07_fonts/` | Calamity 字体 woff/woff2 | 4 |
| `99_archive/` | 非目标与溯源：TOTK 510、大师模式 5、他作 2、各仓库 README/LICENSE/package.json/data | 528 |
| `_index/` | 本文件、`content_map.csv`、`compendium_map.csv`、`import_manifest.json` | 4 |

## 索引文件

- `content_map.csv`：1215 行，`old_path,new_path,sha256,action`。搬迁前每条路径都能查到去向，
  并附 SHA-256；`action=byte-identical` 的 12 行表示该副本已移入
  `build/_trash/2026-10-28-raw-dedup/`（保留原目录层级）。
- `import_manifest.json`：三个上游仓库当初的归档清单（源路径、目标路径、SHA-256、来源仓库），
  记录的是**搬迁前**的 `raw/` 结构，作为历史凭据保留，不再与当前目录一一对应。
- `compendium_map.csv`：110 行，`03_compendium` 二次拍平的旧→新映射与 SHA-256；`04_equipment/_variants`
  也是在这次合并进 `03_compendium/variants/` 的。

## 回滚

```powershell
# 逐条按 new_path -> old_path 移回（byte-identical 的从 trash 取回）
python build/_rollback_raw.py --dry-run
python build/_rollback_raw.py
```

回滚脚本按 `content_map.csv` 反向执行，不改字节。

## 已知待办

1. `03_compendium/BOTW/` 的 390 张 BOTW 图标还没按图鉴五类（生物/材料/怪物/装备/宝物）细分。
   离线没有可用的分类清单，需要补一份后再拆，不靠文件名猜。
2. 管线输入的 25 张原图（13 图标 + 12 模型）文件名未改，脚本恢复后按名对名即可重新指向。
3. 多版本取舍：`03_compendium/variants/` 里是 Chuchu 的 Model_2/Model_3（2 张）与非 starter 的
   144px 装备图标（16 张）；确认不再需要后再清理。
