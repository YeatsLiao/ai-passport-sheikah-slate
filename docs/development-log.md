# 开发日志

本文件保留既有开发过程，包括技术调研、方案决策、踩坑记录和问题修复；不再作为当前状态的权威来源。

仅在追溯时先通过 [历史索引](context/history/README.md) 选择关键词，再读取相关章节。
当前任务见 [NOW](context/NOW.md)，当前决策入口见 [DECISIONS](context/DECISIONS.md)，验证缺口见 [RISKS](context/RISKS.md)。
历史正文中的路径、通过记录与“后续可玩方向”不自动成为当前事实或执行授权。

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

## 阶段 6：符文能力模拟 + 帧率优化

### 符文能力模拟（新增 `page_rune_app.c`）

5 个游戏符文从纯装饰变为可交互模拟（纯 LVGL 绘制，无新素材，退出均长按 OK）：

| 符文 | 交互 |
| --- | --- |
| REMOTE BOMBS | OK 放置炸弹（引信闪烁）→ 再按 OK 引爆（冲击环扩散 + 白闪 + 画面震动） |
| MAGNESIS | UP/DOWN 移动准星，OK 吸附/释放金属箱（吸附后箱子跟随准星，有距离判定与提示文案） |
| STASIS | 石块持续左右移动，OK 时停 5 秒（橙色冰封 + 28px 大字倒计时，结束解冻恢复移动） |
| CRYONIS | OK 从水面升起冰柱（生长动画，最多 3 根，第 4 次融化最早一根） |
| CAMERA | 取景框 + 对焦环，OK 拍照（白闪 + 底片条缩略图 + SAVED 淡出，防连按重复计数） |

路由：`page_runes.c` 游戏符文 `page_id` 改为 4，新增 `page_runes_get_selected_rune()`；`main.c` 增加 `PAGE_RUNE_APP`，长按 OK 与其他子页一致返回符文页。

### 帧率三件套

| 改动 | 收益 |
| --- | --- |
| `BSP_LCD_PCLK_HZ` 40→80MHz | 整帧 SPI 传输 ~31ms→~15ms，第一瓶颈减半 |
| 20 行单缓冲→双缓冲（+9.6KB 内部 RAM） | 渲染下一带与上一带 SPI 传输重叠（esp_lvgl_port 用 trans_done 中断回调 flush_ready），约快 30-40% |
| `CONFIG_LV_DEF_REFR_PERIOD` 33→16ms | 默认 33ms 把帧率硬限在 30fps，改为 60fps 上限 |

---

## 阶段 7：音效系统（合成兜底 + 换装管线）

游戏原版音效下载受限，改用纯正弦/噪声合成“希卡味”电子音（版权干净可入库），同时把换装管线建好——以后拿到原版 wav 覆盖 `assets/audio/<id>.wav` 重跑脚本即可。

| 组件 | 说明 |
| --- | --- |
| `tools/gen_synth.py` | 合成 8 个音效到 `assets/audio/`（chirp 扫频 + 指数衰减 + 一阶低通噪声，固定种子可复现） |
| `tools/gen_audio.py` | wav → 16kHz/16bit/mono PCM → `main/audio/sfx_data.{c,h}`（ffmpeg 可选，纯 Python wave 兜底） |
| `main/audio/sfx.c` | 播放模块：`sfx_play()` 只投队列（按键回调/LVGL 定时器内安全），audio 任务懒初始化 `bsp_audio` 后分块写 I2S |

8 个音效（合计 ~102KB flash）：activate(0.78s)/tick/confirm/bomb_place/bomb_boom(0.9s)/stasis_freeze/stasis_unfreeze/shutter。触发点 11 处：待机激活、轮盘 UP/DOWN、符文选中、进能力页、炸弹放置/引爆、时停冻结/解冻、快门。

---

## 阶段 8：游戏原版对齐打磨 + 交互修复

实机验证反馈三类问题：音效不够"原版"、轮盘布局拥挤、设置页按键无用。逐一对齐修复。

### 音效对齐游戏（8 → 10 个）

游戏里每个符文激活都有专属音色，原先只有炸弹/时停/相机有音：

- 新增 `magnesis_activate`：55Hz 电磁嗡鸣（失谐玻璃双振）+ 电弧上扫 + 金属泛音
- 新增 `cryonis_activate`：C5-G5-C6 水晶上行琶音 + 冰裂噪声
- 精调全部 8 个现有音：activate 更明亮（增加 880/1320Hz 钟音泛音）、confirm 更清脆、stasis 增加金属分音、tick 更短促、shutter 更紧凑

触发点扩到 14 处（新增：磁力进入、制冰进入、冰柱生长）。

### 轮盘布局对齐游戏原版

- 8 符文环形轮盘（r=78，对齐 quick-selector 规格），相邻图标间隙 ~60px 不拥挤
- 中心 hub 纯装饰（D-pad 十字）：不放选中图标副本——否则选中环上底部/顶部符文时放大图标与 hub 内副本挤在一起
- 底部信息两行即止：名称 (Hylia) + 描述；装备状态行与符文名重复，删除
- 快速选配框架件（quick-selector top/left/right SVG）在 240px 小屏与 r=78 图标环几何重叠，实测移除；扫描线侧边装饰保留（待机/轮盘页）

### 设置页交互修复

- 根因：`main.c` 设置页 OK 处理完后事件穿透到默认分支再调一次 `page_settings_key()`，ABOUT 弹窗开了又立即被关（看似按键无用）
- 交互重构为游戏式编辑模式：OK 进入调值（行框变黄），UP/DOWN ±10，OK 确认；不再依赖 1.5s 长按
- `page_compendium.c` 补 `update_list_selection()` 前向声明（与坑 9 同类）

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

### 坑 13：LVGL 9 没有 `lv_timer_del`，是 `lv_timer_delete`

**现象**：符文模拟页首次编译即报隐式声明/链接错误。

**根因**：LVGL 8 的 API 名是 `lv_timer_del`，LVGL 9 改名为 `lv_timer_delete`（`lv_anim_del` → `lv_anim_delete` 同理，但项目里原本就没用到旧名）。

**教训**：从旧教程/记忆里写 LVGL API 前先对 `managed_components/lvgl__lvgl/src/misc/lv_timer.h` 核实；本项目 LVGL 9 定时器删除断续续用到，统一用 `lv_timer_delete`。

### 坑 14：按键事件穿透 —— 处理完必须 return

**现象**：设置页按 OK 打开 ABOUT 弹窗后弹窗立即消失，表现为"按键无用"。

**根因**：`main.c` 的按键分发里，设置页 OK 分支处理后没有 `return`，事件穿透到后面的默认分支又调了一次 `page_settings_key()`——第二次调用把刚打开的弹窗关掉了。

