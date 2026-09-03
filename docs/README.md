# 开发文档

## 项目概述

Sheikah Slate - AI Passport Edition 是基于 FoloToy AI Passport (ESP32-C3) 硬件的塞尔达旷野之息「希卡石板」UI 模拟器。设备启动后显示游戏内经典的希卡之眼待机画面，通过 3 个物理按键操控符文菜单、海拉鲁图鉴、冒险记录等页面，还原游戏内的石板交互体验。

**核心目标**：有趣、好玩、尽量还原原版游戏视觉风格，在 ESP32-C3 的硬件限制下做到"能玩的希卡石板"。

## 功能

| 页面 | 说明 |
|---|---|
| **待机页** | 希卡之眼 Logo + 呼吸动画 (opa 40↔255, 1.5s ease_in_out)，OK 键唤醒 |
| **符文选择器** | 8 个符文 (4×2 网格) 轮转，选中项放大 (44→56px) + 希卡蓝发光边框 + shadow |
| **海拉鲁图鉴** | 5 分类标签 (生物/怪物/材料/装备/宝物)，每分类 10 条，详情弹窗 |
| **冒险记录** | 主线 8 + 支线 5 + 回忆 7 = 20 条任务，彩色类型标签，详情弹窗 |
| **设置页** | 亮度调节 (10%~100%) + 返回待机 |

### 按键操作

| 按键 | 事件 | 功能 |
|---|---|---|
| UP | 单击 | 上一项 / 亮度+ |
| DOWN | 单击 | 下一项 / 亮度- |
| OK | 单击 | 确认 / 进入子页面 |
| OK | 长按 | 返回上一级 (子页面→符文, 符文→待机) |

### 页面路由状态机

```
待机页 ──[OK]──▶ 符文选择器 ──[OK]──▶ 图鉴 / 冒险记录 / 设置
                  ▲                        │
                  └───[长按OK 返回]────────┘
```

状态机实现在 `main.c`：

```c
typedef enum { PAGE_STANDBY=0, PAGE_RUNES, PAGE_COMPENDIUM, PAGE_QUEST, PAGE_SETTINGS } page_id_t;

// 长按 OK 路由:
//   RUNES       → STANDBY
//   子页面      → RUNES
//   STANDBY     → 不响应

// OK 短按在符文页:
//   page_runes_get_selected_page() 返回 page_id:
//     1 → COMPENDIUM, 2 → QUEST, 3 → SETTINGS, -1 → 无操作 (装饰符文)
```

## 技术架构

```
┌──────────────────────────────────────────────────────────────┐
│                          main/                               │
│  main.c          主程序 + 页面路由状态机 + 按键分发            │
│  sheikah_theme   希卡配色 (RGB565) + 全局样式组件              │
│  sheikah_ui      通用组件 (列表/标签栏/弹窗)                   │
│  page_standby    待机页: 希卡之眼图片 + 呼吸动画               │
│  page_runes      符文选择器: 8 符文轮转 + 图标                 │
│  page_compendium 海拉鲁图鉴: 5 分类 + JSON 解析                │
│  page_quest      冒险记录: 20 任务 + 详情弹窗                  │
│  page_settings   设置: 亮度调节                                │
│  img/            图片 C 数组 (img_to_c.py 生成)               │
├──────────────────────────────────────────────────────────────┤
│                    components/bsp/                            │
│  bsp_button / bsp_display / bsp_i2c /                        │
│  bsp_battery / bsp_audio                                     │
├──────────────────────────────────────────────────────────────┤
│          ESP-IDF 5.5.x + LVGL 9.x (16-bit RGB565)           │
└──────────────────────────────────────────────────────────────┘
```

### 硬件层 (BSP)

直接复用 `ai-passport-tiktok-remote` 仓库的 BSP 组件：

- **bsp_display**: ST7789P3 240×320 SPI 屏驱动 + LVGL 集成
  - 单缓冲: 20 行 × 240 像素 × 2 字节 = 9.6KB (DMA)
  - `swap_bytes=true`: SPI 传输自动字节交换，匹配 RGB565 大端
  - LEDC 背光控制 (0~100%)
- **bsp_button**: 3 按键 ADC 分压输入 (GPIO0)
  - 基于 `iot_button` 组件，支持单击/双击/长按事件
  - 电压窗口: UP ≈ 1.2V, DOWN ≈ 0.6V, OK ≈ 0V
- **bsp_i2c**: I2C 总线 (SDA=GPIO10, SCL=GPIO7)
- **bsp_battery**: CW2017 电量计 (I2C)
- **bsp_audio**: ES8311 I2S codec (本项目未使用)

### 显示层 (LVGL 9)

LVGL 9.x 配置要点：

