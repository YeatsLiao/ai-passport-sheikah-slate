# 开发日志

完整记录希卡石板从立项到成型的全部开发过程，包括技术调研、方案决策、踩坑记录和问题修复。

---

## 阶段 0：需求确认与可行性分析

**目标**：基于 FoloToy AI Passport (ESP32-C3) 硬件，做一个塞尔达旷野之息「希卡石板」UI 模拟器。

### 需求来源

用户提供了一份功能+UI 完整清单文档（`ESP32‑C3｜希卡石板 功能+UI完整清单.md`），以及 6 个参考仓库：

| 仓库 | 用途 |
|---|---|
| `ai-passport` | BSP 驱动框架 + ui_pixel 渲染模式参考 |
| `ai-passport-tiktok-remote` | BSP 直接复用 + ESP-IDF 项目架构参考 |
| `zelda-hyrule-ui` | 配色 Token (variables.less) + SVG 图标素材 + 组件设计参考 |
| `react-sheikah-ui` | React 组件库 + Token 色系参考 |
| `Sheikah_Slate` | 原版 Arduino 项目 (RA8875 800×480, 不可直接复用) |
| `ESP32‑C3｜希卡石板 功能+UI完整清单.md` | 需求清单文档 |

### 用户要求

> "先做技术可行性，最终效果一定要有趣、跟原版游戏一模一样、好玩就行，功能可以不一定要具体实现那么多"

**设计原则**：
- 视觉效果优先：配色、图标、动画必须尽量还原游戏感
- 功能可以裁剪：不需要实现所有功能，保留最有趣的部分
- 硬件约束优先：一切方案服从 ESP32-C3 的实际能力

### 硬件约束分析

| 约束 | 影响 |
|---|---|
| 400KB SRAM, 无 PSRAM | LVGL 只能用单缓冲 (~10KB), 不能缓存大量数据 |
| 240×320 SPI 屏 | 需求清单假设 800×480 (RA8875), 所有 UI 需重新设计布局 |
| 无 SD 卡 | 无法运行时加载图片, 必须编译时嵌入 Flash |
| 3 个 ADC 按键 | 无触摸屏, 无法实现复杂的滑动交互 |
| 160MHz RISC-V | 无 PSRAM 的情况下, 图片解码必须轻量 |

### 可行性结论

**可行**。核心思路：
1. 复用 tiktok-remote 的 BSP (成熟稳定)
2. LVGL 9 单缓冲, 图片预转为 RGB565 C 数组
3. JSON 数据用 EMBED_TXTFILES 嵌入 Flash, 手写轻量解析器
4. 功能裁剪为 5 个核心页面 (待机/符文/图鉴/冒险/设置)

---

## 阶段 1：项目初始化

### 完成的工作

1. **克隆原版 Sheikah_Slate 仓库**
   - `git clone https://github.com/emilyanthony4244/Sheikah_Slate.git`
   - 目录已存在 (仅有 .git), 通过 `git init + remote add + fetch + checkout` 修复

2. **技术调研 (5 个仓库)**
   - 读取 BSP 驱动: `bsp_display.c` (ST7789P3 初始化序列), `bsp_button.c` (ADC 分压), `bsp_pins.h` (引脚定义)
   - 读取 LVGL 配置: `bsp_display_lvgl.c` (20行单缓冲, swap_bytes)
   - 读取 tiktok-remote `main.c`: 理解 BSP 初始化流程和按键回调模式
   - 读取 zelda-hyrule-ui `variables.less`: 提取完整配色 Token
   - 读取 react-sheikah-ui `Token.ts`: 交叉验证配色值

3. **项目结构搭建**
   - 从 tiktok-remote 复制 `components/bsp/` (显示/按键/I2C/音频/电量计驱动)
   - 创建 `CMakeLists.txt`, `sdkconfig.defaults`, `partitions.csv`
   - 配置 ESP32-C3 + LVGL 16-bit + Montserrat 14/16/20/24 字体

### 设计决策

**决策 1：页面路由用状态机，不用 LVGL 原生导航**

LVGL 9 没有内置的多页面导航框架（不像 Flutter 的 Navigator）。选择手动状态机：

