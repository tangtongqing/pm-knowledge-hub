import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "产品设计案例｜PM Knowledge Hub",
  description:
    "从 204 篇本地笔记出发，展示 PM Knowledge Hub 如何经过证据审计、范围取舍、产品建模与验收，形成可检索、可核验、可训练的知识工作台。",
  openGraph: {
    title: "PM Knowledge Hub｜产品设计案例",
    description: "一份区分已交付证据、单用户观察与待验证假设的 0→1 产品案例。",
    type: "article",
    locale: "zh_CN",
  },
};

const sections = [
  ["overview", "00", "案例概览"],
  ["problem", "01", "问题重构"],
  ["evidence", "02", "研究与证据"],
  ["alternatives", "03", "替代方案"],
  ["requirements", "04", "需求转译"],
  ["users", "05", "用户与范围"],
  ["solution", "06", "方案模型"],
  ["interfaces", "07", "界面产出"],
  ["validation", "08", "验证与边界"],
] as const;

const evidenceRows = [
  {
    grade: "A",
    title: "直接证据",
    source: "代码、PRD、验收记录、运行截图",
    use: "证明产品已实现什么、交付质量如何",
    limit: "不能证明外部需求、留存或效率提升",
  },
  {
    grade: "B",
    title: "外部事实",
    source: "竞品官方能力与公开资料",
    use: "确认替代工作流、能力边界与进入壁垒",
    limit: "不能证明目标用户一定需要本产品",
  },
  {
    grade: "C",
    title: "待验证假设",
    source: "项目所有者观察、行为角色、未来计划",
    use: "形成滩头用户与验证问题",
    limit: "不能写成真人访谈或真实用户结果",
  },
] as const;

const requirementRows = [
  {
    evidence: "204 篇本地 Markdown 笔记",
    problem: "靠目录和记忆定位内容，复习现场调用困难",
    response: "目录浏览 + 语义检索 + 完整原文预览",
    priority: "Must",
    status: "已交付",
  },
  {
    evidence: "生成回答可能脱离个人原文",
    problem: "语言流畅不等于事实可信",
    response: "编号引用 + 来源摘录 + Obsidian 回跳",
    priority: "Must",
    status: "已交付",
  },
  {
    evidence: "自练难发现表达结构缺口",
    problem: "练习与后续复习彼此割裂",
    response: "STAR 四维反馈 + 建议回答 + 追问",
    priority: "Must",
    status: "部分交付",
  },
  {
    evidence: "私人笔记不适合默认上传",
    problem: "模型调用与数据边界不透明",
    response: "本地索引 + 主动调用 + 公开演示隔离",
    priority: "Must",
    status: "已交付",
  },
] as const;

const productScreens = [
  {
    src: "/case-study/knowledge-search.png",
    alt: "PM Knowledge Hub 知识库界面：左侧目录、中间搜索结果、右侧完整笔记预览",
    label: "01 / 定位",
    title: "先从问题回到完整原文",
    copy: "三栏结构把目录、结果与正文放在同一视野；搜索不是终点，用户仍能回到原始 Markdown。",
    className: styles.screenWide,
    width: 1036,
    height: 850,
  },
  {
    src: "/case-study/evidence-answer.png",
    alt: "PM Knowledge Hub AI 问答界面：回答正文与五条引用证据并列显示",
    label: "02 / 核验",
    title: "让答案和证据同时出现",
    copy: "回答区与来源区并列，引用编号承担导航，不把模型输出包装成无来源的确定事实。",
    className: styles.screenWide,
    width: 1440,
    height: 900,
  },
  {
    src: "/case-study/star-interview.png",
    alt: "PM Knowledge Hub 模拟面试界面：候选人回答、STAR 四维反馈和改进建议",
    label: "03 / 训练",
    title: "把泛泛点评拆成结构反馈",
    copy: "反馈分别对应 Situation、Task、Action、Result；当前已证明流程可用，尚未证明它会改善真人表现。",
    className: styles.screenHalf,
    width: 1440,
    height: 900,
  },
  {
    src: "/case-study/knowledge-map.png",
    alt: "PM Knowledge Hub 知识图谱界面：目录节点和关联关系组成的力导向网络",
    label: "04 / 关联",
    title: "用分层聚合控制图谱复杂度",
    copy: "默认展示目录级关系，再按章节展开笔记，避免一次铺开 204 个节点造成信息过载。",
    className: styles.screenHalf,
    width: 1412,
    height: 850,
  },
] as const;