- **色深**: 16-bit RGB565 (`CONFIG_LV_COLOR_DEPTH_16=y`)
- **缓冲**: 单缓冲 20 行 (~9.6KB)，通过 `bsp_lvgl_lock/unlock()` 保证线程安全
- **字体**: Montserrat 14/16/20/24 (在 `sdkconfig.defaults` 中启用)
- **图片**: 预转换为 RGB565 C 数组，`lv_image_dsc_t` 描述符直接引用

### 数据层 (JSON 嵌入)

图鉴和任务数据以 JSON 格式嵌入 Flash：

```
assets/data/*.json  ──[EMBED_TXTFILES]──>  Flash .rodata
                                               │
page_compendium.c  ──[extern asm()]──>  指针访问  ──[strstr 解析]──>  显示
```

不使用 cJSON 库（节省 RAM），用手写 `strstr` 模式匹配解析简单 JSON 结构。

## 代码结构

```
ai-passport-sheikah-slate/
├── CMakeLists.txt              # ESP-IDF 项目配置
├── sdkconfig.defaults          # ESP32-C3 + LVGL 16-bit + 字体
├── partitions.csv              # 4MB factory 分区
├── components/
│   └── bsp/                    # Board Support Package (复用 tiktok-remote)
│       ├── include/            #   bsp_display.h / bsp_button.h / bsp_pins.h
│       └── src/                #   驱动实现
├── main/
│   ├── main.c                  # 主程序 + 状态机路由
│   ├── sheikah_theme.h/c       # 配色常量 + 屏幕/标题/面板样式函数
│   ├── sheikah_ui.h/c          # sk_list / sk_tabs / sk_popup 组件
│   ├── page_standby.c/h        # 待机页: 希卡之眼 + 呼吸
│   ├── page_runes.c/h          # 符文选择器 (主菜单)
│   ├── page_compendium.c/h     # 海拉鲁图鉴 (5 分类)
│   ├── page_quest.c/h          # 冒险记录 (20 任务)
│   ├── page_settings.c/h       # 设置 (亮度)
│   └── img/                    # 图片 C 数组 (自动生成)
│       ├── img_all.h           #   所有图片 extern 声明
│       ├── img_sheikah_eye.c   #   希卡之眼 120×120 RGB565
│       └── img_rune_*.c        #   5 个符文 48×48 RGB565
├── assets/
│   ├── images/                 # 源 PNG (从 SVG 渲染)
│   └── data/                   # JSON 数据 (6 个文件, 嵌入 Flash)
├── tools/
│   ├── img_to_c.py             # PNG → LVGL RGB565 C 数组
│   └── svg_to_png.mjs          # SVG → PNG (resvg-js + sharp)
└── docs/
    ├── README.md               # 本文档
    └── development-log.md      # 开发日志 + 踩坑记录
```

## 配色方案

提取自 `zelda-hyrule-ui/packages/core/styles/variables.less`：

| 名称 | 宏定义 | RGB565 | 用途 |
|---|---|---|---|
| 希卡蓝 | `SK_BLUE` | `0x3CD3FC` | 选中边框、高亮、shadow |
| 深蓝 | `SK_BLUE_DARK` | `0x0A8DD7` | 次级高亮 |
| 希卡黄 | `SK_YELLOW` | `0xFFE460` | 激活条目名称 |
| 面板底色 | `SK_PANEL_BG` | `0x0A1428` | 面板/列表背景 |
| 页面底层 | `SK_PAGE_BG` | `0x66645D` | 底层背景 (未使用, 待机页纯黑) |
| 正文暖白 | `SK_TEXT` | `0xE9E1D1` | 普通文字 |
| 弱化文字 | `SK_TEXT_MUTED` | `0x9A9484` | 未选中符文、提示文字 |
| 金色 | `SK_EFFECT_GOLD` | `0xFCC413` | 回忆类型标签 |
| 塞尔达 Tan | `SK_TAN` | `0xE2DED3` | 装饰边框 |

## RAM 预算

| 项目 | 占用 | 说明 |
|---|---|---|
| LVGL 单缓冲 | 9.6 KB | 20 行 × 240px × 2B (DMA) |
| LVGL 对象 | ~30 KB | 5 个页面同时存在的对象树 |
| 图片 C 数组 | ~50 KB | 希卡之眼 28.8KB + 5 符文 × 4.5KB |
| JSON 数据 | ~15 KB | 6 个 JSON 文件 (嵌入 Flash, 不占 RAM) |
| FreeRTOS 栈 | ~8 KB | 主任务 + button 任务 |
| **总计** | **~113 KB** | 远低于 400KB SRAM 上限 |

> JSON 数据通过 `EMBED_TXTFILES` 嵌入 Flash 的 `.rodata` 段，运行时通过指针访问，解析时使用局部缓冲（~256B），不额外占用堆内存。

## 图片资源管线