```c
typedef enum { PAGE_STANDBY, PAGE_RUNES, PAGE_COMPENDIUM, PAGE_QUEST, PAGE_SETTINGS } page_id_t;
```

优点：简单直接，每个页面是独立的 enter/exit/key 函数对，切换时 exit 旧页 + enter 新页。

**决策 2：图片用 C 数组，不用文件系统**

ESP32-C3 无 SD 卡，8MB Flash 的 factory 分区有 4MB。将图片编译时嵌入：
- 预转换为 RGB565 big-endian (匹配 SPI swap_bytes)
- 生成 `lv_image_dsc_t` 描述符 + 像素数据数组
- 总计 ~50KB 像素数据，Flash 充裕

**决策 3：JSON 用 EMBED_TXTFILES + 手写解析，不用 cJSON**

- `EMBED_TXTFILES` 将 JSON 嵌入 Flash `.rodata` 段 (不占 RAM)
- 手写 `strstr` 模式匹配提取字段 (避免 cJSON 的堆内存分配)
- 图鉴数据每分类 10 条, JSON 结构简单且可预测

**决策 4：功能裁剪为 5 页**

需求清单有 10+ 页面, 根据"好玩优先"原则裁剪:

| 保留 | 理由 |
|---|---|
| 待机页 (希卡之眼) | 标志性视觉, 呼吸动画有氛围感 |
| 符文选择器 | 核心交互入口, 图标轮转有趣 |
| 海拉鲁图鉴 | 数据展示, 分类浏览有探索感 |
| 冒险记录 | 任务追踪, 回忆标签有情怀 |
| 设置 | 亮度调节实用功能 |

| 砍掉 | 理由 |
|---|---|
| 相册 | 无 SD 卡, 无法存储照片 |
| 地图 | 240×320 屏幕太小, 无法交互 |
| 感应器 (雷达) | 无硬件支持 |
| 相机 | 无摄像头 |
| 复杂扫描动画 | 内存和帧率限制 |

---

## 阶段 2：主题系统与通用组件

### 配色提取

从 `zelda-hyrule-ui/packages/core/styles/variables.less` 提取 RGB565 色值：

```c
#define SK_BLUE         0x3CD3FC  // 希卡蓝 - 选中高亮/边框
#define SK_YELLOW       0xFFE460  // 希卡黄 - 激活条目
#define SK_PANEL_BG     0x0A1428  // 面板底色 (深蓝黑)
#define SK_TEXT         0xE9E1D1  // 正文暖白
#define SK_TEXT_MUTED   0x9A9484  // 弱化文字
#define SK_EFFECT_GOLD  0xFCC413  // 金色效果 (回忆标签)
```

### 通用组件设计

`sheikah_ui.h/c` 提供 3 个通用组件，被多个页面复用：

| 组件 | 函数 | 说明 |
|---|---|---|
| 滚动列表 | `sk_list_create` / `sk_list_add_item` | 深蓝黑底 + 希卡蓝边框, 选中高亮 |
| 标签栏 | `sk_tabs_create` / `sk_tabs_update` | 水平分类标签, 选中下划线 |
| 详情弹窗 | `sk_popup_show` / `sk_popup_close` | 半透明遮罩 + 居中面板 |

---

## 阶段 3：5 个页面实现

### 待机页 (page_standby.c)

**初始方案**: 用 30+ 个 LVGL block 绘制像素化希卡之眼 (参考 ai-passport 的 `ui_pixel` 渲染模式)

**最终方案**: 使用真实希卡之眼图片 (120×120 RGB565)

动画: 呼吸闪烁 (`lv_anim_path_ease_in_out`, opa 40↔255, 1.5s 循环)

### 符文选择器 (page_runes.c)

8 个符文排列为 4×2 网格：

