"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./CustomerLanding.module.css";

type DemoMode = "search" | "answer" | "interview";

const REPO_URL = "https://github.com/tangtongqing/pm-knowledge-hub";
const CONTACT_URL = `${REPO_URL}/issues/new`;

const Arrow = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
    <path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Check = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" width="17" height="17">
    <path d="m4 10 4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Mark = () => (
  <svg aria-hidden="true" viewBox="0 0 32 32" width="28" height="28">
    <path d="M5 7.5 16 3l11 4.5-11 4.7L5 7.5Z" fill="currentColor" />
    <path d="M5 14.2 16 19l11-4.8v5.2L16 24 5 19.4v-5.2Z" fill="currentColor" opacity=".65" />
    <path d="m5 25 11 4 11-4" fill="none" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const demoLabels: Record<DemoMode, string> = {
  search: "找知识",
  answer: "问知识",
  interview: "练表达",
};

const currentPlan = [
  "Markdown / Obsidian 本地索引",
  "语义搜索与原文定位",
  "带引用的 AI 问答",
  "STAR 单题模拟评估",
  "知识图谱与会话历史",
];

const proPlan = [
  "包含本地版全部能力",
  "增量同步与混合检索",
  "完整三轮模拟面试",
  "面试报告与复习建议",
  "持续更新与优先支持",
];

