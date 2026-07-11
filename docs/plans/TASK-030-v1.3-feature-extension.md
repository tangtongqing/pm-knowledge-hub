# TASK-030 — v1.3 功能扩展（对话历史 + 面试 PDF + 关键词高亮）

> **任务类型**：工作智能体实现任务（新功能开发，前端为主 + 后端小幅扩展）
> **前置依赖**：v1.2.0 已发布 ✅；TASK-029 a11y critical 修复已提交（`6c4754d`）✅
> **目标版本**：v1.3.0
> **来源**：MRD Could-Have / PRD P2 / ROADMAP Cut 2 — 产品文档中明确列为"后续迭代"的二期功能
> **创建时间**：2026-07-11
> **派发人**：主导智能体 (ZCode)

---

## 1. 任务背景

v1.2.0 已完成一期核心功能 + 可访问性专项，20 个系统验收 Test Case 全过。但产品文档（MRD/PRD/ROADMAP）中明确列出的 3 个 Could-Have 功能尚未实现，它们是产品从"能用的 MVP"走向"可交付的求职作品"的关键拼图：

1. **对话历史记录** — MRD Could-Have / PRD P2。当前 QA 和面试对话纯内存 `useState`，刷新即丢，无法回看历史会话。这是用户最直观体验缺口。
2. **面试报告 PDF 导出** — ROADMAP Cut 2 明确列为"延期项"。STAR 评分仅网页展示，无法作为求职附件分发。
3. **关键词高亮** — PRD P2。后端 BM25 关键词检索已有，但前端预览正文无高亮，用户无法快速定位命中位置。

本任务一次性补齐这三项，让产品在"完整度"维度达到作品集级水准。

---

## 2. 现状基线（主导智能体已实测确认）

### 2.1 对话状态：纯内存，无持久化

- `assistant/page.tsx:12` — `const [messages, setMessages] = useState<ChatMessage[]>([...])` 仅初始化一条欢迎消息，后续 append 全在内存。
- `interview/page.tsx:14` — `const [messages, setMessages] = useState<ChatMessage[]>([])` 空数组起步；`latestEval`（L20）只保留最近一次评估，前序评估被覆盖。
- 全前端 `localStorage` 仅 `ThemeProvider.tsx` 用了 `pmhub-theme` 一个 key（主题）。无 sessionStorage / IndexedDB。
- **结论**：本任务引入第一个对话持久化层。

### 2.2 面试评估结果结构

`EvaluateResponse`（`lib/api.ts:92-106`，后端 `interview_agent.py:22-34`）：
```ts
interface STARFeedback { situation: string; task: string; action: string; result: string; }
interface EvaluateResponse {
  score: number;            // 0-100 综合分
  evaluation: string;       // Markdown 评语
  star_feedback: STARFeedback;  // 四维定性文字（非数值）
  suggested_answer: string; // Markdown 建议答案
  next_question: string;
  is_mock: boolean;
}
```
- **注意**：`star_feedback` 是定性文字，不是数值分数。雷达图需要后端新增数值字段或前端从文字推断。
- 当前页面只渲染 `score`（CSS progress bar）+ 四段文字。无图表库（package.json 无 recharts/chart.js）。

### 2.3 知识库预览渲染

- `knowledge/page.tsx:189-191` — 用 `react-markdown@10.1.0` + `remark-gfm@4.0.1` 渲染 `activeDoc.text`。
- 搜索词 `query` 在组件作用域内可用（L34 `searchParams.get("q")`），但**未传入 ReactMarkdown**。
- 后端已有 `GET /search/keyword`（BM25，`lib/api.ts:184`）但前端知识库页**未调用**（目前只用 semanticSearch）。
- **结论**：高亮只需在 ReactMarkdown 的 `components.text` 自定义渲染器里匹配关键词即可，无需后端改动。

### 2.4 技术栈约束

- 前端：Next.js 16 (App Router) + React 19 + TypeScript + CSS Modules + CSS 变量主题。**无 Tailwind、无状态库、无 UI 组件库**。
- 5 个生产依赖：next, react, react-dom, react-force-graph-2d, react-markdown, remark-gfm。
- 新增依赖必须保持精简，优先选零依赖或生态主流库。

---

## 3. 目标产物

### Feature A：对话历史记录（前端为主）

#### A.1 持久化层 — `frontend/src/lib/history.ts`（新建）

创建一个轻量的对话历史管理模块，封装 localStorage 读写：

