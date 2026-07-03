"use client";

import styles from "./page.module.css";

export default function MapPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>知识图谱</h1>
          <p className={styles.subtitle}>知识节点双向链接网络</p>
        </div>
      </div>
      
      <div className={styles.mapArea}>
        <div className={styles.placeholder}>
          <div className={styles.svgWrapper}>
            <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid meet">
              <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--brand-subtle)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
              
              {/* Lines */}
              <g stroke="var(--border-component)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5">
                <line x1="400" y1="300" x2="250" y2="200" />
                <line x1="400" y1="300" x2="550" y2="180" />
                <line x1="400" y1="300" x2="300" y2="450" />
                <line x1="400" y1="300" x2="520" y2="420" />
                <line x1="250" y1="200" x2="150" y2="250" />
                <line x1="550" y1="180" x2="650" y2="150" />
                <line x1="550" y1="180" x2="600" y2="280" />
              </g>

              {/* Glows */}
              <circle cx="400" cy="300" r="80" fill="url(#glow)" />
              <circle cx="250" cy="200" r="50" fill="url(#glow)" />
              <circle cx="550" cy="180" r="60" fill="url(#glow)" />

              {/* Nodes */}
              <g fill="var(--surface-1)" stroke="var(--brand)" strokeWidth="2">
                <circle cx="400" cy="300" r="24" />
                <circle cx="250" cy="200" r="16" />
                <circle cx="550" cy="180" r="20" />
                <circle cx="300" cy="450" r="12" />
                <circle cx="520" cy="420" r="14" />
                <circle cx="150" cy="250" r="10" />
                <circle cx="650" cy="150" r="10" />
                <circle cx="600" cy="280" r="12" />
              </g>

              {/* Labels */}
              <g fill="var(--text-1)" fontSize="13" fontFamily="var(--font-sans)" textAnchor="middle">
                <text x="400" y="340" fontWeight="600">产品经理</text>
                <text x="250" y="235">需求分析</text>
                <text x="550" y="220">数据指标</text>
                <text x="300" y="480" fill="var(--text-2)">敏捷开发</text>
                <text x="520" y="450" fill="var(--text-2)">竞品分析</text>
              </g>
            </svg>
          </div>
          
          <div className={styles.noticeBox}>
            <h3 className={styles.noticeTitle}>图谱功能开发中</h3>
            <p className={styles.noticeDesc}>
              基于 Obsidian 双向链接（Wikilinks）的图谱渲染模块将在 Phase D 推出。
              当前版本核心聚焦于语义检索（RAG）与 STAR 面试演练。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
