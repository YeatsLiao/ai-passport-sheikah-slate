# 🗡️ 希卡石板 · Sheikah Slate

> 一块真的能玩的希卡石板 —— 基于 ESP32-C3 的《塞尔达传说：旷野之息》
> 希卡石板复刻。320×240，全离线，开机即玩，不需要网——因为一万年前也没有。

![待机 · 静谧科技](assets/docs/standby-quiet-tech-cn.png)

## 这是什么

给 FoloToy AI Passport 写的固件。刷进去之后，这台 ESP32-C3 小机器
就是一块《旷野之息》的希卡石板：九个符文是真小游戏，图鉴、日志、
地图、相册装着全量数据，全部离线跑在 8MB Flash 里。

## 石板上有什么

- **九个符文小游戏** —— 圆/方炸弹、磁力抓取、静止器、制冰器、相机、
  感应器、amiibo、大师摩托。每个都是完整的小关卡，能通关也能失败重来。
- **海拉鲁图鉴** —— 394 条全量数据（含大师模式金色怪），中英文名齐全，可登记。
- **冒险日志** —— 152 条任务，含全部 DLC 与《异度之刃 2》联动，双语梗概。
- **地图** —— 177 个游戏原始命名点位，缩放、横移、纵移。
- **相册** —— 12 张固定照片，可放大查看、删除。
- **系统** —— 中英切换、音量、亮度、扫描线、USB 校时、六款待机画布、
  背景主题、电量显示。

操作只有三个键 **UP / OK / DOWN**：OK 长按暂停或返回。
音效直接播游戏原声 WAV——开锁、磁力移动、时停蓄力、爆炸、任务完成，
部分事件音仍在补齐。

## 实机一览

| 主菜单 | 符文选择 |
|---|---|
| ![主菜单](assets/docs/home-cn.png) | ![符文选择](assets/docs/rune-select-cn.png) |
| **装备** | **图鉴** |
| ![装备](assets/docs/equipment-grid-cn.png) | ![图鉴](assets/docs/compendium-cn.png) |
| **相机 · 识别成功** | **冒险日志** |
| ![相机](assets/docs/rune-camera-found-cn.png) | ![日志](assets/docs/quest-main-cn.png) |

## 九项符文小游戏

| 圆炸弹 | 方形炸弹 | 磁力抓取 |
|---|---|---|
| ![圆炸弹](assets/docs/rune-bomb-round-cn.png) | ![方形炸弹](assets/docs/rune-bomb-cube-cn.png) | ![磁力抓取](assets/docs/rune-magnet-cn.png) |
| **静止器** | **制冰器** | **希卡感应器** |
| ![静止器](assets/docs/rune-stasis-cn.png) | ![制冰器](assets/docs/rune-cryonis-cn.png) | ![感应器](assets/docs/rune-sensor-cn.png) |
| **大师摩托** | **amiibo** | **相机 · 识别成功** |
| ![大师摩托](assets/docs/rune-moto-cn.png) | ![amiibo](assets/docs/rune-amiibo-cn.png) | ![相机识别](assets/docs/rune-camera-found-cn.png) |

## 六款待机画布

横竖屏自适应，自动轮换，熄屏唤醒。

| 静谧科技 | 晨光旷野 | 古地图 |
|---|---|---|
| ![静谧科技](assets/docs/standby-quiet-tech-cn.png) | ![晨光旷野](assets/docs/standby-dawn-field-cn.png) | ![古地图](assets/docs/standby-antique-map-cn.png) |

竖屏款（神庙石碑 / 林间薄雾）与黑金款见
[assets/docs/MANIFEST.md](assets/docs/MANIFEST.md)。

## 先在浏览器里玩

设备还没到手？原型和真机出自同一套设计与数据：

```bash
python -m http.server 8124 --bind 127.0.0.1
# 打开 http://127.0.0.1:8124/prototype/
```

预览要求和页面说明见 [prototype/README.md](prototype/README.md)。

## 烧进真机

硬件是 FoloToy AI Passport（ESP32-C3，8MB Flash，ST7789 240×320 SPI 屏，
三键 ADC 分压，ES8311 音效，CW2017 电量计）。需要 ESP-IDF 环境：

- 构建、烧录与硬件规格：[docs/hardware/hardware.md](docs/hardware/hardware.md)
- 固件为全离线 V1，app 与设备资源包必须配套烧录；整包流程见
  [docs/hardware/offline-v1.md](docs/hardware/offline-v1.md)

## 仓库地图

```
prototype/   浏览器原型 —— 就是上面让你先玩的那套界面
firmware/    ESP-IDF 固件（main/offline/ + components/bsp/）
assets/      素材：生成图池 + 原型引用件（原作解包原料外迁归档）
tools/       资源包生成、数据管线、设备通信脚本
docs/        文档索引、架构、硬件、原型说明与历史
```

依赖是单向的：`素材 → tools → assets/gen → firmware/ 与 prototype/`，
详细边界见 [docs/architecture.md](docs/architecture.md)；按任务查文档从
[文档索引](docs/README.md) 进。

## 已知限制

- 音效为需自备素材：克隆后无声，从外部归档复制 `assets/audio/botw/` 即可
- 摩托启动、引擎循环、起跳和落地音已接入，待听测；宝箱落地专用音仍待确认（见 [音效来源](docs/assets/provenance.md#botw-原版音效)）
- 地图缩放档位（1×/2×/4×）少于原型（最高 16×）；部分页面布局与原型仍有差异

## 声明

代码以 MIT 许可发布。《塞尔达传说》相关名称与游戏素材权利归 Nintendo 所有；
本项目的图像素材多为参考实机授权生成的风格替代，音效取自个人合法获得的游戏
解包资源，来源与限制见 [docs/assets/provenance.md](docs/assets/provenance.md)。
