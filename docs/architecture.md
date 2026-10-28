# 架构

五个域，按「谁生产、谁消费」切分；依赖方向单向，不允许回指。

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
├── tests/                 test_game.c（主机侧，编译 main/game/，不依赖 IDF）
├── managed_components/    组件管理器下载物（生成物）
└── build/                 CMake 构建目录（生成物；迁移自旧根 build/，缓存已失效）

prototype/                 index.html + css/ + js/ + fonts/，无 node_modules
assets/                    raw/ gen/ data/ audio/ manifest.json README.md
tools/
├── assets/                入库与校验（当前 5 个脚本待恢复）
├── gen/                   gen_assets、img_to_c、gen_synth、gen_audio
└── web/                   gen_font、svg_to_png（Node）
docs/                      README、architecture、hardware/、prototype/、assets/、development-log
```

## 边界规则

1. **顶层级不加数字前缀**：`firmware`、`prototype`、`assets`、`tools`、`docs` 都是工具链按惯例找根的名字
   （ESP-IDF 找 `CMakeLists.txt`、静态站找 `index.html`）。数字前缀只留给排序有意义的层，如 `assets/raw/01_runes…`。
2. **生成物不入库**：`firmware/build/`、`firmware/managed_components/`、`firmware/sdkconfig`、
   `firmware/dependencies.lock`、`.build-tools/`（本地 lvgl 与 python 缓存，未入库）。
3. **固件只读 `assets/gen`**，不读 `assets/raw`；`raw` 只给 `tools/assets` 读。原型同理，通过
   `../assets/gen/...` 与 `../assets/audio/...` 相对路径取图。
4. **素材只增不改名**：分类调整靠 `assets/raw/_index/content_map.csv` 留痕，重生成永远从 `raw` 出发。
5. **文档单一事实**：行为说明只写在 `docs/`，根 README 只做导航，避免两处描述打架。

## 常用命令（均以仓库根为当前目录）

```bash
idf.py -C firmware build            # 固件；等价于先 cd firmware
idf.py -C firmware -p COMx flash monitor
python -m http.server 8124           # 原型：http://127.0.0.1:8124/prototype/
python tools/assets/verify_assets.py # 素材只读校验（脚本待恢复）
```

## 迁移记录（2026-10-28）

| 动作 | 细节 |
|---|---|
| 固件下沉 | `CMakeLists.txt`、`sdkconfig*`、`partitions.csv`、`dependencies.lock`、`main/`、`components/` → `firmware/`；`managed_components/`、`build/` 一并迁入（均为生成物） |
| tools 分组 | `gen_assets.py`、`img_to_c.py`、`gen_synth.py`、`gen_audio.py` → `tools/gen/`；`gen_font.mjs`、`svg_to_png.mjs`、`package*.json` → `tools/web/` |
| 脚本路径 | `img_to_c.py`：读 `assets/gen/firmware`、写 `firmware/main/img`；`gen_assets.py`：写 `assets/gen/firmware`；`gen_audio.py`：写 `firmware/main/audio`；`gen_synth.py`：读 `assets/audio`；`gen_font.mjs`：写 `firmware/main/font` |
| 文档 | 根 README 瘦身为导航；新增本文件与 `hardware/`、`prototype/`、`assets/` 三组；`docs/superpowers/specs/` 与根目录中文清单并入 `docs/specs/`（后者改名 `feature-checklist.md`，该目录已于 2026-10-28 删除，见决策 22） |
| 未做 | 固件未编译（用户要求原型阶段不跑构建）；`tools/assets/` 5 个脚本与 `tests/` 仍缺失，恢复后按上表落位 |

旧根 `build/` 的 CMake 缓存记录的是旧绝对路径，首次在 `firmware/` 重建前直接删除 `firmware/build/` 更省事。
