# v2 冻结测试夹具与评测集规范（草案）

> 对应策略：[TEST_STRATEGY_V2.md](../../TEST_STRATEGY_V2.md) · 对应场景：[TEST_SCENARIOS_V2.md](../../TEST_SCENARIOS_V2.md) · 规范版本：`v1.0-draft.1` · 更新日期：2026-08-26 · 状态：结构待验收；数据尚未创建

## 1. 目的

本目录定义 v2 测试数据如何组织、标注、冻结和审计。当前只提交规范，不提交私人知识库内容，也不声称已有冻结评测结果。

夹具必须同时支持：

- 对象/所有权/空间隔离；
- 格式解析、版本、锚点和原文回跳；
- 检索 queries/qrels、问答拒答与冲突证据；
- Link/Backlink、typed Relation、Suggestion 和 Evidence；
- Agent 计划、批准、提示注入、幂等和撤销；
- v1.x 迁移、重启、局部失败和回滚；
- S/M/L 确定性规模生成。

## 2. 计划目录

```text
docs/quality/fixtures/v2/
├── README.md
├── manifests/
│   ├── dataset-v2-eval-0001.json
│   └── checksums.sha256
├── sources/
│   ├── space-a-agent/
│   ├── space-b-urban/
│   └── format-edge-cases/
├── versions/
│   ├── before/
│   └── after/
├── annotations/
│   ├── anchors.jsonl
│   ├── links.jsonl
│   ├── relations.jsonl
│   └── entities.jsonl
├── retrieval/
│   ├── queries.jsonl
│   ├── qrels.jsonl
│   └── no-answer.jsonl
├── agent/
│   ├── plans.jsonl
│   ├── policies.jsonl
│   ├── injections.jsonl
│   └── expected-actions.jsonl
├── migration/
│   ├── v1-source/
│   ├── legacy-chunks.jsonl
│   └── legacy-history.json
└── scale/
    └── generator-spec.json
```

只有小型、合成、无敏感内容的数据可以进入 Git。M/L 规模数据应由固定 seed 生成，不直接提交大量重复文件。

## 3. Dataset manifest

每个冻结版本使用独立 manifest：

```json
{
  "dataset_version": "v2-eval-0001",
  "schema_version": "pending",
  "created_at": "2026-08-26T00:00:00Z",
  "license": "synthetic-project-owned",
  "contains_private_data": false,
  "seed": 20260826,
  "spaces": 2,
  "formats": ["md", "txt", "pdf-text"],
  "expected_counts": {
    "documents": 100,
    "blocks": 1000,
    "links": 40,
    "relations": 20
  },
  "annotation_versions": {
    "anchors": "a1",
    "qrels": "q1",
    "relations": "r1",
    "agent": "g1"
  },
  "known_limitations": []
}
```

字段要求：

- `dataset_version` 一旦用于接受基线不可覆盖，只能新增版本；
- `contains_private_data` 在仓库数据中必须为 `false`；
- 所有文件进入 `checksums.sha256`；
- parser/index/model/tool 版本不写死在数据集内，但每次 run 必须记录；
- 标注变化独立版本化，避免数据不变但答案悄悄变化。

## 4. 内容规则

### 4.1 必须包含

- 中文、英文和中英混合文本；
- Unicode、空格、长路径、相对路径、同名文件和大小写差异；
- H1～H4、段落、列表、代码块、表格、Frontmatter 和标准 Markdown/Wikilink；
- TXT 无结构长段落；
- 可选中文本 PDF 的多页、目录、重复页眉和页码；
- 空文件、损坏文件、不支持格式和超限文件的最小样本；
- 两个空间同名概念但不同事实，用于泄漏检测；
- 明确无答案和相互冲突的证据；
- 关系证据、建议关系、冲突关系和失效目标；
- 提示注入、伪授权、任意命令和外发诱导文本。

### 4.2 禁止包含

- 项目所有者或任何用户的私人知识库正文；
- 真实用户名、公司、电话、邮箱、地址、项目机密；
- 真实绝对路径、API key、token、cookie 或账号；
- 未获得再分发许可的 PDF、图片、课程或书籍内容；
- 能从文件名推断私人活动的真实标题；
- 为了让测试通过而从生产结果反向复制的未审查数据。

## 5. 锚点标注

`anchors.jsonl` 每行至少包含：

```json
{
  "anchor_id": "anc-md-react-h2-001",
  "source_fixture": "sources/space-a-agent/react.md",
  "format": "md",
  "document_key": "doc-react",
  "version": "v1",
  "anchor_type": "heading_text_range",
  "heading_path": ["ReAct", "工具调用边界"],
  "expected_excerpt_hash": "sha256:pending",
  "position": {"start_line": 42, "end_line": 55},
  "relocalization_case": "versions/after/react-heading-renamed.md"
}
```

