"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, HealthResponse } from "@/lib/api";
import styles from "./page.module.css";

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [metrics, setMetrics] = useState<{
    collection_count: number;
    total_queries: number;
    mock_queries: number;
    live_queries: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Fetch system health on mount
    api.getHealth().then(setHealth);
    // Fetch metrics
    api.getMetrics().then(setMetrics).catch(err => console.error("Failed to fetch metrics", err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, this might navigate to a global search results page,
      // or open a search modal. For now, let's navigate to the knowledge base 
      // with a search parameter.
      router.push(`/knowledge?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        {/* Title */}
        <div className={styles.header}>
          <h1 className={styles.title}>PM Knowledge Hub</h1>
          <p className={styles.subtitle}>智能产品经理知识库与面试工作台</p>
        </div>

        {/* Search Bar */}
        <div className={styles.searchSection}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.searchIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="搜索你的知识库 (例如: AARRR 模型)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          <div className={styles.quickTags}>
            <span className={styles.tagLabel}>热门检索：</span>
            <button className={styles.tag} onClick={() => router.push('/knowledge?q=AARRR')}>AARRR</button>
            <button className={styles.tag} onClick={() => router.push('/knowledge?q=北极星指标')}>北极星指标</button>
            <button className={styles.tag} onClick={() => router.push('/knowledge?q=需求定义')}>需求定义</button>
            <button className={styles.tag} onClick={() => router.push('/knowledge?q=用户故事')}>用户故事</button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className={styles.grid}>
          <Link href="/knowledge" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                </svg>
              </div>
              <h2 className={styles.cardTitle}>知识库</h2>
            </div>
            <p className={styles.cardDesc}>
              浏览和检索 {health?.collection_count || '...'} 篇经过处理的本地 Obsidian 笔记，带有精确引用分片。
            </p>
          </Link>

          <Link href="/assistant" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className={styles.cardTitle}>AI 问答</h2>
            </div>
            <p className={styles.cardDesc}>
              基于 RAG 引擎的对话系统。获取带溯源标注的结构化回答，消除幻觉。
            </p>
          </Link>

          <Link href="/interview" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <polyline points="16 11 18 13 22 9" />
                </svg>
              </div>
              <h2 className={styles.cardTitle}>模拟面试</h2>
            </div>
            <p className={styles.cardDesc}>
              多轮真实的 PM 面试演练，并提供细粒度的 STAR 结构评估与弱点建议。
            </p>
          </Link>

          <Link href="/map" className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </div>
              <h2 className={styles.cardTitle}>知识图谱</h2>
            </div>
            <p className={styles.cardDesc}>
              可视化你的 PM 知识结构，探索笔记与章节之间的双向链接网络。
            </p>
          </Link>
        </div>

        {/* Metrics Section */}
        <div className={styles.metricsSection}>
          <div className={styles.metricsHeader}>
            <h2 className={styles.metricsTitle}>系统运行指标 (L1 & L2)</h2>
            <span className={styles.metricsStatus}>实时更新</span>
          </div>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>今日问答与面试次数 (L1)</span>
              <span className={styles.metricValue}>{metrics?.total_queries ?? 0}</span>
              <span className={styles.metricSub}>会话累计请求总量</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>真实 LLM 调用量</span>
              <span className={styles.metricValue}>{metrics?.live_queries ?? 0}</span>
              <span className={styles.metricSub}>Gemini API 实时召回</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>演示模式降级量</span>
              <span className={styles.metricValue}>{metrics?.mock_queries ?? 0}</span>
              <span className={styles.metricSub}>离线安全回退计数</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>向量库切片容量 (L2)</span>
              <span className={styles.metricValue}>{health?.collection_count ?? 2579}</span>
              <span className={styles.metricSub}>ChromaDB 索引分片数</span>
            </div>
          </div>

          <div className={styles.chartArea}>
            <div className={styles.chartLabels}>
              <span>LLM 调用配比 (真实 vs 演示)</span>
              <span>
                {metrics && metrics.total_queries > 0
                  ? `${Math.round((metrics.live_queries / metrics.total_queries) * 100)}% 真实`
                  : "暂无会话数据"}
              </span>
            </div>
            <div className={styles.chartBarWrapper}>
              <div 
                className={styles.chartBarLive} 
                style={{ 
                  width: metrics && metrics.total_queries > 0 
                    ? `${(metrics.live_queries / metrics.total_queries) * 100}%` 
                    : "50%" 
                }}
              ></div>
              <div 
                className={styles.chartBarMock} 
                style={{ 
                  width: metrics && metrics.total_queries > 0 
                    ? `${(metrics.mock_queries / metrics.total_queries) * 100}%` 
                    : "50%" 
                }}
              ></div>
            </div>
            <div className={styles.chartLegend}>
              <span className={styles.legendItem}><span className={styles.dotLive}></span>真实 API (Gemini)</span>
              <span className={styles.legendItem}><span className={styles.dotMock}></span>演示模式 (Mock)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Status Bar */}
      <footer className={styles.footer}>
        <div className={styles.statusIndicator} data-status={health?.status === 'ok' ? 'online' : (health?.status === 'offline' ? 'error' : 'loading')}></div>
        <span className={styles.statusText}>
          {health?.status === 'ok'
            ? `ChromaDB: ${health.collection_count} chunks • Model: ${health.embedding_model}`
            : health?.status === 'offline' 
            ? 'Backend connection error (Ensure python server is running on port 8000)'
            : 'Connecting to backend...'}
        </span>
      </footer>
    </div>
  );
}
