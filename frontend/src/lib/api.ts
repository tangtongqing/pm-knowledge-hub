/**
 * PM Knowledge Hub API Client
 * =====================================
 * 连接 FastAPI 后端（默认端口 8000）
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

// ── 类型定义 ─────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  collection_count: number;
  note_count: number;
  embedding_model: string;
  version: string;
}

export interface ChunkMeta {
  source_path: string;
  title: string;
  chapter: string;
  section: string;
  tags: string; // 逗号分隔的字符串
  obsidian_uri: string;
  chunk_index: number;
  token_count: number;
}

export interface SearchHit {
  text: string;
  metadata: ChunkMeta;
  distance: number;
}

export interface SearchResponse {
  query: string;
  results: SearchHit[];
  total: number;
}

export interface KeywordSearchResponse {
  keyword: string;
  results: SearchHit[];
  total: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "chapter" | "note";
  chapter: string;
  note_count: number;
  tags: string[];
}

export interface GraphLink {
  source: string;
  target: string;
  weight: number;
}

export interface GraphResponse {
  nodes: GraphNode[];
  links: GraphLink[];
  level: "chapter" | "note";
  total_notes: number;
}

export interface QASource {
  title: string;
  source_path: string;
  section: string;
  obsidian_uri: string;
  distance: number;
  excerpt: string;
}

export interface QAServiceResponse {
  query: string;
  answer: string;
  sources: QASource[];
  recommendations: string[];
  is_mock: boolean;
}

export interface StartResponse {
  question: string;
  context_title: string;
  suggested_topics: string[];
  is_mock: boolean;
}

export interface STARFeedback {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface EvaluateResponse {
  score: number;
  evaluation: string;
  star_feedback: STARFeedback;
  suggested_answer: string;
  next_question: string;
  is_mock: boolean;
  question?: string;
}

// ── 辅助 Fetch 函数 ───────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const parsedError = JSON.parse(errorText);
      errorMessage = parsedError.detail || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

// ── API 接口导出 ─────────────────────────────────────────────────────────

export const api = {
  /**
   * 系统健康检查
   */
  async getHealth(): Promise<HealthResponse> {
    try {
      return await request<HealthResponse>("/health");
    } catch {
      return {
        status: "offline",
        collection_count: 0,
        note_count: 0,
        embedding_model: "Connection Error",
        version: "unknown",
      };
    }
  },

  /**
   * 语义检索接口
   */
  async semanticSearch(
    q: string,
    topK = 5,
    chapter?: string,
    tag?: string
  ): Promise<SearchResponse> {
    const params = new URLSearchParams({
      q,
      top_k: topK.toString(),
    });
    if (chapter) params.append("chapter", chapter);
    if (tag) params.append("tag", tag);

    return request<SearchResponse>(`/search/semantic?${params.toString()}`);
  },

  /**
   * 目录浏览接口，获取指定分类下的所有文档
   */
  async getDocuments(chapter?: string): Promise<SearchResponse> {
    const params = new URLSearchParams();
    if (chapter) params.append("chapter", chapter);
    return request<SearchResponse>(`/search/documents?${params.toString()}`);
  },

  /**
   * 关键词精确检索接口
   */
  async keywordSearch(q: string, topK = 10): Promise<KeywordSearchResponse> {
    const params = new URLSearchParams({
      q,
      top_k: topK.toString(),
    });
    return request<KeywordSearchResponse>(`/search/keyword?${params.toString()}`);
  },

  /**
   * RAG 问答接口
   */
  async askQuestion(
    query: string,
    topK = 5,
    chapter?: string,
    tag?: string
  ): Promise<QAServiceResponse> {
    return request<QAServiceResponse>("/qa/ask", {
      method: "POST",
      body: JSON.stringify({
        query,
        top_k: topK,
        chapter,
        tag,
      }),
    });
  },

  /**
   * 启动模拟面试，生成面试题
   */
  async startInterview(chapter?: string): Promise<StartResponse> {
    return request<StartResponse>("/interview/start", {
      method: "POST",
      body: JSON.stringify({
        chapter,
      }),
    });
  },

  /**
   * 提交并评估面试作答
   */
  async evaluateAnswer(
    question: string,
    userAnswer: string
  ): Promise<EvaluateResponse> {
    return request<EvaluateResponse>("/interview/evaluate", {
      method: "POST",
      body: JSON.stringify({
        question,
        user_answer: userAnswer,
      }),
    });
  },

  /**
   * 获取系统运行指标
   */
  async getMetrics(): Promise<{
    collection_count: number;
    total_queries: number;
    mock_queries: number;
    live_queries: number;
  }> {
    return request<{
      collection_count: number;
      total_queries: number;
      mock_queries: number;
      live_queries: number;
    }>("/metrics");
  },

  /**
   * 获取知识图谱拓扑数据
   */
  async getGraph(
    level: "chapter" | "note" = "chapter",
    chapter?: string
  ): Promise<GraphResponse> {
    const params = new URLSearchParams({ level });
    if (chapter) params.append("chapter", chapter);
    return request<GraphResponse>(`/graph?${params.toString()}`);
  },
};
