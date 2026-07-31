# PM Knowledge Hub Web 上线测试报告

> 文档导航：[文档中心](../../README.md) · [系统验收](../ACCEPTANCE.md)

- 测试日期：2026-07-24
- 测试地址：https://pm-knowledge-hub-demo.tongqtang.chatgpt.site
- 仓库版本：`v1.6.0-rc.1`
- 测试方式：线上黑盒测试 + 仓库发布门禁检查
- 主要浏览器环境：Chromium，1440×1000、390×844

## 证据索引

- 页面走查：[桌面首页](home-desktop.png) · [移动首页](home-mobile-390x844.png) · [移动端助手侧栏](assistant-mobile-collapsed.png)
- 缺陷证据：[旧 About 文案](about-outdated-content.png) · [HTTP 响应头](assistant-response-headers.txt)
- 导出证据：[面试报告 PDF](interview-report-export.pdf) · [PDF 首屏渲染](pdf-render/page-1.png)

## 结论

**复测结论：两个 S1 阻断项已修复，生产发布门禁通过（GO）；开发工具链有新增上游安全公告，需持续跟踪。**

首页、知识库、AI 问答、模拟面试、知识图谱、关于页和设计页均可访问，桌面端和移动端核心流程能够完成。2026-07-24 复测确认：主项目和托管项目的生产依赖审计均为 0 项漏洞；About 页已明确区分公开演示版与本地完整版；版本 3 已成功发布并通过线上回归。

产品侧剩余问题均为 S2：安全响应头、移动端侧栏焦点管理、PDF 文本可访问性和 404 恢复路径。2026-07-27 新增一项发布工程风险：生产依赖审计仍为 0，但完整审计受 Next.js 官方 ESLint 工具链的上游公告影响。该风险不进入当前线上运行时，但应在后续上游兼容版本发布后立即升级。

## 通过项

| 范围 | 结果 | 说明 |
|---|---|---|
| 站点与路由 | 通过 | `/`、`/knowledge`、`/assistant`、`/interview`、`/map`、`/about`、`/design` 均可直接访问 |
| 首页与导航 | 通过 | CTA、桌面导航、移动菜单、页内锚点正常 |
| 知识库 | 通过 | 分类、搜索、结果重排、关键词高亮、正文预览、清空搜索正常 |
| AI 问答 | 通过 | 演示回答、引用编号、证据卡、推荐问题、历史恢复、删除与撤销正常 |
| 模拟面试 | 通过 | 题目、STAR 回答、四维反馈、总分、后续练习、历史恢复正常 |
| PDF 导出 | 部分通过 | 下载成功，中文与视觉排版正常；文本可访问性见 WB-05 |
| 知识图谱 | 通过 | 目录/笔记模式、过滤、快速选择、详情、重置、文本摘要正常 |
| 响应式 | 通过 | 390×844 与 1440×1000 未出现页面级横向滚动，核心操作可完成 |
| 主题 | 通过 | 明暗主题切换及刷新后持久化正常 |
| 输入安全 | 通过 | URL 中的 HTML/XSS 测试字符串未生成节点或事件处理器 |
| 隐私隔离 | 通过 | 13 个公开 JS 资源中未发现常见 API Key、私钥或 Windows 用户路径；无真实 `/api/` 调用 |
| HTTPS | 通过 | HTTP 自动跳转 HTTPS |
| 性能抽查 | 通过 | 首页单次实验室测量 LCP 1.544s、CLS 0；助手页 FCP 0.548s、CLS 0 |
| 前端 Lint | 通过 | `npm run lint`，0 error |
| 前端构建 | 通过 | `npm run build`，7 个业务路由及 `_not-found` 静态生成成功 |
| 后端测试 | 通过 | 正确虚拟环境中 53/53 通过，1 条依赖弃用 warning |
| Python 依赖 | 通过 | `pip check` 无损坏依赖 |

## 缺陷与修复状态

### WB-01 · S1 · 已修复 · 前端生产依赖存在高危安全公告

`npm audit --omit=dev` 返回失败，共 4 个问题：3 个 high、1 个 low。涉及 `next@16.2.9`、`postcss`、`sharp` 和 `dompurify`。

影响：正式发布安全门禁失败。公开演示版并未使用其中所有受影响能力，但仍需升级后重新构建和回归。

建议：升级至审计建议的安全版本，重新执行 `npm audit`、构建、核心 E2E 和部署验证。

复测：Next.js 已升级到 16.2.11，DOMPurify 升级到 3.4.12，并对 PostCSS 8.5.22、Sharp 0.35.3 使用安全版本覆盖。主项目和托管项目执行 `npm audit --omit=dev` 均为 0 项漏洞。

