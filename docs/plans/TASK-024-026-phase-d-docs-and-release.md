# TASK-024 / 025 / 026 — Phase D：文档完善与 v1.0.0 交付

> **任务类型**：工作智能体交付任务（文档 + 仓库整理，无代码功能变更）
> **前置依赖**：Phase C 全部验收通过 ✅（系统验收 15/15，2026-07-06）
> **验收标准**：本任务书第 5 节 + ROADMAP v1.0.0 验收概要
> **创建时间**：2026-07-06
> **派发人**：主导智能体 (ZCode)

---

## 1. 任务背景

Phase A（产品文档）/ B（后端引擎）/ C（前端界面）已全部完成并验收通过：

- 后端：6 业务接口（health/search.semantic/search.keyword/search.documents/qa.ask/interview.start/interview.evaluate/graph）+ 39 单元/集成测试全绿。
- 前端：5 大页面（首页工作台/知识库/AI 问答/模拟面试/学习地图）全部接入真实 API，`acceptance_test.md` 15/15 Test Case 通过。
- 真实 LLM：`GEMINI_API_KEY` 已配置，面试 `is_mock=False` 跑通。

**Phase D 是项目最后一公里**——把工程产物包装成可展示、可复现、可写进简历的交付物。本阶段**不写新功能代码**，聚焦文档、截图、视频脚本、仓库治理与版本打 tag，对应 ROADMAP 的 **v1.0.0「高保真视觉与交付」**里程碑。

---

## 2. 目标产物

### 2.1 TASK-024：README 完善（根目录 `README.md` + `frontend/README.md`）

**根 `README.md`** —— 当前是 Phase A 时期的占位版（status badge 还写着 "Phase A In Progress"），需要全面重写为 v1.0.0 发布版。必须包含：

- **项目横幅 / 一句话定位**：保留现有「基于 RAG 技术的 AI 产品经理垂直知识库」定位，更新 badge 为 `version-v1.0.0` / `status-Released`。
- **功能亮点（4 大模块）**：📚 语义知识检索 / 🤖 RAG 问答助手 / 🎤 STAR 面试模拟 / 🗺️ 知识图谱可视化。每个模块配 1 张截图（从 `acceptance-*.png` 中挑选或重新截取，放到 `docs/screenshots/`）。
- **架构图**：在现有文字架构基础上，补充一张 Mermaid 架构图（前端 Next.js → rewrites → FastAPI → ChromaDB / Gemini），可直接复用 `docs/pm/ARCHITECTURE.md` 的图。
- **快速开始（Quick Start）**：
  - 环境要求：Python 3.10+ / Node 18+ / Windows（项目当前环境）。
  - 后端启动：`cd backend && python -m venv venv && source venv/Scripts/activate && pip install -r requirements.txt` → 配置 `.env`（`NOTES_DIR`/`CHROMA_DB_PATH`/`EMBEDDING_MODEL`/`GEMINI_API_KEY`）→ `python -m uvicorn api.main:app --port 8000`。
  - 前端启动：`cd frontend && npm install && npm run dev` → 访问 `http://localhost:3000`。
  - **必须说明**：首次启动会加载 `paraphrase-multilingual-MiniLM-L12-v2` 模型（需联网下载，约 120MB），后续离线可用。
- **项目结构**：用 tree 形式列出 `backend/`（api/ingest/agents/tests）、`frontend/`（src/app 5 页面）、`docs/`（pm/acceptance/plans/versions）。
- **技术栈表**：FastAPI / ChromaDB / Sentence-Transformers / LangChain / Gemini / Next.js 16 / react-force-graph-2d。
- **文档索引**：链接到 BRD/MRD/PRD/ARCHITECTURE/ROADMAP/PROGRESS/`acceptance_test.md`。
- **License**：MIT。

**`frontend/README.md`** —— 当前内容停留在 "C-1 完成 / 下一步 C-2"，需要更新：
- 把「当前阶段」改为「Phase C 全部完成（C-1/C-2/C-3）」。
- 删除「下一步 C-2」段落，改为「已完成功能清单」。
- 补充 `/map` 图谱页说明（react-force-graph-2d、交互方式）。
- 补充「截图」小节，链接到 `docs/screenshots/`。

### 2.2 TASK-025：Demo 视频脚本与简历项目描述

**文件**：新建 `docs/demo/DEMO_SCRIPT.md` 与 `docs/demo/RESUME_BULLET.md`（创建 `docs/demo/` 目录）。

**`DEMO_SCRIPT.md`（1 分钟产品演示视频脚本）**：
- 按「问题 → 方案 → 演示 → 价值」结构，分镜脚本格式（时间戳 / 画面 / 旁白 / 操作）。
- 4 个核心演示场景（每个 12-15 秒）：
  1. 知识库语义检索：搜 `AARRR`，展示相关度排序 + 三栏预览。
  2. RAG 问答：问「如何撰写 PRD」，展示 answer + 引用证据分片 + Obsidian 跳转。
  3. 面试模拟：开始面试 → 作答 → STAR 评分卡（强调 is_mock=False 真实 LLM）。
  4. 知识图谱：切目录聚合 → 笔记展开 → 章节过滤 → 节点聚焦。
- 附「录屏操作清单」：需启动后端 8000 + 前端 3000，OBS/系统录屏设置建议。
- 附「旁白完整文稿」（约 180 字，中文），可直接配音。

