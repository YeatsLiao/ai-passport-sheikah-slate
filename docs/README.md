# 文档索引

| 文档 | 内容 |
|---|---|
| [architecture.md](architecture.md) | 五个域的边界、依赖方向、命名规则、迁移记录 |
| [hardware/hardware.md](hardware/hardware.md) | 硬件规格、构建与烧录、资源约束、实机记录、主机测试 |
| [prototype/pages.md](prototype/pages.md) | Web 原型的路由、三键操作、交互手感、装备页 |
| [prototype/trials.md](prototype/trials.md) | 五个试炼的通关/失败规则、图鉴与相册规则 |
| [assets/provenance.md](assets/provenance.md) | 素材来源、许可边界、图鉴数据出处 |
| [assets/pipeline.md](assets/pipeline.md) | 素材四层、生成顺序、脚本读写关系 |
| [development-log.md](development-log.md) | 决策与执行记录（决策 1–22，含未复验项） |

## 约定

- 根 `README.md` 只做导航与快速开始，不再复述细节；改动行为时先改这里的文档。
- 任何「已验证 / 未验证」都必须写清依据。当前是原型阶段：按用户要求不跑固件编译、不跑自动化测试、
  不做浏览器截图，最近的状态以 `development-log.md` 最后一条为准。
- 素材路径的唯一事实是仓库里的目录本身；`assets/raw/_index/content_map.csv` 记录 2026-10-28 重排的旧→新映射。
