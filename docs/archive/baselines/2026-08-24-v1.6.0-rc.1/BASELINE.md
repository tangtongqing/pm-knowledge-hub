# PM Knowledge Hub v1.6.0-rc.1 文档基线

> 本基线在 v2 产品定义工作开始前建立。它用于恢复和审计，不是后续需求的单一事实源。

## 1. 基线结论

- 当前活动文件未被移动、删除或覆盖。
- 已完整复制 `docs/product/` 和 `docs/design/`，并补齐高保真原型索引引用的 6 张实现截图。
- 共归档 32 个文件、3,354,258 字节。
- 捕获完成后，32/32 个归档文件与源文件的 SHA-256 指纹一致，差异数为 0。
- 远程 Figma 设计源只登记链接，不对外部文件执行复制或修改。

## 2. 基线元数据

| 字段 | 值 |
|---|---|
| 捕获日期 | 2026-08-24 |
| 时区 | Asia/Hong_Kong |
| 项目版本 | `v1.6.0-rc.1` |
| Git 分支 | `main` |
| Git HEAD | `7bc9dbd765164e9a363cc770140815c337afa423` |
| PRD 版本 | `v4.0` |
| PRD 状态 | 评审稿；捕获时的需求与验收单一事实源 |
| 文件指纹 | [SHA256SUMS.txt](SHA256SUMS.txt) |

## 3. 归档范围

| 区域 | 文件数 | 说明 |
|---|---:|---|
| [product](product/) | 14 | BRD、MRD、PRD v4、指标、路线图、用户旅程、证据矩阵、Word 评审稿及 PRD 图示 |
| [design](design/) | 12 | 设计索引、评审、Backlog，以及 P-07～P-11 的 PNG、HTML、CSS、JavaScript 原型 |
| [screenshots](screenshots/) | 6 | P-01～P-06 对应的当前实现证据截图 |
| **合计** | **32** | **3,354,258 字节** |

关键入口：

- [PRD v4 Markdown](product/PRD.md)
- [PRD v4 Word 评审稿](product/PRD-PM-Knowledge-Hub-v4.0.docx)
- [PRD v4 证据矩阵](product/PRD_EVIDENCE_MATRIX.md)
- [高保真原型索引](design/HIGH_FIDELITY_PROTOTYPES.md)
- [P-07～P-11 本地交互原型](design/prototypes/prd-v4/index.html)
- [Figma 设计源](https://www.figma.com/design/7sQuypYVJEEuxaaJu3WqqD)

## 4. 捕获前的工作区状态

以下状态在创建 `docs/archive/` 前捕获。原有工作区包含 **9 个已跟踪修改文件**和 **19 个未跟踪文件**；已跟踪内容合计增加 1,541 行、删除 525 行。

```text
 M README.md
 M docs/README.md
 M docs/demo/PM_KNOWLEDGE_HUB_RESUME_MASTER.md
 M docs/design/README.md
 M docs/product/METRICS.md
 M docs/product/PRD.md
 M docs/product/README.md
 M docs/product/ROADMAP.md
 M docs/product/USER_JOURNEY.md
?? docs/demo/RESUME_HANDBOOK_OPTIMIZATION_PROMPT.md
?? docs/design/HIGH_FIDELITY_PROTOTYPES.md
?? docs/design/prototypes/prd-v4/P-07-setup-ready-desktop.png
?? docs/design/prototypes/prd-v4/P-08-privacy-consent-desktop.png
?? docs/design/prototypes/prd-v4/P-09-index-failure-desktop.png
?? docs/design/prototypes/prd-v4/P-10-validation-records-desktop.png
?? docs/design/prototypes/prd-v4/P-11-setup-ready-mobile.png
?? docs/design/prototypes/prd-v4/index.html
?? docs/design/prototypes/prd-v4/prototype.css
?? docs/design/prototypes/prd-v4/prototype.js
?? docs/product/PRD-PM-Knowledge-Hub-v4.0.docx
?? docs/product/PRD_EVIDENCE_MATRIX.md
?? docs/product/assets/prd-v4/mermaid/PRD-rendered-1.png
?? docs/product/assets/prd-v4/mermaid/PRD-rendered-2.png
?? docs/product/assets/prd-v4/mermaid/PRD-rendered-3.png
?? docs/product/assets/prd-v4/mermaid/PRD-rendered-4.png
?? scripts/build_prd_docx.py
?? start-dev.cmd
?? start-dev.ps1
```

## 5. 使用与恢复规则

1. 后续 PRD v5、目标架构和新原型只在活动目录或新版本目录中修改。
2. 不从本基线原地继续编辑；如需恢复，将目标归档文件复制回活动目录，并先确认当前文件是否还需保留。
3. 恢复前使用 [SHA256SUMS.txt](SHA256SUMS.txt) 验证归档完整性。
4. Git HEAD 只代表已提交代码；上方工作区清单用于说明捕获时尚未进入 Git 的内容。
5. 本地归档在提交 Git 或完成外部备份前，不视为跨设备备份。

## 6. 本次未执行的事项

- 未修改 PRD、BRD、MRD、指标、路线图或用户旅程的正文。
- 未修改现有 P-01～P-11 原型、截图或 Figma 文件。
- 未创建 PRD v5、目标架构、新原型或代码迁移文件。
- 未修改前后端业务代码、依赖、配置和测试。
- 未执行 Git 提交、推送、清理或删除。

