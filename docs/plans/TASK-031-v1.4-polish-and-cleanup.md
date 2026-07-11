# TASK-031 — v1.4 收尾补漏 + P3 体验打磨

> **任务类型**：工作智能体实现任务（文档补全 + 功能瑕疵修复 + P3 体验优化）
> **前置依赖**：v1.3.0 已发布 ✅；TASK-030 验收通过（lint 修复已提交 `1f9a516`）✅
> **目标版本**：v1.4.0
> **来源**：TASK-030 验收遗留 + `docs/design/BACKLOG.md` P3 高价值项
> **创建时间**：2026-07-11
> **派发人**：主导智能体 (ZCode)

---

## 1. 任务背景

v1.3.0 三项新功能（对话历史 + PDF 导出 + 关键词高亮）已全部实测通过并发布。验收过程中发现两类遗留：

1. **文档/瑕疵收尾**（3 项）— acceptance_test.md 缺 Phase 8、PDF 面试官提问取值瑕疵、v1.2.1 补丁未归档。
2. **P3 体验打磨**（6 项高价值）— BACKLOG.md 的 10 项 P3 中，选 ROI 最高的 6 项一次性清完。

本任务是项目最终打磨，完成后 P3 backlog 基本清空，产品达到"可投递"终态。

---

## 2. 目标产物

### Part A：收尾补漏（3 项，必做）

#### A.1 acceptance_test.md 补 Phase 8 章节

**涉及文件**：`acceptance_test.md`

在现有 Phase 7 之后新增 **Phase 8: Feature Extension (v1.3 功能扩展验证)**，包含至少 3 个 Test Case：

- **Test Case 8.1: 对话历史持久化** — 在 /assistant 发消息 → 刷新 → 历史侧栏恢复会话 → localStorage `pmhub-history-qa` 含完整 messages
- **Test Case 8.2: 面试 PDF 导出** — /interview 完成评估 → 点击"导出 PDF" → 文件下载（`PM_Interview_Report_*.pdf`）→ PDF 可打开且中文无乱码
- **Test Case 8.3: 关键词高亮** — /knowledge 搜索"产品" → 预览正文出现 `<mark>` 高亮元素 → 空查询时无高亮

每个 Test Case 需写明 Action + 预期结果 + 实测结果（留占位符 `* **✅ 实测结果 (2026-07-xx)**：` 待验收时填）。

同时更新底部汇总表：新增 Phase 8 行，整体结论更新为 23/23 Test Case（20 + 3），版本号更新为 v1.4.0。

#### A.2 PDF 面试官提问取值修复

**涉及文件**：`frontend/src/lib/pdf.ts`

**问题**：`exportInterviewReport` 中 `evalItem.question` 取自 `EvaluateResponse`，但该接口无 `question` 字段（面试官问题存在 `session.messages` 中 role="interviewer" 的消息里）。当前显示"(无提问记录)"。

**修复方案**：从 session.messages 中按轮次提取面试官问题。每轮评估对应一条 interviewer 消息（在 candidate 回答之前）。修改 PDF 生成逻辑：

```ts
// 在 session.evaluations.forEach 循环中
// 取出对应轮次的面试官问题
const interviewerMsgs = session.messages.filter(m => m.role === "interviewer");
const questionText = interviewerMsgs[idx]?.content || evalItem.question || "(无提问记录)";
// 用 questionText 替代 evalItem.question
```

注意：interviewer 消息可能包含评估结果拼接的长文本（`evaluation + suggested_answer + next_question`），需要取原始提问。更精确的方案是：在 `handleSubmit` 时将 `currentQuestion` 存入 evaluation 对象的 `question` 字段（interview/page.tsx L197-201 区域），这样 pdf.ts 直接读 `evalItem.question` 即可。

**推荐方案**：在 `interview/page.tsx` 的 `handleSubmit` 中，保存 evaluation 前注入 question：
```ts
const response = await api.evaluateAnswer(currentQuestion, userAnswer);
// 注入当前问题到 evaluation 对象，供 PDF 导出使用
(response as any).question = currentQuestion;
const currentEvals = activeSession.evaluations || [];
activeSession.evaluations = [...currentEvals, response];
```
这样 pdf.ts 无需改动，`evalItem.question` 自然有值。

#### A.3 v1.2.1 补丁归档

**涉及文件**：`docs/versions/CHANGELOG.md`