**修复**：分支处理完后显式 `return`（需要先解锁 LVGL 锁再返回）。

**教训**：按键分发器的每个专属分支处理完必须终止传播；穿透型 bug 的表现往往不是"多响应"而是"相互抵消"，很难从现象直接定位。

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

### 决策 7：帧率优化只动“传输+调度”，不动渲染算法（阶段 6）

**选择**：SPI 80MHz + 20 行双缓冲 + 16ms 刷新周期，不动页面绘制逻辑。

**理由**：瓶颈定量算过——整帧 153KB 走 40MHz SPI ≈ 31ms，单缓冲下渲染/传输逐带串行；这四项都是配置级改动（~15 行），不动已经验收过的视觉。双缓冲 +9.6KB 内部 RAM 的风险用注释里的回退路径控制（NO_MEM 时改回单缓冲）。

**拒绝方案**：缩小待机呼吸动画区域/降低动画精度——牺牲视觉换不多的帧数，等实机确认 SPI 80MHz 稳定后仍有需要再说。

### 决策 8：图鉴封面用「分类代表照片 + 官方分类图标」（Web 原型）

**选择**：五个分类卡的底图换成该分类的代表性图鉴实拍图（马 / 波克布林 / 苹果 / 大师之剑 / 宝物箱），右上角贴 72×55 的官方分类图标；条目按游戏内图鉴编号与分类重排，照片全部换成图鉴实拍图：

| 分类 | 封面 | 条目（原版编号） | 总数 |
|---|---|---|---|
| 生物 | 马 | 马 001 / 蓝雀 032 / 亮胸鸭 041 / 海拉鲁鲈鱼 048 / 耐火蜥蜴 083 | 83 |
| 怪物 | 波克布林 | 波克布林 103 / 莫力布林 108 / 蜥蜴战士 113 / 莱尼尔 121 / 西诺克斯 147 | 81 |
| 材料 | 苹果 | 苹果 165 / 野莓 167 / 榴莲 168 / 海拉鲁蘑菇 174 / 蓝色夜光草 198 | 36 |
| 装备 | 大师之剑 | 大师之剑 201 / 士兵的阔剑 208 / 古代短剑 218 / 王族双手剑 257 / 海利亚盾 354 | 185 |
| 宝物 | 宝箱 | 宝箱 386 / 矿床 387 / 稀有矿床 388 / 夜光矿床 389 | 4 |

**理由**：此前封面是随机背景截图、右上角贴的是怪物抠图（生物卡配丘丘、材料卡配西诺克斯），与分类内容不对应，也不像游戏内图鉴。实拍图 + 官方分类图标既保证“封面=内容”，也保留了原版 UI 的识别符号；头部进度改为按真实总数动态计算（52 / 389 · 13%），不再写死 34 / 90。

**素材来源**：见 README「图鉴素材来源（Web 原型）」——Hyrule-Compendium-API（MIT，图鉴照片与编号）、hyrule-compendium（ISC，五个分类图标）、zelda-botw-starter（未声明许可，装备透明图标）；react-sheikah-ui 只作 UI 参考，无游戏素材。导入脚本 `tools/import_compendium_assets.py` 输出 33 个 `cp_*`/`cat_*`/`eq_*` 资产。

**权衡**：图鉴照片是游戏内实拍图（偏灰绿、带环境背景），不是宣传插画；在深色 UI 上用 0.95 不透明度 + 底部渐变压暗保证文字可读，不做额外调色，以免偏离原图。宝物分类原版只有 4 条，按实际条数展示，不凑成 5 条。

### 决策 9：手感层用「覆盖层 + 真实 wav + 置灰」，不动 DOM 结构（Web 原型）

**选择**：选中框改成绝对定位的覆盖层 `.focus-frame`；音效直接播 `assets/audio/*.wav`；交互前置条件用 `disabled` 表达；换页加扫光、长按加进度条、悬停跟随焦点。

**理由**：
- `:focus` 样式要写进每个控件，还会和 `.comp-tile::after`、`.map-pin::before` 这些既有伪元素抢图层；覆盖层只有一份 CSS，坐标按 `(元素 rect − 屏幕 rect) ÷ --scale` 现算，缩放后仍然贴合，还能整体做 0.1s 平移动画。
- 音效复用固件同一批 16 kHz 单声道 wav，按动作语义分配音色（放置=机械落位、冻结=金属下滑、碎冰=玻璃碎裂），原型与实机能听到同一套反馈，评审结论才可迁移。
- 按钮置灰比“点了弹提示”更接近游戏：一眼就能看出「引爆」要先放炸弹；toast 只留给需要解释的情况（未登记条目、封印符文）。
- 相机快门写入 `state.albumShots`，相册页与「相册 N」计数同步，是原型里唯一一条跨页数据流，用来验证“拍照 → 图鉴/相册”这条设计是否成立。

**拒绝方案**：
- 引入 React / 构建链重写原型——现在四个静态文件双击就能开，接固件前不值得多一层依赖。
- 直接引用 `react-sheikah-ui` 的组件代码——它是 styled-components + framer-motion，与“无依赖、无构建”的前提冲突；只借设计语言即可。
- 用 Web Audio 振荡器现合成提示音——音色单薄，且与固件听到的不是同一批素材。

**权衡**：Calamity 只覆盖拉丁字母与数字，中文仍走系统字体，混排时字重略有差异；选中框是覆盖层，截图前要等字体 `ready`，所以 `build/shots.ps1` 的 `--virtual-time-budget` 从 2200 ms 提到 3600 ms，否则会截在淡入动画中途。

---

## 决策 10：assets 按「管线阶段」分四层，而不是按图片内容

**选择**：`assets/` 拆成 `raw/`（上游原图，只给生成脚本读）、`gen/firmware`（固件 C 数组的图源）、`gen/prototype`（Web 原型贴片）、`data/`、`audio/`；根目录新增 `assets/README.md` 当资产地图，`manifest.json` 留在根与 `gen/firmware` 配套。

**理由**：整理前 assets 约 79 MB、330+ 文件，混了四种生命周期完全不同的东西——不可再生的下载原图、可随时重跑的脚本产物、只给固件编译的图源、只给原型读的贴片，中间还夹着一个下载临时目录。按内容分类（背景/怪物/材料）解决不了「哪张能删」；按管线阶段分类则一眼能判断：`raw/` 删了要去 Zelda Wiki 重下，`gen/` 删了跑脚本即可。

