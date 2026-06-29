# 📦 CHANGELOG — PM Knowledge Hub

所有版本变更记录。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

---

## [0.1.0-alpha] — 2026-06-29 — Phase A 产品文档发布

### Added
- 建立项目工程目录结构（backend/frontend/docs/scripts）
- 初始化Git仓库，配置.gitignore
- 创建完整项目管理文档框架（PROGRESS.md, TASKS.md, CHANGELOG.md, AGENT_WORKFLOW.md, acceptance/）
- 撰写完整的 AI 产品管理文档体系：
  - **BRD v1.1** (商业背景、用户定义、量化求职与提效数据)
  - **MRD v1.0** (4类竞品分析矩阵、MoSCoW功能裁剪、差异化定位)
  - **PRD v1.1** (RAG混合检索、切片规范、STAR面试评估逻辑、5个核心Job Stories、边缘异常容错矩阵)
  - **ARCHITECTURE v1.0** (系统三层拓扑图、RAG 核心数据流 Sequence 时序图)
  - **USER_JOURNEY v1.1** (检索复习、学习规划与打卡、面试模拟 3 大场景旅程)
  - **METRICS v1.0** (北极星指标 SRR, 4项系统性能/行为指标, 3项面试质量指标)
  - **ROADMAP v1.0** (MVP 规划、里程碑和 Scope Cut 决策机制)
- 完成两轮独立验收智能体的质量门禁审计，报告均已记录。

---

## [0.0.1] — 2026-06-29 — 项目启动

### Added
- 项目立项：PM Knowledge Hub
- 确认技术选型（Python/FastAPI/ChromaDB/Next.js/Gemini Flash）
- 完成方案设计文档 v0.2
- 建立多智能体工作流约定（主导/工作/验收智能体分工）

### Decisions
- 使用Gemini Flash免费额度（每日1500次）接入LLM能力
- 采用本地ChromaDB（无需云端向量数据库，降低成本）
- 知识库数据源：204篇Obsidian Markdown笔记
- 开发顺序：Phase A（产品文档）→ B（后端）→ C（前端）→ D（部署）

---

## 版本规划

| 版本 | 里程碑 | 对应Phase |
|------|--------|----------|
| v0.1.0 | 产品文档完成 + Python环境就绪 | Phase A + B启动 |
| v0.2.0 | RAG检索核心可用（CLI可测试）| Phase B |
| v0.3.0 | 两个Agent可对话（API可调）| Phase B |
| v0.5.0 | 前端基础框架 + 设计系统建立 | Phase C |
| v0.8.0 | 全部页面完成（本地可完整运行）| Phase C |
| v1.0.0 | 产品文档完善 + GitHub整理完成 | Phase D |
