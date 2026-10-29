# 文档索引

本项目包含 ESP32-C3 希卡石板固件、配套 Web 原型与素材工具。本文件沿用为 PROJECT_INDEX：
按任务选入口，再定位章节/符号/关键词；不是必读清单。入口或职责变化时更新，不复制专题正文。

## 基础职责与任务路由

| 当前任务 | 权威入口 | 更新时机 |
|---|---|---|
| 接手并确认规则 | [AGENTS.md](../AGENTS.md) | 长期约定改变 |
| 了解用途或基本使用 | [根 README](../README.md) | 能力或使用方式改变 |
| 接续目标、进展与下一步 | [context/NOW.md](context/NOW.md) | 状态实质变化，直接修订 |
| 定位目录、版本约束、配置或运行位置 | [architecture.md](architecture.md)（沿用为 MAP） | 映射改变 |
| 执行具体操作与验证 | [context/RUNBOOK.md](context/RUNBOOK.md) | 前置条件或方法改变；具体命令仍在被链接的专题 |
| 理解已确认选择 | [context/DECISIONS.md](context/DECISIONS.md) | 决策确认或被替代 |
| 处理问题、风险或验证缺口 | [context/RISKS.md](context/RISKS.md) | 证据或状态改变 |
| 追溯历史过程与依据 | [context/history/README.md](context/history/README.md) | 有价值的过程需归档 |

## 专题路由

以下文件保留各自领域职责；修改对应硬件、行为或素材方法时，只更新受影响章节。

| 文档 | 内容 |
|---|---|
| [architecture.md](architecture.md) | 五个域的边界、依赖方向、命名规则、迁移记录 |
| [hardware/hardware.md](hardware/hardware.md) | 硬件规格、固件构建/烧录与主机测试命令、资源约束、历史实机记录 |
| [../prototype/README.md](../prototype/README.md) | 本地预览命令、静态服务根与相对路径要求 |
| [../tools/README.md](../tools/README.md) | 工具输入输出、缺失脚本恢复落位 |
| [../assets/README.md](../assets/README.md) | 素材目录导航与资产地图 |
| [prototype/pages.md](prototype/pages.md) | Web 原型的路由、三键操作、交互手感、装备页 |
| [prototype/trials.md](prototype/trials.md) | 五个试炼的通关/失败规则、图鉴与相册规则 |
| [assets/provenance.md](assets/provenance.md) | 素材来源、许可边界、图鉴数据出处 |
| [assets/pipeline.md](assets/pipeline.md) | 素材分层与生成/校验操作；工具输入输出链接到 tools |
| [development-log.md](development-log.md) | 历史决策与执行记录；仅按历史索引搜索需要的章节 |

## 约定

- 读写和验证规则统一见 [AGENTS.md](../AGENTS.md)，当前状态只维护在 NOW，开发日志不再承担当前状态职责。
- 目录与配置以实际仓库为准；专题文档描述当前约定，历史仅作追溯。已发现的说明冲突见 RISKS，未核实内容不推断为事实。
- 素材路径以仓库目录为准；仅在追溯重排时查 `assets/raw/_index/content_map.csv`，不默认读取数据与归档。
- 已有等价结构优先沿用，因此不另建根 PROJECT_INDEX.md、MAP.md 或无独立用途的 PROJECT_NOTES.md。
