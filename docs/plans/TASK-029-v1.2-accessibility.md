# TASK-029 — v1.2 可访问性专项（a11y P2 修复）

> **任务类型**：工作智能体实现任务（前端可访问性 + 体验改进）
> **前置依赖**：v1.1.0 已发布 ✅；TASK-028 收尾补漏已完成 ✅
> **目标版本**：v1.2.0
> **来源**：`docs/design/BACKLOG.md` 的 P2 可访问性专项 + 体验效率专项（audit 评分拉低主因）
> **创建时间**：2026-07-09
> **派发人**：主导智能体 (ZCode)

---

## 1. 任务背景

v1.1.0 已闭环产品设计工作流 8 大门控，但 `docs/design/` 的 5 份 audit 报告普遍给「Accessibility」打了 **3 分（满分 5）**，这是整体质量评分被拉低的主因。BACKLOG.md 归档了 10 个 P2 + 10 个 P3 改进项，其中**可访问性专项**（P2 #1-5）ROI 最高——修复后 audit a11y 评级可从 3 升到 4-5。

本任务聚焦**全量修复 P2 可访问性问题（#1-5）+ 高价值 P2 体验项（#6-10）**，让产品在可访问性维度达到生产级水准。这是对真实用户（含视障/键盘用户）的实质性改善，也是求职作品集里"我懂 a11y"的有力证明。

**当前实测基线**（主导智能体已确认）：
- 3 个核心页面共 **11 个 `<svg>`，0 个带 aria 属性**。
- `home/page.tsx` 无 `useRef`（`/` 快捷键需新增）。
- `knowledge/page.tsx` 无 inputRef（焦点管理需补）。
- `map/page.tsx` 已有 `fgRef`（`centerAt`/`zoom` 在用），reset-zoom 可直接加 `zoomToFit()`。
- `.playwright-mcp/` 残留目录未在 `.gitignore`（本任务顺带清理）。

---

## 2. 目标产物

### 2.1 P2 可访问性专项（#1-5，必做）

#### P2-1 / P2-2 / P2-3：SVG 图标 + 动态区域 + 进度条语义化

**涉及文件**：`frontend/src/app/page.tsx`、`knowledge/page.tsx`、`interview/page.tsx`、`assistant/page.tsx`、`map/page.tsx` 及对应 `page.module.css`。

- **SVG aria 属性（P2-1，audit-home）**：给所有装饰性 `<svg>` 加 `aria-hidden="true"`（读屏器跳过纯视觉图标）；功能性图标（如「在 Obsidian 打开」按钮内的 svg）保留可见，确保其外层 `<button>`/`<a>` 有可读的 `aria-label` 或文本。逐个 `<svg>` 核对：装饰→`aria-hidden`，功能→配文字标签。
- **搜索结果 aria-live（P2-2，audit-knowledge）**：`knowledge/page.tsx` 的结果列表容器加 `aria-live="polite"`，结果更新时读屏器自动播报「找到 N 篇笔记」。
- **评分进度条 role（P2-3，audit-interview）**：`interview/page.tsx` 的 STAR 评分进度条加 `role="progressbar"` + `aria-valuenow={score}` + `aria-valuemin={0}` + `aria-valuemax={100}`。

#### P2-4：地图 canvas 读屏器 fallback（audit-map）

**涉及文件**：`frontend/src/app/map/page.tsx`。

- 纯 canvas 对读屏器完全不可访问。在 `<canvas>`（ForceGraph2D 渲染容器）下方插入一个 `sr-only`（visually hidden）的摘要列表，结构为：
  ```html
  <div className={styles.srOnly} aria-label="知识图谱节点摘要">
    共 {nodes} 个节点，{links} 条连接。节点列表：{nodeLabels.join('、')}
  </div>
  ```
- 在 `page.module.css` 加 `.srOnly` 工具类（标准 visually-hidden 实现：`position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap`）。

