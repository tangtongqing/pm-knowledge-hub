# TASK-027 — Phase D 收尾：补齐产品设计工作流缺口（7 项）

> **任务类型**：工作智能体交付任务（安全加固 + 合规补齐 + 设计评审 + 指标落地）
> **前置依赖**：v1.0.0 已发布（19/19 验收通过，tag 已推远程）✅
> **目标版本**：v1.1.0（功能/合规增量）或 v1.0.1（仅补丁），由工作智能体按改动范围自定并回报
> **创建时间**：2026-07-07
> **派发人**：主导智能体 (ZCode)
> **完成状态**：✅ 已完成（2026-07-07，按 v1.1.0 发布）

---

## 1. 任务背景

v1.0.0 从**工程交付**角度已闭环（四阶段验收、tag 推送），但从 **product-design-workflow 的 8 个 Completeness Gates** 严格对照，存在 7 项缺口。其中 Gate 5（后端安全与测试门控）和 Gate 8（合规与风险）是工作流明确要求"不得跳过"的硬门控——v1.0.0 实际跳过了且未声明理由。本任务补齐这些缺口，使项目从「产品设计工作流」角度也能严谨声明完成。

工作流原话约束："Do not mark a release-ready UI complete if the required backend gate is blocked or skipped without a stated reason." 本任务即补这个 reason 的实证。

**诊断依据**：见主导智能体 2026-07-07 的八大门控对照分析（已与 `acceptance_test.md` 19/19 结论交叉核对）。

---

## 2. 缺口清单与产物

### 2.1 测试覆盖率证据（Gate 5 测试门控）— 硬

**现状**：`requirements.txt` 已含 `pytest-cov`，但项目无 `.coveragerc`、无任何覆盖率报告产物。Phase B 验收文档（`docs/acceptance/phase-b-criteria.md`）声称「覆盖率 ≥ 70%」，全项目找不到数据支撑——属未验证声明。

**产物**：
- `backend/.coveragerc`（新建）：配置 source=`api,agents,ingest`，omit 测试目录与 venv，分支覆盖 `branch = True`。
- 执行命令并留存报告：`cd backend && source venv/Scripts/activate && python -m pytest --cov=api --cov=agents --cov=ingest --cov-report=term --cov-report=html`。
- `backend/htmlcov/` 加入 `.gitignore`（不提交）；在 `docs/acceptance/phase-b-criteria.md` 追加一节「覆盖率实测」，粘贴 term 报告（含 TOTAL 行的真实百分比），如低于 70% 需补测试到位或显式声明实际数值并说明可接受理由。

**验收**：`.coveragerc` 存在 + term 报告 TOTAL 行 ≥ 70%（或显式声明的实际值）写进 phase-b-criteria。

### 2.2 AI 安全防护（Gate 5 后端安全门控 — AI/生成内容专项）— 硬

**现状**：QA `/qa/ask` 与 `/interview/start`、`/interview/evaluate` 直接把用户输入拼进 Gemini prompt，无任何防护。这是处理 AI 行为 + 生成内容的项目，门控要求覆盖，当前 0 防护。

**产物**（`backend/api/security.py` 新建 + 各路由接入）：
- **输入校验**：在 Pydantic 请求模型加约束（query/user_answer 长度上限 2000 字符，禁止控制字符）。`POST /qa/ask` 的 `query` 已有校验则确认。
- **prompt injection 基础过滤**：在送入 Gemini 前，对用户文本做最小清洗——剥离常见注入模式（`ignore previous`/`system:`/`<|` 等前缀关键词，长度截断）。实现一个 `sanitize_user_input(text: str) -> str` 纯函数 + 单元测试覆盖 3+ 注入样例。
- **rate limit**：引入 `slowapi`（加入 requirements），对 `/qa/ask` 与 `/interview/*` 限制为每 IP 每分钟 10 次，超限返回 429。配置 limiter 在 `main.py`，异常 handler 注册 `_rate_limit_exceeded_handler`。
- **输出 schema 校验**：QA/Interview Agent 解析 Gemini 返回时已有 try/except，确认 `is_mock` 降级路径在任何解析失败时都生效（不让原始 LLM 文本透传成 500）；补 1 个测试模拟 Gemini 返回脏数据 → 走 fallback。

**验收**：`backend/api/security.py` + `backend/tests/test_security.py`（≥3 用例）+ `slowapi` 在 requirements + 各路由实际接入 + pytest 全绿。

### 2.3 LICENSE 文件（Gate 8 法律一致性）— 硬

**现状**：`README.md` 写「MIT License」并链接 `[LICENSE](LICENSE)`，根目录 `ls` 确认**无 LICENSE 文件**——README 链接是死链，法律一致性硬伤。

