# 📦 CHANGELOG — PM Knowledge Hub

所有版本变更记录。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

---

## [Unreleased] — Phase A 进行中

### Added
- 建立项目工程目录结构（backend/frontend/docs/scripts）
- 初始化Git仓库，配置.gitignore
- 创建完整项目管理文档框架：
  - `docs/PROGRESS.md` — 实时进度看板
  - `docs/TASKS.md` — Sprint任务清单
  - `docs/versions/CHANGELOG.md` — 本文件
  - `docs/acceptance/` — 验收报告目录
  - `docs/pm/` — 产品文档目录
  - `docs/plans/` — 执行计划目录

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
