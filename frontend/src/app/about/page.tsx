"use client";

import styles from "./page.module.css";

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>关于 PM Knowledge Hub</h1>
        <p className={styles.subtitle}>基于 RAG 的个人知识库智能体</p>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2>系统架构 (Phase C)</h2>
          <p>
            PM Knowledge Hub 是一个用于产品经理面试准备与知识管理的 RAG 智能体系统。
            当前版本 (Phase C) 实现了完整的前后端闭环。
          </p>

          <div className={styles.architectureDiagram}>
            <div className={styles.archBox}>
              <div className={styles.archTitle}>Frontend (Next.js)</div>
              <ul className={styles.archList}>
                <li>React 19 + App Router</li>
                <li>Zinc OKLCH Dual Theme</li>
                <li>Markdown GFM Rendering</li>
              </ul>
            </div>
            
            <div className={styles.archArrow}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
              <span>REST API</span>
            </div>

            <div className={styles.archBox}>
              <div className={styles.archTitle}>Backend (FastAPI)</div>
              <ul className={styles.archList}>
                <li>Python 3.12 + LangChain</li>
                <li>RAG Pipeline (Top-K, Rerank)</li>
                <li>STAR Interview Evaluator</li>
              </ul>
            </div>

            <div className={styles.archArrow}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>

            <div className={styles.archBox}>
              <div className={styles.archTitle}>Data Layer</div>
              <ul className={styles.archList}>
                <li>ChromaDB Vector Store</li>
                <li>paraphrase-multilingual</li>
                <li>Obsidian Local Vault</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>核心能力</h2>
          <ul className={styles.featureList}>
            <li>
              <strong>语义检索：</strong> 
              抛弃传统的关键词匹配，支持自然语言提问，精确匹配 Obsidian 笔记中相关的段落和分片。
            </li>
            <li>
              <strong>带溯源的 RAG 问答：</strong>
              AI 回答不仅提供结论，还会提供带有 `[1]` 标记的引用来源，支持一键跳回源笔记验证，杜绝幻觉。
            </li>
            <li>
              <strong>STAR 智能面试演练：</strong>
              多轮追问对话，能够基于 S (情景) / T (任务) / A (行动) / R (结果) 四个维度独立评分，并提供改进建议和标准参考。
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
