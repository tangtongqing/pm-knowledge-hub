# ADR-0003：SQLite 保存业务事实，检索索引作为可重建投影

## 状态

Proposed — 2026-08-24

## 背景

v1.x 主要从 Chroma metadata 生成目录，运行指标存在内存，问答/面试历史存在浏览器。v2 需要事务化保存空间、来源、版本、链接、关系、任务、Agent 审计和撤销，同时支持词法、向量和图谱查询。

## 方案比较

| 方案 | 优点 | 缺点 | 复杂度 | 结论 |
|---|---|---|---|---|
| 继续以 Chroma 为中心 | 复用最多 | 不适合事务、关系、审计和迁移 | 低/短期，高/长期 | 不选 |
| SQLite + 可重建索引 | 单机事务可靠、备份简单、无需服务运维 | 写并发有限；中文 FTS 需评测 | 中 | 选择 |
| PostgreSQL + pgvector | 成熟并发和查询 | 本地安装/运维重，当前规模过度 | 高 | 云端/团队再评估 |
| 文档库 + 图数据库 + 向量库 | 各自擅长 | 多事实源、一致性和备份复杂 | 很高 | 不选 |

## 决策

- SQLite 保存所有业务事实、解析结果状态、持久任务、审计和本地指标；
- SQLite FTS5 作为首个词法索引候选，通过 `LexicalIndexPort` 隔离，中文质量不达标时可替换；
- 当前 ChromaDB 通过 `VectorIndexPort` 继续作为向量投影候选，不再保存唯一业务事实；
- 图谱当前由 SQLite 中的层级、Link、Entity 和 Relation 投影；Neo4j 保留为未来可重建读投影候选；
- 预览/OCR/缩略图使用可删除文件缓存；
- Job 表与进程内有限并发 Worker 提供持久后台执行，不引入 Redis/Celery。

## 一致性规则

1. 先在 SQLite 创建 staging DocumentVersion/BlockRevision；
2. FTS/Vector 按 `block_revision_id` 建立 generation 投影；
3. 达到最低必要投影后，SQLite 事务切换 `active_version_id`；
4. 索引失败保留旧 active version，新投影可重试；
5. 查询命中后回 SQLite 二次验证 Space、active version 和状态；
6. 删除 FTS/Vector 不删除 Document/Link/Audit，索引可以完整重建；
7. 备份以 SQLite 和 managed sources 为核心，派生索引可选择重建。

## 理由

- SQLite 符合本地、单用户、有限写并发和无服务运维约束；
- 事务可以保证版本、链接、任务和 Agent 状态不分裂；
- 检索实现可以基于评测替换，不锁定业务模型；
- 避免为了图谱可视化引入第二个权威数据库；
- 从 v1.x Chroma 迁移时可以影子重建，不做危险原地升级。

## 接受的取舍

- FTS 与向量投影和 SQLite 最终一致；
- 本地磁盘会保存部分重复的抽取文本与向量；
- SQLite 不适合高并发云端写入；
- FTS5 中文分词质量可能不足。

## 缓解

- 使用持久 IndexProjection generation 和 Job checkpoint；
- 限制 Worker 并发、批量事务、WAL 和必要索引；
- 冻结中文/英文/混合评测集，词法适配器不达标即替换；
- 定期 SQLite 一致性备份，提供完整索引重建命令和验收。

## 复审触发器

- 100,000 blocks 基准下事务或查询长期无法达标；
- 多进程/多用户并发写成为已批准需求；
- Chroma 在过滤、备份、升级或恢复上无法达到门槛；
- FTS5 中文检索在合理优化后仍明显低于替代方案；
- 图谱查询出现 SQLite 无法满足的真实复杂度和规模。
