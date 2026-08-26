const params = new URLSearchParams(window.location.search);
const screens = new Set([
  "workspace", "source", "import", "document", "search", "answer", "links",
  "graph", "graph-focus", "agent", "templates", "settings", "recovery", "mobile"
]);
const screen = screens.has(params.get("screen")) ? params.get("screen") : "workspace";
const root = document.querySelector("#prototype-root");
const liveStatus = document.querySelector("#live-status");

const pageUrl = (name) => `?screen=${encodeURIComponent(name)}`;
const activeArea = screen.startsWith("graph") ? "graph"
  : (["search", "answer"].includes(screen) ? "search"
  : (screen === "agent" ? "agent"
  : (screen === "templates" ? "templates"
  : (screen === "settings" || screen === "recovery" ? "settings" : "workspace"))));

const screenTitles = {
  workspace: "知识工作台",
  source: "知识空间 · 来源",
  import: "导入任务",
  document: "文档阅读与结构",
  search: "统一搜索",
  answer: "证据化回答",
  links: "链接与反向链接",
  graph: "知识图谱",
  "graph-focus": "图谱聚焦视图",
  agent: "知识 Agent",
  templates: "任务模板",
  settings: "设置与治理",
  recovery: "失败恢复",
  mobile: "移动端核心闭环"
};

document.title = `${screenTitles[screen]} · 个人知识工作台 v2`;

function railLink(area, href, glyph, label) {
  const current = activeArea === area ? ' aria-current="page"' : "";
  return `<a class="rail-link" href="${href}"${current}><span class="rail-glyph" aria-hidden="true">${glyph}</span><span class="rail-label">${label}</span><span class="sr-only">${label}</span></a>`;
}

function globalRail() {
  return `<aside class="global-rail" aria-label="全局导航">
    <a class="brand-mark" href="${pageUrl("workspace")}" aria-label="个人知识工作台首页">K</a>
    <nav class="rail-nav">
      ${railLink("workspace", pageUrl("workspace"), "空", "知识空间")}
      ${railLink("search", pageUrl("search"), "查", "搜索与问答")}
      ${railLink("graph", pageUrl("graph"), "图", "知识图谱")}
      ${railLink("agent", pageUrl("agent"), "A", "知识 Agent")}
      ${railLink("templates", pageUrl("templates"), "模", "任务模板")}
      ${railLink("settings", pageUrl("settings"), "设", "设置")}
    </nav>
    <button class="theme-button" type="button" data-theme-toggle aria-label="切换明暗主题"><span aria-hidden="true">◐</span></button>
  </aside>`;
}

function contextPanel(selected = "all") {
  return `<aside class="context-panel" aria-label="当前知识空间">
    <div class="context-head">
      <div class="workspace-label"><span>个人工作区</span><span>本地优先</span></div>
      <button class="space-switch" type="button" data-toast="空间切换器：可在多个独立知识空间间切换">
        <span class="space-monogram">AG</span><span><strong>Agent 学习</strong><small>36 个来源 · 218 个文档块</small></span><span class="chevron">⌄</span>
      </button>
    </div>
    <div class="context-scroll">
      <section class="context-section">
        <div class="context-title"><span>空间结构</span><span>+</span></div>
        <ul class="tree">
          <li><a class="tree-item ${selected === "all" ? "active" : ""}" href="${pageUrl("source")}"><span class="tree-icon">▦</span>全部知识<span class="tree-count">218</span></a></li>
          <li><a class="tree-item ${selected === "concept" ? "active" : ""}" href="${pageUrl("document")}"><span class="tree-icon">▾</span>01 核心概念<span class="tree-count">64</span></a></li>
          <li><a class="tree-item child" href="${pageUrl("document")}"><span class="tree-icon">⌁</span>Agent 架构<span class="tree-count">28</span></a></li>
          <li><a class="tree-item grandchild" href="${pageUrl("document")}"><span class="tree-icon">§</span>规划与执行<span class="tree-count">9</span></a></li>
          <li><a class="tree-item child" href="${pageUrl("document")}"><span class="tree-icon">⌁</span>上下文工程<span class="tree-count">19</span></a></li>
          <li><button class="tree-item" type="button" data-toast="已展开 02 工具与协议"><span class="tree-icon">›</span>02 工具与协议<span class="tree-count">83</span></button></li>
          <li><button class="tree-item" type="button" data-toast="已展开 03 实践案例"><span class="tree-icon">›</span>03 实践案例<span class="tree-count">71</span></button></li>
        </ul>
      </section>
      <section class="context-section">
        <div class="context-title"><span>来源</span><span>管理</span></div>
        <ul class="context-list">
          <li><a class="context-item" href="${pageUrl("source")}"><span class="format-badge">MD</span>本地笔记<span class="tree-count">17</span></a></li>
          <li><a class="context-item" href="${pageUrl("import")}"><span class="format-badge">PDF</span>论文与报告<span class="tree-count">12</span></a></li>
          <li><a class="context-item" href="${pageUrl("import")}"><span class="format-badge">IMG</span>截图与白板<span class="tree-count">7</span></a></li>
        </ul>
      </section>
      <section class="context-section">
        <div class="context-title"><span>最近打开</span></div>
        <ul class="context-list">
          <li><a class="context-item" href="${pageUrl("document")}">ReAct：推理与行动循环</a></li>
          <li><a class="context-item" href="${pageUrl("links")}">工具调用的权限边界</a></li>
        </ul>
      </section>
      <div class="context-alert"><span>!</span><span>1 个 PDF 等待 OCR 复核，不影响已完成内容的查询。</span></div>
    </div>
  </aside>`;
}

function topbar(title, parent = "Agent 学习", options = {}) {
  return `<header class="topbar">
    <div class="breadcrumb"><small>${parent}</small><strong>${title}</strong></div>
    <div class="top-actions">
      <button class="command-button" type="button" data-toast="命令面板：搜索、跳转或调用 Agent"><span>搜索或输入命令…</span><kbd>Ctrl K</kbd></button>
      ${options.scope === false ? "" : '<span class="scope-chip"><i></i>当前空间</span>'}
      ${options.model === false ? "" : '<span class="model-chip"><i></i>本地索引就绪</span>'}
      ${options.jobs ? '<a class="job-chip warning" href="?screen=import"><i></i>1 个任务需处理</a>' : ""}
    </div>
  </header>`;
}

function shell(content, options = {}) {
  const withContext = options.context !== false;
  return `<div class="app ${withContext ? "" : "no-context"}">
    ${globalRail()}
    ${withContext ? contextPanel(options.selected) : ""}
    <div class="main-shell">${topbar(options.title || screenTitles[screen], options.parent, options)}${content}</div>
  </div><div class="toast" role="status" aria-live="polite"></div>`;
}

