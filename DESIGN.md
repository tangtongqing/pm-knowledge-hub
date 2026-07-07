# Design

## Visual Direction

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

## Design Critique & Audit Reports (v1.1.0)

We have systematically analyzed the design health and code quality of the 5 core pages using the Impeccable framework. Detailed reports are stored under `docs/design/`:

* **Homepage (`/`)**: [critique-home.md](file:///C:/Users/tangtongqing/Desktop/学习/pm-knowledge-hub/docs/design/critique-home.md) & [audit-home.md](file:///C:/Users/tangtongqing/Desktop/学习/pm-knowledge-hub/docs/design/audit-home.md)
* **Knowledge base (`/knowledge`)**: [critique-knowledge.md](file:///C:/Users/tangtongqing/Desktop/学习/pm-knowledge-hub/docs/design/critique-knowledge.md) & [audit-knowledge.md](file:///C:/Users/tangtongqing/Desktop/学习/pm-knowledge-hub/docs/design/audit-knowledge.md)
* **AI Assistant (`/assistant`)**: [critique-assistant.md](file:///C:/Users/tangtongqing/Desktop/学习/pm-knowledge-hub/docs/design/critique-assistant.md) & [audit-assistant.md](file:///C:/Users/tangtongqing/Desktop/学习/pm-knowledge-hub/docs/design/audit-assistant.md)
* **Mock Interview (`/interview`)**: [critique-interview.md](file:///C:/Users/tangtongqing/Desktop/学习/pm-knowledge-hub/docs/design/critique-interview.md) & [audit-interview.md](file:///C:/Users/tangtongqing/Desktop/学习/pm-knowledge-hub/docs/design/audit-interview.md)
* **Knowledge Graph (`/map`)**: [critique-map.md](file:///C:/Users/tangtongqing/Desktop/学习/pm-knowledge-hub/docs/design/critique-map.md) & [audit-map.md](file:///C:/Users/tangtongqing/Desktop/学习/pm-knowledge-hub/docs/design/audit-map.md)