export default function CustomerLanding() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [demoMode, setDemoMode] = useState<DemoMode>("answer");

  useEffect(() => {
    const root = rootRef.current;
    const scroller = document.getElementById("main-content");
    if (!root || !scroller) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      { root: scroller, threshold: 0.1 },
    );

    root.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo} aria-label="PM Knowledge Hub 首页">
          <span><Mark /></span>
          <b>PM Knowledge Hub</b>
        </Link>

        <nav className={styles.desktopNav} aria-label="官网主导航">
          <a href="#product">产品</a>
          <a href="#use-cases">使用场景</a>
          <Link href="/design">产品设计案例</Link>
          <a href="#services">服务</a>
          <a href="#pricing">定价</a>
          <a href="#security">安全</a>
        </nav>

        <div className={styles.headerActions}>
          <a href={`${REPO_URL}#readme`} target="_blank" rel="noreferrer" className={styles.docsLink}>使用文档</a>
          <Link href="/assistant" className={styles.headerCta}>进入工作台 <Arrow /></Link>
          <details className={styles.mobileMenu}>
            <summary aria-label="打开导航菜单"><span /><span /></summary>
            <nav aria-label="移动端官网导航">
              <a href="#product">产品</a>
              <a href="#use-cases">使用场景</a>
              <Link href="/design">产品设计案例</Link>
              <a href="#services">服务</a>
              <a href="#pricing">定价</a>
              <a href="#security">安全</a>
              <a href="#contact">联系我们</a>
            </nav>
          </details>
        </div>
      </header>

      <div className={styles.siteBody}>
        <section className={styles.hero} aria-labelledby="customer-hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>为产品经理打造 · 本地优先知识工作台</p>
            <h1 id="customer-hero-title">让你的产品知识，<br /><em>随时可以被调用。</em></h1>
            <p className={styles.heroLead}>连接你已有的 Markdown 或 Obsidian 笔记。需要做方案、复盘或准备面试时，直接搜索、提问和练习，每个结论都能回到原文。</p>
            <div className={styles.heroActions}>
              <Link href="/assistant" className={styles.primaryCta}>免费使用本地版 <Arrow /></Link>
              <a href="#product" className={styles.textCta}>了解产品能力</a>
            </div>
            <p className={styles.heroFinePrint}>无需注册 · 数据保留在本机 · 支持自有模型密钥</p>
          </div>

          <div className={styles.productWindow} aria-label="PM Knowledge Hub 产品界面预览">
            <div className={styles.windowBar}>
              <div className={styles.windowDots}><i /><i /><i /></div>
              <span>PM Knowledge Hub</span>
              <small>本地工作区</small>
            </div>
            <div className={styles.windowBody}>
              <aside className={styles.appRail} aria-hidden="true">
                <Mark />
                <span className={styles.railActive}>⌕</span>
                <span>▤</span>
                <span>◫</span>
                <span>⌁</span>
              </aside>
              <div className={styles.demoPanel}>
                <div className={styles.demoHeader}>
                  <div><small>知识工作台</small><b>从自己的积累开始</b></div>
                  <span>LOCAL</span>
                </div>
                <div className={styles.demoTabs} role="tablist" aria-label="产品核心能力预览">
                  {(Object.keys(demoLabels) as DemoMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      role="tab"
                      aria-selected={demoMode === mode}
                      onClick={() => setDemoMode(mode)}
                    >
                      {demoLabels[mode]}
                    </button>
                  ))}
                </div>
                <div className={styles.demoViewport} aria-live="polite">
                  {demoMode === "search" && (
                    <div className={styles.demoView}>
                      <div className={styles.demoQuery}>如何判断一个需求是否值得做？<kbd>↵</kbd></div>
                      <p className={styles.resultMeta}>找到 8 个相关片段 · 按相关度排序</p>
                      <article className={styles.searchResult}>
                        <div><b>需求价值评估</b><em>高相关</em></div>
                        <p>从用户问题、业务目标、机会成本和验证难度四个维度判断……</p>
                        <small>产品方法 / 需求分析 / 第 3 节</small>
                      </article>
                      <article className={styles.searchResult}>
                        <div><b>优先级与资源约束</b><em>相关</em></div>
                        <p>排序不是给需求打分，而是在明确约束下做取舍……</p>
                        <small>产品决策 / 优先级 / 第 2 节</small>
                      </article>
                    </div>
                  )}

                  {demoMode === "answer" && (
                    <div className={styles.demoView}>
                      <div className={styles.demoQuery}>AI 功能上线前，最该验证什么？</div>
                      <div className={styles.answerCard}>
                        <small>基于你的知识库生成 · 3 个来源</small>
                        <p>先验证用户是否愿意把真实任务交给它，再验证结果质量。技术可用不等于用户愿意持续使用。<sup>[1]</sup></p>
                        <ul><li><span>01</span>任务是否高频且有明确成本</li><li><span>02</span>输出是否能被用户判断与修正</li><li><span>03</span>失败后是否有可接受的回退路径</li></ul>
                      </div>
                      <div className={styles.citation}><span>[1] 来源</span><b>AI 产品验证框架.md</b><small>查看原文段落 →</small></div>
                    </div>
                  )}

                  {demoMode === "interview" && (
                    <div className={styles.demoView}>
                      <div className={styles.interviewPrompt}><small>第 2 轮追问</small><p>你如何证明这个方案解决的是核心问题，而不是表面症状？</p></div>
                      <div className={styles.scoreSummary}><strong>82</strong><div><b>结构清楚，证据不足</b><p>行动过程完整；建议补充判断依据和结果指标。</p></div></div>
                      <div className={styles.scoreRows}><span>S · 80</span><span>T · 84</span><span>A · 88</span><span>R · 76</span></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.compatibility} aria-label="兼容能力">
          <span>连接你已经在用的工具</span>
          <div><b>Markdown</b><b>Obsidian</b><b>SiliconFlow</b><b>Gemini</b><b>Local RAG</b></div>
        </section>

        <section id="product" className={styles.productSection} data-reveal>
          <div className={styles.sectionHeading}>
            <p>产品能力</p>
            <h2>一个工作台，完成从找到知识到用出知识。</h2>
            <span>不是把聊天、搜索和题库拼在一起。所有能力都围绕同一份个人知识上下文工作。</span>
          </div>

          <div className={styles.knowledgeLoop} aria-label="知识闭环">
            <div><span>01</span><b>连接</b><p>读取本地笔记并建立索引</p></div>
            <i>→</i>
            <div><span>02</span><b>找回</b><p>用自然语言定位相关原文</p></div>
            <i>→</i>
            <div><span>03</span><b>理解</b><p>生成带来源的结构化回答</p></div>
            <i>→</i>
            <div><span>04</span><b>应用</b><p>用模拟训练检验表达</p></div>
          </div>

          <div className={styles.featureRows}>
            <article>
              <div className={styles.featureCopy}><span>01 · 检索与阅读</span><h3>不记得文件名，也能找到那段知识。</h3><p>描述你记得的意思，语义检索会返回对应章节、标签和原文片段。需要时可以继续打开完整笔记。</p><Link href="/knowledge">查看知识检索 <Arrow /></Link></div>
              <div className={styles.featureVisual}>
                <div className={styles.miniSearch}>“怎么设计北极星指标？” <kbd>⌘ K</kbd></div>
                <div className={styles.miniResult}><span>01</span><div><b>北极星指标的选择</b><p>真正反映用户获得核心价值的行为指标……</p></div><em>92%</em></div>
                <div className={styles.miniResult}><span>02</span><div><b>领先与护栏指标</b><p>用领先指标预测趋势，用护栏指标控制副作用……</p></div><em>86%</em></div>
              </div>
            </article>

            <article>
              <div className={styles.featureCopy}><span>02 · 引用问答</span><h3>得到答案，也知道它为什么可信。</h3><p>回答基于召回的本地材料生成，正文引用与来源列表一一对应。你可以回到原文核验，而不是接受没有出处的结论。</p><Link href="/assistant">体验引用问答 <Arrow /></Link></div>
              <div className={`${styles.featureVisual} ${styles.citationVisual}`}>
                <small>回答依据</small>
                <blockquote>“先定义用户获得价值的时刻，再选择能够持续反映这一价值的行为。”</blockquote>
                <div><span>[1]</span><b>北极星指标.md</b><em>已定位至原文</em></div>
                <div><span>[2]</span><b>指标体系设计.md</b><em>已定位至原文</em></div>
              </div>
            </article>

            <article>
              <div className={styles.featureCopy}><span>03 · 模拟面试</span><h3>练的不是标准答案，是你自己的表达。</h3><p>AI 面试官结合产品主题连续追问，并按 STAR 结构指出背景、目标、行动和结果中的具体缺口。</p><Link href="/interview">开始模拟面试 <Arrow /></Link></div>
              <div className={`${styles.featureVisual} ${styles.practiceVisual}`}>
                <div><small>面试官</small><p>你在这个项目中做过最困难的一次取舍是什么？</p></div>
                <div className={styles.practiceScore}><strong>82</strong><span>表达完成度</span></div>
                <ul><li><b>做得好</b><span>行动过程具体</span></li><li><b>待补充</b><span>结果缺少量化证据</span></li></ul>
              </div>
            </article>

            <article>
              <div className={styles.featureCopy}><span>04 · 知识图谱</span><h3>看见知识之间的连接，也看见缺口。</h3><p>用交互图谱浏览笔记、主题和双链关系，发现孤立内容和需要继续补充的方法论区域。</p><Link href="/map">打开知识图谱 <Arrow /></Link></div>
              <div className={`${styles.featureVisual} ${styles.graphVisual}`} aria-label="知识图谱产品示意">
                <svg aria-hidden="true" viewBox="0 0 500 250">
                  <g stroke="currentColor" strokeOpacity=".22"><path d="M85 82 210 55 305 120 410 65M85 82l75 105 145-67 78 76M210 55l-50 132M305 120l105-55M305 120l78 76M160 187l223 9" /></g>
                  <g fill="currentColor"><circle cx="85" cy="82" r="14" /><circle cx="210" cy="55" r="9" /><circle cx="305" cy="120" r="20" /><circle cx="410" cy="65" r="8" /><circle cx="160" cy="187" r="12" /><circle cx="383" cy="196" r="10" /></g>
                  <g fontSize="12" fill="currentColor"><text x="65" y="55">需求</text><text x="190" y="30">指标</text><text x="282" y="126" fill="white">决策</text><text x="396" y="42">AI</text><text x="133" y="220">访谈</text><text x="361" y="228">复盘</text></g>
                </svg>
              </div>
            </article>
          </div>
        </section>

        <section id="use-cases" className={styles.useCases} data-reveal>
          <div className={styles.sectionHeading}>
            <p>使用场景</p>
            <h2>在产品经理真正需要知识的时刻出现。</h2>
          </div>
          <div className={styles.caseList}>
            <article><span>01</span><div><small>面试前</small><h3>把零散项目经历练成清楚表达</h3><p>围绕目标岗位持续追问，用 STAR 反馈定位薄弱环节，再回到相关笔记复习。</p></div><Link href="/interview">体验面试模式 <Arrow /></Link></article>
            <article><span>02</span><div><small>做方案时</small><h3>快速找回方法、案例与判断依据</h3><p>从自己的方法论中寻找答案，保留证据链，减少在多个文件夹和聊天窗口之间切换。</p></div><Link href="/assistant">打开问答工作台 <Arrow /></Link></article>
            <article><span>03</span><div><small>项目结束后</small><h3>让复盘继续进入下一次决策</h3><p>把项目经验写回知识库，通过关联图谱和语义搜索，在下一次相似问题中重新调用。</p></div><Link href="/map">查看知识图谱 <Arrow /></Link></article>
          </div>
        </section>

        <section id="services" className={styles.services} data-reveal>
          <div className={styles.serviceIntro}>
            <p>产品与服务</p>
            <h2>先从本地版开始，再按需要扩展。</h2>
            <span>当前产品以开源本地工作台交付；自动同步、完整面试流程和团队部署将按路线图逐步开放。</span>
          </div>
          <div className={styles.serviceGrid}>
            <article><span>01</span><h3>本地知识工作台</h3><p>完整运行在你的电脑上，适合有 Markdown 或 Obsidian 知识库的个人产品经理。</p><ul><li><Check />本地索引与搜索</li><li><Check />自有模型密钥</li><li><Check />开源代码与部署文档</li></ul></article>
            <article><span>02</span><h3>个人增强服务</h3><p>面向需要持续同步、深度检索与系统训练的高频用户，当前开放需求预约。</p><ul><li><Check />增量同步与混合检索</li><li><Check />三轮面试与总结报告</li><li><Check />产品更新优先支持</li></ul></article>
            <article><span>03</span><h3>团队私有部署</h3><p>面向产品团队或培训机构，提供知识迁移、模型接入和私有环境部署评估。</p><ul><li><Check />部署方案评估</li><li><Check />知识目录迁移</li><li><Check />模型与权限配置</li></ul></article>
          </div>
        </section>

        <section id="security" className={styles.security} data-reveal>
          <div className={styles.securityCopy}>
            <p>本地优先</p>
            <h2>你的知识，不需要先交给我们。</h2>
            <span>原始笔记、向量索引与会话历史保存在本机。只有当你主动发起 AI 问答或面试评估时，相关检索片段才会发送给你配置的模型供应商。</span>
            <a href={`${REPO_URL}#数据流向与隐私`} target="_blank" rel="noreferrer">查看数据说明 <Arrow /></a>
          </div>
          <div className={styles.dataFlow} aria-label="产品数据流">
            <div><small>01 · 本地</small><b>你的笔记</b><span>Markdown / Obsidian</span></div>
            <i><span>建立本地索引</span>→</i>
            <div><small>02 · 本地</small><b>PM Knowledge Hub</b><span>检索 / 引用 / 历史</span></div>
            <i><span>仅相关片段</span>→</i>
            <div><small>03 · 由你选择</small><b>模型服务</b><span>SiliconFlow / Gemini</span></div>
          </div>
        </section>

        <section id="pricing" className={styles.pricing} data-reveal>
          <div className={styles.sectionHeading}>
            <p>定价</p>
            <h2>现在免费开始，需要更多时再升级。</h2>
            <span>增强版价格用于验证商业方案；在正式开放付费前不会产生任何费用。</span>
          </div>
          <div className={styles.priceGrid}>
            <article className={styles.availablePlan}>
              <div className={styles.planHeader}><span>当前可用</span><h3>开源本地版</h3><p>适合建立个人产品知识工作台</p></div>
              <div className={styles.price}><strong>¥0</strong><span>永久免费</span></div>
              <Link href="/assistant" className={styles.planPrimary}>开始使用 <Arrow /></Link>
              <ul>{currentPlan.map((item) => <li key={item}><Check />{item}</li>)}</ul>
            </article>
            <article>
              <div className={styles.planHeader}><span>开放预约</span><h3>个人 Pro</h3><p>适合高频学习、复盘与面试准备</p></div>
              <div className={styles.price}><strong>¥39</strong><span>/ 月 · 规划价格</span></div>
              <a href={CONTACT_URL} target="_blank" rel="noreferrer" className={styles.planSecondary}>预约增强版 <Arrow /></a>
              <ul>{proPlan.map((item) => <li key={item}><Check />{item}</li>)}</ul>
            </article>
            <article>
              <div className={styles.planHeader}><span>需求评估</span><h3>团队私有部署</h3><p>适合产品团队与培训机构</p></div>
              <div className={styles.price}><strong>定制</strong><span>按部署范围评估</span></div>
              <a href={CONTACT_URL} target="_blank" rel="noreferrer" className={styles.planSecondary}>联系我们 <Arrow /></a>
              <ul><li><Check />团队知识空间规划</li><li><Check />私有模型与环境接入</li><li><Check />迁移、部署与使用支持</li><li><Check />按需功能与集成评估</li></ul>
            </article>
          </div>
        </section>

        <section className={styles.faq} data-reveal>
          <div><p>常见问题</p><h2>开始前需要知道的事。</h2></div>
          <div className={styles.faqList}>
            <article><h3>这是云端 SaaS 还是本地软件？</h3><p>当前版本是本地运行的 Web 工作台。前后端和索引都在你的电脑上运行，通过浏览器访问。</p></article>
            <article><h3>必须使用 Obsidian 吗？</h3><p>不必须。产品读取的是 Markdown 文件；Obsidian 用户可以额外使用双链、标签和原文跳转能力。</p></article>
            <article><h3>为什么需要自己的模型密钥？</h3><p>本地版把模型选择权和费用控制权交给你。目前支持 SiliconFlow，并保留 Gemini 兼容配置。</p></article>
            <article><h3>增强版和团队版已经可以购买吗？</h3><p>还没有。页面中的方案用于开放预约和收集需求；正式收费前会明确公布功能、条款与交付方式。</p></article>
          </div>
        </section>

        <section id="contact" className={styles.contact} data-reveal>
          <div><p>联系我们</p><h2>想把自己的知识库真正用起来？</h2><span>直接使用免费本地版，或告诉我们你对增强功能、知识迁移和团队部署的需求。</span></div>
          <div className={styles.contactActions}>
            <Link href="/assistant" className={styles.contactPrimary}>进入本地工作台 <Arrow /></Link>
            <a href={CONTACT_URL} target="_blank" rel="noreferrer" className={styles.contactSecondary}>在 GitHub 联系我们 <Arrow /></a>
          </div>
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <div className={styles.logo}><span><Mark /></span><b>PM Knowledge Hub</b></div>
          <p>产品经理的本地优先知识工作台。</p>
          <small>开源构建，数据由用户掌控。</small>
        </div>
        <div className={styles.footerLinks}>
          <nav aria-label="产品页脚导航"><b>产品</b><a href="#product">产品能力</a><a href="#use-cases">使用场景</a><a href="#pricing">定价</a><a href="#security">数据安全</a></nav>
          <nav aria-label="资源页脚导航"><b>资源</b><a href={`${REPO_URL}#readme`} target="_blank" rel="noreferrer">使用文档</a><Link href="/about">版本说明</Link><a href={`${REPO_URL}/blob/main/docs/delivery/CHANGELOG.md`} target="_blank" rel="noreferrer">更新记录</a><Link href="/design">产品设计案例</Link></nav>
          <nav aria-label="支持页脚导航"><b>支持</b><a href="#services">部署服务</a><a href={CONTACT_URL} target="_blank" rel="noreferrer">联系我们</a><a href={`${REPO_URL}/issues`} target="_blank" rel="noreferrer">问题反馈</a><a href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a></nav>
          <nav aria-label="法律页脚导航"><b>开放与条款</b><a href="#security">隐私说明</a><a href={`${REPO_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer">MIT License</a><a href={`${REPO_URL}/security`} target="_blank" rel="noreferrer">安全策略</a></nav>
        </div>
        <div className={styles.footerBottom}><span>© 2026 PM Knowledge Hub</span><span>为认真积累、认真判断的产品经理而做。</span></div>
      </footer>
    </div>
  );
}