function SectionHeading({
  number,
  eyebrow,
  title,
  description,
}: {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className={styles.sectionHeading}>
      <div className={styles.sectionIndex}>{number}</div>
      <div>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2>{title}</h2>
        <p className={styles.sectionLead}>{description}</p>
      </div>
    </header>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
      <path
        d="M3 10h13M11 5l5 5-5 5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export default function DesignPage() {
  return (
    <article className={styles.caseStudy}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.wordmark} aria-label="返回 PM Knowledge Hub 首页">
          <span className={styles.wordmarkMark}>P/</span>
          <span>PM Knowledge Hub</span>
        </Link>
        <div className={styles.topbarMeta}>
          <span>Product case / 2026</span>
          <a
            href="https://pm-knowledge-hub-demo.tongqtang.chatgpt.site"
            target="_blank"
            rel="noreferrer"
          >
            公开演示 <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <div className={styles.readingProgress} aria-hidden="true" />

      <aside className={styles.chapterRail} aria-label="案例章节">
        <span className={styles.railTitle}>Case index</span>
        <nav>
          {sections.map(([id, number, label]) => (
            <a href={`#${id}`} key={id}>
              <span>{number}</span>
              {label}
            </a>
          ))}
        </nav>
      </aside>

      <div className={styles.caseBody}>
        <section id="overview" className={styles.hero} aria-labelledby="case-title">
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>AI 辅助个人项目 · 产品负责人 / UX / 交付</p>
            <h1 id="case-title">
              把 <span>204 篇笔记</span>
              <br />
              从仓库变成一条
              <br />
              可核验的学习闭环。
            </h1>
            <p className={styles.heroLead}>
              PM Knowledge Hub 面向已经使用 Obsidian / Markdown、正在准备 PM
              面试的人：先找到相关原文，再核验 AI 回答，最后把知识练成可复盘的表达。
            </p>
            <div className={styles.heroActions}>
              <a
                className={styles.primaryAction}
                href="https://pm-knowledge-hub-demo.tongqtang.chatgpt.site"
                target="_blank"
                rel="noreferrer"
              >
                查看公开演示 <ArrowIcon />
              </a>
              <Link className={styles.textAction} href="/assistant">
                进入本地产品 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className={styles.heroRegister} aria-label="案例项目档案">
            <div className={styles.registerHeader}>
              <span>PROJECT REGISTER</span>
              <span>NO. 01</span>
            </div>
            <dl>
              <div>
                <dt>角色</dt>
                <dd>产品负责人 · UX · AI 辅助开发</dd>
              </div>
              <div>
                <dt>周期</dt>
                <dd>2026.06 — 2026.07</dd>
              </div>
              <div>
                <dt>形态</dt>
                <dd>本地完整版 + 脱敏公开演示</dd>
              </div>
              <div>
                <dt>当前状态</dt>
                <dd>v1.6.0-rc.1 候选版</dd>
              </div>
            </dl>
            <div className={styles.registerNumbers}>
              <div>
                <strong>204</strong>
                <span>篇真实笔记</span>
              </div>
              <div>
                <strong>2,579</strong>
                <span>个索引分片</span>
              </div>
              <div>
                <strong>27</strong>
                <span>个系统验收案例</span>
              </div>
            </div>
            <div className={styles.registerStamp}>EVIDENCE BOUNDED</div>
          </div>
        </section>

        <section className={styles.boundaryNote} aria-labelledby="boundary-title">
          <div>
            <span className={styles.boundaryCode}>READ THIS FIRST</span>
            <h2 id="boundary-title">这是一份交付案例，不是市场成功故事。</h2>
          </div>
          <p>
            现有证据能证明产品设计、实现、验收和公开演示已经完成；外部真人访谈、真实资料试用、
            留存、付费与效率提升仍未验证。页面中的未来样本数是计划门槛，不是已完成结果。
          </p>
        </section>

        <section id="problem" className={styles.contentSection}>
          <SectionHeading
            number="01"
            eyebrow="Problem reframing"
            title="问题不是资料不够，而是知识无法回到使用现场。"
            description="项目从“做一个 AI 知识库”起步。资产盘点和任务拆解让问题逐步收窄到检索、核验与训练之间的断点。"
          />

          <div className={styles.reframeGrid}>
            <article className={styles.reframeBefore}>
              <span>最初以为</span>
              <h3>需要一个更聪明的问答入口</h3>
              <p>把 204 篇笔记向量化，再让模型回答问题，似乎就能解决复习效率。</p>
              <div aria-hidden="true">AI Q&amp;A</div>
            </article>
            <div className={styles.reframeArrow} aria-hidden="true">
              <span>证据修正</span>
              <svg viewBox="0 0 160 40">
                <path d="M2 20h144m-12-12 12 12-12 12" />
              </svg>
            </div>
            <article className={styles.reframeAfter}>
              <span>重新定义</span>
              <h3>需要一条能回到原文、暴露缺口的闭环</h3>
              <p>问答只是中间环节。用户真正要完成的是“定位 → 核验 → 表达 → 补弱”。</p>
              <ol>
                <li>找到上下文</li>
                <li>检查证据</li>
                <li>练习表达</li>
                <li>回到薄弱点</li>
              </ol>
            </article>
          </div>

          <div className={styles.decisionStrip}>
            <span>产品判断</span>
            <p>不与 Obsidian 争夺笔记编辑，也不把模型回答当终点；产品只承担“调用与训练层”。</p>
            <small>来源：BRD v5.0 · MRD v3.0 · PRD 核心用例 UC-02 / UC-03</small>
          </div>
        </section>

        <section id="evidence" className={`${styles.contentSection} ${styles.tintedSection}`}>
          <SectionHeading
            number="02"
            eyebrow="Research & evidence"
            title="先标注证据强弱，再决定页面能说什么。"
            description="研究没有被包装成一套漂亮但虚假的访谈故事。每一种材料只承担它能证明的那部分。"
          />

          <div className={styles.evidenceTable} role="table" aria-label="案例证据等级">
            <div className={styles.tableHeader} role="row">
              <span role="columnheader">等级</span>
              <span role="columnheader">材料</span>
              <span role="columnheader">可用于判断</span>
              <span role="columnheader">不能外推</span>
            </div>
            {evidenceRows.map((row) => (
              <div className={styles.tableRow} role="row" key={row.grade}>
                <span role="cell" className={styles.grade} data-grade={row.grade}>
                  {row.grade}
                  <small>{row.title}</small>
                </span>
                <span role="cell">{row.source}</span>
                <span role="cell">{row.use}</span>
                <span role="cell">{row.limit}</span>
              </div>
            ))}
          </div>

          <div className={styles.researchQuestions}>
            <p className={styles.eyebrow}>研究要回答的三个问题</p>
            <ol>
              <li>
                <span>01</span>
                <p>什么时刻，已有笔记仍然无法被调用？</p>
              </li>
              <li>
                <span>02</span>
                <p>问答、来源核验和练习为什么会断开？</p>
              </li>
              <li>
                <span>03</span>
                <p>哪些能力必须进入首版，哪些应该主动不做？</p>
              </li>
            </ol>
          </div>
        </section>

        <section id="alternatives" className={styles.contentSection}>
          <SectionHeading
            number="03"
            eyebrow="Alternatives"
            title="竞品研究没有寻找“功能空白”，而是寻找工作流断点。"
            description="成熟工具已经分别解决笔记、来源问答和面试训练。机会不在复制单项功能，而在连接个人资料、证据与后续行动。"
          />

          <div className={styles.alternativeMap}>
            <div className={styles.altAxis} aria-hidden="true">
              <span>资料</span>
              <span>理解</span>
              <span>练习</span>
              <span>行动</span>
            </div>
            <article>
              <h3>Obsidian / Notion</h3>
              <div className={styles.coverage}>
                <i data-filled="true" />
                <i data-filled="true" />
                <i />
                <i />
              </div>
              <p>资料组织与长期保存强；不重复建设笔记工具。</p>
            </article>
            <article>
              <h3>NotebookLM / ChatGPT</h3>
              <div className={styles.coverage}>
                <i data-filled="true" />
                <i data-filled="true" />
                <i data-filled="true" />
                <i />
              </div>
              <p>来源理解与生成能力强；单次答案仍容易成为终点。</p>
            </article>
            <article>
              <h3>Yoodli / 通用面试工具</h3>
              <div className={styles.coverage}>
                <i />
                <i />
                <i data-filled="true" />
                <i data-filled="true" />
              </div>
              <p>专项训练成熟；个人知识与训练反馈通常分离。</p>
            </article>
            <article className={styles.altCurrent}>
              <h3>PM Knowledge Hub</h3>
              <div className={styles.coverage}>
                <i data-filled="true" />
                <i data-filled="true" />
                <i data-filled="true" />
                <i data-partial="true" />
              </div>
              <p>当前差异化：让来源、回答和训练共用同一份个人资料；行动闭环仍待验证。</p>
            </article>
          </div>
          <p className={styles.sourceNote}>
            资料来源：MRD v3.0 对官方产品能力的事实型对比，研究截止 2026-07-27。这里不声称“市场上没有同类产品”。
          </p>
        </section>

        <section id="requirements" className={`${styles.contentSection} ${styles.darkSection}`}>
          <SectionHeading
            number="04"
            eyebrow="Requirements"
            title="从证据进入问题，再转译成可验收的产品响应。"
            description="需求不是从已做功能倒推。每个 Must 都连接到明确阻力、交付状态与下一步验证。"
          />

          <div className={styles.requirementTable}>
            <div className={styles.reqHeader}>
              <span>证据 / 观察</span>
              <span>用户问题</span>
              <span>产品响应</span>
              <span>状态</span>
            </div>
            {requirementRows.map((row, index) => (
              <article key={row.response}>
                <div className={styles.reqNumber}>R{String(index + 1).padStart(2, "0")}</div>
                <p>{row.evidence}</p>
                <p>{row.problem}</p>
                <p>{row.response}</p>
                <div>
                  <span>{row.priority}</span>
                  <strong data-complete={row.status === "已交付"}>{row.status}</strong>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="users" className={styles.contentSection}>
          <SectionHeading
            number="05"
            eyebrow="Users & scope"
            title="用行为和任务定义用户，不虚构年龄、城市与收入。"
            description="当前只有项目所有者的单用户观察。核心角色因此被明确标为行为角色，不能当作经过访谈验证的人群画像。"
          />

          <div className={styles.rolesGrid}>
            <article className={styles.rolePrimary}>
              <span className={styles.roleTag}>核心行为角色 · C 类假设</span>
              <h3>已有个人资料、临近 PM 面试的学习者</h3>
              <dl>
                <div>
                  <dt>可观察行为</dt>
                  <dd>持续维护 Markdown / Obsidian；复习时组合搜索、AI 和手工整理。</dd>
                </div>
                <div>
                  <dt>触发场景</dt>
                  <dd>收到面试、发现回答薄弱、准备项目展示。</dd>
                </div>
                <div>
                  <dt>核心任务</dt>
                  <dd>调用个人原文，形成可信回答，再把反馈变成补弱行动。</dd>
                </div>
                <div>
                  <dt>关键风险</dt>
                  <dd>是否愿意维护本地环境、导入真实资料并持续使用，均未验证。</dd>
                </div>
              </dl>
            </article>
            <article className={styles.roleSecondary}>
              <span className={styles.roleTag}>次要角色 · PRD 直接证据</span>
              <h3>只有三分钟的外部评审者</h3>
              <p>PM 同行、导师或面试官并非长期用户，他们需要快速判断：</p>
              <ul>
                <li>产品为谁解决什么问题</li>
                <li>证据和隐私边界是否可信</li>
                <li>项目所有者做了哪些取舍</li>
              </ul>
              <small>这也是独立案例页必须存在的原因。</small>
            </article>
          </div>

          <div className={styles.scopeBoard}>
            <div className={styles.scopeIn}>
              <p>首版必须闭环 / IN</p>
              <ul>
                <li>Markdown 目录与全文浏览</li>
                <li>检索、问答与来源回跳</li>
                <li>STAR 文本训练与历史</li>
                <li>本地数据与模型调用说明</li>
              </ul>
            </div>
            <div className={styles.scopeOut}>
              <p>主动不做 / OUT</p>
              <ul>
                <li>通用课程与内容平台</li>
                <li>多人协作、权限与企业连接器</li>
                <li>语音面试与真人教练</li>
                <li>未经验证的自动学习规划</li>
              </ul>
            </div>
            <div className={styles.scopeRule}>
              <span>取舍原则</span>
              <p>先保留“检索 → 证据 → 训练”的核心闭环；图谱、报告等增强项可降级，不让展示性功能挤占可信度。</p>
            </div>
          </div>
        </section>

        <section id="solution" className={`${styles.contentSection} ${styles.tintedSection}`}>
          <SectionHeading
            number="06"
            eyebrow="Product model"
            title="方案从产品对象和状态开始，而不是从页面清单开始。"
            description="笔记、切片、回答、引用和训练记录是同一条证据链上的对象。AI 只负责生成与评估，来源和用户控制仍留在系统边界内。"
          />

          <div className={styles.objectFlow} aria-label="产品主链路">
            <article>
              <span>01</span>
              <h3>原始笔记</h3>
              <p>Markdown / Obsidian</p>
              <small>用户控制</small>
            </article>
            <i aria-hidden="true">→</i>
            <article>
              <span>02</span>
              <h3>索引与召回</h3>
              <p>2,579 个本地分片</p>
              <small>系统处理</small>
            </article>
            <i aria-hidden="true">→</i>
            <article>
              <span>03</span>
              <h3>回答与引用</h3>
              <p>结论连接来源摘录</p>
              <small>可核验</small>
            </article>
            <i aria-hidden="true">→</i>
            <article>
              <span>04</span>
              <h3>训练与反馈</h3>
              <p>STAR 结构化评估</p>
              <small>部分闭环</small>
            </article>
          </div>

          <div className={styles.mechanismGrid}>
            <article>
              <span className={styles.mechanismIndex}>M/01</span>
              <h3>证据始终可见</h3>
              <p>回答中的编号引用跳向来源摘录；来源保留笔记标题、章节与 Obsidian 回跳。</p>
              <dl>
                <div><dt>解决</dt><dd>生成内容难核验</dd></div>
                <div><dt>边界</dt><dd>引用存在不等于回答必然正确</dd></div>
              </dl>
            </article>
            <article>
              <span className={styles.mechanismIndex}>M/02</span>
              <h3>公开演示与本地版隔离</h3>
              <p>公开站使用浏览器内脱敏数据；真实索引、后端与模型调用只存在于本地完整版。</p>
              <dl>
                <div><dt>解决</dt><dd>作品展示与私人资料冲突</dd></div>
                <div><dt>边界</dt><dd>公开 Demo 不能证明真实 RAG 质量</dd></div>
              </dl>
            </article>
            <article>
              <span className={styles.mechanismIndex}>M/03</span>
              <h3>失败时保留恢复路径</h3>
              <p>模型失败可降级为本地回答；搜索、删除与导出均提供反馈或撤销。</p>
              <dl>
                <div><dt>解决</dt><dd>异常打断核心任务</dd></div>
                <div><dt>边界</dt><dd>降级输出必须明确标识</dd></div>
              </dl>
            </article>
          </div>
        </section>

        <section id="interfaces" className={styles.contentSection}>
          <SectionHeading
            number="07"
            eyebrow="Interface output"
            title="界面按用户主链路组织，而不是按页面目录罗列。"
            description="以下均为真实运行与验收截图。它们展示产品机制，不作为真人效果或商业结果的替代证据。"
          />

          <div className={styles.screenGallery}>
            {productScreens.map((screen) => (
              <figure className={screen.className} key={screen.src}>
                <div className={styles.screenFrame}>
                  <div className={styles.browserChrome} aria-hidden="true">
                    <span />
                    <span />
                    <span />
                    <i>localhost / verified build</i>
                  </div>
                  <Image
                    src={screen.src}
                    alt={screen.alt}
                    width={screen.width}
                    height={screen.height}
                    sizes={screen.className === styles.screenWide ? "(max-width: 800px) 100vw, 1100px" : "(max-width: 800px) 100vw, 540px"}
                  />
                </div>
                <figcaption>
                  <span>{screen.label}</span>
                  <h3>{screen.title}</h3>
                  <p>{screen.copy}</p>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className={styles.mobileEvidence}>
            <div>
              <p className={styles.eyebrow}>Responsive decision</p>
              <h3>移动端不是缩小桌面三栏，而是把上下文分层。</h3>
              <p>
                核心页面以 390 × 844 作为发布门禁；移动视图收起次要面板，保留主要任务和显式返回路径。
              </p>
              <span>验收记录：五个核心页面 390 / 390，无页面级横向溢出。</span>
            </div>
            <figure>
              <Image
                src="/case-study/workspace-mobile.png"
                alt="PM Knowledge Hub 移动端工作区长截图，展示窄屏下的单列内容结构"
                width={380}
                height={1142}
                sizes="(max-width: 720px) 72vw, 300px"
              />
            </figure>
          </div>
        </section>

        <section id="validation" className={`${styles.contentSection} ${styles.validationSection}`}>
          <SectionHeading
            number="08"
            eyebrow="Validation & limits"
            title="把“交付通过”与“用户价值成立”分开记录。"
            description="测试能证明系统按预期工作，却不能自动证明用户愿意使用、效率提高或愿意付费。"
          />

          <div className={styles.validationStats}>
            <article>
              <strong>27</strong>
              <span>系统验收案例</span>
              <p>23 个历史案例 + 4 个 v1.6 发布门禁案例。</p>
            </article>
            <article>
              <strong>47</strong>
              <span>后端测试通过</span>
              <p>来自 2026-07-16 的 v1.6.0-rc.1 验收记录。</p>
            </article>
            <article>
              <strong>2</strong>
              <span>关键视口</span>
              <p>390 × 844 与 1440 × 1000 均检查页面级溢出。</p>
            </article>
            <article>
              <strong>0</strong>
              <span>真人研究样本</span>
              <p>当前最重要的证据缺口，明确保留而不补造。</p>
            </article>
          </div>

          <div className={styles.proofGrid}>
            <article className={styles.proven}>
              <p>当前真正证明了什么</p>
              <ul>
                <li>204 篇笔记可被解析为 2,579 个本地索引分片</li>
                <li>检索、问答引用、STAR 训练与图谱核心流程可操作</li>
                <li>失败降级、会话撤销、键盘与窄屏门禁已有验收记录</li>
                <li>公开演示与本地完整版的数据和模型边界已说明</li>
              </ul>
            </article>
            <article className={styles.unproven}>
              <p>当前还没有证明什么</p>
              <ul>
                <li>问题在外部 PM 人群中的普遍性与发生频率</li>
                <li>外部用户能否自行导入不同结构的真实资料</li>
                <li>产品是否提高知识定位效率或面试表现</li>
                <li>四周留存、付费意愿与可持续商业空间</li>
              </ul>
            </article>
          </div>

          <div className={styles.futurePlan}>
            <div>
              <span>NEXT VALIDATION</span>
              <h3>下一步先验证现有价值，不继续堆功能。</h3>
            </div>
            <ol>
              <li>
                <span>01</span>
                <p><strong>15 人问题访谈</strong>追问最近一次真实复习与工具拼接行为。</p>
              </li>
              <li>
                <span>02</span>
                <p><strong>10 人真实资料试用</strong>记录导入、自助完成与人工介入点。</p>
              </li>
              <li>
                <span>03</span>
                <p><strong>连续 4 周观察</strong>验证训练反馈是否形成复习行动与重复使用。</p>
              </li>
              <li>
                <span>04</span>
                <p><strong>真实价格测试</strong>只在完成价值试用后验证付款，不用口头兴趣替代。</p>
              </li>
            </ol>
          </div>
        </section>

        <footer className={styles.footer}>
          <div>
            <p>PM Knowledge Hub / Product case</p>
            <h2>证据到这里，结论也到这里。</h2>
          </div>
          <div className={styles.footerLinks}>
            <a
              href="https://pm-knowledge-hub-demo.tongqtang.chatgpt.site"
              target="_blank"
              rel="noreferrer"
            >
              查看公开演示 <span aria-hidden="true">↗</span>
            </a>
            <Link href="/assistant">进入本地工作台 <span aria-hidden="true">→</span></Link>
            <a href="#overview">回到顶部 <span aria-hidden="true">↑</span></a>
          </div>
        </footer>
      </div>
    </article>
  );
}
