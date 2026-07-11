"use client";

import React, { useState, useEffect, Suspense, isValidElement, cloneElement } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api, SearchHit } from "@/lib/api";
import { escapeRegExp } from "@/lib/utils";
import styles from "./page.module.css";

// Hardcoded chapters for demonstration (would typically come from a backend /chapters API)
const CHAPTERS = [
  { id: "all", name: "全部知识库" },
  { id: "01-入门", name: "01-入门" },
  { id: "02-思维与软实力", name: "02-思维与软实力" },
  { id: "03-全流程知识", name: "03-全流程知识" },
  { id: "04-前人经验", name: "04-前人经验" },
  { id: "05-项目实践", name: "05-项目实践" },
  { id: "06-面试", name: "06-面试" },
  { id: "07-AI工作", name: "07-AI工作" },
  { id: "08-深入学习数据", name: "08-深入学习数据" },
  { id: "09-深入学习AI", name: "09-深入学习AI" },
  { id: "10-AI政治", name: "10-AI政治" },
  { id: "11-AI公司研究", name: "11-AI公司研究" },
  { id: "12-AI或产品专家", name: "12-AI或产品专家" },
  { id: "13-AI金融", name: "13-AI金融" },
];

function KnowledgeBaseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [activeChapter, setActiveChapter] = useState("all");
  const [results, setResults] = useState<SearchHit[]>([]);
  const [activeDoc, setActiveDoc] = useState<SearchHit | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const highlightText = (node: React.ReactNode, searchWord: string): React.ReactNode => {
    if (!searchWord.trim()) return node;
    
    if (typeof node === "string") {
      const escaped = escapeRegExp(searchWord);
      const parts = node.split(new RegExp(`(${escaped})`, "gi"));
      return parts.map((part, i) =>
        part.toLowerCase() === searchWord.toLowerCase() ? (
          <mark key={i} className={styles.highlight}>
            {part}
          </mark>
        ) : (
          part
        )
      );
    }
    
    if (Array.isArray(node)) {
      return node.map((child, i) => <React.Fragment key={i}>{highlightText(child, searchWord)}</React.Fragment>);
    }
    
    if (isValidElement(node)) {
      const element = node as React.ReactElement<any>;
      if (element.props && element.props.children) {
        return cloneElement(element, {
          children: highlightText(element.props.children, searchWord)
        });
      }
    }
    
    return node;
  };

  const markdownComponents = {
    p: ({ children }: any) => <p>{highlightText(children, initialQuery)}</p>,
    li: ({ children }: any) => <li>{highlightText(children, initialQuery)}</li>,
    h1: ({ children }: any) => <h1>{highlightText(children, initialQuery)}</h1>,
    h2: ({ children }: any) => <h2>{highlightText(children, initialQuery)}</h2>,
    h3: ({ children }: any) => <h3>{highlightText(children, initialQuery)}</h3>,
    td: ({ children }: any) => <td>{highlightText(children, initialQuery)}</td>,
    th: ({ children }: any) => <th>{highlightText(children, initialQuery)}</th>,
  };

  const performSearch = async (q: string, chapter: string) => {
    setIsLoading(true);
    try {
      const chapterFilter = chapter === "all" ? undefined : chapter;
      let res;
      
      if (!q.trim()) {
        res = await api.getDocuments(chapterFilter);
      } else {
        res = await api.semanticSearch(q.trim(), 20, chapterFilter);
      }
      
      setResults(res.results);
      if (res.results.length > 0) {
        setActiveDoc(res.results[0]);
      } else {
        setActiveDoc(null);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    performSearch(initialQuery, activeChapter);
  }, [initialQuery, activeChapter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/knowledge?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className={styles.container}>
      {/* Column 1: Directory Tree */}
      <div className={styles.colTree}>
        <div className={styles.treeHeader}>
          <h2 className={styles.treeTitle}>目录分类</h2>
        </div>
        <div className={styles.treeList}>
          {CHAPTERS.map(ch => (
            <button
              key={ch.id}
              className={`${styles.treeItem} ${activeChapter === ch.id ? styles.activeTreeItem : ''}`}
              onClick={() => setActiveChapter(ch.id)}
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {ch.id === 'all' ? (
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                ) : (
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                )}
              </svg>
              <span>{ch.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Column 2: Document List */}
      <div className={styles.colList}>
        <div className={styles.listHeader}>
          <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <svg aria-hidden="true" className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="在列表中搜索..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </form>
          <div className={styles.listMeta} aria-live="polite">
            <span>找到 {results.length} 篇笔记</span>
          </div>
        </div>

        <div className={styles.listContent}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <span>正在加载...</span>
            </div>
          ) : results.length === 0 ? (
            <div className={styles.emptyState}>
              <span>没有找到相关笔记</span>
            </div>
          ) : (
            results.map((hit, idx) => (
              <div 
                key={idx}
                className={`${styles.listItem} ${activeDoc === hit ? styles.activeListItem : ''}`}
                onClick={() => setActiveDoc(hit)}
              >
                <div className={styles.itemTitle}>{highlightText(hit.metadata.title, initialQuery)}</div>
                <div className={styles.itemMeta}>
                  <span className={styles.itemChapter}>{hit.metadata.chapter}</span>
                  {hit.distance > 0 && <span className={styles.itemScore}>相关度: {(1 - hit.distance).toFixed(2)}</span>}
                </div>
                {hit.metadata.tags && (
                  <div className={styles.itemTags}>
                    {hit.metadata.tags.split(',').slice(0, 3).map((t, i) => (
                      <span key={i} className={styles.tag}>{t.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Column 3: Preview Area */}
      <div className={styles.colPreview}>
        {activeDoc ? (
          <>
            <div className={styles.previewHeader}>
              <div className={styles.previewTitleInfo}>
                <h1 className={styles.previewTitle}>{highlightText(activeDoc.metadata.title, initialQuery)}</h1>
                <div className={styles.previewPath}>
                  {activeDoc.metadata.source_path} 
                  {activeDoc.metadata.section && activeDoc.metadata.section !== activeDoc.metadata.title ? ` > ${activeDoc.metadata.section}` : ''}
                </div>
              </div>
              
              {activeDoc.metadata.obsidian_uri && (
                <a 
                  href={activeDoc.metadata.obsidian_uri} 
                  className={styles.obsidianBtn}
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  在 Obsidian 打开
                </a>
              )}
            </div>
            <div className={styles.previewContent}>
              <div className={styles.markdownContent}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {activeDoc.text}
                </ReactMarkdown>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.emptyPreview}>
            <svg aria-hidden="true" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <p>在左侧选择一篇笔记以查看详情</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KnowledgePage() {
  return (
    <Suspense fallback={<div className={styles.fallbackLoader}>Loading workspace...</div>}>
      <KnowledgeBaseContent />
    </Suspense>
  );
}