**产物**：根目录新建 `LICENSE`，标准 MIT 文本，版权行 `Copyright (c) 2026 tangtongqing`。

**验收**：`LICENSE` 存在 + 内容为有效 MIT 文本 + README 链接不再死链。

### 2.4 AI 生成内容免责声明（Gate 8 AI 合规）— 硬

**现状**：`/assistant`（QA）和 `/interview`（STAR 评估）直接展示大模型输出，全项目无「AI 生成，仅供参考」类提示（已 grep 确认）。用户可能把 AI 评分当真实 HR 评价、把 RAG 回答当绝对正确。

**产物**：
- `frontend/src/app/assistant/page.tsx` 与 `interview/page.tsx`：在 AI 输出卡片底部或页脚加固定免责声明组件，文案：「⚠️ 以上内容由 AI 基于本地知识库生成，仅供参考，请结合实际判断。」（中英可只取中文）。
- 复用既有 Design Tokens，不引入新色系；免责文案用 `var(--text-3)` 次要色 + 小字号。
- 在 `acceptance_test.md` 的 Phase 3 追加一条 Test Case 3.3（AI 免责声明校验）并跑通。

**验收**：两个页面 DOM 中可抓到免责文案 + 截图归档到 `docs/screenshots/`。

### 2.5 隐私与数据流向说明（Gate 8 隐私）— 硬

**现状**：系统读取私人 Obsidian 笔记并把检索内容发到 Google Gemini API（第三方），全项目无任何地方说明数据流向，用户不知道笔记会上传 Google。

**产物**：
- `README.md` 新增「🔒 数据流向与隐私」小节，明确：
  - 本地存储：笔记原文、向量切片、ChromaDB 全在本地 `backend/data/`，不外传。
  - 外发数据：**仅当启用 RAG 问答 / 模拟面试时**，检索到的笔记**片段**（非全文）+ 用户问题会发送到 Google Gemini API 生成回答。
  - 关闭外发：不设置 `GEMINI_API_KEY` 即走本地 mock 降级，零外传。
- `backend/.env.example`（新建，作为模板；真实 `.env` 已在 gitignore）注释强化 GEMINI_API_KEY 的外发含义。
- `.env` 本身不改（含真实 key，不提交），只产出 `.env.example` 模板。

**验收**：README 含数据流向小节 + `.env.example` 存在且含 5 个 key 的注释说明 + `git check-ignore .env` 仍确认 `.env` 被忽略。

### 2.6 impeccable 设计评审深度（Gate 4 设计执行）— 软但重要

**现状**：`.impeccable/live/` 只有 130 字节 `config.json`（只配了 layout.tsx 注入点）——只跑了 `$impeccable init`，**从未执行 shape/critique/audit/polish**。ROADMAP v1.0.0 验收要求「前端 UI 走完 Impeccable Critique 打磨」，`.impeccable/` 下无任何 critique/audit 报告产物——这个验收点实际未做。

**产物**：对 5 个核心页面（`/`、`/knowledge`、`/assistant`、`/interview`、`/map`）各执行一次 `$impeccable critique` + `$impeccable audit`，报告归档到 `docs/design/`（新建）：
- `docs/design/critique-<page>.md`（5 份）：AI slop 检测、认知负荷、Nielsen 启发式、persona 红旗。
- `docs/design/audit-<page>.md`（5 份）：无障碍、性能、响应式、技术质量。
- 若 critique 发现 P0/P1 问题，**修复**（不只是在报告里记录）；P2/P3 可记录到 backlog。
- 更新 `.impeccable/live/` 产物，使引掄件状态可追溯。

**验收**：`docs/design/` 含 10 份报告 + P0/P1 问题已修或已显式声明延后 + PRODUCT.md/DESIGN.md 据评审结论补充深化（当前 31/53 行偏薄）。

### 2.7 指标采集落地（Gate 7 数据迭代）— 软

**现状**：`docs/pm/METRICS.md` 定义了北极星 + L1 + L2 指标，但前端 0 analytics 埋点、后端 0 metrics endpoint——指标体系是纸上谈兵。

**产物**（最小可用，不引入第三方 analytics 服务）：
- 后端 `GET /api/v1/metrics`（新建 `backend/api/routes/metrics.py`）：暴露当前可统计的运行时指标——`collection_count`、`total_queries`（在 app.state 累加）、`mock_vs_live_llm` 计数（`is_mock` true/false 各计一次）。无 PII，无外部依赖。
- 前端在首页工作台「检索质量趋势图」区域接入真实 `/metrics` 数据（替换当前静态演示数据）；至少 1 个 L1 指标（如「今日问答次数」）真实展示。
- `docs/pm/METRICS.md` 追加「采集实现」小节，说明哪些指标已落地、哪些仍为 v1.2 backlog。