**落地**：`images/*.png` 45 张里只留 `images.cmake` 实际编译的 28 张进 `gen/firmware`，17 张旧五页 UI 素材连同对应的 `main/img/img_*.c` 一起删除；`images/real` 142 张只留原型真实引用的 75 张进 `gen/prototype`；`zeldawiki-extra → raw/zeldawiki`，`zeldawiki-runes`/`maps`/`source` 一并归入 `raw/`。原型 `IMG()` 基址改为 `gen/prototype`，另加 `FW()` 读固件图源（炸弹墙、磁力闸门与木箱三处道具仍借固件图）。删完后 `main/img` 只剩 28 个 `.c`，与 `img_all.h` 的 28 条 extern 一一对应。

**拒绝方案**：
- 按图片内容建 `bg/`/`monster/`/`material/` 目录——仍要逐张查引用，而且同一张图可能既是固件图源又是原型贴片。
- 保留 `assets/images` 不动、只加一份 README——文件名与用途继续错位，下次仍会问「这个还在用吗」。

**权衡**：路径变更要同步 5 处 CSS/HTML、71 个 `IMG()` 引用和 6 个生成脚本；验收靠两件事——脚本断言「所有引用都能解析到文件」，再跑 53 张截图回归。`gen/prototype` 只提交在用的 75 张，其余依赖 `build_real_assets.py` 重生成，所以换机器后先跑脚本再截图。

---

## 决策 11：全量素材库、离线装备数据与01换装首屏

**范围**：本批次只调整素材管线和Web原型，不推进历史固件计划，不改main/BSP/分区，不提交Git或部署。CODEX保留24条示例，拍照与相册规则不变。

**归档**：三个来源共968个文件，约100.07 MiB；全部保留原路径及文件名，包括跨游戏同名图、撇号、加号和大师模式目录。