在 `[1.3.0]` 之前、`[1.2.0]` 之后插入 `[1.2.1]` 条目：

```markdown
## [1.2.1] — 2026-07-11 — a11y 热修补丁

### Fixed
- `/assistant` 和 `/interview` 的发送按钮缺少 `aria-label`，axe-core 报 critical `button-name` 违规。两个按钮各加 `aria-label="发送"`，critical 归零。

### Verification
- axe-core 4.10.0 复扫：/assistant critical 1→0，/interview critical 1→0。
```

### Part B：P3 体验打磨（6 项高价值）

从 BACKLOG.md 10 项 P3 中选取 ROI 最高的 6 项。剩余 4 项（#2 虚拟化、#6 打字动画性能、#9 拖拽防抖、#10 手势引导浮层）涉及较大重构或性能调优，留待 v1.5+。

#### B.1 P3-1：首页指标卡文字溢出（audit-home）

**涉及文件**：`frontend/src/app/page.module.css`

指标卡（`.metricCard` 或类似类名）内文字溢出不换行。加 `word-break: break-word; overflow-wrap: break-word;`。

#### B.2 P3-3：知识库预览字号偏小（critique-knowledge）

**涉及文件**：`frontend/src/app/knowledge/page.module.css`

预览栏正文 `.markdownContent` 字号从 13px 提升至 15px。检查 `font-size` 属性并更新。同时确认 `line-height` 配合调整（建议 1.7）。

#### B.3 P3-4：目录树折叠过渡动画（critique-knowledge）

**涉及文件**：`frontend/src/app/knowledge/page.module.css` + 可能涉及 `page.tsx`

目录树（左侧章节列表）展开/折叠无过渡。给 `.treeList` 或折叠容器加 `transition: height 0.2s ease, opacity 0.2s ease;`。

注意：当前目录树可能是全量渲染（非折叠式），如果实际没有折叠逻辑则改为给 `activeTreeItem` 切换加 `transition: background-color 0.15s ease, color 0.15s ease;`。

#### B.4 P3-5：AI 回答滚动锁定底部（critique-assistant）

**涉及文件**：`frontend/src/app/assistant/page.tsx`

当前 `scrollToBottom` 在 `useEffect([messages])` 中调用，但多段输出时可能不锁定。改为在 `scrollToBottom` 中用 `behavior: "smooth"` 后再追加一个 `behavior: "auto"` 的即时滚底，确保长消息也能跟到底部。

验证：连续发两条长问题，第二条 AI 回复时视口应自动跟随到底部。

#### B.5 P3-7：面试分数计数器动画（critique-interview）

**涉及文件**：`frontend/src/app/interview/page.tsx` + `page.module.css`

STAR 综合得分（`.scoreNum`）变化时无过渡动画。加一个简单的 count-up 效果：用 `useEffect` + `requestAnimationFrame` 在 `latestEval.score` 变化时从旧值递增到新值（300ms 内完成）。

或者用 CSS 方案：给 `.scoreNum` 加 `transition` + `transform: scale()` 弹跳效果（更轻量）。推荐 CSS 方案，避免引入动画逻辑复杂度。

#### B.6 P3-8：面试 textarea resize 控制（audit-interview）

**涉及文件**：`frontend/src/app/interview/page.module.css`

作答 textarea 缺 resize 控制，用户可能拖拽变形破坏布局。加 `resize: vertical;`（允许垂直拉伸但不影响宽度），或 `resize: none;`（完全禁用，保持固定高度）。推荐 `resize: vertical` + `max-height: 200px;` 限制最大高度。

### Part C：color-contrast 对比度提升（axe serious）

**涉及文件**：涉及多个 `page.module.css`

axe-core 在多个页面报 `color-contrast` serious 违规（如 `.subtitle`、`.sessionTime`、`.disclaimer` 等低对比度文字）。逐个检查这些元素的 `color` 与背景色的对比度，确保达到 WCAG AA 标准（正常文字 ≥ 4.5:1，大文字 ≥ 3:1）。

具体方法：
1. 用 axe 扫描定位所有 color-contrast 违规元素及其 CSS 变量
2. 将过浅的 `var(--text-2)` / `var(--text-3)` 在 light 主题下调深（如 `#64748b` → `#475569`）
3. dark 主题下同理调亮
4. 改完后复扫确认 serious 归零或显著减少