function renderWorkspace() {
  return shell(`<main id="main-content" class="page">
    <section class="workspace-hero">
      <article class="panel hero-panel">
        <div class="eyebrow">Knowledge fieldwork</div>
        <h1>把资料变成可追溯的知识。</h1>
        <p>导入、组织、连接、检索和行动都在同一个个人知识工作台中完成。领域由你决定，系统不预设职业边界。</p>
        <div class="hero-actions"><a class="button primary" href="${pageUrl("source")}">进入 Agent 学习</a><a class="button secondary" href="${pageUrl("search")}">跨空间查询</a></div>
      </article>
      <aside class="panel attention-panel">
        <div class="eyebrow">需要关注</div><h2>今天有 3 件事值得处理</h2>
        <div class="attention-list">
          <a class="attention-item" href="${pageUrl("import")}"><span class="attention-symbol">1</span><span><strong>OCR 等待复核</strong><small>research-agent.pdf · 6 页</small></span><span>→</span></a>
          <a class="attention-item" href="${pageUrl("links")}"><span class="attention-symbol">7</span><span><strong>新增反向链接</strong><small>来自 4 个不同来源</small></span><span>→</span></a>
          <a class="attention-item" href="${pageUrl("agent")}"><span class="attention-symbol">A</span><span><strong>Agent 计划待确认</strong><small>整理工具调用章节</small></span><span>→</span></a>
        </div>
      </aside>
    </section>
    <div class="workspace-section-head"><h2>知识空间</h2><button class="button secondary" type="button" data-toast="新建空间：设置名称、目录与索引策略">＋ 新建空间</button></div>
    <section class="space-grid" aria-label="知识空间列表">
      <a class="space-card large" href="${pageUrl("source")}"><span class="space-index">01</span><span class="status-badge success">索引正常</span><h3>Agent 学习</h3><p>关于 Agent 架构、工具协议、上下文工程与实际案例的学习资料。</p><div class="space-card-meta"><span>36 个来源</span><span>218 个块</span><span>8 分钟前更新</span></div></a>
      <a class="space-card medium" href="${pageUrl("source")}"><span class="space-index">02</span><span class="status-badge">本地目录</span><h3>城市研究</h3><p>城市更新、公共空间与步行体验的长期观察。</p><div class="space-card-meta"><span>22 个来源</span><span>94 个块</span></div></a>
      <a class="space-card small" href="${pageUrl("source")}"><span class="space-index">03</span><span class="status-badge warning">2 项待复核</span><h3>产品方法</h3><p>研究、策略与交付方法。</p><div class="space-card-meta"><span>41 个来源</span></div></a>
      <a class="space-card medium" href="${pageUrl("source")}"><span class="space-index">04</span><span class="status-badge">图片为主</span><h3>摄影笔记</h3><p>作品、构图分析、场景记录与灵感来源。</p><div class="space-card-meta"><span>67 个来源</span><span>含 OCR</span></div></a>
      <button class="space-card small" type="button" data-toast="空间创建器：可关联本地目录，也可使用应用托管副本"><span class="space-index">＋</span><h3>创建新空间</h3><p>为一个学习主题、研究项目或长期兴趣建立独立边界。</p></button>
    </section>
    <div class="workspace-section-head"><h2>最近继续</h2><a class="button text" href="${pageUrl("document")}">查看全部</a></div>
    <section class="recent-strip">
      <a class="recent-item" href="${pageUrl("document")}"><span class="format-badge">MD</span><span><strong>ReAct：推理与行动循环</strong><small>Agent 学习 · 阅读至 64%</small></span></a>
      <a class="recent-item" href="${pageUrl("answer")}"><span class="format-badge">Q</span><span><strong>如何限制 Agent 工具权限？</strong><small>引用 5 条证据</small></span></a>
      <a class="recent-item" href="${pageUrl("graph")}"><span class="format-badge">G</span><span><strong>Agent 架构关系图</strong><small>已展开到 H3</small></span></a>
    </section>
  </main>`, {title: "我的知识工作台", parent: "个人工作区", context: false, jobs: true});
}

function renderSource() {
  return shell(`<main id="main-content" class="page compact">
    <header class="page-header"><div><div class="eyebrow">Space / sources</div><h1>Agent 学习</h1><p>空间是查询、权限、索引和 Agent 操作的默认边界；目录只是空间内部的组织方式。</p></div><div class="header-actions"><a class="button primary" href="${pageUrl("import")}">＋ 添加来源</a><button class="button secondary" type="button" data-toast="已打开空间设置摘要">空间设置</button></div></header>
    <section class="job-summary" aria-label="空间摘要">
      <article class="job-stat"><span>来源</span><strong>36</strong></article><article class="job-stat"><span>知识块</span><strong>218</strong></article><article class="job-stat"><span>显式链接</span><strong>93</strong></article><article class="job-stat"><span>反向链接</span><strong>127</strong></article>
    </section>
    <section class="panel">
      <div class="panel-head"><h2>来源与同步状态</h2><span class="status-badge success">最近同步 8 分钟前</span></div>
      <div class="job-table">
        <div class="job-row head"><span>来源</span><span>格式</span><span>状态</span><span>位置 / 边界</span><span>操作</span></div>
        <div class="job-row"><span class="job-file"><span class="format-badge">MD</span><strong>本地 Agent 笔记</strong></span><span>Markdown</span><span class="status-badge success">已索引</span><span class="mono">D:\Knowledge\Agents\</span><a class="button text" href="${pageUrl("document")}">打开</a></div>
        <div class="job-row"><span class="job-file"><span class="format-badge">PDF</span><strong>research-agent.pdf</strong></span><span>PDF</span><span class="status-badge warning">待复核</span><span>托管副本 · 24 页</span><a class="button text" href="${pageUrl("import")}">复核</a></div>
        <div class="job-row"><span class="job-file"><span class="format-badge">XLS</span><strong>agent-tools-comparison.xlsx</strong></span><span>Excel</span><span class="status-badge success">已索引</span><span>表格 · 3 个工作表</span><button class="button text" type="button" data-toast="已打开表格分块预览">预览</button></div>
        <div class="job-row"><span class="job-file"><span class="format-badge">IMG</span><strong>architecture-whiteboard.png</strong></span><span>图片</span><span class="status-badge success">OCR 完成</span><span>图片 · 1,920 × 1,080</span><button class="button text" type="button" data-toast="已打开 OCR 文本与原图对照">对照</button></div>
      </div>
    </section>
  </main>`, {title: "来源", selected: "all", jobs: true});
}

