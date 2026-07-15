# TASK-032 — v1.5 性能优化（剩余 4 项 P3）+ 项目正式收尾

> **任务类型**：工作智能体实现任务（前端性能优化 + 项目终期归档）
> **前置依赖**：v1.4.0 已发布 ✅；TASK-031 验收通过 ✅
> **目标版本**：v1.5.0（项目最终版本）
> **来源**：`docs/design/BACKLOG.md` 剩余 4 项 P3 性能优化
> **创建时间**：2026-07-15
> **派发人**：主导智能体 (ZCode)

---

## 1. 任务背景

v1.4.0 后，BACKLOG.md 仅剩 4 项 P3 性能优化（#2 虚拟化、#6 打字性能、#9 拖拽防抖、#10 手势浮层）。本任务是**项目最终迭代**——完成后 BACKLOG 清空，项目正式收尾。

**重要前提**：对于本地单用户的知识库产品（204 篇笔记），这 4 项的性能收益有限。但作为作品集项目，"我懂前端性能优化"是加分项，且能彻底清空技术债，让代码库达到"无可改进"的终态。

### 现状基线（主导智能体已实测确认）

| P3 项 | 真实瓶颈（非文档原描述） |
|--------|------------------------|
| #2 虚拟化 | 搜索 topK=20（可控）；**空查询 `getDocuments` 返回全部 204+ 篇全量 `.map()` 渲染**（page.tsx:178），无分页无虚拟化 |
| #6 打字性能 | CSS 动画已是 GPU 友好的 `transform: scale()`（**不是瓶颈**）；真实成本是 loading 态 append 触发整个 messages 数组重渲染（assistant:153, interview:206） |
| #9 拖拽防抖 | force-graph 全用默认 simulation 参数（无 `cooldownTicks`/`d3AlphaDecay`）；自定义 `nodeCanvasObject` 每帧 canvas 绘制；无 debounce 工具函数 |
| #10 手势浮层 | 完全 greenfield——无 overlay/legend/help UI、无 `showHelp` state、无 localStorage 首次访问检测、仅有 `.toast` CSS 类可参考 |

---

## 2. 目标产物

### P3-2：知识库列表虚拟化

**涉及文件**：`frontend/src/app/knowledge/page.tsx` + `frontend/package.json`

**问题**：空查询浏览模式下 `getDocuments` 返回全部语料，`.map()` 全量渲染 204+ 个 DOM 节点（每个还跑 `highlightText` 递归），首屏渲染卡顿。

**方案**：引入 `@tanstack/react-virtual`（轻量、无 UI 绑定、兼容任意滚动容器，比 react-window 更灵活）。

实现步骤：
1. `npm install @tanstack/react-virtual`
2. 在 knowledge page 的 `.listContent` 容器（当前 `tabIndex={0}` 的滚动区）上用 `useVirtualizer`：
   ```tsx
   const parentRef = useRef<HTMLDivElement>(null);
   const virtualizer = useVirtualizer({
     count: results.length,
     getScrollElement: () => parentRef.current,
     estimateSize: () => 80,  // 每个 listItem 估计高度
     overscan: 5,
   });
   ```
3. 用虚拟izer 的 `getVirtualItems()` 替代 `results.map()`，每个虚拟项用绝对定位 `position: absolute; top: 0; left: 0; transform: translateY(offset)`。
4. 外层容器设 `position: relative; height: virtualizer.getTotalSize()`。
5. 保留现有的 `highlightText`、`activeDoc` 高亮、`onClick` 逻辑不变。

**验收**：空查询浏览模式下 DOM 节点数从 204+ 降至 ~10（overscan 5 × 2）；滚动流畅无卡顿。

### P3-6：消息列表重渲染优化

**涉及文件**：`frontend/src/app/assistant/page.tsx` + `interview/page.tsx`

**问题**：每次 loading 态 append（`setMessages([...updatedMsgs, {isLoading:true}])`）触发整个 messages 数组重渲染。历史会话消息多时（50 条上限），每次 AI 回复都全量重渲染。

**方案**：用 `React.memo` 包裹单个消息组件，使未变化的消息跳过重渲染。

实现步骤：
1. 抽取消息渲染为独立组件 `ChatMessageItem`，用 `React.memo` 包裹：
   ```tsx
   const ChatMessageItem = React.memo(function ChatMessageItem({
     msg, idx, onCopy, copiedIndex, query, ...
   }: ChatMessageItemProps) {
     // 现有的 messageWrapper + avatar + messageBubble + markdownContent 渲染逻辑
   });
   ```
