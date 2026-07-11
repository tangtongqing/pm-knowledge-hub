# 📦 CHANGELOG — PM Knowledge Hub

所有版本变更记录。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

---

## [1.3.0] — 2026-07-11 — TASK-030 功能扩展（对话历史 + 面试 PDF + 关键词高亮）

### Added
- **对话历史记录 (Feature A)**:
  - 引入 LocalStorage 轻量客户端持久化存储，分别存储并管理问答助手 (`qa`) 和模拟面试 (`interview`) 两个分类下的最近 50 条会话。
  - 会话标题根据首条用户消息截取（前 20 字）自动命名，支持手动新增会话（新对话 / 新面试）以及一键垃圾桶图标单条物理删除。
  - 为历史侧栏配备精美的平滑过渡折叠面板布局，并在侧栏会话卡片上以徽标 badge（如 `85分`）直观呈现该会话中取得的最高面试评分。
- **面试评估报告 PDF 导出 (Feature B)**:
  - 引入 `jspdf` 依赖。开发了基于 HTML5 Canvas 绘制的多页 PDF 排版引擎，将报告整体绘制输出为高分辨率位图，解决中文字体加重打包体积的问题，支持主流系统字体的完美排版。
  - 支持多页排版与自动高度折行，PDF 报告集成大标题、评估时间、首轮总结看板（包含最高得分、平均得分、总评估轮数）以及按 STAR 四维原则（情景、任务、行动、结果）深度评估的每轮测评模块与标准建议回答框架。
- **关键词高亮 (Feature C)**:
  - 针对知识库 (`/knowledge`) 的列表标题、预览大标题以及 ReactMarkdown 渲染的正文（支持 p/li/h1/h2/h3/td/th 的深度递归子节点处理，确保行内代码与链接不被破坏），进行大小写不敏感、正则注入安全的搜索检索词包裹 `<mark className={styles.highlight}>` 高亮渲染。
  - 适配警告风格亮黄色圆角高亮样式底色，确保高亮提示在暗黑/明亮主题下有极佳的对比度表现。

### Verification
- 运行 `npm run build` 打包发布验证通过，全量静态路由生成完好。
- 测试验证 LocalStorage 缓存与清除机制，在 quota 异常极限下捕获存储溢出保护；PDF 导出包含中文字体正常排版。

## [1.2.0] — 2026-07-09 — TASK-029 可访问性与体验优化专项

### Added
- **可访问性专项 (P2-1 至 P2-5)**:
  - 首页、知识库、模拟面试、问答助手、知识地图 5 大页面共 20+ 个装饰性 SVG 全量加入 `aria-hidden="true"`。
  - 知识库搜索页面的结果数显示容器加入 `aria-live="polite"`，保证搜索结果更新时键盘焦点不丢失且屏幕阅读器能实时播报。
  - 模拟面试评分页的 STAR 四维综合得分组件，增加 `<div role="progressbar" aria-valuenow={score}>` 水平评分填充进度条，提升进度条语义化。
  - 力导向知识地图 canvas 容器后附带 visually-hidden `.srOnly` 文本节点摘要，包含节点总数、连线数与具体笔记大纲列表，解决纯 Canvas 对读屏器的离线障碍。
  - 问答助手提问页点击底部的建议问题词后，在输入文本替换的同时，焦点能够回弹聚焦在提问输入框 `inputRef` 内。
- **体验/效率专项 (P2-6 至 P2-10)**:
  - 全局键盘监听首页触发 `/` 快捷键，可在非输入控件聚焦时，自动拦截并聚焦输入头部搜索框。
  - 首页对指标卡网格 (.metricsGrid) 和功能卡网格 (.grid) 应用 `grid-auto-rows: 1fr` 弹性属性，确保同行卡片在文字不等长时高度对齐。
  - 问答助手 AI 消息气泡右上角新增一键复制按钮，Hover 气泡时显示，复制内容到剪贴板，并在 1.5 秒内呈现「已复制 ✓」反馈。
  - 模拟面试答题框增加 `STAR` 引导文案，帮助用户按「Situation - Task - Action - Result」逻辑结构组织作答。
  - 力导向知识图谱地图的操作栏内添加「重置视图」控制按钮，点击能够触发 `zoomToFit(400)` 重置图谱到合适大小与中心。
