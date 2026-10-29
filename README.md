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
firmware/    硬件开发：ESP-IDF 工程（main/、components/bsp/、sdkconfig.defaults）
prototype/   模拟页面开发：纯静态 320×240 点击原型
assets/      素材：raw（按游戏内容分类）→ gen → data / audio
tools/       管线：assets（入库校验）、gen（生成固件源码）、web（字体/SVG）
docs/        文档：任务索引、上下文、架构、硬件、原型、素材与历史
```

依赖是单向的：`assets/raw → tools → assets/gen → firmware/main/img` 与 `prototype/`。
详细边界见 [docs/architecture.md](docs/architecture.md)。

## 快速开始

- 看原型：使用 Python 从仓库根提供静态服务，再访问 `/prototype/`；命令与路径要求见 [本地预览](prototype/README.md#本地预览)。
- 用设备：准备符合组件声明的 ESP-IDF 环境，以 `firmware/` 为工程根，按 [构建与烧录](docs/hardware/hardware.md#构建) 操作。
- 改素材：先按 [素材操作入口](docs/context/RUNBOOK.md#素材加工与校验) 确认脚本与输入可用。

这些是使用入口，不代表本轮执行成功，也不授权 AI 自动构建、烧录或安装依赖；执行前确认 [协作规则](AGENTS.md)。

## 文档

- [AGENTS.md](AGENTS.md)：项目协作、按需读取、定点写入及验证规则。
- [文档索引](docs/README.md)：按任务进入对应文件或章节；沿用为 PROJECT_INDEX。
- [当前工作](docs/context/NOW.md)：接续目标、进展、下一步与证据。
- [操作入口](docs/context/RUNBOOK.md)：使用与验证的前置条件；其他专题按索引选择。

## 当前状态

当前目标与完成证据统一见 [NOW](docs/context/NOW.md)，已知问题和待核实项见 [RISKS](docs/context/RISKS.md)。
旧编译、烧录与素材校验记录通过 [历史索引](docs/context/history/README.md) 追溯，不代表当前验证结果。

## License

MIT（仅代码）。游戏相关名称与素材权利归 Nintendo 所有；素材来源与限制见
[docs/assets/provenance.md](docs/assets/provenance.md)。
