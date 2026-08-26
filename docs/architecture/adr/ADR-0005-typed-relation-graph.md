# ADR-0005：使用 SQLite typed edges 保存关系事实

## 状态

Accepted — 2026-08-25

## 背景

v1.x 图谱主要展示目录顺序和标题/关键词启发式连线，无法表达关系类型、来源、方向、证据和可信状态。v2 需要真实结构、原生链接、实体关系和模型建议，但当前规模和单用户场景不足以证明需要 Neo4j 等图数据库。

## 方案比较

| 方案 | 优点 | 缺点 | 结论 |
|---|---|---|---|
| 继续即时启发式连线 | 无迁移、实现快 | 不可信、不可审计、无法维护 | 不选 |
| SQLite typed tables + 查询投影 | 与业务事务一致；备份简单；足够当前规模 | 深层遍历和图算法有限 | 选择 |
| 专用图数据库 | 图遍历和算法丰富 | 本地安装、第二事实源、迁移和运维复杂 | 证据成立后再评估 |
| 全部关系只存向量相似度 | 自动生成容易 | 相似不等于关系，无法解释 | 仅作建议输入 |

## 决策

关系事实保存在 SQLite：

- 结构关系由 Workspace/Space/Collection/Document 层级投影；
- 导航关系使用有向 Link，Backlink 由目标反查；
- Entity/EntityMention 表达概念和出现位置；
- Relation/RelationEvidence 表达带主语、谓词、宾语和证据的命题；
- 每条边返回 `edge_kind/type/direction/origin/status/evidence`；
- 模型抽取默认 `suggested`，用户确认后才转 `confirmed`；
- 图谱 API 按空间、节点类型、边类型、状态和聚焦深度投影。

Neo4j 保留为未来候选图谱投影层，但不进入 v2 当前依赖。无论未来是否使用 Neo4j，SQLite 中的稳定对象、Link、Relation 和 RelationEvidence 仍是业务事实来源。

不把前端 Force Graph 的节点/边格式作为持久数据模型。

## 最小边类型

| edge_kind | 事实来源 | 示例 |
|---|---|---|
| structure | 容器层级 | Space contains Collection |
| link | 用户/源文件显式链接 | Block supports Document |
| citation | 回答或结果引用 | Answer cites BlockRevision |
| relation | 用户确认或有证据命题 | Concept contradicts Concept |
| suggestion | 模型/相似度建议 | 可能相关，未确认 |

建议边与事实边在存储状态、API 和视觉上都必须区分。

## 理由

- SQLite 可以与 Document、Link、版本和审计同事务维护；
- 当前主要查询是空间过滤、反链、邻居和有限深度聚焦，不需要复杂图算法；
- 图谱价值来自证据和任务，不来自数据库类型；
- 将来若有真实规模需求，可以从 typed tables 构建专用图投影。

## 接受的取舍

- 多跳路径和复杂图算法性能有限；
- Relation schema 和实体消歧需要产品治理；
- 某些投影可能需要递归 CTE 或缓存。

## 缓解

- 首发限制聚焦深度、节点数和关系类型；
- 大图提供过滤、聚合和文本列表替代；
- 用关系任务成功率、采用率和回跳率决定投入；
- 如需图库，只作为可重建读投影，SQLite 仍是事实来源。

## 确认记录

- 2026-08-25：项目所有者确认 Neo4j 先保留为候选；当前优先完善标题层级、真实链接、关系证据、图谱 API 和展开交互。

## 复审触发器

- 真实数据上的聚焦/路径查询持续超过性能门槛；
- 用户验证需要大规模多跳分析或图算法；
- typed relation 数量和查询复杂度显著超过当前设计规模；
- 专用图库能带来明确任务收益，且备份/迁移成本可接受。
