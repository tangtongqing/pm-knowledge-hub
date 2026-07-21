"use client";

import {
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, HealthResponse } from "@/lib/api";
import styles from "./page.module.css";

const ArrowIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
    <path d="M3 10h13M11 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BrandMark = () => (
  <svg aria-hidden="true" viewBox="0 0 36 36" width="34" height="34">
    <path d="M7 8.5 18 3l11 5.5L18 14 7 8.5Z" fill="currentColor" />
    <path d="m7 15 11 5.5L29 15v5.5L18 26 7 20.5V15Z" fill="currentColor" opacity=".72" />
    <path d="m7 26 11 5.5L29 26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type JourneyLinkProps = {
  href: string;
  className: string;
  children: ReactNode;
  onJourney: (href: string) => void;
};

function JourneyLink({ href, className, children, onJourney }: JourneyLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    onJourney(href);
  };

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

const sceneLabels = ["找到上下文", "带着证据回答", "把知识练成表达"];

export default function Home() {
  const router = useRouter();
  const landingRef = useRef<HTMLDivElement>(null);
  const journeyTimer = useRef<number | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [journeyTarget, setJourneyTarget] = useState<string | null>(null);

  useEffect(() => {
    api.getHealth().then(setHealth);
  }, []);

  useEffect(() => {
    const root = landingRef.current;
    const scroller = document.getElementById("main-content");
    if (!root || !scroller) return;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { root: scroller, threshold: 0.16 },
    );

    root.querySelectorAll("[data-reveal]").forEach((item) => revealObserver.observe(item));

    const sceneObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveScene(Number(visible.target.getAttribute("data-scene-trigger") || 0));
      },
      { root: scroller, rootMargin: "-30% 0px -40% 0px", threshold: [0.1, 0.45, 0.75] },
    );

    root.querySelectorAll("[data-scene-trigger]").forEach((item) => sceneObserver.observe(item));

    const updateProgress = () => {
      const available = scroller.scrollHeight - scroller.clientHeight;
      const progress = available > 0 ? scroller.scrollTop / available : 0;
      root.style.setProperty("--page-progress", progress.toString());
    };

    scroller.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => {
      revealObserver.disconnect();
      sceneObserver.disconnect();
      scroller.removeEventListener("scroll", updateProgress);
    };
  }, []);

  useEffect(() => () => {
    if (journeyTimer.current) window.clearTimeout(journeyTimer.current);
  }, []);

  const startJourney = useCallback((href: string) => {
    if (journeyTarget) return;
    setJourneyTarget(href);
    journeyTimer.current = window.setTimeout(() => router.push(href), 640);
  }, [journeyTarget, router]);

  const handleCanvasMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    event.currentTarget.style.setProperty("--pointer-x", `${x * 100}%`);
    event.currentTarget.style.setProperty("--pointer-y", `${y * 100}%`);
    event.currentTarget.style.setProperty("--tilt-x", `${(0.5 - y) * 5}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${(x - 0.5) * 6}deg`);
  };

  const noteCount = health?.note_count || 204;
  const chunkCount = health?.collection_count || 2579;
  const version = health?.version && health.version !== "unknown" ? health.version : "v1.6";
  const isOnline = health?.status === "ok";

  return (
    <div ref={landingRef} className={styles.landing} data-leaving={Boolean(journeyTarget)}>
      <div className={styles.paperGrain} aria-hidden="true" />
      <div className={styles.scrollProgress} aria-hidden="true"><span /></div>

      <header className={styles.siteHeader}>
        <Link href="/" className={styles.brand} aria-label="PM Knowledge Hub 首页">
          <span className={styles.brandMark}><BrandMark /></span>
          <span className={styles.brandName}>PM Knowledge Hub</span>
        </Link>
        <nav className={styles.marketingNav} aria-label="营销页导航">
          <a href="#product">产品现场</a>
          <a href="#workflow">知识闭环</a>
          <a href="#privacy">本地掌控</a>
        </nav>
        <JourneyLink href="/assistant" className={styles.headerCta} onJourney={startJourney}>
          打开工作台 <ArrowIcon />
        </JourneyLink>
      </header>

      <div>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}><span />给产品经理的本地知识系统</p>
            <h1 id="hero-title" aria-label="笔记不是仓库，是你的第二判断现场">
              <span className={styles.heroLine}><i>笔记</i>不是仓库，</span>
              <span className={styles.heroLine}>是你的第二</span>
              <span className={`${styles.heroLine} ${styles.heroAccent}`}>判断现场。</span>
            </h1>
            <p className={styles.heroLead}>
              连接 Obsidian，让每一次搜索都有上下文、每一个答案都有出处、每一场面试都留下可改进的证据。
            </p>
            <div className={styles.heroActions}>
              <JourneyLink href="/assistant" className={styles.primaryCta} onJourney={startJourney}>
                从一个真实问题开始 <ArrowIcon />
              </JourneyLink>
              <a href="#product" className={styles.secondaryCta}>观看知识如何流动 <span>↓</span></a>
            </div>
          </div>

          <div
            className={styles.knowledgeCanvas}
            onMouseMove={handleCanvasMove}
            onMouseLeave={(event) => {
              event.currentTarget.style.setProperty("--pointer-x", "50%");
              event.currentTarget.style.setProperty("--pointer-y", "50%");
              event.currentTarget.style.setProperty("--tilt-x", "0deg");
              event.currentTarget.style.setProperty("--tilt-y", "0deg");
            }}
            aria-label="知识从笔记流向答案的动态产品预览"
          >
            <div className={`${styles.looseNote} ${styles.looseNoteOne}`} aria-hidden="true">
              <span>05 / METRICS</span><b>北极星指标</b><i>用户真正获得价值的时刻</i>
            </div>
            <div className={`${styles.looseNote} ${styles.looseNoteTwo}`} aria-hidden="true">
              <span>INTERVIEW</span><b>STAR</b><i>S · T · A · R</i>
            </div>
            <div className={`${styles.looseNote} ${styles.looseNoteThree}`} aria-hidden="true">
              <span>LOCAL FILE</span><b>.md</b><i>Obsidian</i>
            </div>

            <div className={styles.answerSheet}>
              <div className={styles.sheetTopline}>
                <span className={styles.liveStatus} data-online={isOnline}><i />{isOnline ? "本地服务在线" : "本地工作区"}</span>
                <span>AI 问答 / 07:21</span>
              </div>
              <div className={styles.sheetQuestion}>AI 产品的北极星指标应该怎么定？</div>
              <div className={styles.sheetAnswer}>
                <span className={styles.typingCursor} />
                先定义用户真正获得价值的那一刻，再选择能持续反映这一价值的行为指标。
              </div>
              <div className={styles.sheetMetrics}>
                <div><small>01</small><span>价值时刻</span><b>[1]</b></div>
                <div><small>02</small><span>领先指标</span><b>[2]</b></div>
                <div><small>03</small><span>护栏指标</span><b>[3]</b></div>
              </div>
              <div className={styles.sheetFooter}><span>回答</span><i /><span>推理</span><i /><span>证据</span></div>
            </div>

            <div className={styles.sourceTab}>
              <span>引用 03</span>
              <b>北极星指标.md</b>
              <small>原始笔记已连接</small>
            </div>
            <div className={styles.pointerOrb} aria-hidden="true"><span>ASK</span></div>
          </div>

          <div className={styles.heroFootnote}>
            <span>无需注册</span><span>本地索引</span><span>自带模型密钥</span>
          </div>
        </section>

        <section className={styles.liveStrip} aria-label="产品实时数据">
          <div className={styles.liveMarquee} aria-hidden="true">
            <div>SEARCH / CITE / PRACTICE / THINK / SEARCH / CITE / PRACTICE / THINK /</div>
            <div>SEARCH / CITE / PRACTICE / THINK / SEARCH / CITE / PRACTICE / THINK /</div>
          </div>
          <div className={styles.liveStats}>
            <div><strong>{noteCount}</strong><span>篇本地笔记</span></div>
            <div><strong>{chunkCount.toLocaleString()}</strong><span>个语义切片</span></div>
            <div><strong>04</strong><span>条知识工作流</span></div>
            <div><strong>{version}</strong><span>当前版本</span></div>
          </div>
        </section>

        <section className={styles.manifesto} data-reveal>
          <div className={styles.sectionLabel}>01 — WHY IT EXISTS</div>
          <div className={styles.manifestoGrid}>
            <h2>收藏让信息变多。<br /><em>调用</em>才让知识发生。</h2>
            <div className={styles.manifestoNotes}>
              <p>真正的工作发生在需要做判断、写方案、参加面试的那一刻。你缺少的不是下一篇文章，而是把已有知识及时调回现场的能力。</p>
              <p>PM Knowledge Hub 不替你思考。它把原文、结论和练习放回同一张桌面，让每次提问都成为一次重新组织。</p>
            </div>
          </div>
          <div className={styles.marginScribble} aria-hidden="true">remember → retrieve → reason</div>
        </section>

        <section id="product" className={styles.productTheatre} aria-labelledby="product-title">
          <div className={styles.theatreIntro} data-reveal>
            <span className={styles.sectionLabel}>02 — PRODUCT IN MOTION</span>
            <h2 id="product-title">不是三个功能。<br />是一次连续的思考。</h2>
            <p>向下滚动，看看同一份知识如何被找到、引用，再变成现场表达。</p>
          </div>

          <div className={styles.theatreGrid}>
            <div className={styles.sceneCopyRail}>
              <article data-scene-trigger="0" data-active={activeScene === 0} onMouseEnter={() => setActiveScene(0)}>
                <span>01 / SEARCH</span><h3>先找到正确的上下文。</h3>
                <p>语义检索理解问题的意思，不要求你记住文件名。关键词只是入口，真正命中的是相关段落。</p>
                <JourneyLink href="/knowledge" className={styles.sceneLink} onJourney={startJourney}>探索知识库 <ArrowIcon /></JourneyLink>
              </article>
              <article data-scene-trigger="1" data-active={activeScene === 1} onMouseEnter={() => setActiveScene(1)}>
                <span>02 / EVIDENCE</span><h3>让答案带着“收据”。</h3>
                <p>结论与来源同时出现。引用编号连接原始笔记，不把语言流畅误认为事实可靠。</p>
                <JourneyLink href="/assistant" className={styles.sceneLink} onJourney={startJourney}>开始一次问答 <ArrowIcon /></JourneyLink>
              </article>
              <article data-scene-trigger="2" data-active={activeScene === 2} onMouseEnter={() => setActiveScene(2)}>
                <span>03 / PRACTICE</span><h3>把知识练成现场表达。</h3>
                <p>真实 AI 面试官基于知识库出题，用 STAR 四维反馈暴露知识和表达的缺口。</p>
                <JourneyLink href="/interview" className={styles.sceneLink} onJourney={startJourney}>开始模拟面试 <ArrowIcon /></JourneyLink>
              </article>
            </div>

            <div className={styles.stickyStage} data-scene={activeScene} aria-live="polite" aria-label={`当前产品场景：${sceneLabels[activeScene]}`}>
              <div className={`${styles.scenePanel} ${styles.searchScene}`} data-active={activeScene === 0}>
                <div className={styles.sceneChrome}><span>知识检索</span><i>⌘ K</i></div>
                <div className={styles.bigSearch}><span>如何给 AI 功能做需求优先级？</span><b>↵</b></div>
                <div className={styles.filterRail}><span>全部章节</span><span>AI 产品</span><span>需求分析</span></div>
                <div className={styles.resultStack}>
                  <article><div><b>4.3 需求优先级</b><em>91%</em></div><p>用户价值、业务价值、实现成本与风险共同约束……</p></article>
                  <article><div><b>7.4 AI 产品评估</b><em>87%</em></div><p>增加数据可得性、模型不确定性与评测成本……</p></article>
                </div>
                <div className={styles.scanLine} aria-hidden="true" />
              </div>

              <div className={`${styles.scenePanel} ${styles.evidenceScene}`} data-active={activeScene === 1}>
                <div className={styles.answerCard}>
                  <small>ANSWER / 01</small>
                  <p>好的北极星指标应同时反映<strong>用户核心价值</strong>与<strong>长期增长方向</strong>。<sup>[1]</sup></p>
                </div>
                <svg className={styles.evidenceThread} aria-hidden="true" viewBox="0 0 300 110" preserveAspectRatio="none">
                  <path d="M8 10 C130 10 120 96 292 96" pathLength="1" />
                </svg>
                <div className={styles.receiptCard}>
                  <span>ORIGINAL NOTE · [1]</span><b>北极星指标.md</b>
                  <p>团队需要围绕一个能代表用户获得核心价值的指标持续迭代……</p>
                  <small>Obsidian / 05-数据指标</small>
                </div>
              </div>

              <div className={`${styles.scenePanel} ${styles.practiceScene}`} data-active={activeScene === 2}>
                <div className={styles.scoreDial}><strong>82</strong><span>/100</span><i /></div>
                <div className={styles.starFeedback}>
                  <div><b>S</b><span>场景交代</span><i style={{ "--score": ".78" } as React.CSSProperties} /><em>78</em></div>
                  <div><b>T</b><span>目标量化</span><i style={{ "--score": ".84" } as React.CSSProperties} /><em>84</em></div>
                  <div><b>A</b><span>行动逻辑</span><i style={{ "--score": ".88" } as React.CSSProperties} /><em>88</em></div>
                  <div><b>R</b><span>结果验证</span><i style={{ "--score": ".76" } as React.CSSProperties} /><em>76</em></div>
                </div>
                <div className={styles.followupBubble}>下一问：如果指标两周没有改善，你会先验证哪一个假设？</div>
              </div>

              <div className={styles.sceneCounter}><span>0{activeScene + 1}</span><i /><span>03</span></div>
            </div>
          </div>
        </section>

        <section id="workflow" className={styles.workflow} aria-labelledby="workflow-title">
          <div className={styles.workflowTitle} data-reveal>
            <span className={styles.sectionLabel}>03 — THE LOOP</span>
            <h2 id="workflow-title">知识不是库存，<br />它应该循环起来。</h2>
          </div>
          <div className={styles.loopTrack} data-reveal>
            <svg aria-hidden="true" viewBox="0 0 1200 240" preserveAspectRatio="none">
              <path d="M30 120 C170 10 310 230 450 120 S730 10 870 120 S1050 230 1170 120" pathLength="1" />
            </svg>
            <article><span>01</span><h3>接入</h3><p>Markdown 与 Obsidian 元数据</p></article>
            <article><span>02</span><h3>检索</h3><p>问题命中相关知识片段</p></article>
            <article><span>03</span><h3>回答</h3><p>生成带引用的可核验答案</p></article>
            <article><span>04</span><h3>演练</h3><p>STAR 反馈暴露真实缺口</p></article>
          </div>
        </section>

        <section id="privacy" className={styles.controlRoom} aria-labelledby="privacy-title">
          <div className={styles.controlMosaic} data-reveal aria-hidden="true">
            <div className={styles.localFolder}><BrandMark /><b>LOCAL</b><span>你的工作区</span></div>
            <div className={styles.fileTile}><span>204</span><b>Markdown</b><small>notes</small></div>
            <div className={styles.indexTile}><span>2,579</span><b>Vector index</b><small>chunks</small></div>
            <div className={styles.keyTile}><span>••••••••</span><b>API KEY</b><small>.env.local</small></div>
            <div className={styles.movingStamp}>YOU CONTROL IT</div>
          </div>
          <div className={styles.controlCopy} data-reveal>
            <span className={styles.sectionLabel}>04 — LOCAL CONTROL</span>
            <h2 id="privacy-title">先属于你，<br />再服务于你。</h2>
            <p>知识库、向量索引和会话记录由你的本机工作区掌控。只有发起 AI 请求时，相关片段才会发送给你主动配置的模型供应商。</p>
            <ul>
              <li><span>01</span><b>密钥</b><em>保存在本地环境文件</em></li>
              <li><span>02</span><b>离线</b><em>无密钥时进入本地演示</em></li>
              <li><span>03</span><b>溯源</b><em>随时回到对应原始笔记</em></li>
            </ul>
          </div>
        </section>

        <section className={styles.finalCta} data-reveal>
          <div className={styles.finalTicker} aria-hidden="true"><span>YOUR NOTES, NOW AT WORK — YOUR NOTES, NOW AT WORK —</span></div>
          <div className={styles.finalInner}>
            <p>你的笔记已经够多了。</p>
            <h2>现在，让它们<br /><em>开始工作。</em></h2>
            <div className={styles.finalActions}>
              <JourneyLink href="/assistant" className={styles.finalPrimary} onJourney={startJourney}>进入 PM Knowledge Hub <ArrowIcon /></JourneyLink>
              <JourneyLink href="/interview" className={styles.finalSecondary} onJourney={startJourney}>直接开始一场面试</JourneyLink>
            </div>
          </div>
          <div className={styles.finalShape} aria-hidden="true"><BrandMark /></div>
        </section>
      </div>

      <footer className={styles.siteFooter}>
        <div className={styles.footerBrand}><BrandMark /><span>PM Knowledge Hub</span></div>
        <p>为产品经理构建的本地知识与面试工作台。</p>
        <nav aria-label="页脚导航"><a href="#privacy">隐私说明</a><Link href="/about">项目说明</Link><Link href="/knowledge">知识库</Link></nav>
      </footer>

      <div className={styles.pageCurtain} data-active={Boolean(journeyTarget)} aria-hidden="true">
        <span /><span /><span />
        <div><BrandMark /><b>把知识带到现场</b></div>
      </div>
    </div>
  );
}