| # | 符文 | 图标 | page_id |
|---|---|---|---|
| 0 | Remote Bombs | `img_rune_bomb` | -1 (装饰) |
| 1 | Magnesis | `img_rune_magnet` | -1 |
| 2 | Stasis | `img_rune_stasis` | -1 |
| 3 | Cryonis | `img_rune_cryonis` | -1 |
| 4 | Camera | `img_rune_camera` | -1 |
| 5 | Hyrule Compendium | 文字 "Cmp" | 1 → COMPENDIUM |
| 6 | Adventure Log | 文字 "Log" | 2 → QUEST |
| 7 | Settings | 文字 "Set" | 3 → SETTINGS |

选中态: 44→56px 放大 + 希卡蓝边框 (3px) + shadow (12px, opa 40%)

### 图鉴页 (page_compendium.c)

- 5 个分类标签: Creatures / Monsters / Materials / Equipment / Treasures
- 每分类 10 条条目, JSON 数据通过 `extern asm("_binary_xxx_start")` 访问
- 手写 `json_extract()` 解析器, 从 `obj_start` 位置开始搜索

### 冒险记录页 (page_quest.c)

- 20 条任务: 8 Main + 5 Side + 7 Memory
- 类型色块: Main=黄, Side=蓝, Memory=金
- 详情弹窗: 点击 OK 弹出任务描述

### 设置页 (page_settings.c)

- 亮度: UP/DOWN 调节 ±10%, 范围 10~100%
- "Return to Standby" 选项, 通过 `page_settings_wants_standby()` 通知 main.c

---

## 阶段 4：图片资源

### 第一版：AI 生成 (废弃)

使用 ImageGen 生成希卡之眼和 5 个符文图标。

**问题**: AI 生成的图标不够像原版游戏素材，用户明确表示"不像，直接取就行"。

### 第二版：从 zelda-hyrule-ui 仓库取原版 SVG

发现 `zelda-hyrule-ui/packages/core/assets/svg/` 目录包含完整的游戏原版 SVG 素材：

| 用途 | SVG 文件 |
|---|---|
| 希卡之眼 | `sheikah-symbol.svg` |
| 炸弹 | `ability-round-bomb.svg` |
| 磁力 | `ability-magnesis.svg` |
| 静止 | `ability-stasis.svg` |
| 制冰 | `ability-cryonis.svg` |
| 相机 | `ability-camera.svg` |

---

## 阶段 5：视觉全面还原（游戏原版素材 + Hylia 字体 + 环形轮盘）

**目标**：用户反馈初版“完全不像游戏的希卡石板”。本阶段从 `zelda-hyrule-ui` 取全套原版素材，对五个页面做视觉全面还原。方向经用户确认：**全面还原 + 环形符文轮盘 + 只保证代码正确（用户自行构建）**。

### 素材管线（tools/）

| 脚本 | 作用 |
|---|---|
| `svg_to_png.mjs` | `@resvg/resvg-js` 按 viewBox 渲染原版 SVG → PNG（正则解析 CSS 变量填充色） |
| `gen_assets.py` | 生成无 SVG 来源的图标（齿轮/书本等）+ 石板背景（渐变/中心辉光/暗角/扫描线烘焙） |
| `img_to_c.py` | PNG → LVGL 9 `lv_image_dsc_t` C 数组（ARGB8888 图标 / RGB565 背景，小端） |
| `gen_font.mjs` | `lv_font_conv` 将 Hylia Serif TTF 转 16/20/28px LVGL C 字体（bpp4, ASCII 0x20–0x7F） |

产物：`main/img/` 19 个图片 C 文件 + `img_all.h`，`main/font/` 3 个 Hylia 字体，共 ~400KB Flash（factory 4MB 充裕）。`main/CMakeLists.txt` 的 `SRCS` 已补齐这 22 个源文件。

### 主题与组件升级（sheikah_theme / sheikah_ui）

