# 当前交付状态

> 最后整理：2026-07-30
>
> 版本来源：根目录 [`VERSION`](../../VERSION)

## 当前结论

| 项目 | 状态 |
|---|---|
| 当前代码版本 | `v1.6.0-rc.1` |
| 最新稳定标签 | `v1.5.0` |
| 远程状态 | RC 候选代码已同步远程 `main` |
| 公开演示 | [Codex Sites 演示版](https://pm-knowledge-hub-demo.tongqtang.chatgpt.site) 已上线 |
| 本地完整版 | Next.js + FastAPI + ChromaDB，可选真实 LLM |
| 发布门禁 | Phase 9 的 4 项 RC 门禁通过 |
| 正式发布 | 尚未创建 `v1.6.0` tag 与 GitHub Release |

## 已交付范围

- 产品文档：BRD、MRD、PRD、用户旅程、指标体系与 Roadmap。
- 知识引擎：Obsidian Markdown 解析、标题/窗口切片、ChromaDB 持久化、语义检索与精确关键词检索。
- 智能能力：带来源证据的 RAG 问答、STAR 模拟面试与本地 Mock 降级。
- 前端体验：知识浏览、问答、面试、学习地图、历史记录、PDF 导出、明暗主题与响应式布局。
- 质量保障：后端测试、前端 lint/build、双视口浏览器验收、线上黑盒测试与隐私边界检查。
- 公开展示：不含本地笔记、后端、密钥和付费模型调用的脱敏演示版。

## 待决策

1. 为当前候选版创建 `v1.6.0` tag 与 GitHub Release。
2. 或保留 RC 状态，启动 PRD / Roadmap 中的下一阶段能力。
3. 线上测试仍记录若干 S2 项：安全响应头、移动侧栏焦点、PDF 文本可访问性和 404 恢复路径。

## 里程碑

| 版本 | 核心结果 |
|---|---|
| `v0.1.0-alpha` | 产品文档与基础工程建立 |
| `v1.0.0` | RAG、面试、知识图谱和系统验收闭环 |
| `v1.2.0` | 无障碍与体验专项 |
| `v1.3.0` | 历史记录、PDF、关键词高亮 |
| `v1.5.0` | 列表、消息与图谱性能优化 |
| `v1.6.0-rc.1` | 移动端、证据闭环、失败恢复与公开演示 |

详细版本变化见 [CHANGELOG](CHANGELOG.md)，实施过程见 [实施历史](IMPLEMENTATION_HISTORY.md)，实测结果见 [系统验收](../quality/ACCEPTANCE.md)。
