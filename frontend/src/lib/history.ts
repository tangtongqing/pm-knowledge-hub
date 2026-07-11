// Re-declare ChatMessage locally or extend it if needed
export interface HistoryMessage {
  role: "user" | "assistant" | "interviewer" | "candidate";
  content: string;
  responseMeta?: any;
  score?: number;
  isLoading?: boolean;
}

export interface HistorySession {
  id: string;              // crypto.randomUUID() fallback
  type: "qa" | "interview";
  title: string;           // 首条用户消息前 20 字，或默认名称
  createdAt: number;       // Date.now()
  updatedAt: number;
  messages: HistoryMessage[];
  // 仅 interview 类型：
  evaluations?: any[];     // 累积评估数组 EvaluateResponse[]
}

const STORAGE_KEYS = {
  qa: "pmhub-history-qa",
  interview: "pmhub-history-interview"
};

const MAX_SESSIONS = 50;

/**
 * 从 localStorage 获取特定类型的所有会话列表，按 updatedAt 降序排列
 */
export function listSessions(type: "qa" | "interview"): HistorySession[] {
  if (typeof window === "undefined") return [];
  const key = STORAGE_KEYS[type];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const sessions = JSON.parse(raw) as HistorySession[];
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (e) {
    console.error("Failed to load history sessions from localStorage", e);
    return [];
  }
}

/**
 * 获取单个会话详情
 */
export function getSession(id: string, type: "qa" | "interview"): HistorySession | null {
  const sessions = listSessions(type);
  return sessions.find(s => s.id === id) || null;
}

/**
 * 保存或更新一个会话（Upsert）
 * 并限制最大留存数 50 条，处理超量容量异常
 */
export function saveSession(session: HistorySession): void {
  if (typeof window === "undefined") return;
  const { type } = session;
  const key = STORAGE_KEYS[type];
  try {
    const sessions = listSessions(type);
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    // 更新时间戳
    session.updatedAt = Date.now();

    if (existingIndex > -1) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    // 重新排序并进行数量截断 (最多 MAX_SESSIONS 条)
    let sorted = sessions.sort((a, b) => b.updatedAt - a.updatedAt);
    if (sorted.length > MAX_SESSIONS) {
      sorted = sorted.slice(0, MAX_SESSIONS);
    }

    // 写入 localStorage，带有 try-catch 容量防护
    localStorage.setItem(key, JSON.stringify(sorted));
  } catch (e) {
    console.warn("localStorage quota exceeded or failed to save session. Dropping history save gracefully.", e);
  }
}

/**
 * 删除单个会话
 */
export function deleteSession(id: string, type: "qa" | "interview"): void {
  if (typeof window === "undefined") return;
  const key = STORAGE_KEYS[type];
  try {
    const sessions = listSessions(type);
    const filtered = sessions.filter(s => s.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to delete history session", e);
  }
}

/**
 * 清空某种类型的所有会话
 */
export function clearSessions(type: "qa" | "interview"): void {
  if (typeof window === "undefined") return;
  const key = STORAGE_KEYS[type];
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error("Failed to clear history sessions", e);
  }
}