**`RESUME_BULLET.md`（简历项目描述）**：
- 提供 **3 种长度版本**：
  - **一句话版**（30 字）：用于简历标题行。
  - **短版**（80-100 字）：用于简历项目经历正文，突出技术栈 + 量化成果（204 篇笔记 / 739 切片 / 6 接口 / 5 页面 / 15 验收点）。
  - **长版**（STAR 格式，200 字）：用于面试口述或详细项目说明。
- 提供 **英文版**短描述（用于外企/英文简历）。
- 提供 **面试问答预案**：3 个高频追问（「为什么选 ChromaDB 不选 Pinecone？」「RAG 如何减少幻觉？」「双链怎么处理？」）+ 参考答案要点。

### 2.3 TASK-026：GitHub 仓库整理与 v1.0.0 tag

**仓库治理**：
- **清理根目录杂物**：根目录现有 `acceptance-*.png`（10 张验收截图）和 `dir_list.txt`、`_scan.py`（若有残留）等散落文件。把验收截图移到 `docs/screenshots/`，删除临时文件（`dir_list.txt`、`_scan.py`、`dev-server.*.log`）。
- **核对 `.gitignore`**：确认 `backend/data/`、`.env`、`node_modules/`、`.next/`、`__pycache__/` 均未误提交（用 `git ls-files | grep -E "data/|\.env$|node_modules"` 抽查）。
- **合并到 main**：当前在 `feature/phase-b-backend` 分支，Phase B/C 的成果需要通过 PR 合并到 `main`（按 `docs/AGENT_WORKFLOW.md` 分支策略）。合并前确认 `acceptance_test.md` 与所有 docs 更新已 commit。
- **README 截图占位**：若 `docs/screenshots/` 截图不足，从 `acceptance-test-*.png` 中挑选 4 张代表（工作台/知识库/面试/图谱）复制过去并重命名为语义化文件名（如 `workspace.png`、`knowledge-search.png`、`interview-star.png`、`knowledge-graph.png`）。

**版本打 tag**：
- 确认 `docs/versions/CHANGELOG.md` 已有 `[1.0.0]` 条目（当前是 `[1.0.0-rc.1]`，合并到 main 后改为 `[1.0.0] — 2026-07-XX` 正式版）。
- 在 main 分支打 tag：`git tag -a v1.0.0 -m "PM Knowledge Hub v1.0.0 — 完整产品发布"`。
- 推送 tag：`git push origin v1.0.0`。

---

## 3. 工作空间与提交规范

- **分支**：从 `feature/phase-b-backend`（或 main，视合并进度）切出 **`feature/phase-d-release`** 子分支工作。
- **提交信息**（按 `docs/AGENT_WORKFLOW.md`）：
  - `docs(readme): rewrite root and frontend README for v1.0.0 release`
  - `docs(demo): add demo video script and resume bullet`
  - `chore(repo): organize screenshots, clean temp files, tag v1.0.0`
- **不要**修改 `backend/` 或 `frontend/src/` 下的功能代码——Phase D 是纯文档/治理阶段。如发现验收后的 bug，单独记到 `docs/` 下的 issue 清单，不在本任务修复。

---

## 4. 风险与注意事项

| 风险 | 处理 |
|------|------|
| 截图与实际 UI 漂移（Phase C 后界面可能微调） | 录制截图前重新启动前后端，确保用最新 UI；每张截图标注拍摄日期 |
| 简历描述夸大 | 严格基于 `acceptance_test.md` 实测数据（204 篇/739 切片/15 验收点），不编造未实现功能 |
| `git tag` 推送需仓库写权限 | 若 `git push origin v1.0.0` 失败，回报需主导智能体协助推送 |
| 合并冲突（feature 分支与 main） | 优先 rebase 到最新 main；冲突点优先保留验收通过版本 |

---

## 5. 验收对照

Phase D 无独立 `phase-d-criteria.md`，按 ROADMAP v1.0.0 验收概要 + 本任务书第 2 节逐项核对：

- [ ] 根 `README.md` 重写为 v1.0.0 发布版（含 4 大功能截图、架构图、Quick Start、技术栈、文档索引）。
- [ ] `frontend/README.md` 更新为 Phase C 完成态（删除 C-2 待办，补充 /map 说明）。
- [ ] `docs/demo/DEMO_SCRIPT.md` 含 4 场景分镜脚本 + 旁白文稿。
- [ ] `docs/demo/RESUME_BULLET.md` 含 3 长度版本 + 英文版 + 3 面试预案。
- [ ] 根目录杂物清理完成（验收截图归档到 `docs/screenshots/`，临时文件删除）。
- [ ] `.gitignore` 核对无敏感文件误提交。
- [ ] Phase B/C 成果合并到 `main` 分支。
- [ ] `CHANGELOG.md` `[1.0.0]` 正式版条目就位。
- [ ] `v1.0.0` tag 已打并推送。

**完成判定**：上述 9 项全部勾选 + `acceptance_test.md` 仍为 15/15 通过态，即视为 Phase D 完成、项目 v1.0.0 发布。

---

## 6. 交付清单（工作智能体完成后回报）

按 `docs/AGENT_WORKFLOW.md` 的「工作报告」格式输出，必须包含：
1. 新增/修改文件清单（README / DEMO_SCRIPT / RESUME_BULLET / CHANGELOG / screenshots）。
2. 仓库清理前后对比（删除了哪些临时文件、移动了哪些截图）。
3. `git log --oneline` 尾段证明 commit 规范。
4. PR 合并链接（合并到 main 后）。
5. `git tag v1.0.0` 与 `git push origin v1.0.0` 的执行结果。
6. 遗留问题（无则写「无」）。