```ts
// 存储结构
interface HistorySession {
  id: string;              // crypto.randomUUID()
  type: "qa" | "interview";
  title: string;           // 首条用户消息前 20 字，或"面试练习 - 2026-07-11 14:30"
  createdAt: number;       // Date.now()
  updatedAt: number;
  messages: ChatMessage[]; // 完整消息序列
  // 仅 interview 类型：
  evaluations?: EvaluateResponse[];  // 累积评估数组（补齐当前只存最新的缺陷）
}
```

API 设计：
- `listSessions(type): HistorySession[]` — 列出某类型全部会话，按 updatedAt 降序
- `getSession(id): HistorySession | null`
- `saveSession(session): void` — 创建或更新（upsert），同时更新 updatedAt
- `deleteSession(id): void`
- `clearSessions(type): void` — 清空某类型全部历史

**存储 key**：`pmhub-history-qa`、`pmhub-history-interview`（与 `pmhub-theme` 同前缀约定）。
**容量保护**：每类型最多保留 50 条会话，超出自动删除最旧的。单条会话超过 localStorage 5MB 上限时 try/catch 降级为不保存（不崩溃）。

#### A.2 QA 页面历史侧栏 — `assistant/page.tsx` 改造

- 页面布局加左侧历史侧栏（可折叠），展示 `listSessions("qa")` 的会话列表（标题 + 时间）。
- 新建对话按钮：清空当前 messages，生成新 session id。
- 点击历史会话：加载 `session.messages` 到当前 messages 状态。
- 每次 messages 变更（用户发送或 AI 回复完成后），debounce 500ms 调 `saveSession`。
- 侧栏每项有删除按钮（hover 显示，aria-label="删除此会话"）。

#### A.3 面试页面历史侧栏 — `interview/page.tsx` 改造

- 同 QA 侧栏模式，类型为 `"interview"`。
- 额外：加载历史会话时恢复 `evaluations` 数组，侧栏展示该会话的最高分（`Math.max(...scores)`）作为标签。
- 当前会话的 `latestEval` 改为从 `evaluations` 数组末尾取（保持渲染逻辑不变，但数据源切换）。

#### A.4 空状态与首次引导

- 无历史记录时，侧栏显示引导文案："暂无历史会话，开始第一次对话吧"。
- 历史侧栏默认折叠（移动端友好），有会话时角标显示数量。

---

### Feature B：面试报告 PDF 导出

#### B.1 依赖选型

新增 1 个依赖：**`jspdf`**（成熟、零 UI 依赖、可直接在浏览器生成 PDF）。不选 `react-to-print`（依赖浏览器打印对话框交互，不够自动化）；不选 `html2canvas`（体积大且对 CSS 变量主题支持差）。

#### B.2 导出模块 — `frontend/src/lib/pdf.ts`（新建）

```ts
export function exportInterviewReport(session: HistorySession): void
```

PDF 内容布局（单页或多页，用 jsPDF 原生 API 绘制，不用 HTML→canvas）：
1. **页眉**：PM Knowledge Hub · 模拟面试报告 · 日期时间
2. **综合得分**：大字号显示 `score` + 100 分制标注
3. **STAR 四维评估**：逐行展示 `star_feedback.situation/task/action/result` 文字（自动换行）
4. **评语**：`evaluation` 纯文本（剥离 Markdown 标记）
5. **建议答案**：`suggested_answer` 纯文本
6. **页脚**：AI 生成内容免责声明 + "由 PM Knowledge Hub 生成"

如果 `session.evaluations` 有多轮，每轮评估分页展示。

#### B.3 触发入口 — `interview/page.tsx` 改造

- 在面试评估结果展示区（score 区域旁）加「导出 PDF」按钮，aria-label="导出面试报告 PDF"。
- 点击调 `exportInterviewReport(currentSession)`。
- 导出成功后 toast 提示"已导出"（复用现有的临时提示模式，如复制按钮的 1.5s 反馈）。
- 仅在有至少一次评估结果时启用，否则 disabled。

#### B.4 STAR 雷达图（可选增强）

> ⚠️ 当前 `star_feedback` 是定性文字而非数值，雷达图需后端配合。**此项为 stretch goal**，若后端改动复杂则降级为四维文字卡片。

