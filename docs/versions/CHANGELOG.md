# 📦 CHANGELOG — PM Knowledge Hub

所有版本变更记录。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

---

## [Unreleased] — v1.6.0-rc.1 — 产品设计 P1 稳定化

### Added
- 回答中的 `[n]` 引用可定位到对应证据卡，并展示最多 500 字的原文摘录。
- 新增受路径与扩展名限制的笔记图片资源端点，修复 Markdown 图片 404。
- 会话删除撤销、问答重试、知识加载重试及面试下一步学习动作。
- 根目录 `VERSION` 作为后端运行时版本来源。
- Codex Sites 公开演示版上线，提供营销、设计、知识库、AI 助手、模拟面试、学习地图和关于页七条路由。
- 新增简历与面试总手册，整合分岗位项目经历、可核验证据、产品流程、模拟访谈与面试题库。

### Changed
- 知识、问答、面试、图谱在 390×844 下改为分层/堆叠工作区；地图 Canvas 按容器尺寸渲染。
- 首页区分 204 篇笔记与 2579 个分片，移除无数据时的伪 50/50，并如实标记运行期指标和 30 秒刷新周期。
- `v1.6.0-rc.1` 候选代码已提交并推送至远程 `main`；最新正式稳定标签为 `v1.5.0`。
- 公开演示版使用浏览器内置脱敏适配器；Codex Sites 部署源以独立 Git 工作区维护，与本地完整后端隔离。
- 求职材料入口统一指向 `PM_KNOWLEDGE_HUB_RESUME_MASTER.md`，替代旧版 `RESUME_BULLET.md`。

### Security
- 公开站点未设置环境变量，不包含 `.env`、API 密钥、本地笔记、后端地址或模型服务调用。
- 线上 AI 问答和模拟面试仅用于交互演示，不请求硅基流动、Gemini 等真实模型，不产生付费 API 成本。

### Verified release gate
- `npm run lint` 与 production build 通过；pytest 47/47 通过。
- 390×844 与 1440×1000 五页横向溢出为 0；引用锚点、五条证据摘录、三张笔记图片、失败降级与删除撤销完成浏览器复验。
- Codex Sites 生产构建成功，公开站点七条路由均通过访问检查；站点环境变量核验为空。
- 候选版已完成 Git 提交与远程 `main` 同步；因尚未创建 `v1.6.0` tag 与 GitHub Release，继续保持 `Unreleased`。



## [1.5.0] — 2026-07-15 — TASK-032 性能优化最终版与项目收尾

### Added
- **P3-2 知识库列表虚拟化**: 引入 `@tanstack/react-virtual` 对 200+ 篇全量笔记列表进行虚拟滚动加载，将首屏 DOM 节点数渲染从 204+ 降至 `<15` 个，极大地消除高亮匹配导致的卡顿现象。
- **P3-6 消息列表重渲染性能调优**:
  - 抽取问答及面试的消息渲染逻辑为独立的 `ChatMessageItem` 组件并包裹在 `React.memo` 内。
  - 用 `useCallback` 稳定 `handleCopy` 引用，实现历史消息在长对话流刷新时 `0` 重复重渲染（did not render）。
- **P3-9 力导向图谱 simulation 优化**:
  - 将 simulation 控制在 100 ticks 停止 (`cooldownTicks={100}`) 并加快收敛 (`d3AlphaDecay={0.05}`)，解决 D3 后期后台计算耗 CPU 问题。
  - 优化 Canvas 节点绘制，当处于 hover 态时对非高亮邻居节点执行早退简化渲染，减少 Canvas 逐帧重绘开销。
  - 自动节点限流保护：当全量展开的节点数 `> 200` 时，自动强制回退为目录层聚合，并显示 toast 引导警告。
- **P3-10 知识图谱操作引导浮层**:
  - 新增图谱右上角操作引导透明浮层，关联 `localStorage` 实现首次访问自动开启，关闭后不复现。
  - Controls 控制区新增“操作指南”按钮，点击可重新唤醒操作引导浮层。
- **归档**: 编写了项目终期总结报告 `docs/FINAL_REPORT.md`，对技术亮点和版本迭代进行了系统复盘。

### Verification
- 运行 `npm run lint` 和 `npm run build` 全量打包编译无任何报错通过。

## [1.4.0] — 2026-07-11 — TASK-031 收尾补漏与 P3 体验打磨

### Added
- **P3 体验打磨 (Part B)**:
  - **P3-1 首页指标卡换行**: 针对指标卡加 `word-break: break-word` 与 `overflow-wrap: break-word` 防溢出限制。
  - **P3-3 预览正文字号提升**: 将知识库预览正文的字号从 13px 提升至 15px，并将 line-height 设为 1.7 以提高阅读舒适度。
  - **P3-4 目录树交互过渡**: 给左侧树形目录导航项 (.treeItem, .activeTreeItem) 新增 background-color 和 color 的平滑 0.15s transition。
  - **P3-5 滚动锁定优化**: 修改 scrollToBottom 以防止浏览器在长文本连续流式渲染输出时将平滑滚动阶段性截断锁焦。
  - **P3-7 分数弹跳微动画**: 为面试综合得分组件增加 @keyframes 关键帧 bounce 缩放跳跃动画，并由 React `animateScore` 去同步触发渲染，丰富微动效体验。
  - **P3-8 作答框拖拽限制**: 模拟面试答题 textarea 增加 `resize: vertical; max-height: 200px;` 的方向及最大拉伸限制，保护整体结构不发生形变破坏。

### Fixed
- **A.2 PDF 面试官提问数据绑定修复**:
  - 在 `interview/page.tsx` 中向 activeSession evaluations 回填当前提问数据属性 `response.question = currentQuestion`。
  - 这修复了 PDF 导出模块对面试官提问取值缺失显示为 `(无提问记录)` 的数据源绑定缺陷。
- **Part C 严重对比度瑕疵修复 (WCAG AA 标准)**:
  - 调整 `globals.css` 中的全局设计文本变量颜色，将 light 主题下的 `--text-2` 设为 `#475569`、`--text-3` 设为 `#6B7280`，以及 dark 主题下的 `--text-2` 设为 `#A1A1AA`、`--text-3` 设为 `#94A3B8`，通过提升前背景色对比度（均大于 4.5:1）消除 axe 报出的全部 serious 级缺陷。

### Verification
- **验收回归**: 补齐 `acceptance_test.md` 包含 **Phase 8 (23/23 cases)** 场景实测全部全过，`npm run lint` 和 `npm run build` 均以 0 报错通过。

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


## [1.2.1] — 2026-07-11 — a11y 热修补丁

### Fixed
- `/assistant` 和 `/interview` 的发送按钮缺少 `aria-label`，axe-core 报 critical `button-name` 违规。两个按钮各加 `aria-label="发送"`，critical 归零。

### Verification
- axe-core 4.10.0 复扫：/assistant critical 1→0，/interview critical 1→0。

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
