# 设计 Backlog — 来自 critique / audit 的待改进项

> **来源**：`docs/design/` 下 5 份 critique + 5 份 audit 报告（2026-07-07，TASK-027 缺口 2.6）。
> **范围**：评审中发现的 P0/P1 已当场修复或并入 v1.1.0；此处归档**未修复的 P2/P3 改进项**，作为 v1.2+ 候选工作。
> **更新时间**：2026-07-09

---

## 严重度定义

- **P2（应修复）**：影响可用性/可访问性/效率，建议在下一次迭代修复。
- **P3（宜改进）**：体验/性能优化，非阻塞，可择机处理。

---

## P2 — 已在 v1.2.0 中全量修复（10 项已归档）

### 可访问性专项（audit 报告集中发现，已于 v1.2.0 修复）

| # | 页面 | 问题 | 建议修复 | 状态 | 来源 |
|---|------|------|---------|------|------|
| 1 | `/`（首页） | SVG 图标缺 `aria-label`/`title`，读屏器无法识别 | 装饰性 SVG 加 `aria-hidden="true"` | ✅ 已修复 (v1.2.0) | audit-home L25 |
| 2 | `/knowledge` | 搜索结果更新时键盘焦点丢失 | 结果容器加 `aria-live="polite"` | ✅ 已修复 (v1.2.0) | audit-knowledge L25 |
| 3 | `/interview` | 评分进度条无读屏器数值 | 加 `role="progressbar"` + `aria-valuenow={score}` | ✅ 已修复 (v1.2.0) | audit-interview L25 |
| 4 | `/map` | 纯 canvas 对读屏器完全不可访问 | canvas 下提供 visually-hidden 的摘要 | ✅ 已修复 (v1.2.0) | audit-map L25 |
| 5 | `/assistant` | 点击建议词后焦点不回输入框 | 点击后调 `inputRef.current.focus()` | ✅ 已修复 (v1.2.0) | audit-assistant L25 |

### 体验/效率专项（critique 报告发现，已于 v1.2.0 修复）

| # | 页面 | 问题 | 建议修复 | 状态 | 来源 |
|---|------|------|---------|------|------|
| 6 | `/`（首页） | 无法按 `/` 快速聚焦搜索框 | 加全局键盘监听，`/` 键 focus 搜索 input | ✅ 已修复 (v1.2.0) | critique-home L37 |
| 7 | `/`（首页） | 指标卡网格与功能卡网格高度冲突 | 统一 grid-row 高度或用 align-items | ✅ 已修复 (v1.2.0) | critique-home L41 |
| 8 | `/assistant` | 代码块/回答无一键复制按钮 | 对话气泡加复制按钮 + clipboard API | ✅ 已修复 (v1.2.0) | critique-assistant L32 |
| 9 | `/interview` | 作答区无格式建议模板 | 提供 STAR 框架占位提示 | ✅ 已修复 (v1.2.0) | critique-interview L32 |
| 10 | `/map` | 无「重置缩放」按钮 | 加 reset-zoom 控件，调 `fgRef.current.zoomToFit()` | ✅ 已修复 (v1.2.0) | critique-map L32 |

---

## P3 — 宜改进（10 项）

| # | 页面 | 问题 | 建议修复 | 来源 |
|---|------|------|---------|------|
| 1 | `/`（首页） | 指标卡文字溢出不换行 | `word-break: break-word` | audit-home L33 |
| 2 | `/knowledge` | 笔记列表超长无虚拟化 | 分页或 react-window 虚拟滚动 | audit-knowledge L32 |
| 3 | `/knowledge` | 预览栏正文字号偏小（13px） | 提升至 14-15px | critique-knowledge L32 |
| 4 | `/knowledge` | 目录树折叠无过渡动画 | 加 height/opacity transition | critique-knowledge L36 |
| 5 | `/assistant` | 多段输出时滚动不锁定底部 | 新消息后滚到底（scrollTop=scrollHeight） | critique-assistant L36 |
| 6 | `/assistant` | 输入时打字加载性能 | 用简单过渡替代重动画 | audit-assistant L32 |
| 7 | `/interview` | 分数变化无计数器过渡动画 | 数字递增动画（如 count-up） | critique-interview L36 |
| 8 | `/interview` | textarea 缺 resize 控制 | `resize: vertical` 或禁用 | audit-interview L32 |
| 9 | `/map` | 拖拽时高频刷新可能掉帧 | debounce drag 或降低 force simulation 迭代 | audit-map L32 |
| 10 | `/map` | 缺手势/操作引导浮层 | 首次访问显示 help legend overlay | critique-map L36 |

---

## 建议迭代节奏

- **v1.2.0 (Completed)**：所有 P2 级别可访问性与体验/效率专项缺陷（共 10 项）已于 v1.2.0 正式交付闭环，A11y 整体达到行业主流无障碍阅读标准。
- **v1.3.0 (Completed)**：完成对话历史保存与恢复 (Feature A)、模拟面试评估 PDF 导出 (Feature B)、检索词高亮渲染 (Feature C)。
- **v1.4+**：剩余 P3 性能与细节体验优化（#2 虚拟化、#9 拖拽防抖等）。

> 注：本 backlog 的 P2/P3 核心高价值功能逐步闭环。