- **方案 1（推荐，轻量）**：前端不画雷达图，PDF 中用四维文字卡片 + 综合分即可。保持 zero new chart dep。
- **方案 2（需后端改动）**：`interview_agent.py` 的 STAR 评估 prompt 新增要求返回 0-100 数值，`EvaluateResponse` 加 `star_scores: {situation, task, action, result}` 字段。前端加 `recharts` 画雷达图。**若选此方案，需单独评估 prompt 改动对评估质量的影响**。

**本任务书默认采用方案 1**。若工作智能体有充分理由选方案 2，需在报告中说明。

---

### Feature C：关键词高亮

#### C.1 ReactMarkdown 自定义 text 渲染器 — `knowledge/page.tsx` 改造

在 `<ReactMarkdown>` 的 `components` prop 中注入自定义 `text` 渲染器：

```tsx
const highlightText = (text: string, keyword: string) => {
  if (!keyword.trim()) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(keyword)})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase()
      ? <mark key={i} className={styles.highlight}>{part}</mark>
      : part
  );
};

<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    // react-markdown v10: text 节点通过 p/li/td 等的 children 传入
    p: ({ children }) => <p>{renderWithHighlight(children, query)}</p>,
    li: ({ children }) => <li>{renderWithHighlight(children, query)}</li>,
    // ... 对 td/th/code 等同样处理
  }}
>
  {activeDoc.text}
</ReactMarkdown>
```

- `escapeRegExp` 工具函数（转义正则特殊字符），放入 `lib/utils.ts`（新建或复用）。
- 高亮 `<mark>` 用 CSS Module `.highlight` 类，颜色用 CSS 变量适配明暗主题：
  ```css
  .highlight { background: var(--highlight-bg, #fef08a); color: var(--highlight-text, inherit); border-radius: 2px; padding: 0 2px; }
  ```

#### C.2 高亮关键词来源

- 语义搜索模式下，用用户输入的 `query` 原文做高亮（不做分词，整词匹配，大小写不敏感）。
- 关键词搜索模式下（若启用），用 query 的各分词分别高亮。
- 空 query（浏览模式）不高亮，正常渲染。

#### C.3 搜索结果列表联动（可选增强）

- 搜索结果卡片中的摘要文本也做高亮（当前 `SearchHit.text` 片段直接显示，可同样套用 `highlightText`）。
- **此项为 stretch goal**，若主流程已完成则顺手做。

---

## 4. 验收标准（实测，非自评）

### 4.1 功能验收（Playwright 逐项）

| Feature | 验收项 | 验收方式 |
|---------|--------|---------|
| A 对话历史 | QA 会话持久化 | 在 /assistant 发一条消息 → 刷新页面 → 历史侧栏出现该会话 → 点击加载 → messages 恢复 |
| A 对话历史 | 面试会话持久化 | /interview 开始面试 + 提交作答 → 刷新 → 历史侧栏出现该会话 + 最高分标签 |
| A 对话历史 | 删除会话 | 历史侧栏点删除 → 该会话从列表消失且 localStorage 中清除 |
| A 对话历史 | 容量保护 | 注入 51 条会话 → 仅保留 50 条，最旧被删 |
| A 对话历史 | 空状态 | 清空 localStorage 后进入页面 → 侧栏显示引导文案 |
| B PDF 导出 | 导出按钮可用 | /interview 完成一次评估 → 「导出 PDF」按钮 enabled |
| B PDF 导出 | PDF 生成 | 点击导出 → 浏览器触发下载 → 下载文件名含日期 → 文件可打开且包含 score + STAR 文字 |
| B PDF 导出 | 多轮分页 | 完成两次评估 → 导出 PDF → 两轮内容分页展示 |
| C 关键词高亮 | 高亮渲染 | /knowledge 搜索 "AARRR" → 预览正文中 "AARRR" 被 `<mark>` 包裹 |
| C 关键词高亮 | 大小写不敏感 | 搜索 "aarr" → "AARRR" 同样高亮 |
| C 关键词高亮 | 空查询不高亮 | /knowledge 无搜索词浏览模式 → 正文无 `<mark>` |

### 4.2 回归

- `npm run lint`（0 error）+ `npm run build`（7 路由静态生成 0 错误）。
- `acceptance_test.md` 现有 20+ Test Case 仍全过（新功能不得破坏既有功能）。
- axe-core 扫描 5 页面 **critical 维持 0**（新组件不得引入新的 critical a11y 违规）。

### 4.3 文档与发版

