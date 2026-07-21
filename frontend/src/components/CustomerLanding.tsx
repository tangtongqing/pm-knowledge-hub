"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api, HealthResponse } from "@/lib/api";
import styles from "./CustomerLanding.module.css";

type DemoMode = "search" | "answer" | "interview";

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

const Logo = () => (
  <svg aria-hidden="true" viewBox="0 0 32 32" width="28" height="28">
    <path d="M16 3 5 8.5 16 14l11-5.5L16 3Z" fill="currentColor" />
    <path d="m5 15 11 5.5L27 15v5L16 25.5 5 20v-5Z" fill="currentColor" opacity=".68" />
    <path d="m5 25.5 11 5.5 11-5.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const demoLabels: Record<DemoMode, string> = {
  search: "语义检索",
  answer: "引用问答",
  interview: "模拟面试",
};

export default function CustomerLanding() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [demoMode, setDemoMode] = useState<DemoMode>("answer");

  useEffect(() => {
    api.getHealth().then(setHealth).catch(() => undefined);
  }, []);

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
      { root: scroller, threshold: 0.14 },
    );

    root.querySelectorAll("[data-reveal]").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const noteCount = health?.note_count || 204;
  const chunkCount = health?.collection_count || 2579;
  const isOnline = health?.status === "ok";

  return (
    <div ref={rootRef} className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo} aria-label="PM Knowledge Hub 首页">
          <span><Logo /></span>
          <b>PM Knowledge Hub</b>
        </Link>
        <nav aria-label="客户营销页导航">
          <a href="#outcomes">你会得到什么</a>
          <a href="#how">如何工作</a>
          <a href="#privacy">数据与隐私</a>
        </nav>
        <div className={styles.headerActions}>
          <Link href="/design" className={styles.designLink}>设计实验</Link>
          <Link href="/assistant" className={styles.headerCta}>打开工作台 <Arrow /></Link>
        </div>
      </header>

      <div>
        <section className={styles.hero} aria-labelledby="customer-hero-title">
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}><span data-online={isOnline} />本地优先 · 为产品经理构建</div>
            <h1 id="customer-hero-title">让你的产品知识，<br /><em>在关键时刻派上用场。</em></h1>
            <p>不用再翻几十篇笔记，也不用接受没有出处的通用答案。连接本地 Obsidian，直接搜索、提问，再把知识练成面试和工作中的清楚表达。</p>
            <div className={styles.heroActions}>
              <Link href="/assistant" className={styles.primaryCta}>用自己的知识库提问 <Arrow /></Link>
              <a href="#proof" className={styles.secondaryCta}>先看看实际效果</a>
            </div>
            <div className={styles.assuranceRow}>
              <span><Check />无需注册</span>
              <span><Check />支持自有模型密钥</span>
              <span><Check />引用可回到原文</span>
            </div>
          </div>

          <div id="proof" className={styles.productDemo} aria-label="PM Knowledge Hub 产品交互预览">
            <div className={styles.demoTopbar}>
              <div className={styles.demoBrand}><Logo /><span>我的产品知识库</span></div>
              <span className={styles.onlineState} data-online={isOnline}><i />{isOnline ? "本地服务在线" : "本地工作区"}</span>
            </div>
            <div className={styles.demoTabs} role="tablist" aria-label="产品能力预览">
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
                <div className={`${styles.demoView} ${styles.searchView}`}>
                  <div className={styles.searchBox}>如何判断一个 AI 功能值不值得做？<kbd>↵</kbd></div>
                  <div className={styles.filterRow}><span>AI 产品</span><span>需求分析</span><span>优先级</span></div>
                  <article><div><b>4.3 需求优先级</b><em>91% 匹配</em></div><p>同时评估用户价值、业务价值、数据可得性、实现成本与模型风险……</p></article>
                  <article><div><b>7.4 AI 产品评估</b><em>87% 匹配</em></div><p>不要只验证功能是否可用，还要验证用户是否愿意在真实任务中持续使用……</p></article>
                </div>
              )}

              {demoMode === "answer" && (
                <div className={`${styles.demoView} ${styles.answerView}`}>
                  <div className={styles.demoQuestion}>AI 产品的北极星指标应该怎么定？</div>
                  <div className={styles.demoAnswer}>
                    <span>基于 3 条本地笔记生成</span>
                    <p>先定义用户真正获得价值的那一刻，再选择能持续反映这一价值的行为指标。<sup>[1]</sup></p>
                    <ul><li>价值指标：高质量任务完成率 <b>[1]</b></li><li>领先指标：核心工作流周活跃率 <b>[2]</b></li><li>护栏指标：人工修订率与次周留存 <b>[3]</b></li></ul>
                  </div>
                  <aside className={styles.sourceCard}><span>引用 [1]</span><b>北极星指标.md</b><small>点击即可查看原始段落</small></aside>
                </div>
              )}

              {demoMode === "interview" && (
                <div className={`${styles.demoView} ${styles.interviewView}`}>
                  <div className={styles.interviewQuestion}><span>面试官追问</span><p>如果上线两周后核心指标没有改善，你会先验证哪个假设？</p></div>
                  <div className={styles.scoreBlock}><strong>82</strong><span>综合评分</span></div>
                  <div className={styles.feedbackRows}><div><b>S</b><span>场景完整</span><em>78</em></div><div><b>T</b><span>目标明确</span><em>84</em></div><div><b>A</b><span>行动清晰</span><em>88</em></div><div><b>R</b><span>补充验证周期</span><em>76</em></div></div>
                </div>
              )}
            </div>
            <div className={styles.demoFooter}><span>你的问题</span><i /><span>你的知识</span><i /><span>可核验的答案</span></div>
          </div>
        </section>

        <section className={styles.runtimeProof} aria-label="当前工作区数据">
          <p>现在，这套知识系统正在本机运行</p>
          <div><strong>{noteCount}</strong><span>篇本地笔记</span></div>
          <div><strong>{chunkCount.toLocaleString()}</strong><span>个可检索片段</span></div>
          <div><strong>3</strong><span>条核心使用路径</span></div>
        </section>

        <section id="outcomes" className={styles.outcomes} data-reveal>
          <div className={styles.sectionIntro}>
            <span>你真正需要的不是另一个笔记工具</span>
            <h2>而是把已经学过的东西，<br />变成下一步行动。</h2>
          </div>
          <div className={styles.outcomeGrid}>
            <article className={styles.outcomeSearch}>
              <div className={styles.outcomeIcon}>01</div>
              <h3>准备方案时，快速找回依据</h3>
              <p>直接描述问题，不必记住文件名或原始关键词。搜索结果定位到具体章节与段落。</p>
              <small>适合：需求评审、竞品分析、指标设计</small>
            </article>
            <article className={styles.outcomeAnswer}>
              <div className={styles.outcomeIcon}>02</div>
              <h3>形成判断时，答案带着出处</h3>
              <p>AI 只基于检索到的相关知识作答，结论旁边保留引用，方便返回原文核验。</p>
              <small>适合：方案写作、决策准备、知识复盘</small>
            </article>
            <article className={styles.outcomePractice}>
              <div className={styles.outcomeIcon}>03</div>
              <h3>面对面试时，把知识说出来</h3>
              <p>面试官连续追问，STAR 反馈指出场景、目标、行动和结果中的具体缺口。</p>
              <small>适合：模拟面试、晋升答辩、项目复盘</small>
            </article>
          </div>
        </section>

        <section className={styles.beforeAfter} data-reveal>
          <div className={styles.beforeColumn}>
            <span>你现在可能这样做</span>
            <h2>笔记很多，现场仍然靠回忆。</h2>
            <ul><li>在文件夹里反复尝试关键词</li><li>把材料复制到通用 AI，再核对真假</li><li>刷面试题，却没有练习自己的项目</li></ul>
          </div>
          <div className={styles.afterColumn}>
            <span>连接之后</span>
            <h2>每次提问，都从自己的积累出发。</h2>
            <ul><li><Check />自然语言直接命中相关段落</li><li><Check />答案、引用与原始笔记保持连接</li><li><Check />练习结果反过来暴露知识缺口</li></ul>
          </div>
        </section>

        <section id="how" className={styles.how} data-reveal>
          <div className={styles.sectionIntro}>
            <span>开始使用</span>
            <h2>三步，让笔记真正进入工作流。</h2>
          </div>
          <div className={styles.steps}>
            <article><span>1</span><div><h3>连接本地知识库</h3><p>读取 Markdown 文件与 Obsidian 元数据，在本机构建向量索引。</p></div></article>
            <article><span>2</span><div><h3>带着真实问题来</h3><p>搜索概念、询问方案或启动面试，不需要重新整理全部内容。</p></div></article>
            <article><span>3</span><div><h3>核验、表达、继续积累</h3><p>查看引用，改进回答，再把新的判断写回自己的知识体系。</p></div></article>
          </div>
          <div className={styles.howCta}><Link href="/assistant">现在问第一个问题 <Arrow /></Link><small>没有 API 密钥也可以体验本地演示模式</small></div>
        </section>

        <section id="privacy" className={styles.privacy} data-reveal>
          <div className={styles.privacyCopy}>
            <span>数据与隐私</span>
            <h2>你的知识库，仍然由你掌控。</h2>
            <p>原始笔记、向量索引和会话历史保留在本机。只有发起 AI 请求时，检索到的相关片段才会发送给你主动配置的模型供应商。</p>
            <ul><li><Check />API 密钥保存在本地环境文件</li><li><Check />回答可以追溯到对应原始笔记</li><li><Check />无密钥时可使用本地演示模式</li></ul>
          </div>
          <div className={styles.localDiagram} aria-label="本地数据流示意图">
            <div className={styles.localCore}><Logo /><b>你的电脑</b><span>笔记 · 索引 · 历史</span></div>
            <div className={styles.flowLine}><i /><span>仅发送相关片段</span><i /></div>
            <div className={styles.modelNode}><b>你的模型</b><span>硅基流动 / Gemini</span></div>
          </div>
        </section>

        <section className={styles.faq} data-reveal>
          <div><span>常见问题</span><h2>开始之前，<br />你可能还想知道。</h2></div>
          <div className={styles.faqList}>
            <article><h3>它会修改我的 Obsidian 笔记吗？</h3><p>当前核心流程以读取、索引和检索为主，不会在你不知情的情况下覆盖原始笔记。</p></article>
            <article><h3>必须配置 AI 密钥才能使用吗？</h3><p>搜索与本地知识浏览可以独立运行；没有密钥时，问答与面试会进入演示模式。</p></article>
            <article><h3>它和直接使用 ChatGPT 有什么区别？</h3><p>通用 AI 依赖通用知识；这里会先检索你的本地材料，并把回答与引用证据一起展示。</p></article>
          </div>
        </section>

        <section className={styles.finalCta} data-reveal>
          <div><span>从你已经拥有的知识开始</span><h2>下一个好答案，<br />可能已经在你的笔记里。</h2></div>
          <div><Link href="/assistant" className={styles.finalPrimary}>打开本地工作台 <Arrow /></Link><Link href="/interview" className={styles.finalSecondary}>先体验一场模拟面试</Link></div>
        </section>
      </div>

      <footer className={styles.footer}>
        <div className={styles.logo}><span><Logo /></span><b>PM Knowledge Hub</b></div>
        <p>把产品知识带回决策与表达现场。</p>
        <nav aria-label="页脚导航"><Link href="/about">项目说明</Link><Link href="/knowledge">知识库</Link><Link href="/design">设计实验页</Link></nav>
      </footer>
    </div>
  );
}
