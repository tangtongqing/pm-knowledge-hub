# 产品文档索引与产品简述

> 返回[文档中心](../README.md)。

## 标准产品文档

| 文档 | 回答的问题 | 何时优先看 |
|---|---|---|
| [BRD](BRD.md) | 为什么值得做、如何形成业务、何时停止 | 商业判断、项目立项 |
| [MRD](MRD.md) | 市场、用户细分、竞品与需求机会是什么 | 市场研究、竞品分析 |
| [PRD](PRD.md) | 当前版本具体做什么、如何验收 | 需求评审、开发与验收 |
| [PRD Word 评审稿](PRD-PM-Knowledge-Hub-v4.0.docx) | PRD v4.0 的可打印评审版 | 正式评审、批注与归档 |
| [PRD 证据矩阵](PRD_EVIDENCE_MATRIX.md) | 需求依据、证据等级和文档处置是什么 | PRD 评审、证据核对 |
| [用户旅程](USER_JOURNEY.md) | 用户如何完成核心任务 | 场景设计、流程复核 |
| [指标体系](METRICS.md) | 用什么指标判断产品有效 | 数据与运营复盘 |
| [Roadmap](ROADMAP.md) | 各版本先后做什么 | 优先级与范围决策 |

Word 评审稿由 [`scripts/build_prd_docx.py`](../../scripts/build_prd_docx.py) 从 `PRD.md` 生成；需求正文仍以 Markdown 为唯一事实源。

技术实现单独查看[系统架构](../architecture/README.md)，视觉与交互规范查看[设计系统](../design/README.md)，当前截图与目标设计查看[高保真原型索引](../design/HIGH_FIDELITY_PROTOTYPES.md)。

## Product Brief

## Users

PM Knowledge Hub is used by product manager candidates who are preparing for interviews with a local Obsidian note base. They are usually in a focused review session, comparing notes, asking RAG questions, checking citations, and practicing STAR interview answers.

## Product Purpose

The product turns a local PM learning vault into a searchable, traceable, and trainable knowledge workspace. Success means the user can quickly find the right note, trust the cited evidence, and turn weak interview answers into concrete follow-up study actions.

## Brand Personality

Geeky, precise, powerful, yet restrained. The interface should feel like a premium AI command center or modern IDE (similar to Open WebUI or Perplexity). It should inspire confidence and look highly technical, showcasing RAG data flows, Obsidian double-link graphs, and structured interview scores.

## Anti-references

Avoid "Cyberpunk AI" stereotypes. 
- Avoid heavy neon glowing effects.
- Avoid glassmorphism (heavy blur filters and translucent panels).
- Avoid flat, boring light gray SaaS dashboard styles (such as the rejected Clarity Console design). 
- Avoid standard generic admin templates. 

Ensure the interface has depth through subtle neutral shadows and clean contrast, using a restrained Zinc-tinted gray color palette rather than pure black/blue-black.

## Design Principles

1. **Workbench first**: every screen should help the user search, read, cite, or practice.
2. **Evidence stays visible**: sources, chapters, tags, and retrieval confidence should be easy to scan.
3. **High visual hierarchy**: use clear typography weight differences, subtle borders, and precise spacing to separate information, not overwhelming colors.
4. **Dense but calm**: show enough information for real PM review without making the page feel crowded. Rely on good whitespace.
5. **Interactive loops**: clicking a citation in the chat panel should instantly scroll and highlight the reference text in the source browser.