PDF 使用页码和可选区域坐标；表格未来使用工作表/单元格范围；图片未来使用区域坐标/OCR 范围。标注者必须实际打开目标核验，不能只由 parser 输出自我验证。

## 6. 检索 queries 与 qrels

`queries.jsonl` 每条包含：

- 稳定 query ID；
- query text 和语言；
- query type：exact/synonym/cross-document/no-answer/conflict/mixed-language；
- allowed space IDs 和 explicitly forbidden space IDs；
- expected strategy 不是必填，避免把实现方案写成答案；
- 任务意图和判定说明。

`qrels.jsonl` 使用 query→Block relevance：

```json
{
  "query_id": "q-scope-001",
  "block_key": "space-a/doc-react/block-permission",
  "relevance": 3,
  "rationale": "直接回答当前空间的权限边界"
}
```

相关性等级建议：0 不相关、1 背景相关、2 可支持部分回答、3 直接证据。至少两人审查关键 qrels；分歧保留记录。

## 7. Link 与 Relation 标注

必须区分：

- `structure`：Space/Collection/Document/Heading/Block 层级；
- `source_explicit`：来源文件显式 Markdown/Wikilink；
- `user_created`：系统内用户链接；
- `confirmed_relation`：已确认 typed Relation；
- `suggestion`：未确认模型/规则建议；
- `conflict`：待处理矛盾；
- `stale/unresolved`：证据或目标失效。

事实关系必须有 direction、type、source、evidence anchor 和 status。Suggestion 不得出现在 confirmed qrels 中。

## 8. Agent 夹具

每个 Agent case 包含：

- 固定 `space_scope`、Source mode、目标对象版本；
- Tool Registry 和风险级；
- 模型产生的候选 Plan；
- 用户 Approval（全批/部分拒绝/过期/取消）；
- 期望 Action、幂等键、结果和 Undo；
- 绝对禁止的对象、工具和网络请求；
- 预期审计字段与必须去敏字段。

注入样本只作为文档正文，不进入 system/tool policy。测试应模拟模型服从恶意正文，确认执行器仍然拒绝。

## 9. 迁移夹具

合成 v1 快照至少包含：

- 单一 `NOTES_DIR` 和 2～3 层目录；
- Markdown、frontmatter、tags、wikilink、失效/模糊链接和相对图片；
- 旧 chunk ID、不同切块和重复内容；
- QA/面试 localStorage 正常、stale 和损坏条目；
- 标题/关键词启发式图边（只能转 suggestion 或丢弃）；
- 去敏 `.env` 配置摘要，不含任何密钥。

每次演练验证源 manifest/hash、目标对象数、幂等、历史映射、双轨搜索/引用和回滚导出。

## 10. 规模数据生成

生成器输入至少包括：seed、Space/Document/Block 数、格式比例、平均层级、链接密度、关系密度、文本长度和重复/冲突比例。

要求：

- 同一 seed 和版本生成相同内容哈希；
- 文本合成不调用外部模型；
- S=2/100/1,000，M=5/1,000/10,000，L=10/10,000/100,000；
- 生成后输出 manifest、耗时和磁盘占用；
- 性能测试使用生成结果的独立临时目录，不污染仓库和个人 Source。

## 11. 冻结与变更流程

1. 新数据先进入 `candidate`，运行解析、锚点和标注审查；
2. 记录 reviewer、差异、许可证和已知限制；
3. 项目所有者/质量负责人接受后分配不可变版本；
4. 接受基线的 run 必须引用精确 dataset/annotation version；
5. 修复错误时新增版本并保留旧报告，不覆盖历史结果；
6. 被发现包含敏感/侵权内容时立即阻止使用并按精确文件处置，报告说明失效范围。

## 12. 本规范验收清单

- [ ] 目录同时承接格式、锚点、检索、关系、Agent 和迁移；
- [ ] 仓库夹具全部为合成/项目自有内容；
- [ ] 两空间同名干扰和禁止范围可表达；
- [ ] 锚点由独立标注验证，不用系统输出自证；
- [ ] queries/qrels 可计算 Recall/MRR/nDCG 和拒答；
- [ ] confirmed relation 与 suggestion 分开；
- [ ] Agent case 明确允许/禁止行为和撤销；
- [ ] S/M/L 数据可确定生成；
- [ ] manifest、hash 和标注均可版本化；
- [ ] 当前状态未误写为已有真实数据集。

---

*v1.0-draft.1：定义 v2 合成测试数据、标注、冻结、隐私和规模生成契约。*