| 来源 | 归档内容 | 当前选用 |
|---|---|---|
| [Hyrule-Compendium-API](https://github.com/gadhagod/Hyrule-Compendium-API) | 907项：images全目录及说明/许可；BOTW 390、TOTK 509、大师模式5张PNG | 24张BOTW图鉴照片 |
| [hyrule-compendium](https://github.com/arjunkahlon/hyrule-compendium) | 14项：12张辅助图片及README/package.json | 5张分类图标 |
| [zelda-botw-starter](https://github.com/flagrede/zelda-botw-starter) | 47项：public/items、src/assets、静态装备数据及说明文件 | 24件装备、背景、7个SVG、2个字体、2段菜单音效 |

**管线**：`python tools/import_compendium_assets.py --archive`只归档，来源默认同级目录，可用`--source-root`或`BOTW_ASSET_ROOT`指定；预检通过再复制，同内容跳过、异内容冲突失败，不修改或清理来源。独立清单`assets/raw/import_manifest.json`记录仓库URL/版本、路径、字节数、SHA-256、尺寸和所属游戏；不取代固件manifest。

日常运行`python tools/import_compendium_assets.py`只读项目内raw，生成24张cp、5张cat、24张eq、装备背景和7个SVG，以及`assets/data/inventory.json`与`prototype/js/inventory-data.js`。装备静态数据不执行外部TypeScript；ID显式映射，透明图缩到64×64，避免Alpha二次相乘。原型图片共103项（96 PNG + 7 SVG），不是把全部原图都加载进页面。

**装备交互**：3×2网格与每类独立分页/选中位置，右侧预览、完整说明分页，装备/卸下覆盖武器、盾牌、头部、身体、腿部五槽；同槽替换，防御只加三个防具槽。沿用哈希路由、焦点覆盖层及三键输入，无持久化、购买、战斗或真实角色模型换装。

**最新用户调整**：装备/换装作为`01`默认首屏及首个导航；其后依次为02符文、03地图、04图鉴、05记录、06系统，07待机保留在末尾。使用现成素材优先：分类图、效果water/mountain/fire和翻页arrow直接复用starter的SVG，字体从归档导出至`prototype/fonts/`。

**音效**：starter的`src/assets/sounds/select.mp3`用于移动/返回，`action.mp3`用于确认/装备/入口激活；原件在raw，运行副本在`assets/audio/prototype/`，不重编码或变调。当前本地来源只提供这两段菜单音效，没有爆炸/制冰等专属原版音源；其他玩法保留既有合成wav，尚未完成全原版音效替换，固件音效不变。用户随后明确“稍后再做”，补齐其他玩法原版音源已移出本轮执行范围；未下载新的音频或安装外部插件。

**来源边界**：API代码MIT；hyrule-compendium仅package.json标注ISC；starter未声明许可，其README没有两段音效的独立出处或授权说明。以上代码许可均不视为Nintendo图片/音效授权；“第三方现成素材”不冒称已核实的游戏原版。

**执行记录**：最新首屏/音效修改前，968项来源对照及哈希校验、10项Python测试、Chrome的114项检查已通过；旧截图保存在`build/inventory-browser/`。随后用户要求不走自动化测试，本次不再运行测试或截图测试脚本，只执行离线素材生成；现有测试保留为可选工具，旧报告不证明新修改通过。浏览器工具连接超时，当前调整待人工预览。

---

## 决策 12：先替换用户提供的真实图标，界面分步推进

**用户调整**：不再要求浏览器预览或截图验收，只需保持本地服务启动；继续不运行自动化测试。当前一步先使用 `assets/zeldawiki-original/`，参考用户提供的游戏图鉴截图，整体布局和边框留待后续。

**素材接入**：保留原目录33张原件，不下载、不移动、不修改。`build_real_assets.py --originals-only` 导出13张图标（7符文、5分类、希卡之眼）及12张原色模型；11张图标逐字节复制，时停/制冰仅清除纯白背景，石板模型仅清除边缘连通的纯色底，缩放不二次乘Alpha。法师概念设计是带说明文字的整张设定稿，未用它替换已有的透明电法师模型。

**页面接入**：符文列表、场景标题、顶部入口、侧栏眼形图改用原图；圆/方炸弹切换时标题图标同步。未开放格显示amiibo原图但不增加玩法。图鉴未记录占位使用所属分类图，地图装饰改用原色模型；MAP/LOG/SYSTEM没有对应原图时只保留文字入口。装备01、24条CODEX、相机和相册交互不变。

**重建约束**：完整素材生成最后应用用户原图；装备导入脚本也优先读取用户提供的分类图，避免后续重建覆盖。可选校验脚本同步符文图片的Web路径，但本次没有执行它。两张旧剪影已无运行时引用，文件暂留；原目录缺少的地图、箱子、闸门、冰柱、炸弹实体和爆炸帧继续作为既有占位，未宣称全素材或完整界面达到原版。

**执行记录**：已运行离线导出并直接查看图标/贴片文件，未操作浏览器、未截图、未运行自动化测试。现有Python服务在127.0.0.1:8124监听并服务当前工作区，继续复用；未改固件、计划文件、音频或装备数据，未提交或部署。

---

## 决策 13：素材按“管线输入 / 未集成归档”拆开，去重后再推进页面

**用户调整**：新增下载的一批 UI 素材直接堆在 `assets/zeldawiki-original/`，感到重复且杂乱，要求先整理素材再继续做页面。这改写了决策 12 中“原目录只读、不移动”的约束：只读仍适用于文件内容，但目录结构按本次要求重组。

**审计结果**：该目录当时 140 个文件，其中 74 个与 `assets/raw/` 或 `assets/gen/` 已归档文件逐字节相同（SHA-256 对比）；真正被脚本读取的只有 25 张（`build_real_assets.py` 的 13 图标 + 12 模型，其中 5 张分类图另供 `import_compendium_assets.py` 使用）。`equipment/` 24 张是 starter 装备图之外的第二套渲染，与页面无引用。

**拆分方式**：`zeldawiki-original/` 只留 25 张管线输入，目录层级不变，因此两个生成脚本无需改路径；未集成的 UI 素材（按键、分类、希卡文字、实机参考、游戏内分类字形、备用装备图标）移入新建的 `assets/raw/zeldawiki-ui-pack/`，共 104 个文件，符合 raw 作为上游原料层的约定。11 个纯重复副本移入 `build/_trash/2026-10-28-zeldawiki-original-dedup/` 待用户确认后删除，未直接永久删除。

**防复发**：`tools/download_botw_ui_icons.py` 的输出目录改为 `assets/raw/zeldawiki-ui-pack/`，不会再写回管线输入区；清单中删去希卡族纹章一条，因为它已是 `zeldawiki-original/ui/` 的管线输入，重复下载只会再造一份副本。两处 README 分别记录“谁是输入、谁是备用、哪些已去重、哪些真缺失”。

**执行记录**：拆分后重新校验 25 张必需输入全在（`missing 0`），未运行自动化测试、未操作浏览器；未改 `prototype/`、`assets/gen/`、固件或计划文件，未提交或部署。

**校验防回退**：`tools/verify_assets.py` 新增两项硬约束——25 张管线输入缺一即报错，`zeldawiki-original/` 与 `raw/zeldawiki-ui-pack/` 内不得再出现逐字节相同的文件；另提供 `--duplicates` 列出 `assets/` 全树同字节分组供人工判断。自测：向包内复制一份同名图，校验如实报 1 个问题并 exit 1；移除后恢复 `exit 0`（输出：归档 968 / 固件 28 / 原型 110 / 装备 24 / 管线输入 25 / 未集成素材 104）。

---

## 决策 14：圆/方炸弹拆成两个符文入口，符文页六格全部可玩

**对齐规范**：Spec 要求「圆炸弹与方炸弹分别显示，共六个能力入口；两种炸弹共用同一个玩法模块」。原实现把两种形态塞进一个入口、在场景里用「圆 / 方」按钮切换，与规范和 README 已写的「六个入口」不一致。

**实现方式**：`data.js` 的 `RUNES` 增加 `bomb_cube`（`kind: 'CUBE'`，图标 `rune_cube.png`），`viewRune` 让 `bomb` 与 `bomb_cube` 共用 `viewBomb`；形态由符文页入口决定，进入另一形态时清空放置/完成状态，场景内的切换按钮删除。符文页去掉一直不可玩的 amiibo「SEALED」占位格，3×2 网格正好放下六个入口；侧栏与哈希路由补 `#/rune/bomb_cube`。

**验证**：`node --check` 通过 `prototype/js/app.js`、`prototype/js/data.js`；`python tools/verify_assets.py` 返回 `exit 0`（归档 968 / 固件 28 / 原型 110 / 装备 24 / 管线输入 25 / 未集成素材 104）。按用户要求未运行自动化测试、未操作浏览器；符文页新布局待人工预览。

---

## 决策 15：zeldawiki-original 合并进 raw，管线输入不再单设目录

**用户要求**：把 `assets/zeldawiki-original/` 这个文件夹合并掉。决策 13 把它保留为 25 张管线输入的“输入契约”，但它与 `raw/` 已有归档逐字节相同，等于同一批图存了两份。

**合并前证据**：用一次性探针（`build/_merge_probe.py`，只在 build 下，未入库）对 25 张逐个算 SHA-256，再在 `assets/raw/` 全树找同字节文件——25 张全部命中，缺失 0 张。映射关系：7 张符文图标 → `raw/zeldawiki-runes/icons/`；希卡之眼 → `raw/zeldawiki/sheikahtext/BotW_Crest_of_the_Sheikah_Symbol.png`；5 张分类图标 → `raw/hyrule-compendium/images/icons/`；11 张怪物模型 → `raw/zeldawiki/monsters/`；石板渲染 → `raw/zeldawiki/slate/BotW_Sheikah_Slate_Render.png`。

**脚本改动**：`build_real_assets.py` 新增 `RAW = assets/raw`、删除 `ORIGINAL`，`ORIGINAL_ICONS` 的值改为 raw 相对路径，`ORIGINAL_CUTS` 改为带子目录的 raw 路径（`monsters/*`、`slate/*`），`prepare_original_assets` 与 `export_original_assets` 统一从 `RAW` 拼路径；`import_compendium_assets.py` 删掉 originals 分支，分类图固定读 `raw/hyrule-compendium/images/icons/`；`verify_assets.py` 第 7 节改为从 `RAW` 解析 25 张，第 8 节只对 `raw/zeldawiki-ui-pack/` 检查自重复（raw 内部跨子树同字节属历史归档，不报错）。

**执行记录**：`prepare_original_assets()` 干跑成功（25 张全部可打开）；`python tools/build_real_assets.py --originals-only` 输出「13 张真实图标（2 张仅去白底）、12 张原色模型贴片」，13 张图标输出 SHA-256 变化数为 0，说明改路径没有改动产物；原目录整体移入 `build/_trash/2026-10-28-zeldawiki-original-merged/`（26 个文件），`Test-Path assets/zeldawiki-original` 为 False；`python tools/verify_assets.py` 返回 `exit 0`（归档 968 / 固件 28 / 原型 110 / 装备 24 / 管线输入 25 / 未集成素材 104）。未运行自动化测试、未操作浏览器，未改 `prototype/` 产物与固件。

> 同日后续：`raw/` 又被按游戏内容重排（决策 17），本节里的 raw 子目录路径已不再适用；文件名一个未改，可对名匹配。

**拒绝方案**：继续留 25 张当“输入契约”——用户已要求合并，且 raw 内有同字节副本，两份只会再次产生“哪份才算数”的歧义；把未集成 UI 包也塞进同一个目录——会把“管线输入”和“未集成归档”重新混在一起，违反决策 13 的分层。

**回滚**：`build/_trash/2026-10-28-zeldawiki-original-merged/` 保留原目录结构与文件名，需要时可整体移回 `assets/`；确认无用后与前面 11 个副本一并删除即可。

---

## 当前批次完成审计（2026-10-28）

逐条对照本节批次的交付项，证据全部取自当前工作区，不靠之前的记忆：

- **全量归档**：`assets/raw/import_manifest.json` 记录 968 个文件，来源为 hyrule-compendium-api / hyrule-compendium / zelda-botw-starter 三个仓库；`tools/verify_assets.py` 的文件集合与哈希校验通过。
- **离线重生成**：默认模式只读 `assets/raw/`；`assets/data/inventory.json`、`prototype/js/inventory-data.js` 与图片一一对应（24 件：8 武器 / 4 盾牌 / 12 防具，ID 唯一、槽位合法，由 `validate_inventory` 强制）。
- **装备页**：`#/inventory` 三分类各有独立页码与选中项，右侧预览、装备/卸下覆盖五槽、说明分页、长按返回；状态仅存内存，刷新或重置即复原。
- **素材整理**：管线输入 25 张已合并进 `assets/raw/`（决策 15，原目录移入 `build/_trash/2026-10-28-zeldawiki-original-merged/`），未集成 UI 素材 104 个，11 个同字节副本在 `build/_trash/2026-10-28-zeldawiki-original-dedup/` 待确认；`--duplicates` 可复查全树分组。
- **页面回归（静态）**：图鉴 24 条未扩成全量；原型 JS/CSS/HTML 无外部 URL，无 TOTK 或大师模式条目；符文页六个入口全部可玩。
- **未执行**：浏览器交互验收、自动化测试（用户明确要求不做）；`main/`、BSP、分区、固件图源未在本批次修改。

**待用户确认**：符文页 3×2 新布局与装备页/林克比例；`build/_trash` 里两批可回滚目录（11 个副本 + 已合并的原目录）何时删除。管线输入改读 `raw/` 一项已按用户要求完成（决策 15）。这两项定下来后，才进入计划的下一步（横屏固件与五关实机验收）。

---

## 决策 16：固件批次逐条对照（2026-10-28，未编译复验）

计划的历史固件部分（横屏、三键、五关、图鉴/相册、NVS、音效）已在代码中落地，本节只记录“哪条要求由哪段代码兑现”，不把静态阅读当成编译或实机结论。

| 计划要求 | 现状与证据 |
|---|---|
| 横屏 320×240、单一方向开关、硬件 swap/mirror | `bsp_display_lvgl.c` 的 `.rotation={.swap_xy=true,.mirror_x=BSP_LCD_CLOCKWISE,.mirror_y=!BSP_LCD_CLOCKWISE}`，一处宏切换另一横向方向；`bsp_display.c` 的 `esp_lcd_panel_mirror(false,false)` 保留了硬件基线 |
| 三键按下/抬起 + 长按消费短按 | `bsp_button.c` 同时注册 `BUTTON_PRESS_DOWN`/`PRESS_UP`；`main.c` 用有界队列（满则丢最旧）+ `input_edge`/`input_poll` 按实际按住时间判定，页面切换按 generation 清手势 |
| 五关模型与统一接口（进入/输入/推进/重置/快照） | `main/game/` 十个文件；`game_init/game_input/game_step/game_reset` + `camera_snapshot`；`GAME_MAX_STEP_MS=100` 限制追赶步数 |
| 每关规则（炸弹落点、磁力对位、时停蓄力方向、冰柱先进先出、取景识别） | `bomb.c` 圆弹滚动/方弹停留、单弹冷却；`magnet.c` 仅金属可抓、落位误差判定、越界回位；`stasis.c` 10s/6 次/>4 次且方向正确；`cryonis.c` 三根上限、第四根顶掉最早一根、仅闸门下方通关；`camera.c` 遮挡与取景框判定 |
| 暂停菜单三项、暂停停表 | `page_rune_app.c` 的 `pause_panel` 三行（继续/重开/返回符文），`game_step` 在 `paused` 时直接返回，恢复时重置 `last_tick` |
| 图鉴只由拍照解锁、只显示五条 | `page_compendium.c` 用 `store_progress.discovered` 判可见，未登记时弹窗提示去相机；`catalog.c` 由 `tools/gen_catalog.py` 从 `assets/data/trial_subjects.json` 生成静态数组 |
| 相册最多 8 张、存快照而非整屏位图 | `progress.h` 的 `PHOTO_CAPACITY=8` 与 `photo_t`（取景中心/缩放/目标/五个目标坐标）；`game_view_photo()` 用 Flash 素材重建 |
| 五关目标与完成状态 | `page_quest.c` 逐条列出 `game_title()` 与 `completed` 位 |
| 版本化 NVS、只在事件点提交、损坏安全回退 | `progress.c` 的 `SKS2` 头+版本 1+FNV 校验+字段范围检查，失败回默认值；`store.c` 只负责读写；提交点是 `GE_SAVE`、设置项保存与设置页退出 |
| 新增敲击/碎裂/识别/完成音，关键音抢占 | `sfx_data.h` 14 条（新增 `SFX_HIT/SHATTER/FOUND/COMPLETE`）；`sfx.c` 对爆炸/解冻/碎裂/完成先 `xQueueReset` 清掉排队音；`slate_open()` 在旧页面退出前调 `sfx_cancel()` |
| 主机 C 测试覆盖五关成功/失败/重试、冷却重入、时停上限与方向、磁力边界、冰柱先进先出、空拍/重复拍摄、相册满、NVS 损坏、三键连按/长按后抬起 | `tests/test_game.c` 七个用例逐条对应；由 `tests/CMakeLists.txt` 只编译 `main/game/` |
| 固件图源只编译实际使用的 | `main/CMakeLists.txt` 的 `images.cmake` 共 28 项；本轮脚本比对 `main/` 中所有 `img_*` 引用与 `img_all.h` 声明，29 处引用全部可解析，无声明缺 `.c` |

**未完成/未复验**（不宣称通过）：

- 本轮没有重新编译。工具链情况已核实：ESP-IDF v5.5.5 装在 `D:\Software\Espressif`（虚拟环境是 `idf5.5_py3.11_env`，需用 `IDF_PYTHON_ENV_PATH` 覆盖 export.ps1 默认的 py3.12 路径）；但 `idf.py build` 在这个受限终端里启动后长时间无输出（README 已记录该现象），且用户明确表示仍在原型阶段、不跑编译。因此 `idf.py build` / `idf.py size` 未完成，当前固件源码是否可编译仍未验证；README 里的 1,993,776 B / 52% 剩余是更早一次固件源码的记录。
- 宿主侧仍无 gcc/clang，`tests/test_game.c` 可以写、可以静态审查，但本机无法编成可执行文件运行。
- 计划要求的主机 LVGL 无头渲染截图（六入口、五关关键状态、图鉴登记、通关/重试）尚未建立：它需要宿主编译与截图管线，本轮不做。
- 实机验收（横屏方向/颜色/音画、五关人工试玩、连续切换 100 次的内存与看门狗）未做，一律标记“待实机验收”。

---

## 决策 17：raw 按游戏内容重排（2026-10-28）

**用户要求**：`assets/raw` 里素材很多重复，不要按项目分类，改按游戏中的内容分类；先给建议，用户拍板三条：TOTK 移进归档、目录带数字前缀、装备图标以 starter 那套为准、另一套进 `_variants`。

**诊断（先说清“重复”是什么）**：1215 个文件、186 MB 里，字节完全相同的只有 12 组 24 个文件、0.96 MB。真正造成“很乱”的是四件事：

| 现象 | 体量 | 处理 |
|---|---|---|
| TOTK 与大师模式整树 | 510 + 5 张、57 MB | 本项目固定 BotW，移入 `99_archive/` |
| BOTW 与 TOTK 同名文件 | 299 组 | 移走 TOTK 后歧义自然消失 |
| 同一怪物多版本 | 90 个文件 / 81 个主题 | 主体留在 `monsters/models/`，`_Model_2/3` 进 `_variants/` |
| 装备图标两套 | starter 24 / ui-pack 24，仅 7 张同字节 | starter 为准，其余进 `04_equipment/_variants/zeldawiki/` |
| ui-pack 目录多套一层（`ui/buttons/buttons`） | 39 个文件 | 重排时拍平 |

**目标结构**：`01_runes`(16) / `02_ui`(93) / `03_compendium`(484) / `04_equipment`(52) / `05_world`(23) / `06_audio`(2) / `07_fonts`(4) / `99_archive`(528) / `_index`。按“游戏里是什么”分，不再出现 `zeldawiki-*`、`hyrule-compendium-api` 这类来源名；来源信息保留在 `99_archive/sources/`、`_index/import_manifest.json` 与 `_index/content_map.csv`。

**执行方式**：一次性脚本 `build/_reorg_raw.py`（支持 `--dry-run`），逐文件映射后 `shutil.move`，不改任何字节；同 sha256 归为一组，按「非 `_variants` / 非 `misc` / 文件名与目标一致」优先保留一份，其余 12 个副本移入 `build/_trash/2026-10-28-raw-dedup/`（保留原目录层级）。

**校验**：

- 干跑：`files=1215 mapped=1215 keep=1203 trash=12 unmapped=0`。
- 执行后按 `content_map.csv` 逐条回读 SHA-256：**1215/1215 全部一致，0 例外**；`raw/` 内同字节重复组从 12 组降为 **0**；旧顶层目录已清空删除。
- 回滚干跑：`build/_rollback_raw.py --dry-run` → `rows=1215 plan=1215 missing=0 conflicts=0`。
- 未跑：`verify_assets.py`（脚本在同日清理中丢失，见决策 16 的说明）。

**留下的尾巴**：

1. `03_compendium/icons/` 的 390 张 BOTW 图标还没按图鉴五类（生物/材料/怪物/装备/宝物）细分——离线没有可用的分类清单，不靠文件名猜；需要补一份清单后再拆。
2. 三个管线脚本（`build_real_assets.py`、`import_compendium_assets.py`、`verify_assets.py`）目前缺失，恢复时要按 `content_map.csv` 把路径改到新目录；25 张管线输入文件名未改，可对名匹配。
3. `99_archive/` 与 `04_equipment/_variants/` 是“留着但不读”的目录，确认不再需要后可整体删除或清出仓库。

**回滚**：`python build/_rollback_raw.py`，按映射表反向移动，不改字节。

---

## 决策 18：五域架构重排（2026-10-28）

**用户要求**：整理架构，粗分为「硬件开发、模拟页面开发、素材、文档」四类，不用管真实构建，先给建议。用户拍板四点：

1. 固件整体下沉到 `firmware/`；
2. `tools/` 保留在根，内部分 `assets`（素材加工）/ `gen`（生成 C 源）/ `web`（Node 侧字体、SVG）；
3. 根 `README.md` 瘦身为导航 + 快速开始，细节移入 `docs/`；
4. 根目录中文清单挪进 `docs/specs/`。

**新顶层**（`firmware / prototype / assets / tools / docs` 五域）：

| 目录 | 职责 | 谁读 |
|---|---|---|
| `firmware/` | ESP-IDF 工程：`main/`、`components/bsp/`、`CMakeLists.txt`、`sdkconfig.defaults`、`partitions.csv` | 只读 `assets/gen/firmware` 与生成好的 C 源 |
| `prototype/` | 纯静态 320×240 原型（`index.html` + `js/` + `css/`） | 浏览器，相对路径 `../assets/gen/prototype/` |
| `assets/` | `raw`（上游原件）/ `gen`（生成物）/ `data`（JSON）/ `audio` | `tools/` 与两个前端 |
| `tools/` | `assets` / `gen` / `web` 三组脚本 | 人手动跑 |
| `docs/` | `architecture.md`、`hardware/`、`prototype/`、`assets/`、`specs/`、`archive/`、`development-log.md` | 人 |

依赖保持单向：`assets/raw → tools/assets → assets/gen → firmware/main/img` 与 `prototype/`。

**具体迁移**：

- 固件：`CMakeLists.txt`、`sdkconfig`、`sdkconfig.defaults`、`partitions.csv`、`dependencies.lock`、`main/`、`components/`、`managed_components/`、旧 `build/` 全部移入 `firmware/`。旧 `build/`（509 MB CMake 缓存）随迁而非删除，其绝对路径已失效，**首次构建前建议直接删掉 `firmware/build/`**。生成物仍不入库：`git check-ignore` 已确认 `firmware/build`、`firmware/sdkconfig`、`firmware/managed_components`、`firmware/dependencies.lock` 均命中，`.gitignore` 无前缀规则在任意层级生效，无需改动。
- tools：`gen_assets.py`、`gen_audio.py`、`gen_synth.py`、`img_to_c.py` → `tools/gen/`；`gen_font.mjs`、`svg_to_png.mjs`、`package.json`、`package-lock.json` → `tools/web/`。五个脚本的路径常量按新深度改（`parents[2]` / `../..`），`gen_audio.py` 与 `gen_synth.py` 的注释、生成文件头也同步为 `tools/gen/...`；`firmware/main/audio/sfx_data.{c,h}` 首行随之更新，避免下次重跑产生无意义 diff。
- 文档：原 341 行 `docs/README.md` 拆成 `docs/README.md`（16 行索引）+ `architecture.md` + `hardware/hardware.md` + `prototype/{pages,trials}.md` + `assets/{provenance,pipeline}.md`；旧内容完整转存 `docs/archive/legacy-architecture.md`（加过时说明头），不丢信息；`docs/superpowers/specs/` 改为 `docs/specs/`，根目录「ESP32‑C3｜希卡石板 功能+UI完整清单.md」改为 `docs/specs/feature-checklist.md`；`device_rune_wheel.jpg` 移入 `docs/hardware/`。
- 根 `README.md`：309 → 约 70 行，只留定位、五关表、目录表、快速开始、文档索引、当前状态。

**校验**：

- 根顶层只剩 `.build-tools`(本地工具链) `assets` `build`(未入库) `docs` `firmware` `prototype` `tools` `.gitignore` `README.md`。
- `firmware/main/img` 仍为 28 个 `.c`；4 个 Python 脚本 `py_compile` 退出码 0；2 个 mjs `node --check` 退出码 0。
- `tools/` 下再无 `tools/gen_audio.py` 之类旧平铺路径引用（grep 0 命中）；`docs/development-log.md`、`docs/archive/` 中的旧路径属历史记录，按“文档单一事实”保留原样。
- `/prototype/` 仍返回 200（2059 字节），原型未受迁移影响。

**未做 / 待办**：`tools/assets/` 下 5 个脚本与 `tools/gen/gen_catalog.py` 仍是缺失状态（见决策 16），恢复时直接落到新分组；`firmware/tests/`（`test_asset_import.py`）同样待恢复。按用户要求本轮**不编译**，新工程路径下的首次 `idf.py -C firmware build` 尚未验证。

---

## 决策 19：03_compendium 二次拍平（2026-10-28）

**用户要求**：`_reference`、`_variants`、`materials`、`monsters` 这四个目录整合一下，有点乱；沿用 `04_equipment` 的思路，尽量少层级。

**诊断**：4 个目录里装了 7 类东西，且有两层嵌套与下划线前缀：

| 旧路径 | 内容 | 数量 |
|---|---|---|
| `materials/drops/` | 材料掉落图标（`BotW_Amber_Icon.png`） | 34 |
| `monsters/models/` | 怪物 3D 模型渲染 | 18 |
| `monsters/artwork/` | 官方艺术与概念图 | 9 |
| `monsters/_screens/` | 游戏内截图 | 12 |
| `_reference/compendium/` | 图鉴界面截图 | 19 |
| `_variants/zeldawiki/` | 144px 装备图标 | 16 |
| `monsters/_variants/` | Chuchu Model_2/3 | 2 |

**目标结构**：7 个同级用途目录，不再有下划线前缀与双层嵌套 —— `BOTW`(390) / `master_mode-BOTW`(5) / `drops`(34) / `models`(18) / `artwork`(9) / `screens`(31) / `variants`(18)，共 505 个文件。

**执行方式**：`build/_reorg_03.py`（`--dry-run` / `--execute`），逐文件 `shutil.move`，目标重名直接报错；映射与哈希写入 `assets/raw/_index/compendium_map.csv`（110 行）。

**校验**：干跑 `files=110 conflicts=0`；执行后 **哈希 110/110 一致**；7 个空目录删除，`maxdepth=2`、`emptydirs=0`、`total=505`。

**同期由用户手动完成的部分**（本轮未代劳，仅记录）：`icons/` 与 `master_mode/` 被删除，保留 `BOTW/` 与 `master_mode-BOTW/` 命名，此前 42.4 MB 的逐字节副本问题随之消失；`04_equipment/_variants` 16 张并入 `03_compendium/variants/`；`04_equipment/_ui/arrow-no-curve.png`（SVG 的位图双份）删除，`04_equipment` 从 52 降到 35 个文件。

**文档同步**：`assets/README.md`（目录树与约定）、`assets/raw/_index/README.md`（目录表 + `compendium_map.csv` 说明 + 待办）、`docs/assets/pipeline.md`（25 张输入路径）、`docs/assets/provenance.md`（变体去向）。`docs/development-log.md` 与 `content_map.csv` 里的旧路径属历史记录，保留原样。

**未做**：`BOTW/` 390 张仍未按图鉴五类（生物/材料/怪物/装备/宝物）细分，缺离线分类清单；`04_equipment` 的 `starter/{weapons,shields,armors}` 三层还没拍平。

---

## 决策 20：只保留非合成的音频（2026-10-28）

**用户要求**：搞清楚现在哪些音频是真的、哪些是生成的，把生成的去掉，只留真的。

**盘点**：三分类，逐个验哈希。

| 类别 | 文件 | 依据 | 处理 |
|---|---|---|---|
| 程序合成 | `assets/audio/*.wav` 14 段 | `gen_synth.py` 的产物，文件头即由 `gen_audio.py` 写入 | 移出库 |
| 第三方现成 | `assets/audio/prototype/{select,action}.mp3` 2 段 | 与 `D:\Project\zelda-botw-starter\src\assets\sounds\` 逐字节相同，未重编码 | 保留 |
| 游戏原版 | 无 | 仓库里没有任何可确认为游戏解包的音频 | — |

`select.mp3` / `action.mp3` 也与 `assets/raw/06_audio/` 的两份归档逐字节相同，三处同源。

**处理**：14 段 wav 移入 `build/_trash/2026-10-28-audio-synth/`（保留文件名），`assets/audio/` 只余
`prototype/` 两段 MP3。选择移出而不是删除，因为 wav 是 `gen_synth.py` 的输出、可零成本重建，
但也属于“生成物不该入库”；两者并不矛盾，留在 trash 只是给自己留一次后悔余地。

**影响**：

- 固件：`firmware/main/audio/sfx_data.{c,h}` 是 wav 转成的 C 数组，已经随固件保留，不重跑 `gen_audio.py`
  就不受影响；将来重跑必须先跑 `gen_synth.py`，否则它会因缺 wav 直接失败。
- 原型：`prototype/js/app.js` 的 `SFX_FILES` 仍指向 11 段 wav，删后这些音效会 404 并静音，
  只剩 `move/ok/back/activate` 四类走 MP3。本轮**未改** `app.js`。

**文档同步**：`assets/README.md`（音频层与表格行）、`docs/assets/pipeline.md`（重生成顺序补
`gen_synth.py`、说明缺 wav 会失败）、`docs/assets/provenance.md`（合成音频去向）。

---

## 决策 21：docs 清点，只删真冗余（2026-10-28）

**用户疑问**：docs 是不是很多没用的，删掉。

**清点**：12 个文件，逐个查引用（根 `README.md`、`docs/README.md`、`prototype/README.md` 与代码内链接）。
结论：不是“很多没用”，只有 1 个纯冗余。

| 文件 | 行数 | 读者 | 处理 |
|---|---|---|---|
| `README.md` | 16 | 人 | 留（索引） |
| `architecture.md` | 55 | 根 README | 留 |
| `hardware/hardware.md` + 实机图 | 67 + 273 KB | 根 README、hardware 引用 jpg | 留 |
| `prototype/pages.md` | 51 | 根 README、`prototype/README.md` | 留 |
| `prototype/trials.md` | 23 | 同上 | 留 |
| `assets/pipeline.md` | 60 | 根 README | 留 |
| `assets/provenance.md` | 38 | 根 README | 留（许可边界） |
| `specs/feature-checklist.md` | 177 | `docs/README.md` | 留，加过时备注 |
| `specs/2026-09-07-…-design.md` | 93 | `docs/README.md` | 留（设计决策来源） |
| `development-log.md` | 595 | 全部文档的单一事实 | 留 |
| `archive/legacy-architecture.md` | 231 | **无引用** | **已删** |

删 `archive/legacy-architecture.md` 的理由：它是决策 18 里从 `git show HEAD:docs/README.md` 转存的旧架构文档，
内容已被 `architecture.md` + `hardware.md` 等覆盖，且 git 历史里永远可取回。同时移除空的 `docs/archive/`。

**顺手修的两处过时**：

1. `docs/README.md` 写“决策 1–17”，改为 1–20。
2. `specs/feature-checklist.md` 开头声明“只做 UI 模拟，无游戏魔法”，与现状（炸弹/磁力/时停/制冰/相机均可玩）
   矛盾，已在原文上方加备注，保留原文作为需求来源而不删。

**结果**：docs 从 12 个文件降为 11 个，无空目录、无悬空链接。

---

## 决策 22：删除 docs/specs 两份过时规格（2026-10-28）

**用户要求**：docs 里过时或者不用的去掉。

**判定**：`specs/` 两份都是 2026-09 的早期文档，且与现状直接矛盾：

| 文件 | 已过时的部分 | 与现状矛盾之处 |
|---|---|---|
| `feature-checklist.md`（177 行） | “只做 UI 模拟，无游戏魔法”；SD 卡读 json、禁止编译进 Flash；分辨率 240×240 以内；Amiibo/大师摩托仅 UI | 固件已有五关可玩；实际无 SD 卡、全部编进 Flash；屏幕 320×240 |
| `2026-09-07-…-design.md`（93 行） | 通篇在描述“完全不像游戏”的四个问题 | 四个问题均已解决，且路径还写着旧的 `main/font/`、`main/img/` |

**仍有效但已别处覆盖的信息**：硬件规格与资源约束→`hardware/hardware.md`；三键语义与长按→`hardware.md`
“三键输入在固件侧的实现”与 `prototype/pages.md`；五关规则→`prototype/trials.md`；配色 token（`#3CD3FC`
希卡蓝、`#FFE460` 希卡黄、`#E9E1D1` 暖白、`#0A1428` 面板、`#66645D` 底层）→`sheikah_theme.c`；
设计决策（环形 8 格轮盘、Hylia 16/20/28、图标 ARGB8888 带透明、扫描线/角饰/辉光）→已在决策 1–14 与代码里。

**只在旧清单里、删了就丢的“放弃方案”**（值得留一句）：

- SD 卡外置全部图片与图鉴 json、分类懒加载 —— 板上没有 SD 卡，方案作废，现为编译进 Flash。
- 瓦片式滑动缩放地图、大图解码、耐力轮盘/心之容器动画 —— 因 400KB SRAM 无 PSRAM 直接放弃。
- WiFi（MQTT）与全套石板 UI 同时跑 —— 内存不够，二选一。
- SPI 屏分辨率 240×240 以内 —— 实际用 320×240 横屏，这条已被推翻。

**处理**：删除 `docs/specs/`（2 个文件）与 `docs/archive/legacy-architecture.md`，同步去掉 `docs/README.md`
与根 `README.md` 里的索引行；`docs/hardware/device_rune_wheel.jpg`（273 KB 实机照）按用户要求一并删除，
`hardware.md` 里的图片链接改为纯文字。两份规格原文在 `b6c69db` 里可取回：
`git show b6c69db:docs/specs/feature-checklist.md`。

**结果**：docs 从 12 个文件降为 8 个（7 份 Markdown + 无二进制），目录只剩 `assets/`、`hardware/`、`prototype/`。

---

## 后续可玩方向

- **休眠省电**: 30s 无操作自动关闭背光, 按键唤醒
- **电量显示**: 利用 BSP 的 CW2017 电量计在状态栏显示电池百分比
- **BLE 连接**: 虽然不做 HID，但可以用 BLE 做一个简单的"手机同步冒险记录"功能
- **陀螺仪**: AI Passport 有 MPU6050 (I2C)，可以做"摇晃激活"的效果

---

## 提交历史（分步提交记录）

```
docs: 同步 README 与开发日志（音效清单/轮盘布局/设置编辑模式）
fix(ui): 设置页事件穿透修复 + 编辑模式重构 + 前向声明补齐
feat(runes): 轮盘对齐游戏原版布局 + 能力页专属音效触发
feat(assets): 游戏原版 quick-selector/扫描线素材入管线 (10 图片)
feat(audio): 磁力/制冰专属音效 + 全部音色精调 (8 → 10 sfx)
feat(audio): 挂接 11 处音效触发点 (激活/轮盘/选中/炸弹/时停/快门)
feat(audio): sfx 播放模块 (audio worker task + 队列, 非阻塞)
feat(audio): 音效转换管线与合成器 (wav -> 16kHz mono PCM -> C 数组)
fix(runes): 修复 snprintf 缓冲区过小触发 -Werror=format-truncation
perf(display): SPI 80MHz + 双缓冲 + 16ms 刷新周期
feat(runes): 5 个符文能力模拟（炸弹/磁力/静止/制冰/相机）
feat(pages): 五页视觉重做（环形符文轮盘 + 游戏风格弹窗）
feat(ui): Hylia 字体与游戏风格主题组件
feat(assets): 引入游戏原版图标与石板背景素材
feat(tools): 完善素材管线（背景生成/字体转换/字节序修复）
docs: 添加开发文档 (docs/README.md + development-log.md)
feat: 添加游戏原版 SVG 素材和 LVGL 图片转换工具
feat: 添加海拉鲁图鉴和冒险记录 JSON 数据
feat: 实现 5 个页面和主程序状态机
feat: 实现希卡主题系统和通用 UI 组件
feat: 初始化项目结构和 BSP 硬件驱动
```