- `acceptance_test.md` 新增 Phase 8 章节（功能扩展），至少 3 个 Test Case（A/B/C 各一）。
- `docs/design/BACKLOG.md` 更新：P3 中与三项功能相关的项标注状态。
- `docs/versions/CHANGELOG.md` 加 `[1.3.0]` 条目。
- `docs/TASKS.md` 标记 TASK-030 完成。
- 打 tag `v1.3.0` 并推远程。

---

## 5. 工作空间与提交规范

- **分支**：从 `main` 切出 **`feature/v1.3-features`**。
- **提交信息**（每个 Feature 独立 commit）：
  - `feat(history): add localStorage-backed conversation history for QA and interview`
  - `feat(history): add collapsible history sidebar to assistant page`
  - `feat(history): add interview session history with score badge`
  - `feat(pdf): add interview report PDF export with jsPDF`
  - `feat(knowledge): add keyword highlighting in document preview`
  - `docs: add Phase 8 acceptance test cases for v1.3 features`
  - `chore: release v1.3.0`
- **后端改动限制**：Feature A（纯前端 localStorage）和 Feature C（纯前端渲染）不改后端。Feature B 方案 1 不改后端；若工作智能体决定走方案 2（雷达图需数值分数），后端改动限定在 `interview_agent.py` 的 prompt + `EvaluateResponse` 模型，且需在报告中说明理由和测试影响。
- **新依赖**：`jspdf`（Feature B）。若不引入雷达图方案则不加 recharts。在 `frontend/package.json` 中添加，`npm install` 后确认 `npm run build` 无类型错误。

---

## 6. 风险与回退

| 风险 | 回退方案 |
|------|---------|
| localStorage 5MB 上限被长对话打满 | `saveSession` 包 try/catch，失败时 console.warn 且不崩溃；历史侧栏提示"部分会话因容量限制未保存" |
| react-markdown v10 的 `components` API 与 v9 差异导致 text 渲染器不生效 | 先用 `p`/`li` 等块级元素的 children 拦截渲染；若仍不生效，降级为在 `activeDoc.text` 传入 ReactMarkdown 前做字符串替换（插入 `<mark>` HTML 标签，配合 `rehype-raw`）——但这需新增 `rehype-raw` 依赖，仅作 fallback |
| jsPDF 中文乱码 | jsPDF 默认字体不含中文。方案：用 `jsPDF.html()` + 临时隐藏 DOM 节点渲染（依赖 html2canvas），或在 `evaluation`/`suggested_answer` 中做中文→拼音降级（不推荐）。**推荐**：用 jsPDF 的 `.text()` + `splitTextToSize`，字体回退到 Helvetica，中文内容若乱码则改为导出纯英文摘要 + 综合分数，并在报告中记录此限制。**或**：引入 `jspdf-autotable` 配合自定义字体文件（需验证 license）。工作智能体需实测中文输出效果并选择可行方案 |
| 面试历史加载后 `latestEval` 取值逻辑改变导致渲染异常 | 保持 `latestEval = evaluations[evaluations.length - 1]` 的赋值在加载时完成，渲染层零改动 |
| 关键词含正则特殊字符（如 `C++`、`A/B`）导致 split 报错 | `escapeRegExp` 函数转义 `.*+?^${}()|[]\` 等字符 |
| Feature 间耦合（历史侧栏改动影响 PDF 导出的 session 数据结构） | `HistorySession` 接口在 `lib/history.ts` 中定义一次，PDF 模块只依赖接口不依赖实现 |

---

## 7. 交付清单（工作智能体完成后回报）

按 `docs/AGENT_WORKFLOW.md` 「工作报告」格式，必须包含：

1. **Feature A 状态**：持久化层 API + 两个页面侧栏 + 空状态，逐项 ✅/⚠️ + 改动文件。
2. **Feature B 状态**：PDF 导出按钮 + jsPDF 模块 + 中文渲染效果说明（是否乱码、采用哪种方案）。
3. **Feature C 状态**：高亮渲染器 + CSS + 大小写/特殊字符处理。
4. **Playwright 验收**：§4.1 表格 11 项逐项结果。
5. **回归结果**：`npm run lint` + `npm run build` 尾段 + axe-core critical 数。
6. **新依赖**：package.json 变更（仅 jspdf，或附加说明）。
7. **文档更新**：acceptance_test.md Phase 8 + CHANGELOG [1.3.0] + TASKS.md + BACKLOG.md。
8. **`v1.3.0` tag** 推送结果。
9. **遗留问题**（无则写「无」）。
10. **方案选择说明**：Feature B 是否采用了方案 2（雷达图），若采用了说明后端改动和测试影响。