2026-07-27 跟进：React、React DOM 与 React Server Components 升级到 19.2.8；托管构建链将 esbuild 固定到 0.28.1，已消除 RSC 高危项和 Drizzle Kit 间接的 4 个中危项。完整审计仍报告 9 个 high，均来自 ESLint / `eslint-config-next` / `minimatch` / `brace-expansion` 链。当前安全版 `brace-expansion@5.0.8` 与旧版 minimatch 的 CommonJS 接口不兼容，强制覆盖会令 ESLint 崩溃；ESLint 10 又尚未被 Next 当前使用的三个插件声明支持，因此暂不采用破坏性规避方案。

### WB-02 · S1 · 已修复 · 关于页与线上演示版实际能力冲突

`/about` 显示“当前版本 (Phase C) 实现了完整的前后端闭环”，同时描述真实 FastAPI、ChromaDB 和多轮面试能力；实际公开部署为无真实后端、无真实 AI 的脱敏演示版。页面仅有全局“线上演示 · 无真实 AI”徽标，仍不足以消除正文冲突。

影响：违反演示版能力边界和版本一致性要求，可能误导评审者。

建议：改为 `v1.6.0-rc.1 / v1.6-demo`，明确“当前页面为浏览器内演示数据；完整能力仅在本地版提供”，并移除“当前实现完整前后端闭环”的线上表述。

证据：[about-outdated-content.png](about-outdated-content.png)

复测：线上 `/about` 已显示“公开演示版 · 无真实 AI 调用”，明确公开站不连接 FastAPI、ChromaDB 或真实模型，并将架构图标注为“本地完整版架构”。线上页面无控制台错误，相关 RSC 请求均返回 200。

### WB-03 · S2 · 缺少常用 HTTP 安全响应头

主文档响应未发现：

- `Strict-Transport-Security`
- `Content-Security-Policy`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `X-Frame-Options` 或 CSP `frame-ancestors`

影响：降低浏览器侧纵深防御。当前为静态公开演示，因此暂定 S2；若未来接入登录、用户数据或真实 API，应提升为 S1。

证据：[assistant-response-headers.txt](assistant-response-headers.txt)

### WB-04 · S2 · 折叠后的移动端历史侧栏仍可被键盘聚焦

在 390×844 下折叠 AI 问答历史侧栏后，`aside` 只通过位移移出屏幕，没有设置 `inert`、`aria-hidden` 或调整子控件 `tabIndex`。新建对话、收起侧栏、会话选择和删除按钮仍处于 Tab 顺序中。

影响：键盘和屏幕阅读器用户会进入不可见控件，违反可见焦点和可操作性预期。

建议：侧栏关闭时使用 `inert`，同步设置正确的 `aria-hidden`，并在打开时恢复焦点到合理位置。

### WB-05 · S2 · PDF 导出为图像化页面，无法提取或选择文本

导出的 PDF 视觉清晰、中文正常且当前内容完整，但文本提取结果为 0 字符，说明页面内容被图像化。

影响：无法搜索、复制或由屏幕阅读器读取；长报告也可能产生较大文件。

建议：嵌入中文字体并以真实 PDF 文本绘制；修复后继续做分页、复制和辅助技术验证。

证据：[interview-report-export.pdf](interview-report-export.pdf)、[pdf-render/page-1.png](pdf-render/page-1.png)

### WB-06 · S2 · 线上 404 页面缺少恢复路径

访问不存在的路由时返回 HTTP 404，但页面仅显示纯文本 `Not Found`，没有产品导航、返回首页按钮或品牌信息。仓库本地构建生成了 `/_not-found`，说明部署产物或路由适配没有呈现预期错误页。

建议：为线上部署配置统一 404 页面，并保留返回首页和核心工作台入口。

## 观察项

- 公开演示数据只有 6 篇笔记，但目录展示 13 个分类，多个分类点击后为空。建议隐藏空分类或提供“演示数据有限”的说明。
- 多数业务路由共用同一个页面标题，不影响功能，但不利于浏览器历史识别和 SEO。
- 后端测试必须从 `backend/venv` 执行；使用系统 Python 会因缺少 `chromadb`、`slowapi` 在收集阶段失败。建议在测试脚本或 README 中明确解释器路径。
- Firefox 与 WebKit 自动化运行环境未预装浏览器二进制，本轮未执行这两个浏览器的兼容性测试。

## 修复顺序

1. ~~升级高危前端依赖并重新审计。~~ 已完成
2. ~~修正 `/about` 的版本和演示边界文案。~~ 已完成
3. 补齐安全响应头。
4. 修复折叠侧栏的焦点管理。
5. 增加正式 404 页面。
6. 改善 PDF 文本可访问性及空目录体验。

## 复测门禁

- `npm audit --omit=dev` 不再包含 high/critical。
- WB-02 至 WB-06 均按原步骤复测通过。
- `npm run lint`、`npm run build`、后端 53 项测试继续通过。
- 重新执行桌面和移动端知识库、问答、面试、图谱核心流程。
- 有 Firefox/WebKit 环境时补做 P1 跨浏览器冒烟。