2. 在 `messages.map()` 中用 `<ChatMessageItem>` 替代内联 JSX。
3. `React.memo` 默认浅比较 props——确保传入的回调（`onCopy`、`onCopy`）用 `useCallback` 稳定引用，避免每次都失效。
4. **不改 CSS 动画**（`typingDots` 的 `transform: scale()` 已是 GPU 友好，无需动）。

**验收**：用 React DevTools Profiler 观察发新消息时，只有新增的消息节点 render，历史消息节点不 render（显示灰色 "did not render"）。

### P3-9：力导向图谱 simulation 调优

**涉及文件**：`frontend/src/app/map/page.tsx`

**问题**：`react-force-graph-2d` 全用默认参数，`level=note&chapter=all` 时几百个节点的力导向 simulation 持续运行耗 CPU；自定义 `nodeCanvasObject` 每帧重绘所有节点的 `arc()` + `fillText()`。

**方案**：分两层优化——(1) simulation 参数调优减少计算量；(2) canvas 绘制优化减少每帧绘制成本。

实现步骤：
1. **Simulation 参数**（在 `<ForceGraph2D>` 上加 props）：
   ```tsx
   <ForceGraph2D
     graphData={graphData}
     cooldownTicks={100}        // 100 tick 后停止 simulation（默认无限）
     d3AlphaDecay={0.05}        // 加快收敛（默认 0.0228）
     d3VelocityDecay={0.4}      // 阻尼增大，减少抖动（默认 0.4，保持）
     // ... 现有 props
   />
   ```
2. **节点绘制优化**（`nodeCanvasObject` 内）：
   - 当前每帧都 `fillText(node.label)`——改为仅在 `globalScale > 阈值` 时画文字（**已有此逻辑** L318，确认保留）。
   - 给 hover 高亮检查加 early return：非高亮节点用简化绘制（不画外圈光晕）。
3. **大数据集预警**：当 `graphData.nodes.length > 200` 时，默认 `level=note` 自动切到 `level=chapter` 或提示用户选择章节过滤（现有 toast 已有类似提示 L226-230，增强文案）。

**验收**：`level=note&chapter=all` 下图谱在 ~3 秒内稳定（simulation 停止），CPU 占用从持续高位降至稳定后接近 0；拖拽节点时无明显掉帧。

### P3-10：知识图谱手势引导浮层

**涉及文件**：`frontend/src/app/map/page.tsx` + `map/page.module.css`

**问题**：用户首次访问 `/map` 不知道可以拖拽、缩放、点击节点跳转 Obsidian。无任何操作引导。

**方案**：首次访问时显示半透明引导浮层，展示手势说明；用户关闭后不再显示（localStorage 记忆）。

实现步骤：
1. **State + localStorage**：
   ```tsx
   const [showHelp, setShowHelp] = useState(false);
   useEffect(() => {
     const seen = localStorage.getItem('pmhub-map-help-seen');
     if (!seen && graphData) setShowHelp(true);
   }, [graphData]);
   const closeHelp = () => {
     localStorage.setItem('pmhub-map-help-seen', '1');
     setShowHelp(false);
   };
   ```
2. **浮层 UI**（覆盖在图谱右上角，不遮挡核心区域）：
   ```
   ┌─────────────────────────┐
   │ 🗺️ 知识图谱操作指南    ✕ │
   ├─────────────────────────┤
   │ 🖱️ 拖拽空白：平移画布    │
   │ 🔍 滚轮：缩放            │
   │ 👆 点击节点：跳转笔记    │
   │ ✋ 拖拽节点：重新布局    │
   └─────────────────────────┘
   ```
3. **CSS**（`map/page.module.css` 新增 `.helpOverlay`）：
   - 半透明卡片背景 `var(--surface-1)` + `box-shadow`
   - `position: absolute; top: 16px; right: 16px; z-index: 10`
   - 关闭按钮 `.helpClose` 带 `aria-label="关闭操作引导"`
   - `max-width: 240px`，移动端适配
4. **可重新打开**：在图谱控制区（与"重置视图"同级）加一个"操作指南"按钮，点击重新显示浮层（`setShowHelp(true)`），供用户复习。

**验收**：清空 localStorage 后首次访问 `/map` → 浮层出现 → 点 ✕ 关闭 → 刷新不再出现 → 点"操作指南"按钮重新出现。

---

## 3. 验收标准（实测，非自评）

### 3.1 功能验收（Playwright / DevTools）