**验收**：`/api/v1/metrics` 返回真实计数 + 首页至少 1 个真实指标 + METRICS.md 更新 + `test_api_metrics_endpoint` 加入 `test_api.py`。

---

## 3. 工作空间与提交规范

- **分支**：从 `main`（v1.0.0 已合并）切出 **`feature/phase-d-gap-closure`**。
- **提交信息**（按 `docs/AGENT_WORKFLOW.md`，每项缺口一个 commit）：
  - `test(backend): add coverage config and report actual coverage rate`
  - `feat(backend): add AI input sanitization, rate limit, and output validation`
  - `docs(legal): add MIT LICENSE file`
  - `feat(frontend): add AI-generated content disclaimers to QA and interview pages`
  - `docs(privacy): add data-flow and privacy section, create .env.example`
  - `docs(design): run impeccable critique and audit on 5 core pages`
  - `feat(metrics): implement /api/v1/metrics endpoint and wire to workspace`
- **不要**提交 `backend/htmlcov/`、真实 `.env`、`.impeccable/` 临时缓存（确认 `.gitignore` 覆盖）。

---

## 4. 风险与回退

| 风险 | 回退方案 |
|------|---------|
| `slowapi` 与 FastAPI lifespan 冲突 | limiter 用 `Limiter(key_func=get_remote_address)` 在 main.py 顶层初始化，异常 handler 标准注册；若仍冲突，回退为手写中间件计数 |
| 覆盖率实测 < 70% | 优先补 `agents/` 与 `api/routes/` 的分支测试；若核心逻辑确实难覆盖（如 Gemini 网络层），显式声明 omit 并在 phase-b-criteria 记录实际值与理由 |
| impeccable critique 报告与现有 UI 大量冲突 | 按严重度分级，P0/P1 必修，P2/P3 记录到 `docs/design/backlog.md` 延后，不阻塞本任务 |
| metrics 真实数据在工作台静态数据替换时破坏布局 | 保留静态数据作为离线 fallback（health offline 时），metrics 调用失败不阻塞渲染 |

---

## 5. 验收对照

本任务无独立 criteria 文档，按以下 7 项 checklist + 工作流 Quality Bar 核对：

- [x] **2.1** `.coveragerc` 存在 + term 报告 TOTAL ≥ 70%（或显式声明实际值）写入 phase-b-criteria。
- [x] **2.2** `security.py` + `test_security.py`（≥3）+ slowapi 接入 + 输入校验/输出 schema 全路由生效 + pytest 全绿。
- [x] **2.3** 根目录 `LICENSE` 存在且为有效 MIT 文本。
- [x] **2.4** `/assistant` 与 `/interview` 页面 DOM 含免责文案 + 截图归档 + acceptance_test.md 加 Test Case 3.3。
- [x] **2.5** README 含「数据流向与隐私」小节 + `.env.example` 存在 + `.env` 仍被忽略。
- [x] **2.6** `docs/design/` 含 10 份 critique/audit 报告 + P0/P1 已修或声明延后 + PRODUCT.md/DESIGN.md 深化。
- [x] **2.7** `/api/v1/metrics` 返回真实计数 + 首页 ≥1 真实指标 + METRICS.md 更新 + metrics 测试通过。
- [x] **回归**：重跑 `acceptance_test.md` 全部 19 项 Test Case 仍通过（含免责声明新增项后变 20 项），`pytest` 全绿，`npm run build` 0 错误。
- [x] **版本**：CHANGELOG 加 `[1.1.0]`（或 `[1.0.1]`）条目；打 tag 并推送。

**完成判定**：上述全部勾选 + 工作流 Quality Bar（product/user context、register、visual direction、states、a11y、security evidence、critique loop）逐项可追溯，即视为 Phase D 缺口补齐、项目从产品设计工作流角度完成。

---

## 6. 交付清单（工作智能体完成后回报）

按 `docs/AGENT_WORKFLOW.md` 「工作报告」格式输出，必须包含：
1. 7 项缺口逐项的完成情况（✅/⚠️/❌）+ 产物路径。
2. `pytest --cov` term 报告尾段（含 TOTAL 行）。
3. `slowapi` rate limit 实测证据（curl 触发 429 的日志）。
4. critique 报告发现的 P0/P1 问题清单 + 修复 commit。
5. `npm run build` + `pytest` 尾段。
6. 新 tag（`v1.1.0` 或 `v1.0.1`）与推送结果。
7. 遗留问题（无则写「无」，有则标注延后版本）。