- **工程整理**:
  - `.gitignore` 新增忽略测试用 Playwright 临时快照文件夹 `.playwright-mcp/`，并进行物理删除清理。

### Verification
- `npm run build` 构建编译成功，7 路由静态编译通过，0 报错。
- `acceptance_test.md` 补充第 7 模块（可访问性与体验），21/21 个验收用例通过。

---

## [1.1.0] — 2026-07-07 — TASK-027 产品设计工作流缺口补齐

### Added
- 新增后端覆盖率配置 `backend/.coveragerc`，并在 `docs/acceptance/phase-b-criteria.md` 记录 2026-07-07 覆盖率实测结果。
- 新增 AI 安全基础防护：`backend/api/security.py`、`backend/tests/test_security.py`、`slowapi` 限流接入，以及 QA/Interview 路由的输入清洗与异常降级保障。
- 新增 `LICENSE`、`backend/.env.example`，并在 README 补充「数据流向与隐私」说明，明确本地存储、Gemini 外发片段与 mock 降级路径。
- 在 `/assistant` 与 `/interview` 页面补充 AI 生成内容免责声明，并在 `acceptance_test.md` 增加 Test Case 3.3。
- 新增 `GET /api/v1/metrics` 运行时指标端点，首页工作台接入真实指标展示；`docs/pm/METRICS.md` 补充 v1.1.0 指标采集实现。
- 新增 5 个核心页面的设计 critique/audit 报告，共 10 份报告归档到 `docs/design/`。

### Verification
- `docs/acceptance/phase-b-criteria.md` 记录后端测试 **45 passed**。
- `docs/TASKS.md` 标记 `TASK-027` 完成，Git tag `v1.1.0` 已存在。

---

## [1.0.0] — 2026-07-06 — Phase D 完成 & 正式 v1.0.0 交付

### Added
- **Phase C-2 真实接口联调**：前端首页/知识库/AI问答/模拟面试四大模块全部接入 FastAPI 真实接口（health/search/qa/interview），替换静态演示数据。
- **Phase C-3 力导向图谱**：后端新增 `GET /api/v1/graph`（chapter/note 两层聚合 + 章节过滤）；前端 `/map` 用 `react-force-graph-2d` 实现可交互知识图谱，支持 hover 高亮+流动粒子、click 聚焦 zoom、章节下拉过滤、Obsidian URI 跳转。
- 后端新增 2 项图谱集成测试（`test_api_graph_chapter_level` / `test_api_graph_note_level_filter`）。
- 新增系统级验收测试清单 `acceptance_test.md`，覆盖 5 个 Phase 共 15 个 Test Case。

### Verification
- 系统验收 **15/15 Test Case 全过**（含真实 Gemini is_mock=False、力导向图谱交互、离线降级文案逐字命中）。
- `python -m pytest tests/test_api.py -v` → **9 passed**。
- `npm run build` → 7 路由静态生成，0 错误。

---

## [0.5.0] — 2026-06-30 — Phase C-1 前端工作台雏形

### Added
- 清理 Next.js 默认模板，完成 PM Knowledge Hub 首页工作台首版。
- 建立 Clarity Console 视觉方向与全局 Design Tokens：浅灰背景、白色卡片、蓝紫主色、轻量图表和状态色。
- 新增核心指标卡、Retrieval Report 趋势图、Evidence Sources 来源摘要、Recent Knowledge Work 记录和 Matched Notes 列表。
- 新增 Phase C 验收标准文档 `docs/acceptance/phase-c-criteria.md`。
- 新增 `PRODUCT.md` 与 `DESIGN.md`，作为后续前端设计上下文。

### Fixed
- 显式配置 `turbopack.root`，修复 Windows 环境下 Next.js 16 构建误判 workspace root 的问题。

### Verification
- `npm.cmd run lint`
- `npm.cmd run build`

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
