# 架构

本文件沿用为 MAP，负责目录、配置与运行位置；定位修改或运行对象时按需读取，映射变化时更新。
五个域，按「谁生产、谁消费」切分；依赖方向单向，不允许回指。以下为既有目标分层约定，不等于本轮已逐一验证所有资源引用。

```
assets/raw ──tools/assets──> assets/gen ──> firmware/main/img/*.c   （编译期）
                                    └────> prototype/               （运行时相对读取）

firmware/    硬件开发：ESP-IDF 工程，唯一能跑 idf.py 的地方
prototype/   模拟页面开发：纯静态站，无构建
assets/      素材：raw → gen → data/audio 四层
tools/       管线：把 raw 变成 gen，把 gen 变成固件 C 源码
docs/        文档：不参与构建
```

## 目录

```
firmware/
├── CMakeLists.txt         项目根（project + EXTRA_COMPONENT_DIRS components）
├── sdkconfig.defaults     配置基线；sdkconfig 为生成物
├── partitions.csv         factory 0x10000 / 4 MB
├── main/                  main.c、slate_app、game_view、page_*、game/、audio/、font/、img/
├── components/bsp/        板级驱动：屏、三键 ADC、I2C、电池、音频
├── tests/                 预期恢复位置；当前缺失状态见 context/RISKS.md
├── managed_components/    组件管理器下载物（生成物）
└── build/                 当前工程的生成目录；不假定旧根缓存已迁入或仍可用

prototype/                 index.html + css/ + js/ + fonts/，无 node_modules
assets/                    raw/ gen/ data/ audio/ manifest.json README.md
tools/
├── assets/                入库与校验（当前 5 个脚本待恢复）
├── gen/                   gen_assets、img_to_c、gen_synth、gen_audio
└── web/                   gen_font、svg_to_png（Node）
docs/                      README（任务索引）、architecture（映射）、context/、原有专题与历史日志
```

## 边界规则

1. **顶层级不加数字前缀**：`firmware`、`prototype`、`assets`、`tools`、`docs` 都是工具链按惯例找根的名字
   （ESP-IDF 找 `CMakeLists.txt`、静态站找 `index.html`）。数字前缀只留给排序有意义的层，如 `assets/raw/01_runes…`。
2. **生成物不入库**：`firmware/build/`、`firmware/managed_components/`、`firmware/sdkconfig`、
   `firmware/dependencies.lock`、`.build-tools/`（本地 lvgl 与 python 缓存，未入库）。
3. **既有素材边界约定**：固件只读 `assets/gen`，不读 `assets/raw`；`raw` 只给 `tools/assets` 读。原型同理，通过
   `../assets/gen/...` 与 `../assets/audio/...` 取资源。地图文档另有 raw 直读记载，实际引用及是否需要调整约定待核实，见 [R3](context/RISKS.md#r3)；本轮不据此改变约定。
4. **素材只增不改名**：分类调整靠 `assets/raw/_index/content_map.csv` 留痕，重生成永远从 `raw` 出发。
5. **文档单一事实**：行为说明保留在专题；根 README 仅作用途与使用导航，职责分配见 [文档索引](README.md)。

## 版本配置与运行位置

2026-10-29 核验范围：下列工程入口、依赖声明与配置项；未核验本机工具安装、生成配置或构建产物。

| 对象 | 权威位置与关系 |
|---|---|
| 固件工程根 | [firmware/CMakeLists.txt](../firmware/CMakeLists.txt) 引入 `IDF_PATH` 的 CMake 工程并声明本地 `components` |
| ESP-IDF 与组件版本约束 | [bsp/idf_component.yml](../firmware/components/bsp/idf_component.yml)；约束不是本机已安装或 lock 已解析版本 |
| 目标与默认配置 | [sdkconfig.defaults](../firmware/sdkconfig.defaults)：ESP32-C3、8 MB Flash、自定义分区；实际构建的 `sdkconfig` 为本地生成物 |
| Flash 分区 | [partitions.csv](../firmware/partitions.csv)：NVS、PHY 与 factory；精确地址/大小以该文件为准 |
| 生成配置与依赖 | `.gitignore` 忽略 `sdkconfig`、`dependencies.lock`、`managed_components/` 与构建产物；旧根残留不作为当前工程配置来源 |
| 原型运行根 | 静态服务器根是仓库根，页面路径 `/prototype/`，与 `assets/` 保持相对关系；见 [原型入口](../prototype/README.md#本地预览) |
| 部署目标 | 设备固件与本地原型是已知使用方式；生产站点、平台和发布流程待核实，见 [R4](context/RISKS.md#r4) |

## 常用操作入口

命令与前置条件统一由 [RUNBOOK](context/RUNBOOK.md) 路由到原专题；本文件不重复维护命令副本。

## 迁移记录（2026-10-28）

以下保留当时的迁移记载，不证明每个克隆的本地生成物已迁移；当前映射以上文为准。

| 动作 | 细节 |
|---|---|
| 固件下沉 | `CMakeLists.txt`、`sdkconfig*`、`partitions.csv`、`dependencies.lock`、`main/`、`components/` → `firmware/`；`managed_components/`、`build/` 一并迁入（均为生成物） |
| tools 分组 | `gen_assets.py`、`img_to_c.py`、`gen_synth.py`、`gen_audio.py` → `tools/gen/`；`gen_font.mjs`、`svg_to_png.mjs`、`package*.json` → `tools/web/` |
| 脚本路径 | `img_to_c.py`：读 `assets/gen/firmware`、写 `firmware/main/img`；`gen_assets.py`：写 `assets/gen/firmware`；`gen_audio.py`：写 `firmware/main/audio`；`gen_synth.py`：读 `assets/audio`；`gen_font.mjs`：写 `firmware/main/font` |
| 文档 | 根 README 瘦身为导航；新增本文件与 `hardware/`、`prototype/`、`assets/` 三组；`docs/superpowers/specs/` 与根目录中文清单并入 `docs/specs/`（后者改名 `feature-checklist.md`，该目录已于 2026-10-28 删除，见决策 22） |
| 未做 | 固件未编译（用户要求原型阶段不跑构建）；`tools/assets/` 5 个脚本与 `tests/` 仍缺失，恢复后按上表落位 |

旧缓存可能含原工程绝对路径；处理前核对目标、可重建性及授权，不按历史记载自动迁移或删除。参见 [RUNBOOK](context/RUNBOOK.md#固件构建与烧录)。