- **字体映射**：标题/名称/页脚用 Hylia Serif（`SK_FONT_TITLE/LARGE/CAPS`），正文用 Montserrat（小写可读）。Hylia 无 `LV_SYMBOL_*` 字形，所有页脚提示改为纯 ASCII 文本（如 `UP/DN  BROWSE     OK  DETAILS`）。
- **背景**：`sk_screen_create()` 铺全屏 `img_slate_bg`（RGB565，扫描线/暗角已烘焙）。
- **装饰**：`sk_corner_frame(parent, w, h)` 用 `img_corner`（锚定右下角的实心三角）做四角括号，90° 倍数旋转像素无损（TL=180/TR=90/BR=0/BL=270）；标题栏两侧加 `img_ornament_*`。
- **辉光**：`sk_glow()` 封装 shadow，选中态 = 希卡蓝边框 + 辉光。
- **列表项**：`sk_list_add_item(list, icon, title, subtitle)` 重构为 `[图标?] [标题/副标题竖直列]`——`lv_list` 按钮本身是 FLEX_ROW，内嵌一个 `flex_grow` 的 FLEX_COLUMN 容器实现两行布局。
- **图标标签栏**：新增 `sk_icon_tabs_create()`，图鉴页 5 个分类用原版图标代替文字。
- **弹窗**：`sk_popup_show()` 改为游戏对话框风格（半透明遮罩 + 深蓝面板 + 四角角饰 + Hylia 黄标题 + 分隔线 + 换行正文）。

### 五页重做

- **待机页**：全屏石板背景 + 四角角饰 + 希卡之眼。辉光用【纯色半透明圆盘 + `bg_opa` 呼吸】实现，**不用 LVGL shadow**（见决策 5）。
- **符文页**：8 符文改为**环形轮盘**（圆心 120,116，半径 70），UP/DOWN 沿环逆/顺时针旋转，选中符文放大（scale 256）+ 全亮 + 辉光盘，中心 hub 显示选中图标 + 名称/描述。**Compendium/Adventure Log/Settings 现在都有真实图标**（不再是文字缩写）。
- **图鉴页**：文字标签 → 5 个原版分类图标标签；标题大写 `COMPENDIUM`；弹窗游戏化。
- **冒险记录页**：主线任务左侧加 `img_quest_main` 图标，每行右侧加类型色点；标题 `ADVENTURE LOG`。
- **设置页**：`BRIGHTNESS` / `RETURN TO STANDBY` 改 Hylia 大写，选中行加边框 + 辉光。

### 本阶段修复的两个 bug

见 坑 11（RGB565 字节序）、坑 12（页面 exit 屏幕泄漏 + 动画空转）。

> **注**：本阶段取代了阶段 3「符文 4×2 网格 + 文字缩写」、决策 3「仅 RGB565」、决策 4「4×2 网格」的早期方案；下文新增决策 5/6 说明取舍。

---

## 踩坑记录

### 坑 1：BSP CMakeLists.txt 被误覆盖

**现象**: 编译报 BSP 函数未定义

**原因**: 创建 `main/CMakeLists.txt` 时路径写错，覆盖了 `components/bsp/CMakeLists.txt` 的原始内容

**修复**: 立即用 SearchReplace 恢复原始 BSP 注册内容（SRCS bsp_i2c.c, bsp_display.c 等）

**教训**: 操作多个同名文件时仔细确认路径

### 坑 2：LVGL 9 不存在的符号常量

**现象**: 编译报 `LV_SYMBOL_BOMB`, `LV_SYMBOL_CHARGE` 等未定义

**原因**: LVGL 9 移除了部分 LVGL 8 中的符号常量 (LV_SYMBOL_BOMB, LV_SYMBOL_CHARGE, LV_SYMBOL_PAUSE, LV_SYMBOL_SNOW, LV_SYMBOL_IMAGE, LV_SYMBOL_BOOK, LV_SYMBOL_LIST)

**修复**: 替换为文字缩写 ("R-Bm", "Mgn", "Sts", "Ice", "Cam", "Cmp", "Log")

**教训**: LVGL 版本升级时符号常量有变化，查阅官方 changelog

### 坑 3：JSON 解析器 bug — 所有条目显示相同内容

**现象**: 图鉴页每个分类的所有条目都显示第一条的内容

**根因**: `json_extract()` 使用 `strstr()` 从 JSON 文本开头搜索 key，每次调用都匹配到第一个对象的字段

**修复**: 用 `obj_start` 参数（当前 `{` 的位置）作为搜索起点，并用 `next_obj_boundary` 限制搜索范围

