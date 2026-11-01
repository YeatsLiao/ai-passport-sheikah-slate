# assets 资产地图

2026-11-01 深度重组后的结构。上游原始素材已**外迁归档**到仓库外
（`D:\2.Project\游戏素材\塞尔达\`，原 assets 全量镜像已核验），仓库只保留
**构建资源包与运行原型必需**的部分。

```
assets/
├── audio/
│   ├── botw/               40 段原作音效（需自备，gitignore 投放目录；缺失时资源包生成报错、原型静音）
├── battery/                CW2017 电芯参数记录（manifest.json + 源表）
├── design/                 待机候选设计稿（docs 配图）
├── fonts/                  思源黑体 Medium OTF + OFL 许可（字库源 + 原型运行）
├── reference-sensor-shrine.png  原型感应器页引用（gallery 已拍平）
├── gen/
│   └── offline/            资源包生成输入：standby/sources、sources、manifest.json（resources.bin 产物已忽略）
│   └── prototype/          520 项平铺图池：场景图集、符文、图鉴照片、装备、背景、inventory、感应器参考（原型 IMG() 单行解析，按名引用——刻意平铺）
├── maps/                   botw-map-base.webp（瓦片源）+ 点位数据源 yml/json/html（gen_map_places.py 输入）
├── screenshots/            实机截图（docs 配图；截图工具输出目录 /screenshots/ 仍忽略）
└── ui/                     希卡字符 SVG、按键/分类/纹章、标题 Logo、电量 HUD 参考
```

## 谁读什么

| 位置 | 读者 |
|---|---|
| `gen/prototype/`、`ui/`、`fonts/`、`maps/`、`audio/botw/`、`gen/firmware/offline/` | [build_offline_pack.py](../tools/pack/build_offline_pack.py)（资源包） |
| `gen/prototype/`、`ui/`、`fonts/`、`maps/`、`audio/botw/` | 原型 CSS/JS 相对引用 |
| `battery/` | 电芯参数记录（只读文档） |

## 克隆即有 vs 需自备

- **克隆即有**：上表全部（音效除外）。`python -B tools/pack/build_offline_pack.py` 可直接重建资源包——除音效外所有输入随 git 分发，缺失输入会明确报错（FileNotFoundError / 格式校验）。
- **需自备（版权）**：`audio/botw/` 的 40 段原作 WAV。从外部归档复制，或按 [tools/README 音效导入](../tools/README.md) 从原解包重新生成 `sound-files.js` 映射；缺失时资源包生成明确报错，原型音效静音。
- **外迁件**：raw/03_compendium、raw/06_audio 原包、raw/99_archive、raw/01_runes 与 05_world 其余、旧 data JSON 与 manifest——不再参与构建，需要时从外部归档取回。旧版完整资产地图与操作记录见 git 历史与 [provenance](../docs/assets/provenance.md)。
