# Sheikah Slate - AI Passport Edition

> ESP32-C3 上的塞尔达旷野之息希卡石板 UI 模拟器，运行在 [FoloToy AI Passport](https://github.com/nickyc975/ai-passport) 硬件上。

![Sheikah Eye](assets/images/sheikah_eye.png)
![Rune: Bomb](assets/images/rune_bomb.png)
![Rune: Magnesis](assets/images/rune_magnet.png)
![Rune: Stasis](assets/images/rune_stasis.png)
![Rune: Cryonis](assets/images/rune_cryonis.png)
![Rune: Camera](assets/images/rune_camera.png)

## 功能

| 页面 | 说明 |
|---|---|
| **待机页** | 希卡之眼 Logo + 呼吸动画，OK 键唤醒 |
| **符文选择器** | 8 个符文 (4×2 网格) 水平/垂直轮转，选中项希卡蓝发光 |
| **海拉鲁图鉴** | 5 分类标签 (生物/怪物/材料/装备/宝物)，50 条图鉴条目，详情弹窗 |
| **冒险记录** | 主线/支线/回忆 20 条任务，彩色类型标签，详情弹窗 |
| **设置页** | 亮度调节 (10%~100%) + 返回待机 |

### 按键操作 (3 键)

| 按键 | 功能 |
|---|---|
| UP | 上一项 / 亮度减小 |
| DOWN | 下一项 / 亮度增大 |
| OK 短按 | 确认 / 进入 |
| OK 长按 | 返回上一级 |

### 页面路由

```
待机页 ──[OK]──▶ 符文选择器 ──[OK]──▶ 图鉴 / 冒险记录 / 设置
                  ▲                        │
                  └───[长按OK 返回]────────┘
```

## 硬件

基于 **FoloToy AI Passport** (ESP32-C3):

| 项目 | 规格 |
|---|---|
| 芯片 | ESP32-C3, RISC-V 160MHz, 400KB SRAM (无 PSRAM) |
| Flash | 8MB |
| 屏幕 | ST7789P3 240×320 SPI, 16-bit RGB565 |
| 按键 | 3 个 (UP/DOWN/OK) ADC 分压 |
| 音频 | ES8311 I2S codec |
| 电量计 | CW2017 I2C |

## 构建 & 烧录

### 前置条件

- ESP-IDF v5.5.x (`idf.py --version` 确认)
- Python 3.10+
- Pillow (仅图片转换需要): `pip install Pillow`

### 步骤

```bash
# 1. 克隆项目
git clone <this-repo> ai-passport-sheikah-slate
cd ai-passport-sheikah-slate

# 2. 设置 ESP-IDF 环境
. $IDF_PATH/export.sh    # Linux/macOS
# 或 Windows: %IDF_PATH%\export.bat

# 3. (可选) 重新生成图片 C 数组 (图片已预生成在 main/img/)
python tools/img_to_c.py

# 4. 编译
idf.py build

# 5. 烧录
idf.py -p COMx flash monitor    # Windows 替换 COMx 为实际端口
```

### 重新生成图片

如果需要替换图片资源：

1. 将新 SVG 放入 `zelda-hyrule-ui` 仓库对应位置
2. 修改 `tools/svg_to_png.mjs` 中的转换列表
3. 安装 Node.js 依赖: `cd tools && npm install`
4. 渲染 SVG 为 PNG: `node tools/svg_to_png.mjs`
5. 转换 PNG 为 C 数组: `python tools/img_to_c.py`
6. 重新编译: `idf.py build`

转换参数分别在 `tools/svg_to_png.mjs` 的 `conversions` 数组和 `tools/img_to_c.py` 的 `IMAGES` 列表中配置。

## 项目结构

```
ai-passport-sheikah-slate/
├── CMakeLists.txt              # ESP-IDF 项目配置
├── sdkconfig.defaults          # ESP32-C3 + LVGL 配置
├── partitions.csv              # 4MB factory 分区
├── components/
│   └── bsp/                    # Board Support Package (复用自 ai-passport-tiktok-remote)
│       ├── include/            #   屏幕/按键/I2C/音频/电量计驱动头文件
│       └── src/                #   驱动实现
├── main/
│   ├── main.c                  # 主程序 + 页面路由状态机
│   ├── sheikah_theme.h/c       # 希卡配色 + 通用样式组件
│   ├── sheikah_ui.h/c          # 列表/标签栏/弹窗通用组件
│   ├── page_standby.c          # 待机页: 希卡之眼
│   ├── page_runes.c            # 符文选择器 (主菜单)
│   ├── page_compendium.c       # 海拉鲁图鉴
│   ├── page_quest.c            # 冒险记录
│   ├── page_settings.c         # 设置页
│   └── img/                    # 图片 C 数组 (由 img_to_c.py 生成)
│       ├── img_all.h           #   所有图片声明
│       ├── img_sheikah_eye.c   #   希卡之眼 120×120
│       ├── img_rune_bomb.c     #   炸弹符文 48×48
│       └── ...                 #   其他 4 个符文
├── assets/
│   ├── images/                 # 源图片 PNG
│   └── data/                   # 图鉴 & 任务 JSON 数据 (嵌入 Flash)
├── docs/
│   ├── README.md               # 技术架构文档 (配色/RAM预算/图片管线等)
│   └── development-log.md      # 开发日志 (方案演进 + 踩坑记录)
└── tools/
    ├── img_to_c.py             # PNG → LVGL RGB565 C 数组转换工具
    ├── svg_to_png.mjs          # SVG → PNG 渲染 (使用 @resvg/resvg-js + sharp)
    └── package.json            # Node.js 依赖 (resvg, sharp)
```

## 配色方案

| 名称 | HEX | 用途 |
|---|---|---|
| 希卡蓝 | `#3CD3FC` | 选中边框、高亮文字 |
| 希卡黄 | `#FFE460` | 激活条目 |
| 正文暖白 | `#E9E1D1` | 普通文字 |
| 面板底色 | `#0A1428` | 面板背景 |
| 页面底层 | `#66645D` | 底层背景 |
| 金色 | `#FCC413` | 回忆/效果 |

## 数据来源 & 参考仓库

| 来源 | 说明 |
|---|---|
| [chaos-xxl/zelda-hyrule-ui](https://github.com/chaos-xxl/zelda-hyrule-ui) | 配色方案 (variables.less)、SVG 图标素材 (希卡之眼 + 符文)、组件设计参考 |
| [emilyanthony4244/Sheikah_Slate](https://github.com/emilyanthony4244/Sheikah_Slate) | 硬件设计参考、休眠逻辑参考 |
| [nickyc975/ai-passport](https://github.com/nickyc975/ai-passport) | BSP 驱动框架、ui_pixel 渲染模式参考 |
| [ai-passport-tiktok-remote](https://github.com/nickyc975/ai-passport-tiktok-remote) | BSP 层直接复用 (display/button/i2c/battery/audio) |
| [gadhagod/Hyrule-Compendium-API](https://github.com/gadhagod/Hyrule-Compendium-API) | 图鉴数据原始来源 |
| [react-sheikah-ui](https://github.com/nickyc975/react-sheikah-ui) | Token 色系参考 |

### 图片资源

- 希卡之眼 + 5 个符文图标: 提取自 [zelda-hyrule-ui](https://github.com/nickyc975/zelda-hyrule-ui) 仓库 SVG 素材 (源自游戏原版资源)，通过 `tools/svg_to_png.mjs` 渲染为 PNG，再由 `tools/img_to_c.py` 转为 LVGL RGB565 C 数组
- 图鉴数据: 基于 Hyrule Compendium API 精简，每分类 10 条代表性条目
- 冒险记录: 基于游戏内实际任务线精简

## 技术约束 (ESP32-C3)

- **RAM**: 400KB 片上 SRAM，无 PSRAM → LVGL 用 20 行单缓冲 (~9.6KB)
- **Flash**: 8MB (factory 分区 4MB) → 图片 ~50KB + 固件 ~500KB，充裕
- **屏幕**: 240×320 SPI，16-bit RGB565，swap_bytes=true
- **无 SD 卡**: 所有资源编译进 Flash (EMBED_TXTFILES for JSON, C arrays for images)
- **无 WiFi/BLE**: 内存有限，不支持网络功能
- **无复杂动画**: 仅呼吸闪烁 + 页面切换，无扫描线/辉光

## License

MIT - 本项目为学习/展示用途，所有游戏素材版权归 Nintendo 所有。
