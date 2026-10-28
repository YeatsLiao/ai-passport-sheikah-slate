# 素材来源与许可

## 固件素材

背景、符文图标、互动物体、拍摄目标、爆炸帧由 `tools/gen/gen_assets.py` 程序绘制；
两张场景底图由 ImageGen 生成后离线缩放到 320×240。固件素材**不是游戏解包素材**。

玩法音效为 Python 合成（`tools/gen/gen_synth.py` 产出 wav，`tools/gen/gen_audio.py` 转成 C 数组），不是原版音频。
14 段合成 wav 已在 2026-10-28 作为生成物移出库（`build/_trash/2026-10-28-audio-synth/`），
需要时重跑 `gen_synth.py` 即可重建；固件里已转好的 `sfx_data.c` 保留不变。
Hylia Serif 字体与希卡之眼沿用此前仓库，其来源声明不能证明为原版解包。

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

## 溯源文件

- `assets/raw/_index/import_manifest.json`：三仓库当初的归档清单（源路径、目标路径、SHA-256、来源版本），
  记录的是 2026-10-28 重排**之前**的结构。
- `assets/raw/_index/content_map.csv`：重排的旧→新逐文件映射与哈希。
- `assets/raw/99_archive/sources/`：来源仓库的 README / LICENSE / package.json 原件。
- `assets/manifest.json`：固件图源清单（名称、尺寸、来源）。

代码的 MIT 许可不覆盖 Nintendo 相关素材权利；本项目仅用于学习与展示。
