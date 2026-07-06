"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, HealthResponse } from "@/lib/api";
import styles from "./page.module.css";

export default function Home() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Fetch system health on mount
    api.getHealth().then(setHealth);
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
