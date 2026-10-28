# Sheikah Slate - AI Passport Edition

> 运行在 [FoloToy AI Passport](https://github.com/nickyc975/ai-passport)（ESP32-C3）上的
> 《塞尔达传说：旷野之息》希卡石板界面模拟。设备横置，逻辑分辨率 **320×240**。

## 是什么

不是开放世界，而是围绕五种符文各做一个固定视角、可完成、可失败、可重试的小场景，加五个功能页：

| 试炼 | 目标 | 功能页 |
|---|---|---|
| 遥控炸弹（圆/方） | 在石墙旁引爆，炸开通路 | 待机 |
| 磁力抓取 | 金属板对齐桥台并稳定落下 | 符文选择（六入口） |
| 静止器 | 蓄力 ≥4 且方向正确，撞开障碍 | 海拉鲁图鉴 + 相册 8 张 |
| 制冰器 | 闸门下方生成冰柱顶起闸门 | 冒险记录 |
| 相机 | 拍下并保存五个图鉴目标 | 系统设置 |

三键（UP / OK / DOWN）共用一路 ADC；OK 长按为返回/暂停，UP 长按只在屏幕明确提示处使用。

## 目录

```
firmware/    硬件开发：ESP-IDF 工程（main/、components/bsp/、tests/、sdkconfig）
prototype/   模拟页面开发：纯静态 320×240 点击原型
assets/      素材：raw（按游戏内容分类）→ gen → data / audio
tools/       管线：assets（入库校验）、gen（生成固件源码）、web（字体/SVG）
docs/        文档：架构、硬件、原型、素材、规格、开发日志
```

依赖是单向的：`assets/raw → tools → assets/gen → firmware/main/img` 与 `prototype/`。
详细边界见 [docs/architecture.md](docs/architecture.md)。

## 快速开始

```bash
idf.py -C firmware build                 # 固件（需要 ESP-IDF v5.5.x）
idf.py -C firmware -p COMx flash monitor

python -m http.server 8124                # 原型：http://127.0.0.1:8124/prototype/
python tools/assets/verify_assets.py      # 素材只读校验（脚本待恢复）
```

## 文档

| 文档 | 内容 |
|---|---|
| [docs/architecture.md](docs/architecture.md) | 五域边界、依赖方向、命名规则、迁移记录 |
| [docs/hardware/hardware.md](docs/hardware/hardware.md) | 硬件规格、构建与烧录、资源约束、实机记录 |
| [docs/prototype/pages.md](docs/prototype/pages.md) | 路由、三键、交互手感、装备页 |
| [docs/prototype/trials.md](docs/prototype/trials.md) | 五关规则、图鉴与相册、进度存储 |
| [docs/assets/pipeline.md](docs/assets/pipeline.md) | 素材四层、脚本读写、重生成顺序 |
| [docs/assets/provenance.md](docs/assets/provenance.md) | 来源与许可边界、图鉴数据出处 |
| [docs/specs/](docs/specs/) | 需求清单、设计稿 |
| [docs/development-log.md](docs/development-log.md) | 决策与执行记录 |
| [assets/README.md](assets/README.md) | 资产地图：分层、谁读、能否重生成 |

## 当前状态

原型阶段。按用户要求**不跑固件编译、不跑自动化测试、不做浏览器截图**，界面由用户分步查看。

- 固件未复验：`firmware/` 内的源码尚未在本次结构中编译过；历史编译/烧录数据见
  [docs/hardware/hardware.md](docs/hardware/hardware.md)，不代表当前代码可编译。
- `tools/assets/` 的 5 个脚本与整个 `tests/` 在 2026-10-28 的清理事故中丢失，待恢复；
  恢复落位见 [tools/README.md](tools/README.md)。
- 素材已于同日按游戏内容重排，1215 个文件逐条 SHA-256 复核一致，`raw/` 内零同字节重复；
  映射与回滚见 `assets/raw/_index/`。

## License

MIT（仅代码）。游戏相关名称与素材权利归 Nintendo 所有；素材来源与限制见
[docs/assets/provenance.md](docs/assets/provenance.md)。
