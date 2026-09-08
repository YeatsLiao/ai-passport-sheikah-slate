# 希卡石板「游戏级还原」改造设计文档

日期：2026-09-07
状态：已确认，实施中
目标仓库：`ai-passport-sheikah-slate`（ESP32-C3 / ST7789P3 240×320 / LVGL 9）

## 背景与问题

现有实现"完全不像游戏的希卡石板"，根因：

1. 用 Montserrat 通用字体，而非游戏专属 **Hylia Serif**
2. 符文选择器是 4×2 网格，游戏是**环形轮盘**
3. 8 个符文里 3 个（图鉴/冒险记录/设置）是文字缩写 "Cmp/Log/Set"，无真实图标
4. 图标被烤死在纯黑底（RGB565 无 alpha），无法与深蓝背景融合
5. 面板朴素方框，缺游戏的**扫描线 / 角饰 / 辉光 / 装饰分隔线**

## 素材来源（工作区其他仓库）

| 素材 | 来源路径 |
|---|---|
| Hylia Serif 字体 | `zelda-hyrule-ui/packages/core/assets/fonts/HyliaSerif.ttf` |
| 90+ 游戏原版 SVG | `zelda-hyrule-ui/packages/core/assets/svg/*.svg` |
| 深蓝背景纹理 | `zelda-hyrule-ui/packages/core/assets/img/sheikah-bg-dark.png` |
| 视觉规格（配色/辉光/环形轮盘/扫描线） | `zelda-hyrule-ui/packages/react/src/components/**/*.module.less` |
| 设计 token | `zelda-hyrule-ui/packages/core/styles/variables.less` |

## 决策（已与用户确认）

- 改造深度：**全面还原**（字体 + 环形轮盘 + 全套带透明图标 + 扫描线/角饰/辉光 + 五页重做）
- 符文布局：**环形轮盘**（8 格圆环，UP/DOWN 沿环旋转，OK 进入）
- 验证方式：**只保证代码正确**，用户自行 `idf.py build`/flash

## 技术方案

### A. 素材管线（本地生成 C 数组，产物入库）

- **字体**：`npm install lv_font_conv`，将 `HyliaSerif.ttf` 转为 LVGL C 字体，字号 16/20/28px，
  字形范围 `0x20-0x7F`（ASCII，标题统一大写）。输出 `main/font/hylia_serif_*.c`。
  正文继续用已启用的 Montserrat（小写可读）。
- **图标（带透明）**：改 `svg_to_png.mjs` 去掉 `.flatten()` 黑底、保留 alpha；
  改 `img_to_c.py` 输出 **ARGB8888**（`LV_COLOR_FORMAT_ARGB8888`，stride=w*4，
  内存字节序 B,G,R,A）。图标可叠加在深蓝背景上。
- **背景**：生成 240×320 深蓝底 `#0a1628` + 扫描线 + 暗角，RGB565，`img_slate_bg.c`。
- **补齐图标**：Compendium（书本/codex）、Settings（齿轮）手写希卡青色发光 SVG。

### 轮盘 8 格图标映射

| # | 符文 | 图标来源 | page_id |
|---|---|---|---|
| 0 | Remote Bombs | `ability-round-bomb.svg` | -1 |
| 1 | Magnesis | `ability-magnesis.svg` | -1 |
| 2 | Stasis | `ability-stasis.svg` | -1 |
| 3 | Cryonis | `ability-cryonis.svg` | -1 |
| 4 | Camera | `ability-camera.svg` | -1 |
| 5 | Hyrule Compendium | 手写 codex SVG | 1 |
| 6 | Adventure Log | `quest-icon-main.svg` | 2 |
| 7 | Settings | 手写 gear SVG | 3 |

### B. 主题系统 `sheikah_theme.c/h`

- 字体映射：`SK_FONT_TITLE`→hylia_serif_28，`SK_FONT_LARGE`→hylia_serif_20，
  `SK_FONT_BODY`/`SMALL` 保留 Montserrat
- 配色对齐游戏 token（sheikah-blue `#3CD3FC`、glow `#4FC0FF`、bg `#0a1628`、tan `#E2DED3`）
- 新增：`sk_bg_create()`（带背景图屏幕）、`sk_corner_frame()`（四角括号）、
  `sk_ornament_title()`（标题两侧角饰）

### C. 五页重做

1. **待机页**：深蓝底+扫描线，希卡之眼居中辉光呼吸，四角括号，"PRESS OK" Hylia Serif
2. **符文页（环形轮盘）**：8 符文圆环排列（预计算坐标），选中放大+辉光，
   轮盘中心显示符文名（Hylia Serif）+描述，对齐 `quickSelectorScreen` 规格
3. **图鉴页**：5 分类标签换真实分类图标，列表加角饰，弹窗用 dialog 风格
4. **冒险记录页**：任务类型图标（main/shrine），游戏风格列表+弹窗
5. **设置页**：希卡面板 + Hylia Serif 标签

### D. 构建配置

- `main/CMakeLists.txt`：新增 `font/*.c` 与 `img/*.c` 到 SRCS
- ARGB8888 在 `LV_COLOR_DEPTH_16` 下由 LVGL 9 正常混合

## 硬件约束（不变）

- 400KB SRAM 无 PSRAM → LVGL 单缓冲；图片/字体存 Flash（factory 4MB，充裕）
- 无 SD 卡 → 全部编译进 Flash
- 无复杂动画 → 仅呼吸/辉光/轮盘选中态切换

## 验证边界

- ✅ 跑素材生成工具（node+python）确认 C 数组/字体无误生成
- ✅ 所有改动 C 文件做静态检查
- ✅ 提供完整 `idf.py build` 命令
- ⚠️ 无法验证实际上屏效果（需硬件），最终视觉以烧录后为准
