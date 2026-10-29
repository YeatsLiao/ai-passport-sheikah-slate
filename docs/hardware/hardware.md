# 硬件与固件

## 硬件

| 项目 | 规格 |
|---|---|
| 芯片 | ESP32-C3, RISC-V 160MHz, 400KB SRAM（无 PSRAM） |
| Flash | 8MB（factory 分区 4MB） |
| 屏幕 | ST7789P3 240×320 SPI，横屏使用；RGB565 |
| 按键 | 3 个（UP/DOWN/OK），ADC 分压 |
| 音频 | ES8311 I2S codec |
| 电量计 | CW2017 I2C |

## 构建

前置：可用的 ESP-IDF 环境；版本范围以 [组件声明](../../firmware/components/bsp/idf_component.yml) 为准（当前声明 `>=5.5.3,<5.6.0`），Python 需符合所用 IDF 的要求；Pillow 仅资源生成需要。
以下命令以仓库根为当前目录；2026-10-29 仅核对入口与配置，未执行。构建、烧录的授权与验证要求见 [RUNBOOK](../context/RUNBOOK.md#固件构建与烧录)。`COMx` 为待确认的设备端口。

```bash
idf.py -C firmware build
idf.py -C firmware -p COMx flash monitor
```

历史排障记录：受限终端曾在 `Executing "cmake ..."` 后停止输出，并使用以下 CMake/esptool 流程。
该流程的旧成功记录不证明迁移后的工程可用；以下改为通用 PowerShell 占位写法，本轮未执行，需在 `firmware/` 下核对环境、产物与当前分区后使用。

```powershell
cmake -G Ninja -DIDF_TARGET=esp32c3 -B build .
cmake --build build -- -j 8
python "$env:IDF_PATH\components\esptool_py\esptool\esptool.py" --chip esp32c3 -p COMx -b 460800 `
  --before default_reset --after hard_reset write_flash --flash_mode dio --flash_size 8MB `
  --flash_freq 80m 0x0 build\bootloader\bootloader.bin 0x8000 build\partition_table\partition-table.bin `
  0x10000 build\ai-passport-sheikah-slate.bin
```

> 当前安装位置、Python 环境与旧 esptool 脚本入口可用性待核实；按实际安装设置 `IDF_PATH`，必要时核对 `IDF_PYTHON_ENV_PATH`，不复用个人设备路径。优先使用上方 IDF 标准入口。

## 固件内部分层

```
firmware/main/
├── main.c                 # 初始化 + 按键事件队列 + LVGL 定时派发
├── slate_app.c            # 页面路由（过渡屏 -> 退出旧页 -> 进入新页）
├── game_view.c            # 场景/物体/特效渲染
├── sheikah_theme.c        # 配色、通用控件、栏目/页脚
├── page_*.c               # 待机、符文、试炼、图鉴、记录、设置
├── game/                  # 纯 C 模型：五关、输入手势、进度、目录、NVS 存储
├── audio/                 # sfx 队列 + 生成的 PCM 数据
├── font/                  # Hylia Serif 16/20/28
└── img/                   # 图片 C 数组（tools/gen/img_to_c.py 生成）
```

`main/CMakeLists.txt` 只登记源码与 `images.cmake`；JSON 数据不参与编译，固件只编 `game/catalog.c`（由生成脚本产出）。

## 资源与性能约束

- 横屏 20 行双缓冲约 25.6KB；不分配全屏 ARGB 画布，不常驻五个场景。
- 背景用 RGB565 直接从 Flash 读取；物体与特效是独立 ARGB8888 小图，不烘焙进背景。
- 交互目标 25–30fps；压力场景需保留至少 40KB 空闲内部堆，固件不超过 factory 容量 90%。

## 三键输入在固件侧的实现

三个按键共用一路 ADC 分压，因此不做组合键、双击或依赖毫秒级同时按下。按键任务只投递有界事件队列，
短按/长按统一在 LVGL 线程按实际按住时间分类（`game/input.c`，`HOLD_MS 550`，长按消费掉短按），
页面切换时按 generation 清除旧手势，避免长按返回后在新页面再触发一次短按。

## 主机逻辑测试

以下保留预期流程，当前测试源缺失与恢复条件见 [R1](../context/RISKS.md#r1)。宿主 C 编译器可用性待核实；仅在测试恢复并取得授权后执行，本轮未运行。

```bash
cmake -S firmware/tests -B build-host
cmake --build build-host
ctest --test-dir build-host -V
```

历史预期覆盖五关成功/失败/重试、冷却禁止重入、时停方向与蓄力上限、磁力边界、冰柱先进先出、空拍/重复拍摄、
相册满、进度编码校验与三键手势分类；原计划只编译 `firmware/main/game/`，不依赖 ESP-IDF、LVGL 或音频。
以上是恢复时可核对的目标，不是当前已有测试覆盖或通过的声明。

## 实机记录（历史）

- 编译体积：1,993,776 B（0x1e6d90），app 分区 4 MB，剩余 52%；DRAM 82,806 / 321,296 B（25.77%），RTC SLOW 56 B。
- 实机：ESP32-C3 rev1.1 / 8 MB Flash 曾经串口烧录成功；启动日志为背光 LEDC gpio21、
  显示 320×240、LVGL task、ADC 三键、电量 99%、`Ready - landscape 320x240`，未出现重启循环。
- **未执行**：屏幕观感与五关玩法的人工验收、主机测试实际运行、与原版截图的逐项对照。

这些数据来自更早一次固件源码，不能证明当前 `firmware/` 内代码仍可编译；逐条对照见
[development-log.md](../development-log.md) 决策 16。