**注意**：这属于跨页面的全局变量调整，改动 `globals.css` 的 CSS 变量定义即可批量生效，不要逐页改。

---

## 3. 验收标准

### 3.1 功能验收

| 项 | 验收方式 |
|----|---------|
| A.1 Phase 8 | acceptance_test.md 有 Phase 8 章节 + 3 个 Test Case + 汇总表更新 |
| A.2 PDF 提问 | /interview 评估后导出 PDF → 面试官提问字段显示实际题目而非"(无提问记录)" |
| A.3 v1.2.1 | CHANGELOG 有 [1.2.1] 条目，位于 [1.2.0] 和 [1.3.0] 之间 |
| B.1 指标卡溢出 | 首页指标卡长文字自动换行不溢出 |
| B.2 预览字号 | /knowledge 预览正文 computed style `font-size` ≥ 15px |
| B.3 过渡动画 | 目录树或激活项切换有 CSS transition |
| B.4 滚动锁定 | /assistant 连续长消息时视口跟随到底部 |
| B.5 分数动画 | /interview 评估后分数有过渡效果（CSS 或 count-up） |
| B.6 textarea resize | /interview 作答框 `resize: vertical` 或 `none` |
| C contrast | axe 扫描 color-contrast serious 违规数减少（修复前后对比） |

### 3.2 回归

- `npm run lint`（0 error 0 warning）+ `npm run build`（7 路由 0 错误）
- axe-core 扫描 5 页面 **critical 维持 0**，**serious 显著减少**（color-contrast 修复后）
- acceptance_test.md 现有 20+ Test Case 仍全过

### 3.3 文档与发版

- `docs/design/BACKLOG.md` 更新：完成的 6 项 P3 标记 ✅，剩余 4 项保留
- `docs/versions/CHANGELOG.md` 加 `[1.4.0]` 条目
- `docs/TASKS.md` 标记 TASK-031 完成
- 打 tag `v1.4.0`

---

## 4. 工作空间与提交规范

- **分支**：从 `main` 切出 **`feature/v1.4-polish`**。
- **提交信息**：
  - `docs(acceptance): add Phase 8 test cases for v1.3 feature extension`
  - `fix(pdf): inject currentQuestion into evaluation for PDF report`
  - `docs(changelog): add v1.2.1 hotfix entry for button-name a11y fix`
  - `fix(css): prevent metric card text overflow on homepage`
  - `fix(knowledge): increase preview font size to 15px for readability`
  - `feat(knowledge): add CSS transition to directory tree interactions`
  - `fix(assistant): improve scroll-to-bottom for multi-paragraph output`
  - `feat(interview): add score transition animation`
  - `fix(interview): constrain textarea resize to vertical`
  - `fix(a11y): improve color-contrast ratio to meet WCAG AA standard`
  - `chore: release v1.4.0`
- **不改后端**（纯前端 + 文档任务）。

---

## 5. 风险与回退

| 风险 | 回退方案 |
|------|---------|
| 调深 CSS 变量 `--text-2` 影响全局视觉 | 先在浏览器 DevTools 实测对比度，确认达标后再改 globals.css；若多处页面视觉异常则只改违规元素的局部 color 而非全局变量 |
| count-up 动画在快速连续评估时卡顿 | 用 CSS transition 方案替代 JS requestAnimationFrame |
| 目录树实际无折叠逻辑导致 B.3 无从下手 | 降级为给 `.treeItem` hover/active 加 `transition: background-color 0.15s` |
| PDF question 注入方案改动 interview/page.tsx 的 handleSubmit 逻辑 | 只加一行 `(response as any).question = currentQuestion`，不改其他逻辑；若 TypeScript 报错则给 EvaluateResponse 接口加可选 `question?: string` 字段 |

---

## 6. 交付清单

1. Part A 三项逐项状态 + 改动文件
2. Part B 六项逐项状态 + 改动文件 + 修复前后截图或 computed style 值
3. Part C color-contrast 修复前后 axe 扫描对比数值
4. `npm run lint` + `npm run build` 尾段
5. axe-core 5 页面扫描结果（critical + serious 数值）
6. BACKLOG.md 更新后的 P3 勾选状态
7. CHANGELOG [1.4.0] + [1.2.1] 内容
8. `v1.4.0` tag 推送结果
9. 遗留问题（无则写「无」；剩余 4 项 P3 记入 BACKLOG v1.5+）