function renderImport() {
  return shell(`<main id="main-content" class="page compact">
    <header class="page-header"><div><div class="eyebrow">Import pipeline</div><h1>导入并建立可追溯索引</h1><p>先确认文件控制方式，再解析结构、生成知识块并保留精确来源定位。</p></div><span class="status-badge warning">步骤 2 / 4</span></header>
    <section class="wizard-layout">
      <article class="panel wizard-main">
        <div class="step-line" aria-label="导入进度"><i class="active"></i><i class="active"></i><i></i><i></i></div>
        <h2>选择文件控制方式</h2><p class="subtle">两种方式都可建立反向链接；差别在于原文件由谁保管、移动后如何恢复。</p>
        <div class="mode-grid">
          <button class="mode-choice selected" type="button" data-import-mode="linked"><span class="mode-symbol">↗</span><strong>关联本地文件</strong><small>保留原文件位置，系统只保存索引与定位信息。适合已有资料目录。</small></button>
          <button class="mode-choice" type="button" data-import-mode="managed"><span class="mode-symbol">□</span><strong>复制到工作区</strong><small>创建受管理副本，便于迁移和恢复；原文件不会被删除。</small></button>
        </div>
        <div class="field"><label for="import-path">来源位置</label><div class="field-row"><input id="import-path" value="D:\Knowledge\Agents\research-agent.pdf" readonly><button class="button secondary" type="button" data-toast="原型不会读取真实文件">重新选择</button></div></div>
        <div class="field"><label for="target-collection">导入到</label><div class="field-row"><input id="target-collection" value="Agent 学习 / 01 核心概念 / Agent 架构" readonly></div></div>
        <div class="approval-actions"><a class="button secondary" href="${pageUrl("source")}">取消</a><button class="button primary" type="button" data-start-import>开始解析</button></div>
      </article>
      <aside class="panel boundary-aside"><div class="panel-body"><div class="eyebrow">Source boundary</div><h2>原文、索引和引用分开保存。</h2><div class="boundary-flow"><div class="boundary-step"><b>01</b><span><strong>原始文件</strong><small>保持在本地目录，或复制为托管副本</small></span></div><div class="boundary-step"><b>02</b><span><strong>解析结果</strong><small>标题、表格、页码、图片区域与 OCR</small></span></div><div class="boundary-step"><b>03</b><span><strong>知识索引</strong><small>全文、向量、关系及版本指纹</small></span></div></div><div class="boundary-rule"></div><div class="safe-note">打开引用时优先回到原文件；路径变化时使用内容指纹提示重新关联，不静默指向错误文件。</div></div></aside>
    </section>
    <section class="panel" style="margin-top:18px"><div class="panel-head"><h2>当前解析任务</h2><span class="status-badge warning">76%</span></div><div class="panel-body"><div class="job-summary"><article class="job-stat"><span>已解析页</span><strong>18 / 24</strong><div class="progress-track"><i></i></div></article><article class="job-stat"><span>识别标题</span><strong>42</strong></article><article class="job-stat"><span>生成知识块</span><strong>87</strong></article><article class="job-stat"><span>需人工复核</span><strong>6</strong></article></div></div></section>
  </main>`, {title: "导入来源", selected: "all", jobs: true});
}

const panelContent = {
  outline: `<ul class="outline-list"><li class="outline-item active">H1 ReAct：推理与行动循环</li><li class="outline-item depth-2">H2 为什么需要交替循环</li><li class="outline-item depth-3">H3 观察如何改变下一步计划</li><li class="outline-item depth-2">H2 工具调用的控制边界</li><li class="outline-item depth-3">H3 最小权限</li><li class="outline-item depth-3">H3 失败与恢复</li><li class="outline-item depth-2">H2 与计划执行架构的关系</li></ul>`,
  links: `<ul class="relation-list"><li class="relation-item"><small><span class="relation-type">LINKS_TO</span>显式链接</small><strong>工具调用的权限边界</strong><p>定位到 H2「确认与最小权限」；可回到本地 Markdown 第 84 行。</p></li><li class="relation-item"><small><span class="relation-type">SUPPORTS</span>证据关系</small><strong>Agent 安全基线</strong><p>该章节为“执行前确认”提供实现依据。</p></li><li class="relation-item"><small><span class="relation-type">EXTENDS</span>语义关系</small><strong>计划—执行—复核循环</strong><p>自动建议，尚未确认进入正式关系。</p></li></ul>`,
  backlinks: `<ul class="relation-list"><li class="relation-item"><small><span class="relation-type">BACKLINK</span>来自 Agent 学习</small><strong>工具协议比较表 / 风险列</strong><p>引用“动作与观察必须分离记录”，来自 Excel 工作表 Tools，第 18 行。</p></li><li class="relation-item"><small><span class="relation-type">BACKLINK</span>来自 产品方法</small><strong>复杂任务的可观察性</strong><p>引用当前文档 H3「观察如何改变下一步计划」。</p></li><li class="relation-item"><small><span class="relation-type">BACKLINK</span>来自 城市研究</small><strong>研究资料自动整理试验</strong><p>将 ReAct 作为研究助手工作流的参考。</p></li></ul>`,
  version: `<ul class="relation-list"><li class="relation-item"><small>当前来源</small><strong class="mono">D:\Knowledge\Agents\ReAct.md</strong><p>SHA-256 指纹已记录 · UTF-8 · 128 行</p></li><li class="relation-item"><small>精确定位</small><strong>第 42–88 行</strong><p>如果本地路径变化，将请求重新关联，不会改写原文件。</p></li><li class="relation-item"><small>版本</small><strong>v7 · 2026-08-24 21:18</strong><p>相较 v6：新增“失败与恢复”小节。</p></li></ul>`
};

function renderDocument() {
  const initialTab = screen === "links" ? "backlinks" : "outline";
  return shell(`<main id="main-content" class="document-layout">
    <article class="document-main">
      <div class="document-meta"><span class="format-badge">MD</span><span>Agent 学习 / 01 核心概念 / Agent 架构</span><span>·</span><span>更新于昨天 21:18</span><span class="status-badge success">来源可访问</span></div>
      <h1>ReAct：推理与行动循环</h1><p class="document-lede">Agent 不只生成答案，还在“思考下一步—调用工具—读取观察”之间循环；每一步都需要边界、证据与可恢复性。</p>
      <div class="article">
        <h2 id="why">为什么需要交替循环</h2><p>纯推理容易脱离环境，纯行动又缺少目标。ReAct 将两者交替组织，使新的观察能够改变后续计划<span class="inline-cite">1</span>。在知识工作台中，这意味着每次文件操作都应留下输入、动作、观察与结果。</p>
        <h3>观察如何改变下一步计划</h3><p>如果检索结果不足，Agent 应主动缩小范围、改用关键词检索或向用户说明证据缺口，而不是把低置信度结果包装成事实。</p>
        <blockquote>可执行不等于可自动执行。动作是否需要确认，取决于影响范围、可逆性与数据边界。</blockquote>
        <h2 id="tools">工具调用的控制边界</h2><p>读取当前空间属于低风险动作；批量移动、覆盖内容或访问空间外文件则必须提升风险级别，并在执行前展示计划和差异。</p>
        <h3>最小权限</h3><p>一次任务只授权完成该任务所需的空间、来源和工具。用户可以拒绝计划中的单个步骤，而不必取消整个任务。</p>
        <h3>失败与恢复</h3><p>所有写操作都生成审计记录与可撤销点。局部失败时保留已完成结果，并明确列出未完成项和重试范围。</p>
        <h2 id="planner">与计划执行架构的关系</h2><p>复杂任务可分为规划、确认、执行、验证和回滚五个阶段。查看 <a class="inline-cite" href="${pageUrl("agent")}" aria-label="打开 Agent 计划">A</a> 计划示例，或进入 <a href="${pageUrl("graph-focus")}" style="color:var(--brand)">图谱聚焦视图</a> 查看本节的上下游关系。</p>
      </div>
    </article>
    <aside class="knowledge-panel" aria-label="文档知识面板">
      <div class="panel-tabs" role="tablist"><button class="panel-tab ${initialTab === "outline" ? "active" : ""}" data-knowledge-tab="outline" role="tab">大纲</button><button class="panel-tab ${initialTab === "links" ? "active" : ""}" data-knowledge-tab="links" role="tab">链接</button><button class="panel-tab ${initialTab === "backlinks" ? "active" : ""}" data-knowledge-tab="backlinks" role="tab">反链 7</button><button class="panel-tab" data-knowledge-tab="version" role="tab">来源</button></div>
      <div class="knowledge-panel-body" data-knowledge-panel>${panelContent[initialTab]}</div>
    </aside>
  </main>`, {title: screen === "links" ? "链接与反向链接" : "ReAct：推理与行动循环", selected: "concept", jobs: true});
}