#### P2-5：建议词焦点回弹（audit-assistant）

**涉及文件**：`frontend/src/app/assistant/page.tsx`。

- 点击建议词（suggestion chips）后焦点留在按钮上，未回输入框。给输入框加 `useRef<HTMLTextAreaElement>`，点击建议词的 handler 里 `query → setInput(建议词)` 后调 `inputRef.current?.focus()`。

### 2.2 P2 体验效率专项（#6-10，必做）

#### P2-6：首页 `/` 快捷键聚焦搜索（critique-home）

**涉及文件**：`frontend/src/app/page.tsx`。

- 新增 `searchRef = useRef<HTMLInputElement>`，绑定到顶部搜索 input。
- `useEffect` 加全局 `keydown` 监听：当 `e.key === '/'` 且焦点不在 input/textarea 内时，`e.preventDefault()` + `searchRef.current?.focus()`。
- 注意排除用户正在输入的场景（`document.activeElement.tagName` 不是 INPUT/TEXTAREA）。

#### P2-7：首页网格高度对齐（critique-home）

**涉及文件**：`frontend/src/app/page.module.css`。

- 指标卡 grid 与功能卡 grid 高度冲突。统一 `align-items: stretch` 或给卡片容器设 `grid-auto-rows: 1fr`，使同行卡片等高。

#### P2-8：QA 回答一键复制（critique-assistant）

**涉及文件**：`frontend/src/app/assistant/page.tsx` + `page.module.css`。

- 在 AI 回答卡片右上角加复制按钮（clipboard 图标）。点击调 `navigator.clipboard.writeText(answer)`，成功后按钮临时变为「已复制 ✓」1.5 秒再还原。带 `aria-label="复制回答"`。

#### P2-9：面试作答 STAR 模板提示（critique-interview）

**涉及文件**：`frontend/src/app/interview/page.tsx`。

- 作答 textarea 的 placeholder 改为 STAR 引导式：「用 STAR 法则作答：Situation（情境）→ Task（任务）→ Action（行动）→ Result（结果）」。不改功能，只优化引导。

#### P2-10：地图重置缩放按钮（critique-map）

**涉及文件**：`frontend/src/app/map/page.tsx`。

- 已有 `fgRef`，在图谱控制区（与「按目录聚合/按笔记展开」同级）加「重置视图」按钮，点击调 `fgRef.current?.zoomToFit(400)`（react-force-graph-2d 内置 API）。带 `aria-label="重置缩放"`。

### 2.3 工程清理（顺带）

- **`.gitignore`** 追加 `.playwright-mcp/`（Playwright MCP 残留快照目录，当前未被忽略）。
- 删除已跟踪的 `.playwright-mcp/` 残留文件（若已被 git 跟踪，用 `git rm -r --cached`）。

---

## 3. 验收标准（a11y 实测，非自评）

### 3.1 自动化扫描

- 安装并运行 `axe-core`（通过 `@axe-core/playwright` 或浏览器 axe DevTools）扫描 5 个核心页面，**严重（critical）+ 重要（serious）a11y 违规归零**。
- 命令建议：在前端加一个临时测试脚本，或在验收时用浏览器 axe 插件截图。

### 3.2 手动 Playwright 校验（必须实测，对照 BACKLOG.md 逐项）

| BACKLOG 项 | 验收方式 |
|-----------|---------|
| P2-1 SVG aria | Playwright `page.locator('svg[aria-hidden="true"]')` 计数 > 0；功能性 svg 外层按钮有 aria-label |
| P2-2 aria-live | knowledge 页 `page.locator('[aria-live="polite"]')` 存在 |
| P2-3 progressbar | interview 评分后 `role="progressbar"` 元素存在且 `aria-valuenow` 为数字 |
| P2-4 sr-only 摘要 | map 页 `page.locator('.srOnly, [aria-label*="摘要"]')` 存在且含节点数 |
| P2-5 焦点回弹 | assistant 点建议词后 `document.activeElement` 是 textarea |
| P2-6 `/` 快捷键 | home 页按 `/` 后 `document.activeElement` 是搜索 input |
| P2-8 复制按钮 | assistant 回答区有复制按钮，点击后剪贴板写入（mock clipboard）|
| P2-10 reset zoom | map 页「重置视图」按钮存在且点击不报错 |

