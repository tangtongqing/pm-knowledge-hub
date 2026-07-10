"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api, QAServiceResponse } from "@/lib/api";
import styles from "./page.module.css";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  responseMeta?: QAServiceResponse;
  isLoading?: boolean;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "你好！我是 PM Knowledge Hub 的知识库助手。你可以向我提问任何关于产品经理的知识点，我会基于你的本地 Obsidian 笔记为你解答并提供引用来源。例如：\n- 什么是 AARRR 模型？\n- 如何撰写一份 PRD？\n- 什么是需求优先级排序的 KANO 模型？",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeSources, setActiveSources] = useState<QAServiceResponse | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
    setMessages(prev => [...prev, { role: "user", content: userQuery }]);
    
    // Add loading message
    setIsLoading(true);
    setMessages(prev => [...prev, { role: "assistant", content: "思考中...", isLoading: true }]);
    setActiveSources(null); // Clear active sources while loading

    try {
      const response = await api.askQuestion(userQuery);
      
      // Replace loading message with actual response
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = {
          role: "assistant",
          content: response.answer,
          responseMeta: response
        };
        return newMsgs;
      });
      setActiveSources(response);
    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = {
          role: "assistant",
          content: "抱歉，检索知识库时发生错误。请确保后端服务正常运行。",
        };
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left Chat Area */}
      <div className={styles.chatArea}>
        <div className={styles.header}>
          <h1 className={styles.title}>AI 问答助手</h1>
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