function resultList() {
  return `<div class="results-head"><span>在 4 个空间中找到 26 条结果</span><span>混合排序 · 38 ms</span></div><div class="result-list">
    <a class="result-item active" href="${pageUrl("answer")}"><div class="result-top"><span class="format-badge">MD</span><strong>工具调用的权限边界</strong><span class="result-score">0.94</span></div><p>任何写操作都应展示范围、差异与回滚点；高影响动作必须逐项确认……</p><div class="result-meta"><span>Agent 学习</span><span>H2 确认与最小权限</span><span>关键词 + 向量 + 图关系</span></div></a>
    <a class="result-item" href="${pageUrl("document")}"><div class="result-top"><span class="format-badge">MD</span><strong>ReAct：推理与行动循环</strong><span class="result-score">0.89</span></div><p>可执行不等于可自动执行。动作是否需要确认，取决于影响范围……</p><div class="result-meta"><span>Agent 学习</span><span>H2 工具调用的控制边界</span></div></a>
    <button class="result-item" type="button" data-toast="已选择 Excel 结果，可精确定位到 Tools 工作表第 18 行"><div class="result-top"><span class="format-badge">XLS</span><strong>Agent 工具风险比较</strong><span class="result-score">0.82</span></div><p>按读取、创建、修改、覆盖、删除分级，并记录是否可以回滚。</p><div class="result-meta"><span>Agent 学习</span><span>Tools!A18:F24</span></div></button>
    <button class="result-item" type="button" data-toast="已选择图片 OCR 结果，可打开原图高亮区域"><div class="result-top"><span class="format-badge">IMG</span><strong>工具权限白板</strong><span class="result-score">0.76</span></div><p>图片 OCR：scope → plan → approve → execute → audit。</p><div class="result-meta"><span>产品方法</span><span>区域 x:420 y:118 w:610 h:280</span></div></button>
  </div>`;
}

function renderSearch() {
  const answerMode = screen === "answer";
  return shell(`<main id="main-content" class="search-layout">
    <section class="search-column" aria-label="检索结果">
      <div class="query-area"><div class="search-tabs"><a class="search-tab ${answerMode ? "" : "active"}" href="${pageUrl("search")}">搜索</a><a class="search-tab ${answerMode ? "active" : ""}" href="${pageUrl("answer")}">带证据回答</a></div><div class="query-box"><span aria-hidden="true">⌕</span><input aria-label="查询" value="Agent 调用工具时如何限制权限？"><a class="button primary" href="${pageUrl(answerMode ? "answer" : "search")}">查询</a></div><div class="query-filters"><button class="filter-chip active" type="button">全部空间</button><button class="filter-chip" type="button" data-toast="已限制为 Agent 学习空间">Agent 学习</button><button class="filter-chip active" type="button">全部格式</button><button class="filter-chip" type="button" data-toast="时间筛选：最近一年">时间不限</button></div></div>
      ${resultList()}
    </section>
    <article class="evidence-view">
      ${answerMode ? `<div class="evidence-kicker"><span class="status-badge success">5 条证据</span><span>生成耗时 1.4 s · 可追溯</span></div><h1>用“范围—计划—确认—审计”限制工具权限。</h1><div class="answer-body"><p>可以把控制分成四层：先限定可访问的空间和文件；再把目标拆成可检查的动作；对写入、移动或删除等高影响步骤逐项确认；最后保存输入、差异、结果和撤销点。</p><h2>建议的执行规则</h2><ol><li><strong>默认最小范围：</strong>只读取当前知识空间，跨空间访问需要明确选择。</li><li><strong>按风险分级：</strong>读取为 R0，创建为 R1，修改/移动为 R2，覆盖/删除为 R3。</li><li><strong>允许部分批准：</strong>用户可以取消计划中的一个动作，其余动作仍可执行。</li><li><strong>验证与回滚：</strong>执行后验证索引和链接，并提供可见的撤销入口。</li></ol><div class="evidence-card"><strong><span class="inline-cite">1</span> 工具调用的权限边界 · H2</strong><p>“写操作必须展示影响范围、预期差异和回滚点。” <a href="${pageUrl("document")}" style="color:var(--brand)">打开原文定位 →</a></p></div><div class="evidence-card"><strong><span class="inline-cite">2</span> Agent 工具风险比较 · Tools!A18:F24</strong><p>表格将工具动作按可逆性和影响范围分为四级。 <button class="button text" type="button" data-toast="将打开本地 Excel 并定位到 Tools!A18:F24">在本地文件中打开 →</button></p></div><div class="insufficient-box"><h3>仍缺少什么？</h3><p>当前资料没有给出远程系统凭证轮换策略。系统不会补写结论，建议导入安全规范或将范围限制在本地文件操作。</p></div></div>` : `<div class="evidence-kicker"><span class="status-badge">结果预览</span><span>选择左侧条目查看原文上下文</span></div><h1>工具调用的权限边界</h1><div class="evidence-card"><strong>匹配段落 · H2 确认与最小权限</strong><p>Agent 在执行前应提供结构化计划：动作、目标、影响范围、风险级别和撤销方式。用户可逐项取消，而非只能全部接受或全部拒绝。</p></div><div class="answer-body"><h2>为什么排在第一位</h2><p>该结果同时命中“工具”“权限”关键词，语义与问题接近，并与 ReAct 文档及风险比较表存在已确认关系。混合排序保留了每一路召回信号，方便诊断。</p><p><a class="button primary" href="${pageUrl("answer")}">基于 5 条证据生成回答</a> <a class="button secondary" href="${pageUrl("document")}">打开原文</a></p></div>`}
    </article>
  </main>`, {title: answerMode ? "证据化回答" : "统一搜索", context: false, jobs: true});
}

