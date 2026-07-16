# 设计 Backlog — 来自 critique / audit 的待改进项

> **来源**：`docs/design/` 下 5 份 critique + 5 份 audit 报告（2026-07-07，TASK-027 缺口 2.6）。
> **范围**：持续记录产品设计评审发现的问题；历史 P2/P3 保留归档，2026-07-15 新增 P1 稳定化批次。
> **更新时间**：2026-07-15

---

## 严重度定义

- **P1（发布阻塞）**：影响核心任务、可信度或目标视口，发布前必须关闭。
- **P2（应修复）**：影响可用性/可访问性/效率，建议在下一次迭代修复。
- **P3（宜改进）**：体验/性能优化，非阻塞，可择机处理。

---

## P1 — v1.6.0-rc.1 稳定化批次

| # | 问题 | 当前处理 | 状态 |
|---|---|---|---|
| 1 | 版本、验收、远端发布事实互相漂移 | 本地 RC 口径 + VERSION 单一来源 + 发布门禁 | ✅ RC 已验证；远端仍未发布 |
| 2 | 390×844 下四个核心工作区横向溢出，关键行缺少键盘语义 | 窄屏分层布局 + 语义按钮 + 44px 触控目标 | ✅ 390×844 / 1440×1000 复验通过 |
| 3 | PRD P0 与当前实现混为一谈 | 保留承诺，明确当前基线与 v1.7 交付里程碑 | ✅ 文档已重排 |
| 4 | 引用不可定位、无证据摘录，笔记图片 404 | 引用锚点 + 来源摘录 + 本地资源 API + 就地重试 | ✅ 真实问答与三张图片复验通过 |

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

| # | 页面 | 问题 | 建议修复 | 状态 | 来源 |
|---|------|------|---------|------|------|
| 1 | `/`（首页） | 指标卡文字溢出不换行 | `word-break: break-word` | ✅ 已修复 (v1.4.0) | audit-home L33 |
| 2 | `/knowledge` | 笔记列表超长无虚拟化 | 分页或 react-window 虚拟滚动 | ✅ 已修复 (v1.5.0) | audit-knowledge L32 |
| 3 | `/knowledge` | 预览栏正文字号偏小（13px） | 提升至 15px 并优化行高 | ✅ 已修复 (v1.4.0) | critique-knowledge L32 |
| 4 | `/knowledge` | 目录树折叠无过渡动画 | 加树状项切换 transition 动画 | ✅ 已修复 (v1.4.0) | critique-knowledge L36 |
| 5 | `/assistant` | 多段输出时滚动不锁定底部 | 优化 scrollToBottom 多端同步滚动 | ✅ 已修复 (v1.4.0) | critique-assistant L36 |
| 6 | `/assistant` | 输入时打字加载性能 | 用简单过渡替代重动画 | ✅ 已修复 (v1.5.0) | audit-assistant L32 |
| 7 | `/interview` | 分数变化无计数器过渡动画 | CSS keyframes 弹跳与缩放动画 | ✅ 已修复 (v1.4.0) | critique-interview L36 |
| 8 | `/interview` | textarea 缺 resize 控制 | `resize: vertical` 并限高 | ✅ 已修复 (v1.4.0) | audit-interview L32 |
| 9 | `/map` | 拖拽时高频刷新可能掉帧 | debounce drag 或降低 force simulation 迭代 | ✅ 已修复 (v1.5.0) | audit-map L32 |
| 10 | `/map` | 缺手势/操作引导浮层 | 首次访问显示 help legend overlay | ✅ 已修复 (v1.5.0) | critique-map L36 |

---

## 建议迭代节奏

- **v1.2.0 (Completed)**：所有 P2 级别可访问性与体验/效率专项缺陷（共 10 项）已于 v1.2.0 正式交付闭环，A11y 整体达到行业主流无障碍阅读标准。
- **v1.3.0 (Completed)**：完成对话历史保存与恢复 (Feature A)、模拟面试评估 PDF 导出 (Feature B)、检索词高亮渲染 (Feature C)。
- **v1.4.0 (Completed)**：完成收尾补漏（A.1-A.3）及高价值 P3 体验打磨与对比度调深（B.1-B.6, Part C）。
- **v1.5.0 (Completed)**：清空所有剩余 P3 性能优化项目，发布项目最终性能卓越版本。

> 历史 P2/P3 已归档，但项目仍以最新产品设计评审为准；只有当前 P1 发布门禁全部通过后，候选版才可进入发布。

