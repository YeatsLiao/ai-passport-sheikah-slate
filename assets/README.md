# assets 资产地图

2026-11-01 深度重组后的结构。上游原始素材已**外迁归档**到仓库外
（`D:\2.Project\游戏素材\塞尔达\`，原 assets 全量镜像已核验），仓库只保留
**构建资源包与运行原型必需**的部分。

```
assets/
├── audio/
│   ├── botw/               43 个运行音效 WAV + manifest.json（随仓库提供，约 11.21 MiB）
├── battery/                CW2017 电芯参数记录（manifest.json + 源表）
├── design/                 待机候选设计稿（docs 配图）
├── fonts/                  思源黑体 Medium OTF + OFL 许可（字库源 + 原型运行）
├── reference-sensor-shrine.png  原型感应器页引用（gallery 已拍平）
├── gen/
│   └── offline/            资源包生成输入：standby/sources、sources、manifest.json（resources.bin 产物已忽略）
│   └── prototype/          520 项平铺图池：场景图集、符文、图鉴照片、装备、背景、inventory、感应器参考（原型 IMG() 单行解析，按名引用——刻意平铺）
├── maps/                   botw-map-base.webp（瓦片源）+ 点位数据源 yml/json/html（gen_map_places.py 输入）
├── screenshots/            实机截图 + MANIFEST 编目（docs 配图；工具输出目录 /screenshots/ 仍忽略）
├── ui/standby/             待机设计稿原件与提示词（原 design/）
└── ui/                     希卡字符 SVG、按键/分类/纹章、标题 Logo、电量 HUD 参考
```

## 谁读什么

| 位置 | 读者 |
|---|---|
| `gen/prototype/`、`ui/`、`fonts/`、`maps/`、`audio/botw/`、`gen/firmware/offline/` | [build_offline_pack.py](../tools/pack/build_offline_pack.py)（资源包） |
| `gen/prototype/`、`ui/`、`fonts/`、`maps/`、`audio/botw/` | 原型 CSS/JS 相对引用 |
| `battery/` | 电芯参数记录（只读文档） |

## 随仓库提供与外部归档

- **克隆即有**：当前原型和设备资源生成所需的素材，包含 `audio/botw/` 中 43 个运行音效 WAV 及来源清单；无需访问维护者个人电脑。音效文件按 `prototype/js/sound-files.js` 的映射选取，原文件字节和 SHA-256 保持不变。
- **本地备用**：完整上游音效包、未映射的原始引擎录音和旧增强音效不随仓库提供。manifest 可保留派生源的历史记录，不代表所有上游原料都已入库。更新映射时同步维护 .gitignore 中的音效白名单。
- **资源包**：准备工具所需依赖后，运行 `python -B tools/pack/build_offline_pack.py` 可重建；缺失或损坏输入会明确报错。`resources.bin` 是生成产物，继续忽略。
- **外迁件**：raw/03_compendium、raw/06_audio 原包、raw/99_archive、raw/01_runes 与 05_world 其余、旧 data JSON 与 manifest——不再参与构建，需要时从外部归档取回。旧版完整资产地图与操作记录见 git 历史与 [provenance](../docs/assets/provenance.md)。
