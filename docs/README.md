# 文档中心

这里是 PM Knowledge Hub 的唯一文档入口。先按“想回答什么问题”找文档，不必记目录。

## 快速定位

| 你想了解 | 首选文档 | 说明 |
|---|---|---|
| 项目现在是什么状态 | [交付状态](delivery/STATUS.md) | 当前版本、发布状态、待决策项 |
| 为什么值得做 | [BRD](product/BRD.md) | 商业目标、边界、投入与停止条件 |
| 市场和竞品如何 | [MRD](product/MRD.md) | 市场细分、竞品证据、需求机会 |
| 当前版本具体做什么 | [PRD](product/PRD.md) | 产品范围、需求、验收与发布门禁 |
| 用户如何使用 | [用户旅程](product/USER_JOURNEY.md) | 核心场景与任务链 |
| 后续做什么 | [Roadmap](product/ROADMAP.md) | 版本规划与范围剪裁 |
| 如何衡量结果 | [指标体系](product/METRICS.md) | 北极星指标与采集方式 |
| 系统如何运行 | [系统架构](architecture/README.md) | 组件、接口、数据流与能力边界 |
| 界面为什么这样设计 | [设计系统](design/README.md) | 视觉原则、Token、布局与组件 |
| 设计还有哪些问题 | [设计评审](design/REVIEW.md) / [Backlog](design/BACKLOG.md) | 当前评审结论与待改进项 |
| 版本发生过什么变化 | [CHANGELOG](delivery/CHANGELOG.md) | 按版本记录已交付变化 |
| 历次迭代如何推进 | [实施历史](delivery/IMPLEMENTATION_HISTORY.md) | 已完成计划的合并摘要 |
| 如何证明质量 | [系统验收](quality/ACCEPTANCE.md) | 发布门禁与实测结论 |
| 阶段验收标准是什么 | [Phase A](quality/criteria/phase-a.md) / [Phase B](quality/criteria/phase-b.md) / [Phase C](quality/criteria/phase-c.md) | 产品、后端、前端阶段标准 |
| 线上黑盒测试结果 | [2026-07-24 Web 测试](quality/web-test-2026-07-24/TEST_REPORT.md) | 公开演示版缺陷与复测 |
| 如何演示或写进简历 | [演示脚本](demo/DEMO_SCRIPT.md) / [简历与面试总手册](demo/PM_KNOWLEDGE_HUB_RESUME_MASTER.md) | 作品集材料 |

## 目录规则

```text
docs/
├── product/       # 商业、市场、产品、旅程、指标、路线图
├── architecture/  # 当前技术架构与数据流
├── design/        # 设计系统、评审与设计 Backlog
├── delivery/      # 当前状态、版本记录、实施历史、终期报告
├── quality/       # 验收标准、验收结果、测试证据
├── demo/          # 演示与求职材料
└── screenshots/   # README 与验收引用的长期截图
```

## 单一事实来源

- 当前版本：根目录 [`VERSION`](../VERSION)。
- 当前交付状态：[`delivery/STATUS.md`](delivery/STATUS.md)。
- 产品范围与需求状态：[`product/PRD.md`](product/PRD.md)。
- 版本变化：[`delivery/CHANGELOG.md`](delivery/CHANGELOG.md)。
- 验收结论：[`quality/ACCEPTANCE.md`](quality/ACCEPTANCE.md)。

已完成的任务清单、进度日志和逐任务实施计划不再分别维护；它们合并到“交付状态 + 实施历史 + CHANGELOG”，避免同一版本在多个文件中出现不同结论。