function graphLines(focus) {
  if (focus) return `<svg class="graph-lines" viewBox="0 0 1000 650" preserveAspectRatio="none" aria-hidden="true"><line x1="170" y1="135" x2="430" y2="300"/><line x1="170" y1="475" x2="430" y2="330"/><line class="link-edge" x1="520" y1="315" x2="740" y2="120"/><line class="relation-edge" x1="520" y1="315" x2="750" y2="300"/><line class="suggest-edge" x1="520" y1="315" x2="735" y2="495"/></svg>`;
  return `<svg class="graph-lines" viewBox="0 0 1000 650" preserveAspectRatio="none" aria-hidden="true"><line x1="135" y1="315" x2="320" y2="155"/><line x1="135" y1="315" x2="320" y2="425"/><line x1="390" y1="155" x2="515" y2="85"/><line x1="390" y1="155" x2="515" y2="220"/><line x1="390" y1="425" x2="515" y2="385"/><line x1="390" y1="425" x2="515" y2="505"/><line x1="585" y1="85" x2="735" y2="70"/><line x1="585" y1="85" x2="735" y2="170"/><line x1="585" y1="220" x2="735" y2="275"/><line x1="585" y1="385" x2="735" y2="405"/><line x1="585" y1="505" x2="735" y2="505"/><line class="link-edge" x1="770" y1="170" x2="555" y2="385"/><line class="relation-edge" x1="790" y1="275" x2="865" y2="275"/></svg>`;
}

function renderGraph() {
  const focus = screen === "graph-focus";
  return shell(`<main id="main-content" class="graph-page">
    <div class="graph-toolbar"><div class="segmented" aria-label="图谱视图"><a class="segment ${focus ? "" : "active"}" href="${pageUrl("graph")}">结构</a><button class="segment" type="button" data-toast="关系视图：突出引用、支持、冲突与扩展关系">关系</button><a class="segment ${focus ? "active" : ""}" href="${pageUrl("graph-focus")}">聚焦</a></div><div class="header-actions"><button class="button secondary" type="button" data-collapse-graph>${focus ? "显示上下文" : "折叠 H2/H3"}</button><button class="button secondary" type="button" data-toast="筛选器：节点类型、关系类型、来源、置信度">筛选</button><button class="button primary" type="button" data-toast="已保存当前图谱视图">保存视图</button></div></div>
    <div class="graph-workspace"><section class="graph-stage ${focus ? "focus-stage" : ""}" aria-label="可交互知识图谱">
      ${graphLines(focus)}
      <button class="graph-node n-space" type="button" data-toast="空间：Agent 学习"><span class="node-dot"></span><span><small>Space</small><strong>Agent 学习</strong></span></button>
      <button class="graph-node n-col-1" type="button" data-toast="集合：01 核心概念"><span class="node-dot"></span><span><small>Collection</small><strong>01 核心概念</strong></span></button>
      ${focus ? "" : '<button class="graph-node n-col-2" type="button" data-toast="集合：02 工具与协议"><span class="node-dot"></span><span><small>Collection</small><strong>02 工具与协议</strong></span></button>'}
      <button class="graph-node document n-doc-1" type="button" data-expand-branch aria-expanded="true"><span class="node-dot"></span><span><small>Document</small><strong>ReAct 循环</strong></span></button>
      ${focus ? "" : '<button class="graph-node document n-doc-2" type="button" data-toast="文档：规划与执行架构"><span class="node-dot"></span><span><small>Document</small><strong>规划与执行架构</strong></span></button><button class="graph-node document n-doc-3" type="button" data-toast="文档：工具权限基线"><span class="node-dot"></span><span><small>Document</small><strong>工具权限基线</strong></span></button><button class="graph-node document n-doc-4" type="button" data-toast="文档：MCP 协议"><span class="node-dot"></span><span><small>Document</small><strong>MCP 协议</strong></span></button>'}
      <button class="graph-node heading n-h-1" type="button" data-branch-child data-toast="H2：为什么需要交替循环"><span class="node-dot"></span><span><small>Heading · H2</small><strong>为什么交替循环</strong></span></button>
      <button class="graph-node heading n-h-2" type="button" data-branch-child data-toast="H3：观察改变计划"><span class="node-dot"></span><span><small>Heading · H3</small><strong>观察改变计划</strong></span></button>
      ${focus ? "" : '<button class="graph-node heading n-h-3" type="button" data-branch-child data-toast="H2：工具调用控制边界"><span class="node-dot"></span><span><small>Heading · H2</small><strong>工具调用边界</strong></span></button><button class="graph-node heading n-h-4" type="button" data-toast="H2：确认与最小权限"><span class="node-dot"></span><span><small>Heading · H2</small><strong>确认与最小权限</strong></span></button><button class="graph-node heading n-h-5" type="button" data-toast="H2：上下文协议"><span class="node-dot"></span><span><small>Heading · H2</small><strong>上下文协议</strong></span></button>'}
      <button class="graph-node entity n-entity" type="button" data-toast="实体：最小权限原则"><span class="node-dot"></span><span><small>Entity</small><strong>最小权限原则</strong></span></button>
    </section><aside class="graph-side"><div class="graph-side-head"><div class="eyebrow">Graph inspector</div><h2>${focus ? "ReAct 循环" : "结构与关系同时可见"}</h2><p class="subtle">${focus ? "聚焦后仍保留上级路径、下级标题和跨文档关系。" : "标题层级来自源文档；跨文档关系带类型和证据。"}</p></div><div class="graph-side-body"><ul class="legend"><li><span class="legend-line"></span>包含 / 标题层级</li><li><span class="legend-line link"></span>显式链接 / 引用</li><li><span class="legend-line relation"></span>已确认语义关系</li><li><span class="legend-line suggest"></span>待确认建议</li></ul><div class="edge-card"><div class="edge-path">ReAct 循环 <span>CONTAINS</span> 工具调用边界</div><p>来自 Markdown H1 → H2 结构，可定位到第 42 行。</p></div><div class="edge-card"><div class="edge-path">观察改变计划 <span>SUPPORTS</span> 风险复核</div><p>已确认关系 · 证据为当前文档第 18–26 行。</p></div><div class="edge-card"><div class="edge-path">工具调用边界 <span>LINKS_TO</span> 最小权限原则</div><p>显式链接 · 打开时返回原文对应标题，而非只打开文档首页。</p></div><p style="margin-top:18px"><a class="button primary" href="${pageUrl("document")}">打开节点原文</a></p></div></aside></div>
  </main>`, {title: focus ? "图谱 · ReAct 聚焦" : "Agent 学习知识图谱", context: false, jobs: true});
}

