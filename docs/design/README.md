# 设计系统与原型索引

> 返回[文档中心](../README.md)。现行 v1.x 产品范围见 [PRD v4](../product/PRD.md)；v2 目标范围见 [PRD v5 草案](../product/PRD-v5-DRAFT.md)。

## v2 目标设计（已验收基线）

v2 采用“知识空间优先”的信息架构，不再以 PM 功能或固定目录作为全局导航。当前设计事实源为：

- [v2 信息架构](V2_INFORMATION_ARCHITECTURE.md)：全局栏、空间上下文、页面层级、图谱三视图、Agent 审批与移动范围；
- [v2 可运行原型说明](V2_PROTOTYPE_SPEC.md)：`V5-P01`～`V5-P14` 的入口、交互和验收项；
- [打开 v2 可运行原型](prototypes/prd-v5/index.html)：单一静态入口，通过 `?screen=` 切换页面，不连接真实数据；
- [PRD v5 需求与证据矩阵](../product/PRD_EVIDENCE_MATRIX-v5-DRAFT.md)：原型与产品需求、架构责任和实现状态的追踪关系。

v2 原型采用 **Knowledge Fieldwork（知识现场）** 视觉方向：克制的 Zinc 中性色、单一靛蓝强调色、持续可见的空间/范围/来源状态。PM 面试仅作为可选任务模板示例。

以下 Visual Direction、Color System、Layout Architecture 和历史高保真索引仍描述 v1.x 现行实现，不能直接视为 v2 已交付设计。

## v1.x 现行视觉基线

Committed: a professional, restrained "Product Register" aesthetic for PM RAG knowledge search and STAR interview training. Designed for deep work and high readability during long review sessions. It abandons "AI cyberpunk" and glassmorphism in favor of a clean, Zinc-based OKLCH dual-theme (Light/Dark) system.

## Color System (Zinc OKLCH)

Theme tokens are implemented in `frontend/src/app/globals.css` using native CSS variables with a `data-theme` attribute on the `<html>` tag.

- **Canvas (Background)**: `#111113` (Dark) / `#FAFAFA` (Light) - Deep Zinc for dark mode, crisp off-white for light mode.
- **Surface-1 (Panels)**: `#1A1A1D` (Dark) / `#FFFFFF` (Light) - Base level for cards and sidebars.
- **Surface-2 (Hover/Cards)**: `#232328` (Dark) / `#F4F4F5` (Light) - Slightly elevated for interactive areas.
- **Surface-3 (Inputs)**: `#161618` (Dark) / `#EFEFF1` (Light) - Recessed areas like search inputs.
- **Primary Brand**: `#4F6CF7` (Light) / `#6B8AFF` (Dark) - A calm, mature indigo, replacing neon blues. Used sparingly (under 10% of screen area).
- **Success State**: `#16A34A` (Light) / `#34D399` (Dark)
- **Warning State**: `#CA8A04` (Light) / `#FBBF24` (Dark)

**Absolute Prohibitions:**
- **NO Glassmorphism**: Do not use `backdrop-filter: blur`, `rgba` panel backgrounds, or translucent glass borders as defaults.
- **NO Glow/Neon**: Do not use heavy colored `box-shadow` for glowing effects. Use subtle neutral shadows for elevation.
- **NO Pure Black/White Dark Mode**: Avoid `#000000` or `#FFFFFF` in dark mode; use tinted Zinc grays.

## Typography

Use one product UI font stack:

```css
--font-sans: 'Inter', 'PingFang SC', 'Microsoft YaHei UI', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Cascadia Code', monospace;
```

Keep typography compact and readable:

- Display heading: 24px (bold)
- Card/Panel titles: 16px (semi-bold)
- Body and paragraph text: 14px (regular)
- Caption/Tags: 12px (medium)
- Mono text (JSON/Code/Paths): 13px (monospace)

## Layout Architecture

The app shell utilizes a flexible sidebar layout:

- **Left Navigation**: 56px wide collapsed by default (icon only). Expands to 220px on hover. Houses main route links and theme toggle.
- **Main Workspace**: Takes remaining width (`flex: 1`). Routes decide their own internal layout (e.g., single column for Home, dual column for Assistant/Interview, three column for Knowledge base).

## Components

- **Panels/Cards**: Solid background (`var(--surface-1)`), subtle border (`var(--border-subtle)`), small corner radius (`var(--radius-lg)`, usually 12px), and subtle neutral shadow (`var(--shadow-sm)`).
- **Interactive Elements**: Subtle background shift on hover (`var(--surface-2)`).
- **Focus States**: Strong brand-colored focus rings (`box-shadow: 0 0 0 2px var(--canvas), 0 0 0 4px var(--brand);`).
- **Citation Indicators**: Small inline numbers (e.g. `[1]`) that link to the source panel.

## 设计评审与改进

早期五页 critique / audit 的分散报告已停止维护。当前统一使用：

- [设计评审](REVIEW.md)：跨页面的最新综合判断、证据与优先级。
- [设计 Backlog](BACKLOG.md)：评审问题的处理状态与后续候选项。