```c
// 修复前 (bug):
const char *k = strstr(json_text, key);  // 总是从开头搜

// 修复后:
const char *k = strstr(obj_start, key);  // 从当前对象开始
if (k > next_obj_boundary) return false; // 不超出当前对象
```

**教训**: 手写 JSON 解析器必须严格限制搜索范围，否则会退化到匹配第一个对象

### 坑 4：cairosvg 需要系统 Cairo 库

**现象**: `OSError: no library called "cairo-2" was found`

**原因**: cairosvg 依赖 cairocffi，后者需要系统安装 Cairo C 库 (libcairo-2.dll)

**尝试的方案**:
1. `pip install svglib reportlab` → renderPM 也依赖 cairocffi，同样失败
2. `pip install svgpathtools` + Pillow 手动绘制 → 无法正确处理 SVG 路径的镂空 (fill-rule)

**最终方案**: Node.js + `@resvg/resvg-js` (Rust 编译的 SVG 渲染器，自带二进制) + `sharp` (libvips 图片处理)

```bash
npm install @resvg/resvg-js sharp
node svg_to_png.mjs
```

**教训**: Windows 上 SVG 渲染的 Python 方案大多依赖 Cairo，Node.js 的 resvg-js 是零依赖替代

### 坑 5：SVG CSS 变量填充色

**现象**: 渲染出的 PNG 图标不可见 (白色图案在白色背景上)

**原因**: SVG 使用 `fill="var(--fill-0, white)"` 或 `fill="var(--fill-0, #00BFFA)"`，CSS 变量在离屏渲染时不被解析

**修复**: 渲染前用正则替换 CSS 变量为实际颜色值

```javascript
svgText = svgText.replace(/fill="var\([^)]+\)"/g, `fill="${fillColor}"`);
```

### 坑 6：Sheikah_Slate 仓库克隆失败

**现象**: 目标目录已存在 (只有 .git), `git clone` 失败

**原因**: 之前不完整的 clone 留下了 .git 目录，`Remove-Item` 因文件锁定无法删除

**修复**: 在已有目录中 `git init` + `remote add` + `fetch` + `checkout main`

### 坑 7：`bool` 类型未定义 (`page_settings.h`)

**现象**: 编译报 `'bool' is defined in header '<stdbool.h>'; this is probably fixable by adding '#include <stdbool.h>'`

**原因**: `page_settings.h` 使用了 `bool` 返回类型但未包含 `<stdbool.h>`，且该头文件不通过 `lvgl.h` 间接包含

**修复**: 在 `page_settings.h` 顶部添加 `#include <stdbool.h>`

**教训**: 头文件中使用了 `bool`/`true`/`false` 时必须显式包含 `<stdbool.h>`，不能依赖其他头文件的间接包含

### 坑 8：`nvs_flash` 组件未声明

**现象**: 编译报 `Compilation failed because main.c includes nvs_flash.h, provided by nvs_flash component(s). However, nvs_flash component(s) is not in the requirements list of "main".`

**原因**: `main.c` 使用了 `nvs_flash.h`，但 `main/CMakeLists.txt` 的 `REQUIRES` 中未声明 `nvs_flash` 组件

**修复**: 在 `main/CMakeLists.txt` 中添加 `PRIV_REQUIRES nvs_flash`

**教训**: ESP-IDF 5.x 的组件依赖必须显式声明，即使其他组件间接包含了该头文件

### 坑 9：`update_sel()` 函数前向声明缺失

**现象**: 编译报 `implicit declaration of function 'update_sel'` 和 `static declaration of 'update_sel' follows non-static declaration`

**原因**: `build_list()` 在第 114 行调用了 `update_sel()`，但 `update_sel()` 的定义在第 117 行，编译器先看到隐式声明（返回 int），再看到 static void 定义时类型冲突

**修复**: 在文件顶部添加 `static void update_sel(void);` 前向声明

**教训**: C 语言中 static 函数必须在调用前声明（定义或前向声明），否则编译器会推断错误的返回类型

### 坑 10：LVGL 9 滚动条样式 API 变更

