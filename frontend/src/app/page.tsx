"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, HealthResponse } from "@/lib/api";
import styles from "./page.module.css";

const ArrowIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
    <path d="M4 10h11M11 6l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BrandMark = () => (
  <svg aria-hidden="true" viewBox="0 0 32 32" width="30" height="30">
    <path d="M16 3 4 9l12 6 12-6-12-6Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
    <path d="m4 15 12 6 12-6M4 21l12 6 12-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    api.getHealth().then(setHealth);
  }, []);

  const noteCount = health?.note_count || 204;
  const chunkCount = health?.collection_count || 2579;
  const isOnline = health?.status === "ok";

  return (
    <div className={styles.landing}>
      <header className={styles.siteHeader}>
        <Link href="/" className={styles.brand} aria-label="PM Knowledge Hub 首页">
          <span className={styles.brandMark}><BrandMark /></span>
          <span className={styles.brandName}>PM Knowledge Hub</span>
        </Link>

        <nav className={styles.marketingNav} aria-label="营销页导航">
          <a href="#product">产品</a>
          <a href="#workflow">工作流</a>
          <a href="#privacy">隐私</a>
        </nav>

        <Link href="/assistant" className={styles.headerCta}>
          进入工作台 <ArrowIcon />
        </Link>
      </header>

      <div>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}>
                <span className={styles.signalDot} />
                Local-first product intelligence
              </div>
              <h1 id="hero-title">
                把零散笔记，
                <span>变成你的产品判断力。</span>
              </h1>
              <p className={styles.heroLead}>
                将本地 Obsidian 知识库连接成可检索、可追溯、可演练的个人产品知识系统。找到答案，也看见答案从哪里来。
              </p>
              <div className={styles.heroActions}>
                <Link href="/assistant" className={styles.primaryCta}>
                  用知识库问一个问题 <ArrowIcon />
                </Link>
                <a href="#product" className={styles.secondaryCta}>看看它如何工作</a>
              </div>
              <div className={styles.heroMeta}>
                <span>无需注册</span>
                <span>本地索引</span>
                <span>自带模型密钥</span>
              </div>
            </div>

            <div className={styles.heroStage} aria-label="产品界面预览">
              <div className={styles.stageGlow} />
              <div className={styles.productWindow}>
                <div className={styles.windowBar}>
                  <div className={styles.windowDots}><i /><i /><i /></div>
                  <span>PM Knowledge Hub / AI 问答</span>
                  <div className={styles.runtimeStatus} data-online={isOnline}>
                    <i /> {isOnline ? "本地服务在线" : "本地工作区"}
                  </div>
                </div>

                <div className={styles.windowBody}>
                  <aside className={styles.previewRail} aria-hidden="true">
                    <span className={styles.railLogo}><BrandMark /></span>
                    <span className={styles.railItem} />
                    <span className={`${styles.railItem} ${styles.railItemActive}`} />
                    <span className={styles.railItem} />
                    <span className={styles.railItem} />
                  </aside>

                  <div className={styles.previewConversation}>
                    <div className={styles.previewLabel}>基于你的知识库</div>
                    <div className={styles.questionBubble}>
                      AI 产品的北极星指标应该怎么定？
                    </div>
                    <div className={styles.answerBlock}>
                      <div className={styles.answerLead}>
                        先定义用户真正获得价值的那一刻，再选择能持续反映这一价值的行为指标。
                      </div>
                      <div className={styles.answerLine}><b>01</b><span>价值时刻：用户完成一次可用的 AI 产出</span><em>[1]</em></div>
                      <div className={styles.answerLine}><b>02</b><span>领先指标：高质量任务完成率</span><em>[2]</em></div>
                      <div className={styles.answerLine}><b>03</b><span>护栏指标：人工修订率与次周留存</span><em>[3]</em></div>
                    </div>
                  </div>

                  <aside className={styles.evidencePanel}>
                    <div className={styles.evidenceHeader}>
                      <span>引用证据</span><strong>3</strong>
                    </div>
                    <div className={styles.evidenceCard}>
                      <div><span>[1]</span> 北极星指标</div>
                      <p>从用户价值而非流量规模出发……</p>
                    </div>
                    <div className={styles.evidenceCard}>
                      <div><span>[2]</span> AI 产品指标</div>
                      <p>同时观察质量、效率与留存……</p>
                    </div>
                    <div className={styles.evidenceCard}>
                      <div><span>[3]</span> 数据护栏</div>
                      <p>避免单一指标带来的局部最优……</p>
                    </div>
                  </aside>
                </div>
              </div>
              <div className={styles.stageCaption}>
                <span>QUESTION</span>
                <i />
                <span>REASONING</span>
                <i />
                <span>EVIDENCE</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.proofRail} aria-label="产品实时数据">
          <div className={styles.proofIntro}>现在，这个知识系统正在本机运行</div>
          <div className={styles.proofStats}>
            <div><strong>{noteCount}</strong><span>篇本地笔记</span></div>
            <div><strong>{chunkCount.toLocaleString()}</strong><span>个语义切片</span></div>
            <div><strong>4</strong><span>条核心工作流</span></div>
            <div><strong>{health?.version || "v1.6"}</strong><span>当前版本</span></div>
          </div>
        </section>

        <section className={styles.thesis}>
          <div className={styles.sectionIndex}>01 / WHY</div>
          <div className={styles.thesisContent}>
            <h2>笔记越多，<br />不代表判断越快。</h2>
            <div className={styles.thesisBody}>
              <p>
                收藏解决的是“以后可能有用”，真正的工作发生在另一端：当你要做判断、写方案、参加面试时，能否及时调用自己的知识。
              </p>
              <p>
                PM Knowledge Hub 不替你思考。它把资料、出处与练习放在一条链路上，让每一次提问都成为知识的再次组织。
              </p>
            </div>
          </div>
        </section>

        <section id="product" className={styles.productStories} aria-labelledby="product-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionIndex}>02 / PRODUCT</span>
              <h2 id="product-title">从“我记得看过”，<br />到“我能清楚说明”。</h2>
            </div>
            <p>每个功能都服务于同一个结果：更快找到证据，更稳形成判断，更清楚表达出来。</p>
          </div>

          <article className={styles.storyRow}>
            <div className={styles.storyCopy}>
              <span className={styles.storyNumber}>01</span>
              <h3>先找到正确的上下文。</h3>
              <p>语义检索理解问题的意思，不要求你记住文件名。按章节与标签收窄范围，直接抵达相关段落。</p>
              <Link href="/knowledge" className={styles.textLink}>探索知识库 <ArrowIcon /></Link>
            </div>
            <div className={`${styles.storyVisual} ${styles.searchVisual}`}>
              <div className={styles.searchCommand}>
                <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" /></svg>
                <span>如何给 AI 功能做需求优先级？</span><kbd>↵</kbd>
              </div>
              <div className={styles.searchFilters}><span>全部章节</span><span>AI 产品</span><span>需求分析</span></div>
              <div className={styles.searchResult}>
                <div><b>4.3 需求优先级</b><em>0.91</em></div>
                <p>优先级不是功能价值的单点评分，而是用户价值、业务价值、实现成本与风险的共同约束……</p>
              </div>
              <div className={`${styles.searchResult} ${styles.searchResultMuted}`}>
                <div><b>7.4 AI 产品评估</b><em>0.87</em></div>
                <p>AI 功能还需要增加数据可得性、模型不确定性与评测成本三个维度……</p>
              </div>
            </div>
          </article>

          <article className={`${styles.storyRow} ${styles.storyRowReverse}`}>
            <div className={styles.storyCopy}>
              <span className={styles.storyNumber}>02</span>
              <h3>答案要有“收据”。</h3>
              <p>AI 回答与来源片段并排呈现。结论上的引用编号可以直接跳到证据，不把“听起来合理”当成事实。</p>
              <Link href="/assistant" className={styles.textLink}>开始一次问答 <ArrowIcon /></Link>
            </div>
            <div className={`${styles.storyVisual} ${styles.citationVisual}`}>
              <div className={styles.citationQuote}>
                好的北极星指标应同时反映<strong>用户核心价值</strong>与<strong>长期增长方向</strong>。
                <sup>[1]</sup>
              </div>
              <div className={styles.citationPath}><span>回答</span><i /><span>引用 [1]</span><i /><span>原始笔记</span></div>
              <div className={styles.sourceReceipt}>
                <div><b>[1] 北极星指标.md</b><span>05-数据指标</span></div>
                <p>“团队需要围绕一个能代表用户获得核心价值的指标持续迭代……”</p>
                <small>Obsidian · 本地文件</small>
              </div>
            </div>
          </article>

          <article className={styles.storyRow}>
            <div className={styles.storyCopy}>
              <span className={styles.storyNumber}>03</span>
              <h3>把知识练成现场表达。</h3>
              <p>真实 AI 面试官基于知识库出题，用 STAR 四维反馈拆解回答，并给出下一轮追问与参考思路。</p>
              <Link href="/interview" className={styles.textLink}>开始模拟面试 <ArrowIcon /></Link>
            </div>
            <div className={`${styles.storyVisual} ${styles.interviewVisual}`}>
              <div className={styles.scoreRing}><strong>82</strong><span>/ 100</span></div>
              <div className={styles.starRows}>
                <div><b>S</b><span>场景交代清楚，但约束条件不足</span><em>78</em></div>
                <div><b>T</b><span>目标明确，指标需要进一步量化</span><em>84</em></div>
                <div><b>A</b><span>方案分层完整，优先级逻辑清晰</span><em>88</em></div>
                <div><b>R</b><span>补充验证周期与成功阈值</span><em>76</em></div>
              </div>
              <div className={styles.nextQuestion}>下一问：如果关键指标两周没有改善，你会先验证哪一个假设？</div>
            </div>
          </article>
        </section>

        <section id="workflow" className={styles.workflow} aria-labelledby="workflow-title">
          <div className={styles.workflowHeader}>
            <span className={styles.sectionIndex}>03 / WORKFLOW</span>
            <h2 id="workflow-title">一条不断变强的知识闭环。</h2>
          </div>
          <div className={styles.workflowTrack}>
            <div className={styles.workflowLine} />
            <article><span>01</span><h3>接入</h3><p>读取本地 Markdown 与 Obsidian 元数据。</p></article>
            <article><span>02</span><h3>检索</h3><p>把问题映射到最相关的知识片段。</p></article>
            <article><span>03</span><h3>回答</h3><p>生成带引用、可回到原文核验的答案。</p></article>
            <article><span>04</span><h3>演练</h3><p>用 STAR 反馈暴露知识与表达的缺口。</p></article>
          </div>
        </section>

        <section id="privacy" className={styles.privacy} aria-labelledby="privacy-title">
          <div className={styles.privacyVisual} aria-hidden="true">
            <div className={styles.vaultCore}><BrandMark /><span>LOCAL</span></div>
            <span className={`${styles.orbit} ${styles.orbitOne}`} />
            <span className={`${styles.orbit} ${styles.orbitTwo}`} />
            <span className={styles.vaultNode}>MD</span>
            <span className={styles.vaultNode}>DB</span>
            <span className={styles.vaultNode}>KEY</span>
          </div>
          <div className={styles.privacyCopy}>
            <span className={styles.sectionIndex}>04 / CONTROL</span>
            <h2 id="privacy-title">你的知识，<br />先属于你。</h2>
            <p>知识库、向量索引和会话记录都由你的本机工作区掌控。只有在发起 AI 请求时，相关片段才会发送给你主动配置的模型供应商。</p>
            <ul>
              <li><span>01</span>API 密钥保存在本地环境文件</li>
              <li><span>02</span>无密钥时自动进入本地演示模式</li>
              <li><span>03</span>可随时追溯答案对应的原始笔记</li>
            </ul>
          </div>
        </section>

        <section className={styles.finalCta}>
          <div className={styles.finalSignal}><span /><span /><span /></div>
          <p>你的笔记已经够多了。</p>
          <h2>现在，让它们开始工作。</h2>
          <div className={styles.finalActions}>
            <Link href="/assistant" className={styles.primaryCta}>进入 PM Knowledge Hub <ArrowIcon /></Link>
            <Link href="/interview" className={styles.secondaryCta}>直接开始一场面试</Link>
          </div>
        </section>
      </div>

      <footer className={styles.siteFooter}>
        <div className={styles.footerBrand}><BrandMark /><span>PM Knowledge Hub</span></div>
        <p>为产品经理构建的本地知识与面试工作台。</p>
        <nav aria-label="页脚导航">
          <a href="#privacy">隐私说明</a>
          <Link href="/about">项目说明</Link>
          <Link href="/knowledge">知识库</Link>
        </nav>
      </footer>
    </div>
  );
}
