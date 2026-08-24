# PM Knowledge Hub 高保真原型索引

> 对应需求：[PRD v4.0](../product/PRD.md) · 更新日期：2026-08-03 · 状态：有效

## 1. 资产使用规则

- `P-01` 至 `P-06` 是当前实现截图，用于证明界面和测试状态，不等于独立设计源文件。
- `P-07` 至 `P-11` 是 PRD v4 的目标设计，表示待实现行为，不得写成已交付。
- `P-07` 至 `P-11` 的可编辑设计事实源是同一份 [Figma 文件](https://www.figma.com/design/7sQuypYVJEEuxaaJu3WqqD)；仓库 PNG 均由对应 Figma Frame 直接导出。
- 原型与 PRD 冲突时，以 PRD 的业务规则和验收标准为准，并把冲突记录为设计待修项。
- 每次更新原型必须保留编号、对应需求 ID、状态和视口。

## 2. 新增设计方向

**方向名称：Editorial Instrument Panel（编辑式仪表盘）**

- 目的：让首次接入、数据边界和业务验证这类高风险任务显得可信、可控、可复核。
- 主导语气：克制的编辑式排版 + 工具型仪表盘，不改变现有 Zinc 中性色和蓝色品牌主轴。
- 识别锚点：`LOCAL / CONTROLLED` 纵向数据边界条，把“本地优先”从说明文字变成持续可见的界面结构。
- 字体：Manrope 用于标题和数字；Noto Sans SC 用于中文正文。
- 动效：只保留状态切换、焦点和结果反馈；遵守 `prefers-reduced-motion`。

### DFII 评估

| 维度 | 分数 | 说明 |
|---|---:|---|
| 美学影响 | 4 | 数据边界纵向锚点具有记忆性 |
| 场景适配 | 4 | 适合本地优先、可信和工具型产品 |
| 实现可行 | 4 | Figma 可编辑图层与本地 HTML/CSS 交互参考并存 |
| 性能安全 | 4 | 无重型动画或图片依赖 |
| 一致性风险 | -2 | 新字体和更强版式需在产品化时收敛 |
| **DFII** | **14/15** | 可执行，需保持克制 |

## 3. 资产清单

| 编号 | 标题 | 路径 | 类型 | 视口 | 对应需求 | 状态 |
|---|---|---|---|---|---|---|
| P-01 | 工作台桌面 | [PNG](../screenshots/acceptance-c1-workspace-desktop.png) | 实现截图 | 1440×900 | F-06 | 已验证 |
| P-02 | 工作台移动端 | [PNG](../screenshots/acceptance-c1-workspace-mobile.png) | 实现截图 | 移动端 | F-06 | 已验证 |
| P-03 | 知识浏览与完整原文 | [PNG](../screenshots/acceptance-c2-knowledge-search.png) | 实现截图 | 桌面 | F-02 | 已验证 |
| P-04 | 带来源问答 | [PNG](../screenshots/acceptance-c2-qa-rag-real.png) | 实现截图 | 桌面 | F-03 | 已验证 |
| P-05 | STAR 面试反馈 | [PNG](../screenshots/acceptance-c2-interview-star.png) | 实现截图 | 桌面 | F-04 | 已验证 |
| P-06 | 目录层知识图谱 | [PNG](../screenshots/acceptance-test-4-2-force-graph.png) | 实现截图 | 桌面 | F-05 | 已验证 |
| P-07 | 资料接入成功态 | [PNG](prototypes/prd-v4/P-07-setup-ready-desktop.png) · [Figma](https://www.figma.com/design/7sQuypYVJEEuxaaJu3WqqD?node-id=8-2) | 目标设计 | 1440×1000 | FR-SETUP-01/02 | 待实现 |
| P-08 | 数据边界确认 | [PNG](prototypes/prd-v4/P-08-privacy-consent-desktop.png) · [Figma](https://www.figma.com/design/7sQuypYVJEEuxaaJu3WqqD?node-id=9-2) | 目标设计 | 1440×1000 | FR-SETUP-03、FR-DEMO-02 | 待实现 |
| P-09 | 索引失败恢复 | [PNG](prototypes/prd-v4/P-09-index-failure-desktop.png) · [Figma](https://www.figma.com/design/7sQuypYVJEEuxaaJu3WqqD?node-id=7-2) | 目标设计 | 1440×1000 | FR-SETUP-04/06 | 待实现 |
| P-10 | 业务验证记录 | [PNG](prototypes/prd-v4/P-10-validation-records-desktop.png) · [Figma](https://www.figma.com/design/7sQuypYVJEEuxaaJu3WqqD?node-id=10-2) | 目标设计 | 1440×1000 | FR-VAL-01～05 | 待实现 |
| P-11 | 移动端资料接入 | [PNG](prototypes/prd-v4/P-11-setup-ready-mobile.png) · [Figma](https://www.figma.com/design/7sQuypYVJEEuxaaJu3WqqD?node-id=12-2) | 目标设计 | 390×844 | AC-SETUP-06 | 待实现 |

## 4. 设计源与交互参考

- [Figma 可编辑设计源](https://www.figma.com/design/7sQuypYVJEEuxaaJu3WqqD)
- [本地交互参考入口](prototypes/prd-v4/index.html)
- [样式](prototypes/prd-v4/prototype.css)
- [交互脚本](prototypes/prd-v4/prototype.js)

Figma 是 P-07～P-11 的视觉事实源；本地 HTML 仅用于验证响应式布局和交互流程。预览时从 `docs/design/prototypes/prd-v4/` 启动静态文件服务，并使用查询参数切换：

```text
?screen=setup-ready
?screen=privacy
?screen=setup-error
?screen=validation
```

## 5. 状态覆盖与缺口

| 模块 | 默认 | 加载 | 成功 | 空状态 | 校验/服务失败 | 移动端 | 结论 |
|---|---:|---:|---:|---:|---:|---:|---|
| F-01 资料接入 | ✓ | 文本规则 | P-07 | 文本规则 | P-09 | P-11 | 核心缺口已补设计 |
| F-02 知识浏览 | P-03 | 代码/文字 | P-03 | 代码/文字 | 代码/文字 | 已有验收 | 后续补异常截图 |
| F-03 问答证据 | 已实现 | 已实现 | P-04 | 已实现 | 已实现 | 已有验收 | 后续补空来源和焦点修复截图 |
| F-04 面试复盘 | 已实现 | 已实现 | P-05 | 已实现 | P-05 含降级 | 已有验收 | 缺复习行动设计 |
| F-05 学习地图 | 已实现 | 已实现 | P-06 | 文字规则 | 已实现 | 已有验收 | 后续补错误截图 |
| F-06 演示边界 | P-01/P-02 | — | P-01/P-02 | 文字规则 | 文字规则 | P-02 | 需补正式 404 |
| F-07 验证记录 | P-10 | 文本规则 | P-10 | 文本规则 | 文本规则 | 未要求 | 核心缺口已补设计 |

## 6. 设计待修项

1. 面试页增加可编辑的复习行动区域，并补成功、未保存和完成状态原型。
2. AI 问答移动侧栏关闭时使用 `inert`/`aria-hidden` 并恢复合理焦点。
3. 公开演示补品牌化 404 和空分类恢复路径。
4. PDF 改为可选择文本的实现后，补导出成功与辅助技术验证资产。
5. 产品化接入页时，评估 Manrope/Noto Sans SC 与现有字体系统的加载成本；如不引入新字体，保留版式层级和数据边界锚点。