**现象**: 编译报 `implicit declaration of function 'lv_obj_set_style_scrollbar_color'` 等

**原因**: LVGL 9 移除了 `lv_obj_set_style_scrollbar_*` 系列函数，改用 `LV_PART_SCROLLBAR` 选择器 + 通用样式 API

**修复**: 替换为 LVGL 9 风格：

```c
// LVGL 8 (已移除):
lv_obj_set_style_scrollbar_color(list, lv_color_hex(SK_BLUE), 0);
lv_obj_set_style_scrollbar_opa(list, LV_OPA_50, 0);
lv_obj_set_style_scrollbar_width(list, 3, 0);

// LVGL 9:
lv_obj_set_style_bg_color(list, lv_color_hex(SK_BLUE), LV_PART_SCROLLBAR);
lv_obj_set_style_bg_opa(list, LV_OPA_50, LV_PART_SCROLLBAR);
lv_obj_set_style_width(list, 3, LV_PART_SCROLLBAR);
```

**教训**: LVGL 9 将滚动条样式统一到 part 选择器机制，所有 `scrollbar_*` 专用函数都改为 `bg_*` + `LV_PART_SCROLLBAR`

### 坑 11：RGB565 图片字节序（大端 vs 小端）

**现象**：石板背景图上屏后红蓝错乱/花屏（ARGB8888 图标正常，仅 RGB565 背景异常）。

**根因**：`img_to_c.py` 的 `convert_rgb565()` 用 `struct.pack('>H')`（大端）写像素。但经 LVGL 9 源码链路核实：
- `bsp_display_lvgl.c` 的 `.swap_bytes = true`，LVGL 输出小端 RGB565；
- `esp_lvgl_port` flush 时对整块缓冲做 `lv_draw_sw_rgb565_swap` 再送面板；
- 不透明 RGB565 源图混合时走 `lv_memcpy` 原样拷贝到 native（小端）缓冲。

即：**源图必须以小端存储**，字节交换发生在 flush 阶段而非源数据。

**修复**：`convert_rgb565()` 改用 `struct.pack('<H')`（小端）。重跑后首像素 `0x63,0x08`（= 小端 `0x0863`）与手工计算吻合。

**教训**：LVGL 9 的 `swap_bytes` 是“显示驱动层”的字节交换，不改变源图数据布局；RGB565 源图一律小端。

### 坑 12：页面 exit() 只置 NULL → 屏幕泄漏 + 动画空转

**现象**：每次切页 RAM 下降（屏幕对象未释放）；离开待机页后呼吸动画仍在后台空转。

**根因**：五个页面的 `exit()` 都只写 `s_scr = NULL`，既不 `lv_obj_delete(s_scr)` 释放屏幕，也不 `lv_anim_delete()` 停动画。

**修复**：
- `exit()` 中先 `lv_anim_delete()` 停掉作用于本页对象的动画（待机页），再 `lv_obj_delete(s_scr)`，最后置 NULL；
- 弹窗页（图鉴/冒险）先 `sk_popup_close()`（弹窗是 `s_scr` 子对象）再删屏。

**为何删屏安全**：`switch_page()` 是 `exit()` → `enter()` 顺序，`exit()` 删除的是当前活动屏幕。核实 LVGL 源码 `lv_obj_delete()`（`lv_obj_tree.c`）：删除活动屏幕时会把 `disp->act_scr = NULL`；随后 `enter()` 的 `lv_screen_load()` → `load_new_screen()` 显式容忍 `old_scr == NULL`。且整个过程持 `bsp_lvgl_lock`，中途无渲染，故“删旧屏 → 载新屏”安全。

**教训**：LVGL 页面 exit 必须显式释放屏幕对象并停掉绑定其对象的动画；删活动屏幕后 LVGL 会清空 `act_scr`，紧接着载入新屏是安全的。

---

## 设计决策记录

### 决策 1：为什么是状态机而不是 LVGL Screen 切换

**选择**: 手动 `page_id_t` 状态机 + `lv_screen_load()`

