# v2 架构决策记录（ADR）

> 对应目标架构：[TARGET_ARCHITECTURE.md](../TARGET_ARCHITECTURE.md) · 更新日期：2026-08-24

本目录记录 v2 中影响数据边界、迁移、替换成本或安全性的关键决策。只有经过项目所有者评审的 ADR 才能改为 `Accepted`，实现不能替代评审。

| ADR | 决策 | 状态 | 主要需求 |
|---|---|---|---|
| [ADR-0001](ADR-0001-local-modular-monolith.md) | 保留 Next.js + FastAPI 两进程，后端采用模块化单体 | Proposed | F-01～F-12 |
| [ADR-0002](ADR-0002-source-modes.md) | 数据模型支持原位连接和工作区管理副本 | Proposed | F-02、F-03、F-10 |
| [ADR-0003](ADR-0003-canonical-store-and-indexes.md) | SQLite 保存业务事实，FTS/向量/图谱投影可重建 | Proposed | F-01～F-08、F-11 |
| [ADR-0004](ADR-0004-stable-ids-and-anchors.md) | 使用稳定对象 ID、文档版本和格式化锚点 | Proposed | F-03、F-04、F-07 |
| [ADR-0005](ADR-0005-typed-relation-graph.md) | v2 用 SQLite typed edges 保存关系事实；Neo4j 保留为候选投影 | Accepted | F-04、F-06 |
| [ADR-0006](ADR-0006-controlled-agent-runtime.md) | Agent 通过登记工具、风险分级、确认、审计和撤销执行 | Proposed | F-08、F-10、F-11 |

## 状态规则

- `Proposed`：已形成推荐方案，仍可在产品/架构评审中修改；
- `Accepted`：决定生效，可以进入实现；
- `Deprecated`：决定不再适用，但保留历史；
- `Superseded`：被新 ADR 替代，必须链接替代记录。

## 评审清单

- 是否解决了明确需求，而非为了使用某个技术；
- 是否写明项目规模、团队、预算和本地优先约束；
- 是否考虑更简单的方案；
- 接受了哪些缺点，如何缓解；
- 什么证据出现时需要重审；
- 是否影响 v1.x 迁移、隐私、删除或回滚；
- ADR、目标架构、数据模型和 PRD 是否使用同一术语。