| 项 | 验收方式 |
|----|---------|
| P3-2 虚拟化 | 空查询浏览 `/knowledge` → DevTools Elements 面板 `.listItem` DOM 节点数 ≤ 15（非 204+）；滚动正常 |
| P3-6 重渲染 | `/assistant` 发消息 → React DevTools Profiler 录制 → 仅新增消息节点 render，历史节点 "bail out" |
| P3-9 simulation | `/map?level=note` → 图谱 ~3s 内稳定停止 → 拖拽节点流畅；DevTools Performance 录制 CPU 占用显著下降 |
| P3-10 浮层 | 清 localStorage → 访问 `/map` → 浮层出现 → 关闭 → 刷新不出现 → "操作指南"按钮可重开 |

### 3.2 回归

- `npm run lint`（0 error 0 warning）+ `npm run build`（7 路由 0 错误）
- axe-core 扫描 5 页面 **critical=0, serious=0**（性能优化不得引入新 a11y 违规，特别是新浮层的按钮需有 aria-label）
- acceptance_test.md 现有 23 项 Test Case 仍全过

### 3.3 项目收尾交付物

- `docs/design/BACKLOG.md`：4 项 P3 全部标记 ✅，backlog 清空，加"项目已无可改进项"终期声明
- `docs/versions/CHANGELOG.md`：加 `[1.5.0]` 条目
- `docs/TASKS.md`：标记 TASK-032 完成，加"项目正式收尾"声明
- `docs/PROGRESS.md`：更新为"项目已交付终态 v1.5.0"
- **项目终期总结报告** `docs/FINAL_REPORT.md`（新建）：交付物清单 + 技术亮点 + 版本演进 + 作品集叙事 + 遗留说明（无）
- 打 tag `v1.5.0`

---

## 4. 工作空间与提交规范

- **分支**：从 `main` 切出 **`feature/v1.5-performance`**。
- **新依赖**：`@tanstack/react-virtual`（仅此一个）。
- **提交信息**：
  - `perf(knowledge): virtualize document list with @tanstack/react-virtual`
  - `perf(chat): memoize ChatMessageItem to prevent full list re-render`
  - `perf(map): tune force-graph simulation params and optimize canvas drawing`
  - `feat(map): add first-visit gesture help overlay with localStorage memory`
  - `docs: add project final report and close backlog`
  - `chore: release v1.5.0`
- **不改后端**（纯前端性能优化 + 文档）。

---

## 5. 风险与回退

| 风险 | 回退方案 |
|------|---------|
| `@tanstack/react-virtual` 与现有 `highlightText` 递归渲染冲突（虚拟项的绝对定位破坏高亮 DOM 结构） | 先验证简单列表（无高亮）的虚拟化；若高亮冲突，降级为仅在空查询浏览模式（无高亮）启用虚拟化，搜索模式（topK=20）保持全量渲染 |
| `React.memo` 导致消息内容更新时不重渲染（stale props） | 确保所有传入 props 是不可变值；`onCopy` 等回调用 `useCallback`；若 memo 后复制按钮失效，移除 memo 改用 `useMemo` 缓存消息列表 JSX |
| `cooldownTicks=100` 导致图谱未充分展开就停止（节点重叠） | 调高到 150-200；或改用 `onEngineStop` 回调判断稳定性；保留现有 `zoomToFit` 按钮供用户手动调整 |
| 帮助浮层遮挡图谱核心交互区域 | `max-width: 240px` + 定位右上角避开中心；移动端改为底部抽屉式 |
| 虚拟化后 `activeDoc` 高亮滚动定位失效（点击列表项不再自动滚动到预览） | 当前是点击列表项更新预览（非滚动定位），不受虚拟化影响；若需滚动到某项用 `virtualizer.scrollToIndex()` |

---

## 6. 交付清单（工作智能体完成后回报）

1. **P3-2 虚拟化**：改动文件 + DOM 节点数实测对比（优化前 204+ → 优化后 ≤15）
2. **P3-6 重渲染**：改动文件 + React DevTools Profiler 截图或文字描述（哪些节点 bail out）
3. **P3-9 simulation**：改动文件 + `cooldownTicks`/`d3AlphaDecay` 值 + 稳定时间实测
4. **P3-10 浮层**：改动文件 + localStorage key + 首次出现/关闭/重开流程实测
5. **回归**：`npm run lint` + `npm run build` 尾段 + axe-core 5 页面结果
6. **收尾文档**：BACKLOG.md（清空）+ CHANGELOG [1.5.0] + TASKS.md + PROGRESS.md + **FINAL_REPORT.md**
7. **`v1.5.0` tag** 推送结果
8. **遗留问题**（无则写「无」——本任务后项目正式收尾）