**理由**:
- LVGL 9 的 `lv_screen_load()` 每次加载新屏幕会销毁旧屏幕的所有对象
- 这正好匹配我们的需求：每个页面 enter 时创建，exit 时自然清理
- 状态机模式简单：`exit(current) → current = next → enter(next)`

**拒绝方案**:
- `lv_tabview` / `lv_menu`: 会同时保留所有页面的对象，RAM 不够
- 自建页面栈: 3 键交互足够简单，不需要历史栈

### 决策 2：为什么 JSON 不用 cJSON

**选择**: 手写 `strstr` 模式匹配

**理由**:
- cJSON 在解析时会在堆上创建完整的对象树，占用数 KB RAM
- 我们的 JSON 结构非常简单且可预测（数组 + 固定字段名）
- 手写解析器零堆分配，只用栈上的 256 字节缓冲区

**权衡**: 代码量多 ~30 行，但没有 RAM 开销

### 决策 3：为什么图片用 RGB565 而不是 ARGB8888

**选择**: RGB565 (2 bytes/pixel) + 黑色背景

**理由**:
- RGB565: 120×120 = 28.8KB, 5 个 48×48 = 23KB, 共 ~52KB
- ARGB8888: 同样尺寸需要 ~104KB, Flash 占用翻倍
- 希卡石板的设计是深色背景 + 亮色图案，不需要透明通道
- 黑色背景合成在图片生成阶段完成 (sharp `.flatten()`)

### 决策 4：为什么符文选择器是 4×2 而不是水平滚动

**选择**: 4×2 网格 (4 列 2 行)

**理由**:
- 240px 屏幕宽度，4 个 44px 图标 + 间距 = 206px，留白均匀
- 8 个符文正好填满 2 行
- 水平滚动在 3 键交互下不直观 (只有 UP/DOWN, 没有 LEFT/RIGHT)
- UP/DOWN 在网格中循环选择，体验更自然

### 决策 5：辉光用纯色圆盘动画，不用 LVGL shadow（阶段 5）

**选择**：待机页希卡之眼辉光 = 纯色半透明圆盘 + `bg_opa` 呼吸动画。

**理由**：ESP32-C3 无 PSRAM，LVGL 软件 shadow 每帧重算模糊代价高；圆盘填充 + 图片混合仅重绘 ~164×164 区域，约 3ms/帧，呼吸流畅且不饿死其他任务。选中态的静态 `sk_glow` shadow 只在状态变化时重算，可接受。

### 决策 6：图标用 ARGB8888（带透明），背景用 RGB565（阶段 5，取代决策 3）

**选择**：符文/分类/装饰图标用 ARGB8888（保留透明通道，叠在石板背景上边缘干净）；全屏背景用 RGB565（不透明，省一半空间）。

**理由**：初版（决策 3）为省 Flash 把所有图压成 RGB565 + 黑底，但图标黑底方块叠在深蓝背景上很突兀、“不像原版”。ARGB8888 图标共 ~210KB + 背景 150KB，仍远低于 4MB factory 分区，视觉收益远大于 Flash 成本。前提：`CONFIG_LV_DRAW_SW_SUPPORT_ARGB8888=y`（默认开启，已在 sdkconfig 核实）。

---

## 后续可玩方向

- **音效**: 利用 BSP 的 ES8311 I2S codec 播放简短的希卡音效 (石板激活/页面切换)
- **休眠省电**: 30s 无操作自动关闭背光, 按键唤醒
- **电量显示**: 利用 BSP 的 CW2017 电量计在状态栏显示电池百分比
- **BLE 连接**: 虽然不做 HID，但可以用 BLE 做一个简单的"手机同步冒险记录"功能
- **陀螺仪**: AI Passport 有 MPU6050 (I2C)，可以做"摇晃激活"的效果

---

## 提交历史（分步提交记录）

```
docs: 添加开发文档 (docs/README.md + development-log.md)
feat: 添加游戏原版 SVG 素材和 LVGL 图片转换工具
feat: 添加海拉鲁图鉴和冒险记录 JSON 数据
feat: 实现 5 个页面和主程序状态机
feat: 实现希卡主题系统和通用 UI 组件
feat: 初始化项目结构和 BSP 硬件驱动
```
