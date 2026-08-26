# ADR-0004：采用稳定对象 ID 与版本化内容锚点

## 状态

Proposed — 2026-08-24

## 背景

v2 必须让搜索、回答、反链和图谱回到具体原文，并在空间/文件重命名、内容更新和格式扩展后尽量保持可用。v1.x 主要使用 `source_path` 和 chunk ID，无法作为跨格式、跨版本的永久地址。

## 方案比较

| 方案 | 优点 | 缺点 | 结论 |
|---|---|---|---|
| 路径 + 行号/页码 | 易实现、直观 | 重命名/插入内容即失效；跨格式不统一 | 不作为永久身份 |
| 内容哈希 | 可检测相同内容 | 内容微调即改变；重复内容冲突 | 只作指纹 |
| 稳定对象 ID + 版本 locator | 身份与位置分离；支持迁移和审计 | 需要匹配和失效状态 | 选择 |
| 每次版本生成全新不可解析链接 | 证据版本最准确 | 普通导航大量失效 | 只用于固定 Citation，不用于稳定 URI |

## 决策

- Document 和逻辑 Block 使用稳定 UUID；
- DocumentVersion 和 BlockRevision 保存某次解析的具体内容；
- SourceAnchor 使用格式化 `locator_json` + context fingerprint；
- 稳定 URI 引用 Document/Block，默认解析到当前 active version；
- Citation 同时固定 DocumentVersion/BlockRevision/Anchor，保留当时证据；
- 版本更新时运行 Block matching，结果为 `exact/relocated/new/stale/ambiguous`；
- 无法可靠定位时明确显示 stale/ambiguous，不自动跳到“最像”的内容。

## 格式 locator

| 格式 | locator 最小信息 |
|---|---|
| Markdown/TXT | heading ancestry、字符/行范围、上下文指纹 |
| PDF | page、文本范围；必要时页面坐标 |
| CSV/Excel | sheet/table、cell range 或稳定记录键 |
| Image | asset、区域坐标、OCR 文本范围 |

## 理由

- 把“文档是什么”和“当前在哪里”分离，重命名不破坏关系；
- Stable URI 支持系统内双链，不依赖 Obsidian URI；
- 固定 Citation 与当前导航兼顾审计和日常使用；
- 格式适配器可以新增 locator，而不改变 Link/Relation/Agent 对象；
- 明确不确定状态比错误回跳更符合证据优先原则。

## 接受的取舍

- Block 跨版本匹配有算法和存储成本；
- 内容大改时部分链接仍会失效；
- 每个格式需要独立 locator/resolver 测试；
- 保留旧版本增加磁盘占用。

## 缓解

- M1 从标题层级、内容指纹和邻近块组合匹配开始；
- 低置信重定位进入用户确认队列；
- 旧版本按保留策略清理前先检查 Citation/Audit 引用；
- 建立重命名、移动、插入、拆分、合并和 OCR 变化的 Golden tests。

## 复审触发器

- 锚点准确率持续达不到 PRD 门槛；
- Block matching 的存储/计算成本超过用户价值；
- 某格式缺乏可重复定位能力，需要降级到文件级；
- 用户更需要不可变快照而非当前版本导航，需要调整 URI 语义。