function renderAgent() {
  return shell(`<main id="main-content" class="agent-layout">
    <aside class="agent-history"><h2>最近任务</h2><button class="run-item active" type="button"><strong>整理工具调用章节</strong><small>等待确认 · 现在</small></button><button class="run-item" type="button" data-toast="已打开历史任务摘要"><strong>查找重复的概念说明</strong><small>已完成 · 昨天</small></button><button class="run-item" type="button" data-toast="已打开历史任务摘要"><strong>生成学习路线</strong><small>已撤销 · 3 天前</small></button></aside>
    <section class="agent-conversation"><div class="eyebrow">Scoped agent</div><h1>对话式管理知识</h1><p class="subtle">当前边界：Agent 学习 / 02 工具与协议。Agent 不能访问其他空间。</p><div class="message user"><p>把工具调用相关资料整理成一篇结构清晰的入口文档，保留原文链接，不要删除文件。</p></div><div class="message"><p>我找到了 8 篇相关文档和 1 张比较表。右侧是执行计划：将创建 1 篇入口文档、补充 3 条显式链接，并为 2 个近义概念添加待确认关系。</p></div><div class="agent-input"><textarea aria-label="给 Agent 的新指令" placeholder="继续说明目标或调整范围…"></textarea><button class="button primary" type="button" data-toast="原型已记录补充指令，但不会操作真实文件">发送</button></div></section>
    <section class="agent-review"><div class="review-head"><div><div class="eyebrow">Approval required</div><h2>确认执行计划</h2><p>取消任意步骤后仍可执行其余项目。</p></div><span class="risk-label">最高风险 R2</span></div>
      <div class="plan-list" data-plan-list>
        <label class="plan-item"><input type="checkbox" checked data-plan-check><span><strong>创建入口文档</strong><small>新增 Agent 学习/02 工具与协议/工具调用索引.md，不改动原文。</small></span><span class="status-badge">R1</span></label>
        <label class="plan-item"><input type="checkbox" checked data-plan-check><span><strong>写入 3 条显式链接</strong><small>修改 2 个 Markdown 文件；每处变更都保留行级差异和撤销点。</small></span><span class="status-badge warning">R2</span></label>
        <label class="plan-item"><input type="checkbox" checked data-plan-check><span><strong>提交 2 条关系建议</strong><small>只写入建议队列，不直接成为已确认语义关系。</small></span><span class="status-badge">R1</span></label>
        <label class="plan-item"><input type="checkbox" checked data-plan-check><span><strong>重建受影响索引</strong><small>仅更新 3 个文件对应的全文、向量与图关系索引。</small></span><span class="status-badge">R0</span></label>
      </div>
      <div class="diff"><div class="diff-row"><span>新增</span><code>02 工具与协议/工具调用索引.md</code></div><div class="diff-row"><span>修改</span><code>ReAct.md · +1 link ／ MCP.md · +2 links</code></div><div class="diff-row"><span>不会执行</span><code>删除、覆盖原始文件、访问其他空间</code></div></div>
      <div data-execution-result></div><div class="approval-actions"><button class="button secondary" type="button" data-agent-cancel>全部取消</button><button class="button primary" type="button" data-agent-confirm>确认执行 4 项</button></div>
    </section>
  </main>`, {title: "知识 Agent · 计划确认", context: false, jobs: true});
}

function renderTemplates() {
  return shell(`<main id="main-content" class="page compact"><header class="page-header"><div><div class="eyebrow">Optional workflows</div><h1>从任务模板开始，也可以自由对话。</h1><p>模板只是预设目标、范围和输出格式，不改变知识空间的通用定位；任何模板都可复制和自定义。</p></div><button class="button primary" type="button" data-toast="已进入自定义模板编辑器">＋ 创建模板</button></header><section class="template-layout"><div class="template-list">
    <article class="template-card"><span class="template-icon">研</span><span><h3>资料综述</h3><p>从选定空间归纳观点、分歧、证据缺口与来源。</p></span><button class="button secondary" type="button" data-toast="已用“资料综述”模板创建新任务">使用</button></article>
    <article class="template-card"><span class="template-icon">整</span><span><h3>知识整理</h3><p>识别重复主题，提出目录、链接和关系调整计划。</p></span><a class="button secondary" href="${pageUrl("agent")}">使用</a></article>
    <article class="template-card"><span class="template-icon">学</span><span><h3>学习教练</h3><p>根据现有资料生成学习路径、问题与阶段复盘。</p></span><button class="button secondary" type="button" data-toast="已用“学习教练”模板创建新任务">使用</button></article>
    <article class="template-card"><span class="template-icon">比</span><span><h3>多来源比较</h3><p>按用户定义维度比较 PDF、表格、笔记和图片证据。</p></span><button class="button secondary" type="button" data-toast="已用“多来源比较”模板创建新任务">使用</button></article>
    <article class="template-card optional"><span class="template-icon">PM</span><span><h3>产品面试训练</h3><p>可选领域模板：使用选定资料进行追问、评分与复盘。</p></span><button class="button secondary" type="button" data-toast="PM 面试只是可选模板，不是产品默认入口">使用</button></article>
  </div><aside class="panel template-info"><div class="eyebrow">Template anatomy</div><h2>模板由可审查的配置组成。</h2><p class="subtle">启动前可以修改目标、空间范围、允许工具、风险上限和期望输出。</p><div class="tool-list"><span class="tool-chip">scope</span><span class="tool-chip">instructions</span><span class="tool-chip">tools</span><span class="tool-chip">risk_policy</span><span class="tool-chip">output_schema</span></div><div class="evidence-card"><strong>默认安全策略</strong><p>只读当前空间；需要写入时生成计划并等待确认；所有结果保留来源与撤销点。</p></div><button class="button secondary" type="button" data-toast="已打开模板 JSON 预览">查看配置结构</button></aside></section></main>`, {title: "任务模板", context: false});
}

function renderSettings() {
  return shell(`<main id="main-content" class="page compact"><header class="page-header"><div><div class="eyebrow">Governance</div><h1>设置、边界与可恢复性</h1><p>默认策略应清楚说明数据在哪里、索引如何生成、模型能看到什么，以及失败后怎么恢复。</p></div><a class="button secondary" href="${pageUrl("recovery")}">查看恢复流程</a></header><section class="settings-layout"><nav class="panel settings-menu" aria-label="设置分类"><button class="active" type="button">存储与来源</button><button type="button" data-toast="已切换到搜索与索引设置">搜索与索引</button><button type="button" data-toast="已切换到模型设置">模型</button><button type="button" data-toast="已切换到 Agent 权限设置">Agent 权限</button><button type="button" data-toast="已切换到备份与恢复设置">备份与恢复</button></nav><section class="panel settings-content"><div class="panel-head" style="padding-inline:0;padding-top:0"><h2>存储与来源</h2><span class="status-badge success">健康</span></div>
    <div class="setting-row"><div><h3>默认导入方式</h3><p>决定新增来源默认关联原文件，还是复制为工作区托管副本。</p></div><div class="setting-control"><select class="select-control" aria-label="默认导入方式"><option>每次询问</option><option>关联本地文件</option><option>复制到工作区</option></select></div></div>
    <div class="setting-row"><div><h3>工作区数据目录</h3><p>保存配置、解析产物、索引、图关系和审计记录。</p></div><div class="setting-control"><div class="field-row"><input value="D:\KnowledgeHub\workspace" readonly><button class="button secondary" type="button" data-toast="原型不会修改真实目录">更改</button></div></div></div>
    <div class="setting-row"><div><h3>原文件访问</h3><p>打开引用前检查路径与内容指纹，避免跳到错误版本。</p></div><div class="setting-control"><select class="select-control"><option>路径 + 指纹双重校验</option><option>仅路径校验</option></select></div></div>
    <div class="setting-row"><div><h3>索引更新</h3><p>文件变化时增量更新，不重建整个知识库。</p></div><div class="setting-control"><select class="select-control"><option>自动监听，失败时通知</option><option>仅手动更新</option></select></div></div>
    <div class="danger-zone"><strong>数据移除不是一个含糊的“删除”按钮</strong><p>系统必须分别说明：仅清除可重建索引、从空间移除来源记录、删除工作区托管副本、请求用户在操作系统中删除原始文件。前三项都不能静默升级为最后一项。</p><div class="tool-list"><span class="tool-chip">仅清除索引</span><span class="tool-chip">移除来源记录</span><span class="tool-chip">删除托管副本</span><span class="tool-chip">原文件需单独授权</span></div><button class="button danger" type="button" data-toast="影响预览会区分索引、来源记录、托管副本和原始文件；本原型没有执行任何删除">查看四类影响范围</button></div>
  </section></section></main>`, {title: "设置", context: false, scope: false, model: false});
}