```
zelda-hyrule-ui SVG 素材
       │
       ▼
  svg_to_png.mjs (Node.js)
  @resvg/resvg-js 渲染 SVG → 4x 超采样 PNG
  sharp 缩放到目标尺寸 + 黑色背景合成
       │
       ▼
  assets/images/*.png (240x240 / 96x96)
       │
       ▼
  img_to_c.py (Python + Pillow)
  逐像素 RGBA → RGB565 big-endian 转换
  生成 lv_image_dsc_t 描述符 + 像素数组
       │
       ▼
  main/img/*.c + img_all.h
  (编译时嵌入固件 Flash)
```

### 图片规格

| 图片 | 源 SVG | PNG 尺寸 | C 数组目标 | 像素数据大小 |
|---|---|---|---|---|
| 希卡之眼 | `sheikah-symbol.svg` | 240×240 | 120×120 | 28,800 B |
| 炸弹符文 | `ability-round-bomb.svg` | 96×96 | 48×48 | 4,608 B |
| 磁力符文 | `ability-magnesis.svg` | 96×96 | 48×48 | 4,608 B |
| 静止符文 | `ability-stasis.svg` | 96×96 | 48×48 | 4,608 B |
| 制冰符文 | `ability-cryonis.svg` | 96×96 | 48×48 | 4,608 B |
| 相机符文 | `ability-camera.svg` | 96×96 | 48×48 | 4,608 B |

> 源 PNG 以 4x 超采样渲染后缩小，确保抗锯齿质量。C 数组目标尺寸匹配屏幕实际显示大小。

## 构建与烧录

### 环境要求

- ESP-IDF 5.5.x
- Python 3.10+ (Pillow: 图片转换)
- Node.js (仅 SVG→PNG 转换时需要)

### 构建步骤

```bash
# 设置 ESP-IDF 环境
. $IDF_PATH/export.sh    # Linux/macOS
# Windows: %IDF_PATH%\export.bat

# 编译
idf.py build

# 烧录
idf.py -p COMx flash monitor    # Windows 替换 COMx
```

> 修改 `sdkconfig.defaults` 后需全量清理：
> `rd /s /q build && del sdkconfig && idf.py build` (Windows CMD)

## 关键实现细节

### LVGL 线程安全

所有 UI 操作必须在 LVGL 锁内执行，锁内不做延时：

```c
static void on_key(bsp_btn_t btn, bsp_btn_ev_t ev, void *user) {
    if (!bsp_lvgl_lock(500)) return;   // 等待锁
    // ... UI 操作 ...
    bsp_lvgl_unlock();
}
```

页面切换 `switch_page()` 同样在锁内完成 exit + enter 的原子操作。

### 弹窗拦截

长按 OK 的全局返回逻辑会先检查弹窗状态：

```c
if (sk_popup_is_open()) {
    sk_popup_close();    // 优先关闭弹窗，不切换页面
    return;
}
```

### 轻量 JSON 解析

不使用 cJSON 库，用手写 `strstr` 模式匹配：

```c
static bool json_extract(const char *obj_start, const char *key, char *buf, int buf_size) {
    // 从 obj_start (当前 '{' 位置) 开始搜索，避免匹配到前一个对象
    const char *k = strstr(obj_start, key);
    if (!k || k > next_obj_boundary) return false;
    // 提取 "key": "value" 中的 value
    ...
}
```

> **关键**: `obj_start` 参数确保搜索范围限制在当前 JSON 对象内，否则所有条目都会匹配到第一个对象的字段。

## 故障排查

| 问题 | 可能原因 | 解决方法 |
|---|---|---|
| 编译报 `LV_SYMBOL_xxx` 未定义 | LVGL 9 移除了部分符号常量 | 用文字缩写代替 (已修复) |
| 图鉴所有条目显示相同内容 | JSON 解析器从文本开头搜索 | 修复 `json_extract` 使用 `obj_start` 参数 |
| 中文显示为方块 | Montserrat 字体不含中文 | UI 文案全部使用英文 |
| 屏幕无显示 | SPI 初始化失败 | 检查 `bsp_display_init()` 返回值 |
| 按键无响应 | ADC 电压窗口不匹配 | 检查 `bsp_button.c` 中的电压阈值 |
| 图片显示偏色 | RGB565 字节序错误 | 确认 `swap_bytes=true` 在 BSP 配置中 |

## 参考资料

- [zelda-hyrule-ui](https://github.com/nickyc975/zelda-hyrule-ui) — 配色 Token + SVG 图标素材
- [react-sheikah-ui](https://github.com/nickyc975/react-sheikah-ui) — Token 色系参考
- [Sheikah_Slate (emilyanthony4244)](https://github.com/emilyanthony4244/Sheikah_Slate) — 原版硬件设计参考
- [ai-passport (FoloToy)](https://github.com/nickyc975/ai-passport) — BSP 驱动框架
- [ai-passport-tiktok-remote](https://github.com/nickyc975/ai-passport-tiktok-remote) — BSP 直接复用 + 架构参考
- [Gadhagod/Hyrule-Compendium-API](https://github.com/gadhagod/Hyrule-Compendium-API) — 图鉴数据原始来源