### 3.3 回归

- `npm run lint`（0 error）+ `npm run build`（7 路由静态生成）。
- `acceptance_test.md` 现有 20 项 Test Case 仍全过（a11y 改动不得破坏功能）。
- 新增 Test Case 7.1（a11y axe 扫描）写入 `acceptance_test.md` Phase 7 新章节并跑通。

### 3.4 文档与发版

- 更新 `docs/design/BACKLOG.md`：完成的 P2 项标记 ✅，未做的 P3 保留。
- CHANGELOG 加 `[1.2.0] — v1.2 可访问性专项`条目。
- 打 tag `v1.2.0` 并推远程。

---

## 4. 工作空间与提交规范

- **分支**：从 `main` 切出 **`feature/v1.2-accessibility`**。
- **前置**：开始前确认 `main` 已包含 TASK-028 的提交（`acceptance_test.md`/`BACKLOG.md` 等当前可能未提交——若未提交，本任务先不依赖它们，从已提交状态切分支即可）。
- **提交信息**（每个 P2 项一个 commit，便于追溯）：
  - `feat(a11y): add aria-hidden to decorative SVGs and labels to functional icons`
  - `feat(a11y): add aria-live to knowledge search results`
  - `feat(a11y): add progressbar role to interview STAR scores`
  - `feat(a11y): add sr-only node summary fallback for map canvas`
  - `feat(a11y): return focus to input after clicking assistant suggestions`
  - `feat(ux): add / keyboard shortcut to focus homepage search`
  - `fix(css): align homepage metrics and feature card grid heights`
  - `feat(ux): add copy-to-clipboard button to QA answers`
  - `feat(ux): add STAR template hint to interview answer placeholder`
  - `feat(ux): add reset-zoom button to knowledge graph`
  - `chore: gitignore .playwright-mcp snapshots`
- **不要**改动 `backend/` 任何文件（纯前端任务）。

---

## 5. 风险与回退

| 风险 | 回退方案 |
|------|---------|
| `aria-hidden` 加错位置导致功能图标读屏器读不到 | 原则：只对**纯装饰 svg**（无点击、纯视觉）加 aria-hidden；功能性 svg 依赖外层 button/a 的可访问名 |
| `/` 快捷键与浏览器默认行为冲突（如 Firefox 快速搜索）| `preventDefault` 拦截；若某些浏览器仍冲突，改为 `Shift+/`（即 `?`）或仅在 input 未聚焦时触发 |
| axe-core 扫出非 P2 范围的违规 | 只修 BACKLOG 列出的 P2；其余记入 BACKLOG 新行，标注「axe 扫描发现，v1.3 处理」，不扩大本任务范围 |
| react-force-graph `zoomToFit` 在节点未稳定时报错 | 点击前判空 `if (fgRef.current) fgRef.current.zoomToFit(400)`，加 try/catch |

---

## 6. 交付清单（工作智能体完成后回报）

按 `docs/AGENT_WORKFLOW.md` 「工作报告」格式，必须包含：
1. 10 个 P2 项逐项状态（✅/⚠️）+ 改动文件。
2. **axe-core 扫描结果**：5 页面 critical/serious 违规数（修复前后对比截图或数值）。
3. Playwright 逐项校验结果（§3.2 表格 8 项）。
4. `npm run lint` + `npm run build` 尾段。
5. BACKLOG.md 更新后的 P2 勾选状态。
6. `v1.2.0` tag 推送结果。
7. 遗留问题（无则写「无」；axe 扫出的非范围违规记入新 backlog 行）。