function renderRecovery() {
  return shell(`<main id="main-content" class="page compact"><header class="page-header"><div><div class="eyebrow">Failure recovery</div><h1>失败要可解释，也要能继续。</h1><p>将局部失败与完整任务分开处理，保留成功结果，并明确重试不会做什么。</p></div><span class="status-badge danger">1 项失败</span></header><section class="recovery-grid"><article class="panel recovery-main"><div class="recovery-symbol">!</div><h2>research-agent.pdf 的 6 页 OCR 置信度过低</h2><p>文档其余 18 页已完成解析并可检索。失败页未生成可引用知识块，系统没有用猜测文本填充。</p><div class="diagnostic"><strong>诊断信息</strong><code>OCR_LOW_CONFIDENCE · pages 7, 8, 12, 13, 19, 20 · threshold 0.82</code></div><div class="recovery-steps"><div class="recovery-step"><b>01</b><strong>保留成功结果</strong><small>18 页、67 个块</small></div><div class="recovery-step"><b>02</b><strong>只重试失败页</strong><small>不重复解析成功页</small></div><div class="recovery-step"><b>03</b><strong>人工对照复核</strong><small>原图与 OCR 并排</small></div></div><div class="approval-actions"><button class="button secondary" type="button" data-toast="已打开原图与 OCR 对照复核">人工复核</button><button class="button primary" type="button" data-retry>重试失败的 6 页</button></div><div data-retry-result></div></article><aside class="panel safety-panel"><div class="eyebrow">Recovery boundary</div><h2>这次重试的影响范围</h2><div class="safety-list"><div class="safety-row"><span>读取</span><strong>6 页图片</strong></div><div class="safety-row"><span>替换</span><strong>0 个成功块</strong></div><div class="safety-row"><span>删除</span><strong>0 个文件</strong></div><div class="safety-row"><span>预计耗时</span><strong>约 45 秒</strong></div></div><div class="safe-note" style="margin-top:18px">重试仍失败时可跳过这些页；查询会明确标注该文档证据不完整。</div></aside></section></main>`, {title: "导入失败恢复", context: false, scope: false, jobs: true});
}

function renderMobile() {
  document.body.classList.add("prototype-mobile");
  return `<main id="main-content" class="mobile-stage"><section class="mobile-frame" aria-label="移动端原型"><div class="mobile-status"><span>9:41</span><span>知识工作台 · 本地</span><span>100%</span></div><header class="mobile-top"><span class="space-monogram">AG</span><span><strong>Agent 学习</strong><small>36 个来源 · 索引正常</small></span><button class="icon-button" style="margin-left:auto" type="button" data-theme-toggle aria-label="切换主题">◐</button></header><div class="mobile-content">
    <section class="mobile-view" data-mobile-view="home"><div class="eyebrow">Continue fieldwork</div><h1 style="font-size:28px;letter-spacing:-.04em">继续你的知识现场</h1><article class="mobile-card"><h2>ReAct：推理与行动循环</h2><p>昨天阅读至 64% · 7 条新反向链接</p><p style="margin-top:10px"><button class="button primary" type="button" data-mobile-open="read">继续阅读</button></p></article><article class="mobile-card"><h2>1 个计划等待确认</h2><p>Agent 准备创建工具调用入口文档。</p><p style="margin-top:10px"><button class="button secondary" type="button" data-mobile-open="agent">查看计划</button></p></article></section>
    <section class="mobile-view" data-mobile-view="spaces" hidden><div class="eyebrow">Spaces</div><h1 style="font-size:26px">知识空间</h1><article class="mobile-card"><h2>Agent 学习</h2><p>36 个来源 · 218 个块 · 8 分钟前更新</p></article><article class="mobile-card"><h2>城市研究</h2><p>22 个来源 · 94 个块</p></article><article class="mobile-card"><h2>产品方法</h2><p>41 个来源 · 2 项待复核</p></article><article class="mobile-card"><h2>摄影笔记</h2><p>67 个来源 · 图片 OCR 已启用</p></article></section>
    <section class="mobile-view" data-mobile-view="search" hidden><div class="mobile-search"><input value="Agent 工具权限" aria-label="移动端搜索"><button class="button primary" type="button" data-toast="移动端搜索已刷新">查询</button></div><div class="mobile-scope"><span class="filter-chip active">当前空间</span><span class="filter-chip">全部格式</span></div><article class="mobile-card mobile-result"><span class="format-badge">MD</span><span><h2>工具调用的权限边界</h2><p>写操作必须展示范围、差异与回滚点…</p><button class="button text" type="button" data-mobile-open="read">打开原文</button></span></article><article class="mobile-card mobile-result"><span class="format-badge">XLS</span><span><h2>Agent 工具风险比较</h2><p>定位到 Tools!A18:F24</p></span></article></section>
    <section class="mobile-view mobile-article" data-mobile-view="read" hidden><button class="button text" type="button" data-mobile-open="search">← 返回结果</button><div class="document-meta"><span class="format-badge">MD</span><span>Agent 学习 / Agent 架构</span></div><h1>ReAct：推理与行动循环</h1><p>Agent 在思考下一步、调用工具和读取观察之间循环。新的观察应改变后续计划。</p><h2>工具调用的控制边界</h2><p>读取当前空间属于低风险动作；移动、覆盖或空间外访问必须展示影响范围并等待确认。</p><div class="mobile-sheet"><strong>反向链接 · 7</strong><p>3 条来自 Agent 学习，2 条来自产品方法，1 条来自城市研究，1 条来自工具比较表。</p><button class="button secondary" type="button" data-toast="已展开反向链接来源">查看全部反链</button></div></section>
    <section class="mobile-view" data-mobile-view="agent" hidden><div class="eyebrow">Approval required</div><h1 style="font-size:26px">整理工具调用章节</h1><p class="subtle">当前边界：Agent 学习。最高风险 R2。</p><div class="mobile-plan"><label><input type="checkbox" checked><span><strong>创建入口文档</strong><small style="display:block;color:var(--muted)">新增 1 个 Markdown 文件</small></span></label><label><input type="checkbox" checked><span><strong>写入 3 条链接</strong><small style="display:block;color:var(--muted)">修改 2 个文件，可撤销</small></span></label><label><input type="checkbox" checked><span><strong>重建局部索引</strong><small style="display:block;color:var(--muted)">不影响其他空间</small></span></label></div><div class="mobile-action-bar"><button class="button secondary" type="button" data-toast="计划已暂存">稍后</button><button class="button primary" type="button" data-toast="已确认 3 项；移动端可随时查看执行记录">确认 3 项</button></div></section>
    <section class="mobile-view" data-mobile-view="more" hidden><div class="eyebrow">More</div><h1 style="font-size:26px">更多</h1><article class="mobile-card"><h2>导入任务</h2><p>1 个 PDF 等待 OCR 复核</p></article><article class="mobile-card"><h2>任务模板</h2><p>资料综述、知识整理、学习教练及自定义模板</p></article><article class="mobile-card"><h2>设置与恢复</h2><p>存储、索引、模型、Agent 权限和备份</p></article><a class="button secondary" href="${pageUrl("workspace")}">返回桌面端原型</a></section>
  </div><nav class="mobile-bottom" aria-label="移动端主导航"><button class="mobile-nav active" data-mobile-nav="home"><span>⌂</span>首页</button><button class="mobile-nav" data-mobile-nav="spaces"><span>▦</span>空间</button><button class="mobile-nav" data-mobile-nav="search"><span>⌕</span>查询</button><button class="mobile-nav" data-mobile-nav="agent"><span>A</span>Agent</button><button class="mobile-nav" data-mobile-nav="more"><span>•••</span>更多</button></nav></section></main><div class="toast" role="status" aria-live="polite"></div>`;
}

