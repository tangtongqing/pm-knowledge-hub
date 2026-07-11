"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api, QAServiceResponse } from "@/lib/api";
import { listSessions, saveSession, deleteSession, getSession, HistorySession } from "@/lib/history";
import { generateUUID, formatDate } from "@/lib/utils";
import styles from "./page.module.css";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  responseMeta?: QAServiceResponse;
  isLoading?: boolean;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeSources, setActiveSources] = useState<QAServiceResponse | null>(null);
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  const handleNewChat = () => {
    const newId = generateUUID();
    const initialMsgs: ChatMessage[] = [
      {
        role: "assistant",
        content: "你好！我是 PM Knowledge Hub 的知识库助手。你可以向我提问任何关于产品经理的知识点，我会基于你的本地 Obsidian 笔记为你解答并提供引用来源。例如：\n- 什么是 AARRR 模型？\n- 如何撰写一份 PRD？\n- 什么是需求优先级排序的 KANO 模型？",
      }
    ];
    const newSession: HistorySession = {
      id: newId,
      type: "qa",
      title: "新建对话",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: initialMsgs
    };
    saveSession(newSession);
    setActiveSessionId(newId);
    setMessages(initialMsgs);
    setActiveSources(null);
    setSessions(listSessions("qa"));
  };

  useEffect(() => {
    const loaded = listSessions("qa");
    if (loaded.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessions(loaded);
      const latest = loaded[0];
       
      setActiveSessionId(latest.id);
       
      setMessages(latest.messages as ChatMessage[]);
      const lastMsg = latest.messages[latest.messages.length - 1];
      if (lastMsg.role === "assistant" && lastMsg.responseMeta) {
         
        setActiveSources(lastMsg.responseMeta);
      } else {
         
        setActiveSources(null);
      }
    } else {
      handleNewChat();
    }
  }, []);

  const handleSelectSession = (id: string) => {
    const s = getSession(id, "qa");
    if (s) {
      setActiveSessionId(s.id);
      setMessages(s.messages as ChatMessage[]);
      const lastMsg = s.messages[s.messages.length - 1];
      if (lastMsg.role === "assistant" && lastMsg.responseMeta) {
        setActiveSources(lastMsg.responseMeta);
      } else {
        setActiveSources(null);
      }
    }
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(id, "qa");
    const updated = listSessions("qa");
    setSessions(updated);
    if (id === activeSessionId) {
      if (updated.length > 0) {
        handleSelectSession(updated[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => {
        setCopiedIndex(null);
      }, 1500);
    });
  };

  const handleRecClick = (rec: string) => {
    setInput(rec);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    setInput("");
    
    // Add user message
    const userMsg = { role: "user" as const, content: userQuery };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    
    // Save intermediate user message
    const activeSession = getSession(activeSessionId, "qa");
    if (activeSession) {
      activeSession.messages = updatedMsgs;
      if (activeSession.title === "新建对话") {
        activeSession.title = userQuery.substring(0, 20) || "新对话";
      }
      saveSession(activeSession);
      setSessions(listSessions("qa"));
    }
    
    // Add loading message
    setIsLoading(true);
    setMessages([...updatedMsgs, { role: "assistant", content: "思考中...", isLoading: true }]);
    setActiveSources(null); // Clear active sources while loading

    try {
      const response = await api.askQuestion(userQuery);
      const finalMsgs = [
        ...updatedMsgs,
        {
          role: "assistant" as const,
          content: response.answer,
          responseMeta: response
        }
      ];
      setMessages(finalMsgs);
      setActiveSources(response);

      const activeSession = getSession(activeSessionId, "qa");
      if (activeSession) {
        activeSession.messages = finalMsgs;
        saveSession(activeSession);
        setSessions(listSessions("qa"));
      }
    } catch (error) {
      console.error(error);
      const errorMsgs = [
        ...updatedMsgs,
        {
          role: "assistant" as const,
          content: "抱歉，检索知识库时发生错误。请确保后端服务正常运行。",
        }
      ];
      setMessages(errorMsgs);
      
      const activeSession = getSession(activeSessionId, "qa");
      if (activeSession) {
        activeSession.messages = errorMsgs;
        saveSession(activeSession);
        setSessions(listSessions("qa"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left History Sidebar */}
      <aside className={`${styles.historySidebar} ${sidebarOpen ? "" : styles.sidebarCollapsed}`}>
        <div className={styles.sidebarHeader}>
          <button className={styles.newChatBtn} onClick={handleNewChat}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            新建对话
          </button>
          <button 
            className={styles.toggleBtnInside} 
            onClick={() => setSidebarOpen(false)}
            title="收起侧边栏"
            aria-label="收起侧边栏"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>
        
        <div className={styles.sessionList}>
          {sessions.length === 0 ? (
            <div className={styles.emptySidebar}>暂无历史会话</div>
          ) : (
            sessions.map(s => (
              <div 
                key={s.id} 
                className={`${styles.sessionItem} ${activeSessionId === s.id ? styles.activeSession : ""}`}
                onClick={() => handleSelectSession(s.id)}
              >
                <div className={styles.sessionInfo}>
                  <div className={styles.sessionTitle} title={s.title}>{s.title}</div>
                  <div className={styles.sessionTime}>{formatDate(s.updatedAt)}</div>
                </div>
                <button 
                  className={styles.deleteSessionBtn}
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  title="删除会话"
                  aria-label="删除会话"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Collapsed sidebar trigger when sidebar is closed */}
      {!sidebarOpen && (
        <button 
          className={styles.toggleBtnCollapsed} 
          onClick={() => setSidebarOpen(true)}
          title="展开侧边栏"
          aria-label="展开侧边栏"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      )}

      {/* Left Chat Area */}
      <div className={styles.chatArea}>
        <div className={styles.header}>
          <div className={styles.headerTitleRow}>
            <h1 className={styles.title}>AI 问答助手</h1>
          </div>
          <p className={styles.subtitle}>基于 RAG 引擎的精准知识问答</p>
        </div>

        <div className={styles.messageList}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.wrapperUser : styles.wrapperAssistant}`}>
              <div className={styles.avatar}>
                {msg.role === 'user' ? (
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                ) : (
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                )}
              </div>
              <div className={`${styles.messageBubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant} ${msg.isLoading ? styles.loading : ''}`}>
                {msg.isLoading ? (
                  <div className={styles.typingDots}><span></span><span></span><span></span></div>
                ) : (
                  <div className={styles.markdownContent}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
                
                {msg.role === 'assistant' && !msg.isLoading && (
                  <button 
                    className={styles.copyBtn} 
                    onClick={() => handleCopy(msg.content, idx)}
                    aria-label="复制回答"
                    title="复制回答"
                  >
                    {copiedIndex === idx ? (
                      <span className={styles.copiedText}>已复制 ✓</span>
                    ) : (
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    )}
                  </button>
                )}

                {msg.responseMeta?.is_mock && (
                  <div className={styles.mockWarning}>当前为演示模式</div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.inputArea}>
          <form className={styles.inputForm} onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className={styles.inputField}
              placeholder="向知识库提问..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={styles.sendBtn}
              disabled={!input.trim() || isLoading}
              aria-label="发送"
            >
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
          <div className={styles.disclaimer}>
            ⚠️ 以上内容由 AI 基于本地知识库生成，仅供参考，请结合实际判断。
          </div>
        </div>
      </div>

      {/* Right Source Area */}
      <div className={styles.sourceArea}>
        <div className={styles.sourceHeader}>
          <h2 className={styles.sourceTitle}>引用证据</h2>
        </div>
        
        <div className={styles.sourceContent}>
          {!activeSources ? (
            <div className={styles.emptySource}>
              <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <p>发起提问后，相关的笔记分片证据将显示在此处</p>
            </div>
          ) : (
            <div className={styles.sourceList}>
              <div className={styles.sourceStats}>
                检索到 {activeSources.sources.length} 个相关分片
              </div>
              
              {activeSources.sources.map((source, idx) => (
                <div key={idx} className={styles.sourceCard}>
                  <div className={styles.sourceCardHeader}>
                    <span className={styles.sourceIndex}>[{idx + 1}]</span>
                    <span className={styles.sourceDocTitle} title={source.title}>{source.title}</span>
                    <span className={styles.sourceDistance}>{(1 - source.distance).toFixed(2)}</span>
                  </div>
                  
                  <div className={styles.sourcePath}>
                    {source.source_path} 
                    {source.section && source.section !== source.title ? ` > ${source.section}` : ''}
                  </div>
                  
                  {/* Context excerpt would go here, currently the API only returns the title/section. 
                      In a fuller implementation, we'd show the matched text snippet */}
                  
                  {source.obsidian_uri && (
                    <a 
                      href={source.obsidian_uri} 
                      className={styles.obsidianLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      在 Obsidian 中打开
                      <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </a>
                  )}
                </div>
              ))}

              {activeSources.recommendations && activeSources.recommendations.length > 0 && (
                <div className={styles.recommendations}>
                  <h3 className={styles.recTitle}>相关推荐问题</h3>
                  <div className={styles.recList}>
                    {activeSources.recommendations.map((rec, idx) => (
                      <button 
                        key={idx} 
                        className={styles.recBtn}
                        onClick={() => handleRecClick(rec)}
                      >
                        {rec}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
