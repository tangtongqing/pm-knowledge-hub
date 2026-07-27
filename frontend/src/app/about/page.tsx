"use client";

import styles from "./page.module.css";

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>关于 PM Knowledge Hub</h1>
        <p className={styles.subtitle}>公开演示版 · 无真实 AI 调用</p>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2>线上演示与本地完整版</h2>
          <p>
            PM Knowledge Hub 是一个用于产品经理面试准备与知识管理的 RAG 智能体系统。
            你正在访问的是公开演示版：功能由浏览器内的脱敏演示数据驱动，不连接 FastAPI、
            ChromaDB 或真实 AI 模型，也不会产生模型调用费用。
          </p>
          <p>
            本地完整版可启用后端 API、向量检索、带引用的 RAG 问答与面试评估。
            下方展示的是本地完整版架构，不代表公开演示站的运行方式。
          </p>

          <h3>本地完整版架构</h3>
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
              <strong>知识浏览与检索：</strong>
              公开演示版提供脱敏样例内容、分类浏览和关键词搜索；本地完整版可进一步接入向量语义检索。
            </li>
            <li>
              <strong>带引用的问答体验：</strong>
              公开演示版使用预设回答和引用展示完整交互；本地完整版可接入真实 RAG 流程，并通过来源引用辅助核验。
            </li>
            <li>
              <strong>STAR 面试演练：</strong>
              公开演示版提供预设题目、评分和报告导出；本地完整版可启用后端评估流程，按 S / T / A / R 四个维度给出反馈。
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