const renderers = {
  workspace: renderWorkspace,
  source: renderSource,
  import: renderImport,
  document: renderDocument,
  links: renderDocument,
  search: renderSearch,
  answer: renderSearch,
  graph: renderGraph,
  "graph-focus": renderGraph,
  agent: renderAgent,
  templates: renderTemplates,
  settings: renderSettings,
  recovery: renderRecovery,
  mobile: renderMobile
};

root.innerHTML = renderers[screen]();

let toastTimer;
function showToast(message) {
  const toast = document.querySelector(".toast");
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  liveStatus.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

document.querySelectorAll("[data-toast]").forEach((element) => {
  element.addEventListener("click", () => showToast(element.dataset.toast));
});

const savedTheme = localStorage.getItem("knowledge-prototype-theme");
if (savedTheme) document.documentElement.dataset.theme = savedTheme;
document.querySelectorAll("[data-theme-toggle]").forEach((button) => button.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("knowledge-prototype-theme", next);
  showToast(`已切换为${next === "dark" ? "深色" : "浅色"}主题`);
}));

document.querySelectorAll("[data-import-mode]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-import-mode]").forEach((choice) => choice.classList.remove("selected"));
  button.classList.add("selected");
  showToast(button.dataset.importMode === "linked" ? "将关联原文件并记录内容指纹" : "将复制到受管理工作区，原文件保持不变");
}));

document.querySelector("[data-start-import]")?.addEventListener("click", () => {
  showToast("解析任务已创建：将识别标题、页码、表格、图片区域与 OCR");
});

document.querySelectorAll("[data-knowledge-tab]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-knowledge-tab]").forEach((tab) => tab.classList.remove("active"));
  button.classList.add("active");
  document.querySelector("[data-knowledge-panel]").innerHTML = panelContent[button.dataset.knowledgeTab];
}));

document.querySelector("[data-collapse-graph]")?.addEventListener("click", (event) => {
  const children = document.querySelectorAll("[data-branch-child]");
  const collapsing = [...children].some((node) => !node.classList.contains("is-hidden"));
  children.forEach((node) => node.classList.toggle("is-hidden", collapsing));
  event.currentTarget.textContent = collapsing ? "展开 H2/H3" : "折叠 H2/H3";
  document.querySelector("[data-expand-branch]")?.setAttribute("aria-expanded", String(!collapsing));
  showToast(collapsing ? "已折叠当前文档的标题分支" : "已展开到 H3，保留原文层级");
});

document.querySelector("[data-expand-branch]")?.addEventListener("click", (event) => {
  const children = document.querySelectorAll("[data-branch-child]");
  const expanded = event.currentTarget.getAttribute("aria-expanded") === "true";
  children.forEach((node) => node.classList.toggle("is-hidden", expanded));
  event.currentTarget.setAttribute("aria-expanded", String(!expanded));
  showToast(expanded ? "已折叠 ReAct 的 H2/H3 分支" : "已展开 ReAct 的 H2/H3 分支");
});

function updateAgentCount() {
  const checks = [...document.querySelectorAll("[data-plan-check]")];
  checks.forEach((check) => check.closest(".plan-item").classList.toggle("rejected", !check.checked));
  const count = checks.filter((check) => check.checked).length;
  const confirm = document.querySelector("[data-agent-confirm]");
  if (confirm) {
    confirm.textContent = count ? `确认执行 ${count} 项` : "没有可执行项目";
    confirm.disabled = count === 0;
  }
}
document.querySelectorAll("[data-plan-check]").forEach((check) => check.addEventListener("change", updateAgentCount));
document.querySelector("[data-agent-cancel]")?.addEventListener("click", () => {
  document.querySelectorAll("[data-plan-check]").forEach((check) => { check.checked = false; });
  updateAgentCount();
  showToast("已取消全部计划；未修改任何文件");
});
document.querySelector("[data-agent-confirm]")?.addEventListener("click", () => {
  const count = [...document.querySelectorAll("[data-plan-check]")].filter((check) => check.checked).length;
  document.querySelector("[data-execution-result]").innerHTML = `<div class="execution-box"><h3>已完成 ${count} 项，验证通过</h3><p>创建 1 个文件、写入 3 条链接、提交 2 条建议并更新局部索引。审计记录 RUN-20260825-014 已保存。</p><button class="button secondary" type="button" data-agent-undo>撤销本次变更</button></div>`;
  document.querySelector("[data-agent-undo]").addEventListener("click", (event) => {
    event.currentTarget.closest(".execution-box").innerHTML = "<h3>已撤销并重新验证索引</h3><p>新建文件和链接变更已恢复；原始来源未受影响。</p>";
    showToast("撤销完成，审计记录已保留");
  });
  showToast(`已按确认范围执行 ${count} 项`);
});

document.querySelector("[data-retry]")?.addEventListener("click", (event) => {
  event.currentTarget.disabled = true;
  event.currentTarget.textContent = "正在重试…";
  document.querySelector("[data-retry-result]").innerHTML = '<div class="execution-box"><h3>已创建局部重试任务</h3><p>只读取失败的 6 页；成功页和原始文件保持不变。</p></div>';
  showToast("局部重试已开始，不会覆盖 18 页成功结果");
});

function showMobileView(name) {
  document.querySelectorAll("[data-mobile-view]").forEach((view) => { view.hidden = view.dataset.mobileView !== name; });
  document.querySelectorAll("[data-mobile-nav]").forEach((nav) => nav.classList.toggle("active", nav.dataset.mobileNav === name || (name === "read" && nav.dataset.mobileNav === "search")));
  document.querySelector(".mobile-content")?.scrollTo({top: 0, behavior: "smooth"});
}
document.querySelectorAll("[data-mobile-nav]").forEach((button) => button.addEventListener("click", () => showMobileView(button.dataset.mobileNav)));
document.querySelectorAll("[data-mobile-open]").forEach((button) => button.addEventListener("click", () => showMobileView(button.dataset.mobileOpen)));

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    showToast("命令面板可统一搜索、跳转页面和调用 Agent");
  }
});
