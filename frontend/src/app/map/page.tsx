/* eslint-disable */
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { api, GraphNode, GraphLink, GraphResponse } from "@/lib/api";
import styles from "./page.module.css";

// 动态导入 react-force-graph-2d，避免 SSR / Next.js 16 编译冲突
const ForceGraph2D = dynamic(
  () => import("react-force-graph-2d").then((mod) => mod.default),
  { ssr: false }
);

// 13 个章节调色板
const CHAPTER_COLORS: Record<string, string> = {
  "01-入门": "#f43f5e",          // Rose
  "02-思维与软实力": "#ec4899",   // Pink
  "03-全流程知识": "#d946ef",     // Fuchsia
  "04-前人经验": "#a855f7",       // Purple
  "05-项目实践": "#6366f1",       // Indigo
  "06-面试": "#3b82f6",          // Blue
  "07-AI工作": "#0ea5e9",        // Sky
  "08-深入学习数据": "#06b6d4",   // Cyan
  "09-深入学习AI": "#14b8a6",     // Teal
  "10-AI政治": "#10b981",        // Emerald
  "11-AI公司研究": "#22c55e",     // Green
  "12-AI或产品专家": "#84cc16",   // Lime
  "13-AI金融": "#eab308",        // Yellow
};

const CHAPTERS_LIST = [
  { id: "all", name: "全部目录" },
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

export default function MapPage() {
  const [level, setLevel] = useState<"chapter" | "note">("chapter");
  const [selectedChapter, setSelectedChapter] = useState<string>("all");
  const [graphData, setGraphData] = useState<GraphResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 交互高亮状态
  const [hoverNode, setHoverNode] = useState<any | null>(null);
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set());

  // 选中节点详情展示
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const fgRef = useRef<any>(null);

  // 获取后端图谱数据
  const fetchGraph = async (lvl: "chapter" | "note", ch?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const filterCh = ch === "all" ? undefined : ch;
      const res = await api.getGraph(lvl, filterCh);
      setGraphData(res);
      setSelectedNode(null);
    } catch (err: any) {
      console.error(err);
      setError("获取图谱拓扑数据失败，请确保后端服务正常启动。");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph(level, selectedChapter);
  }, [level, selectedChapter]);

  // 构建高亮邻居节点的集合
  const updateHighlight = (node: any) => {
    setHoverNode(node);
    highlightNodes.clear();
    highlightLinks.clear();

    if (node && graphData) {
      highlightNodes.add(node.id);
      graphData.links.forEach((link: any) => {
        const sourceId = typeof link.source === "object" ? link.source.id : link.source;
        const targetId = typeof link.target === "object" ? link.target.id : link.target;
        
        if (sourceId === node.id) {
          highlightNodes.add(targetId);
          highlightLinks.add(`${sourceId}->${targetId}`);
        } else if (targetId === node.id) {
          highlightNodes.add(sourceId);
          highlightLinks.add(`${sourceId}->${targetId}`);
        }
      });
    }

    setHighlightNodes(new Set(highlightNodes));
    setHighlightLinks(new Set(highlightLinks));
  };

  // 点击聚焦并平移缩放
  const handleNodeClick = (node: any) => {
    if (!node) return;
    
    // Zoom/Pan into node
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 800);
      fgRef.current.zoom(level === "chapter" ? 4.5 : 2.5, 800);
    }
    
    // 侧边栏详情展示
    const rawNode = graphData?.nodes.find((n) => n.id === node.id);
    if (rawNode) {
      setSelectedNode(rawNode);
    }
  };

  // 格式化 Obsidian 唤醒链接
  const getObsidianUri = (nodeId: string) => {
    if (!nodeId) return "";
    // nodeId 格式: 01-入门/1.1-需求.md
    const pathNoExt = nodeId.replace(".md", "");
    return `obsidian://open?vault=从零开始成为产品经理&file=${encodeURIComponent(pathNoExt)}`;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>知识图谱地图</h1>
          <p className={styles.subtitle}>基于 Obsidian 引用链路与学习通关路径的可视化脑图</p>
        </div>

        {/* 控制面板 */}
        <div className={styles.controls}>
          <div className={styles.btnGroup}>
            <button
              className={`${styles.ctrlBtn} ${level === "chapter" ? styles.active : ""}`}
              onClick={() => {
                setLevel("chapter");
                setSelectedChapter("all");
              }}
            >
              按目录聚合
            </button>
            <button
              className={`${styles.ctrlBtn} ${level === "note" ? styles.active : ""}`}
              onClick={() => setLevel("note")}
            >
              按笔记展开
            </button>
          </div>

          {level === "note" && (
            <select
              className={styles.select}
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
            >
              {CHAPTERS_LIST.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  {ch.name}
                </option>
              ))}
            </select>
          )}

          <button
            className={styles.resetBtn}
            onClick={() => {
              if (fgRef.current) {
                try {
                  fgRef.current.zoomToFit(400);
                } catch (e) {
                  console.error("zoomToFit failed", e);
                }
              }
            }}
            aria-label="重置视图"
            title="重置视图"
          >
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6"></path>
              <path d="M9 21H3v-6"></path>
              <path d="M21 3l-7 7"></path>
              <path d="M3 21l7-7"></path>
            </svg>
            重置视图
          </button>
        </div>
      </header>

      <div className={styles.mainLayout}>
        {/* 图谱渲染区域 */}
        <div className={styles.graphContainer}>
          {isLoading && (
            <div className={styles.loadingBox}>
              <div className={styles.spinner}></div>
              <p>加载图谱数据中...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorBox}>
              <p className={styles.errorText}>{error}</p>
              <button className={styles.retryBtn} onClick={() => fetchGraph(level, selectedChapter)}>
                重试加载
              </button>
            </div>
          )}

          {!isLoading && !error && graphData && (
            <>
              {level === "note" && selectedChapter === "all" && (
                <div className={styles.toast}>
                  💡 笔记数量较多，可使用右上角下拉菜单过滤特定章节。
                </div>
              )}
              
              <ForceGraph2D
                ref={fgRef}
                graphData={graphData}
                nodeRelSize={level === "chapter" ? 8 : 4.5}
                nodeColor={(node: any) => {
                  const color = CHAPTER_COLORS[node.chapter] || "#94a3b8";
                  // hover高亮逻辑
                  if (hoverNode) {
                    return highlightNodes.has(node.id) ? color : `${color}25`;
                  }
                  return color;
                }}
                nodeLabel={(node: any) => {
                  return level === "chapter"
                    ? `${node.label} (${node.note_count}篇笔记)`
                    : `${node.label} [${node.chapter}]`;
                }}
                linkLabel={(link: any) => {
                  if (link.weight === 3) return "章节跨越线";
                  if (link.weight === 2) return "学习路线主干线";
                  return "主题关键词关联";
                }}
                linkWidth={(link: any) => {
                  // hover高亮逻辑
                  const sourceId = typeof link.source === "object" ? link.source.id : link.source;
                  const targetId = typeof link.target === "object" ? link.target.id : link.target;
                  const isHighlighted = highlightLinks.has(`${sourceId}->${targetId}`);
                  
                  if (hoverNode) {
                    return isHighlighted ? (link.weight === 1 ? 1 : 2) : 0.2;
                  }
                  
                  if (link.weight === 3) return 2;
                  if (link.weight === 2) return 1.5;
                  return 0.5;
                }}
                linkColor={(link: any) => {
                  const sourceId = typeof link.source === "object" ? link.source.id : link.source;
                  const targetId = typeof link.target === "object" ? link.target.id : link.target;
                  const isHighlighted = highlightLinks.has(`${sourceId}->${targetId}`);

                  if (hoverNode) {
                    return isHighlighted ? "var(--brand)" : "rgba(226, 232, 240, 0.05)";
                  }
                  return link.weight === 1 ? "rgba(226, 232, 240, 0.25)" : "rgba(226, 232, 240, 0.6)";
                }}
                linkDirectionalArrowLength={(link: any) => (link.weight >= 2 ? 3.5 : 0)}
                linkDirectionalArrowRelPos={0.95}
                linkDirectionalParticles={(link: any) => {
                  // hover高亮或主干线上有流动小粒子
                  const sourceId = typeof link.source === "object" ? link.source.id : link.source;
                  const targetId = typeof link.target === "object" ? link.target.id : link.target;
                  const isHighlighted = highlightLinks.has(`${sourceId}->${targetId}`);
                  
                  if (isHighlighted) return 4;
                  return link.weight === 3 ? 1 : 0;
                }}
                linkDirectionalParticleSpeed={0.01}
                linkDirectionalParticleWidth={2}
                onNodeHover={updateHighlight}
                onNodeClick={handleNodeClick}
                backgroundColor="var(--canvas)"
                // 自定义节点绘制，增加文字显示
                nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                  const label = node.label;
                  const fontSize = level === "chapter" ? 14 / globalScale : 11 / globalScale;
                  ctx.font = `${level === "chapter" ? "600" : "400"} ${fontSize}px sans-serif`;
                  
                  const r = level === "chapter" ? 10 : 5;
                  const color = CHAPTER_COLORS[node.chapter] || "#94a3b8";

                  // 画外环高亮效果
                  if (hoverNode && highlightNodes.has(node.id)) {
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, r + 2.5, 0, 2 * Math.PI, false);
                    ctx.fillStyle = `${color}40`;
                    ctx.fill();
                  }

                  // 绘制实体圆形节点
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                  ctx.fillStyle = hoverNode ? (highlightNodes.has(node.id) ? color : `${color}25`) : color;
                  ctx.fill();
                  
                  // 绘制标签文本（仅在足够大的缩放比率下绘制笔记名字，避免层级文字重叠卡顿）
                  if (level === "chapter" || globalScale > 1.2) {
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = hoverNode 
                      ? (highlightNodes.has(node.id) ? "var(--text-1)" : "var(--text-3)")
                      : "var(--text-2)";
                    ctx.fillText(label, node.x, node.y + r + 8);
                  }
                }}
              />
              {/* Visually hidden screen reader fallback */}
              {graphData && (
                <div className={styles.srOnly} aria-label="知识图谱节点摘要">
                  共 {graphData.nodes.length} 个节点，{graphData.links.length} 条连接。节点列表：
                  {graphData.nodes.map((n) => n.label).join("、")}
                </div>
              )}
            </>
          )}
        </div>

        {/* 侧边节点详情面板 */}
        <aside className={styles.sidebar}>
          {!selectedNode ? (
            <div className={styles.emptySidebar}>
              <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <h3 className={styles.emptyTitle}>节点详情</h3>
              <p className={styles.emptyDesc}>点击图谱中的任何节点，可在此处查看对应章节的学习脉络或笔记详情。</p>
            </div>
          ) : (
            <div className={styles.detailBox}>
              <div className={styles.detailHeader}>
                <span className={`${styles.badge} ${selectedNode.type === "chapter" ? styles.badgeChapter : styles.badgeNote}`}>
                  {selectedNode.type === "chapter" ? "目录章节" : "知识笔记"}
                </span>
                <h3 className={styles.nodeTitle}>{selectedNode.label}</h3>
              </div>

              <div className={styles.metaList}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>所属大纲</span>
                  <span className={styles.metaValue}>{selectedNode.chapter}</span>
                </div>

                {selectedNode.type === "chapter" ? (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>包含笔记数</span>
                    <span className={styles.metaValue}>{selectedNode.note_count} 篇</span>
                  </div>
                ) : (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>文件路径</span>
                    <span className={styles.metaValue} title={selectedNode.id}>{selectedNode.id}</span>
                  </div>
                )}
              </div>

              {selectedNode.type === "note" && (
                <div className={styles.actionBox}>
                  <a
                    href={getObsidianUri(selectedNode.id)}
                    className={styles.obsidianBtn}
                    target="_blank"
                    rel="noreferrer"
                  >
                    在本地 Obsidian 打开
                    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
