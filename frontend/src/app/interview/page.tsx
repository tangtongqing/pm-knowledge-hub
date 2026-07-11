"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api, EvaluateResponse } from "@/lib/api";
import { listSessions, saveSession, deleteSession, getSession, HistorySession } from "@/lib/history";
import { generateUUID, formatDate } from "@/lib/utils";
import { exportInterviewReport } from "@/lib/pdf";
import styles from "./page.module.css";

interface ChatMessage {
  role: "interviewer" | "candidate";
  content: string;
  isLoading?: boolean;
}

export default function InterviewPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [latestEval, setLatestEval] = useState<EvaluateResponse | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNewChat = () => {
    const newId = generateUUID();
    const newSession: HistorySession = {
      id: newId,
      type: "interview",
      title: "面试练习 - " + formatDate(Date.now()).substring(5),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      evaluations: []
    };
    saveSession(newSession);
    setActiveSessionId(newId);
    setMessages([]);
    setCurrentQuestion("");
    setLatestEval(null);
    setIsStarted(false);
    setSessions(listSessions("interview"));
  };

  useEffect(() => {
    const loaded = listSessions("interview");
    if (loaded.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSessions(loaded);
      const latest = loaded[0];
       
      setActiveSessionId(latest.id);
       
      setMessages(latest.messages as ChatMessage[]);
       
      setIsStarted(latest.messages.length > 0);

      if (latest.evaluations && latest.evaluations.length > 0) {
        const lastEval = latest.evaluations[latest.evaluations.length - 1];
         
        setLatestEval(lastEval);
         
        setCurrentQuestion(lastEval.next_question);
      } else {
         
        setLatestEval(null);
         
        setCurrentQuestion("");
      }
    } else {
      handleNewChat();
    }
  }, []);

  const handleSelectSession = (id: string) => {
    const s = getSession(id, "interview");
    if (s) {
      setActiveSessionId(s.id);
      setMessages(s.messages as ChatMessage[]);
      setIsStarted(s.messages.length > 0);
      
      if (s.evaluations && s.evaluations.length > 0) {
        const lastEval = s.evaluations[s.evaluations.length - 1];
        setLatestEval(lastEval);
        setCurrentQuestion(lastEval.next_question);
      } else {
        setLatestEval(null);
        setCurrentQuestion("");
      }
    }
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteSession(id, "interview");
    const updated = listSessions("interview");
    setSessions(updated);
    if (id === activeSessionId) {
      if (updated.length > 0) {
        handleSelectSession(updated[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const getSessionHighScore = (session: HistorySession): number => {
    if (!session.evaluations || session.evaluations.length === 0) return 0;
    const scores = session.evaluations.map(e => e.score || 0);
    return Math.max(...scores);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const res = await api.startInterview();
      setCurrentQuestion(res.question);
      const startMsgs = [
        { role: "interviewer" as const, content: res.question }
      ];
      setMessages(startMsgs);
      setIsStarted(true);
      setLatestEval(null);

      const activeSession = getSession(activeSessionId, "interview");
      if (activeSession) {
        activeSession.messages = startMsgs;
        activeSession.evaluations = [];
        saveSession(activeSession);
        setSessions(listSessions("interview"));
      }
    } catch (error) {
      console.error(error);
      alert("启动面试失败，请检查后端状态。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    const s = getSession(activeSessionId, "interview");
    if (!s || !s.evaluations || s.evaluations.length === 0) return;
    
    setPdfGenerating(true);
    try {
      exportInterviewReport(s);
      setPdfSuccess(true);
      setTimeout(() => setPdfSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to export PDF", err);
      alert("生成 PDF 失败，请重试。");
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !isStarted) return;

    const userAnswer = input.trim();
    setInput("");
    
    const userMsg = { role: "candidate" as const, content: userAnswer };
    const updatedMsgs = [...messages, userMsg];
    setMessages(updatedMsgs);
    
    const activeSession = getSession(activeSessionId, "interview");
    if (activeSession) {
      activeSession.messages = updatedMsgs;
      saveSession(activeSession);
      setSessions(listSessions("interview"));
    }

    setIsLoading(true);
    setMessages([...updatedMsgs, { role: "interviewer" as const, content: "评估中...", isLoading: true }]);

    try {
      const response = await api.evaluateAnswer(currentQuestion, userAnswer);
      const nextMsg = {
        role: "interviewer" as const,
        content: `${response.evaluation}\n\n**建议回答框架：**\n${response.suggested_answer}\n\n---\n**下一个问题：**\n${response.next_question}`
      };
      const finalMsgs = [...updatedMsgs, nextMsg];
      setMessages(finalMsgs);
      setCurrentQuestion(response.next_question);
      setLatestEval(response);

      const activeSession = getSession(activeSessionId, "interview");
      if (activeSession) {
        activeSession.messages = finalMsgs;
        const currentEvals = activeSession.evaluations || [];
        activeSession.evaluations = [...currentEvals, response];
        saveSession(activeSession);
        setSessions(listSessions("interview"));
      }
    } catch (error) {
      console.error(error);
      const errorMsgs = [
        ...updatedMsgs,
        {
          role: "interviewer" as const,
          content: "抱歉，评估时发生错误。请重试。",
        }
      ];
      setMessages(errorMsgs);
      
      const activeSession = getSession(activeSessionId, "interview");
      if (activeSession) {
        activeSession.messages = errorMsgs;
        saveSession(activeSession);
        setSessions(listSessions("interview"));
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
            新面试
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
            <div className={styles.emptySidebar}>暂无历史面试</div>
          ) : (
            sessions.map(s => {
              const score = getSessionHighScore(s);
              return (
                <div 
                  key={s.id} 
                  className={`${styles.sessionItem} ${activeSessionId === s.id ? styles.activeSession : ""}`}
                  onClick={() => handleSelectSession(s.id)}
                >
                  <div className={styles.sessionInfo}>
                    <div className={styles.sessionTitle} title={s.title}>{s.title}</div>
                    <div className={styles.sessionTime}>{formatDate(s.updatedAt)}</div>
                  </div>
                  {score > 0 && (
                    <span className={styles.scoreBadge}>{score}分</span>
                  )}
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
              );
            })
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
          <div className={styles.headerContent}>
            <h1 className={styles.title}>模拟面试</h1>
            <p className={styles.subtitle}>STAR 法则深度演练</p>
          </div>
          {isStarted && (
            <button className={styles.restartBtn} onClick={handleStart} disabled={isLoading}>
              重新开始
            </button>
          )}
        </div>

        {!isStarted ? (
          <div className={styles.startScreen}>
            <div className={styles.startIcon}>
              <svg aria-hidden="true" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <polyline points="16 11 18 13 22 9" />
              </svg>
            </div>
            <h2 className={styles.startTitle}>准备好开始了吗？</h2>
            <p className={styles.startDesc}>
              系统将根据你的知识库内容，扮演面试官对你进行随机提问。你的回答将基于 STAR 原则进行评分和建议。
            </p>
            <button 
              className={styles.startBtn} 
              onClick={handleStart}
              disabled={isLoading}
            >
              {isLoading ? "启动中..." : "开始面试"}
            </button>
          </div>
        ) : (
          <>
            <div className={styles.messageList}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`${styles.messageWrapper} ${msg.role === 'candidate' ? styles.wrapperCandidate : styles.wrapperInterviewer}`}>
                  <div className={styles.avatar}>
                    {msg.role === 'candidate' ? (
                      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    ) : (
                      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z"></path><path d="M19 13v-1a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v1a7 7 0 0 0 14 0z"></path></svg>
                    )}
                  </div>
                  <div className={`${styles.messageBubble} ${msg.role === 'candidate' ? styles.bubbleCandidate : styles.bubbleInterviewer} ${msg.isLoading ? styles.loading : ''}`}>
                    {msg.isLoading ? (
                      <div className={styles.typingDots}><span></span><span></span><span></span></div>
                    ) : (
                      <div className={styles.markdownContent}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
              <form className={styles.inputForm} onSubmit={handleSubmit}>
                <textarea
                  className={styles.inputField}
                  placeholder="用 STAR 法则作答：Situation（情境）→ Task（任务）→ Action（行动）→ Result（结果）"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
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
              <div className={styles.inputFooter}>
                <div className={styles.hint}>Shift + Enter 换行，Enter 发送</div>
                <div className={styles.disclaimer}>
                  ⚠️ 以上内容由 AI 基于本地知识库生成，仅供参考，请结合实际判断。
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Eval Area */}
      <div className={styles.evalArea}>
        <div className={styles.evalHeader}>
          <h2 className={styles.evalTitle}>STAR 评估</h2>
          {latestEval && (
            <button 
              className={styles.pdfBtn} 
              onClick={handleExportPDF}
              disabled={pdfGenerating}
              title="导出面试报告为 PDF"
            >
              {pdfGenerating ? "生成中..." : pdfSuccess ? "已导出 ✓" : "导出 PDF"}
            </button>
          )}
        </div>
        
        <div className={styles.evalContent}>
          {!latestEval ? (
            <div className={styles.emptyEval}>
              <p>回答问题后，此处将显示你的表现评分和详细反馈。</p>
            </div>
          ) : (
            <div className={styles.evalCard}>
              <div className={styles.scoreBoard}>
                <div className={styles.scoreLabel}>综合得分</div>
                <div className={styles.scoreValue}>
                  <span className={styles.scoreNum}>{latestEval.score}</span>
                  <span className={styles.scoreDenom}>/100</span>
                </div>
                <div 
                  className={styles.scoreProgressBar}
                  role="progressbar"
                  aria-valuenow={latestEval.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="综合得分进度条"
                >
                  <div 
                    className={styles.scoreProgressBarFill} 
                    style={{ width: `${latestEval.score}%` }}
                  ></div>
                </div>
                {latestEval.is_mock && (
                  <div className={styles.mockBadge}>演示数据</div>
                )}
              </div>
              
              <div className={styles.starBars}>
                <div className={styles.starItem}>
                  <div className={styles.starItemHeader}>
                    <span className={styles.starLetter}>S</span>
                    <span className={styles.starName}>Situation (情景)</span>
                  </div>
                  <p className={styles.starFeedbackText}>{latestEval.star_feedback.situation}</p>
                </div>
                
                <div className={styles.starItem}>
                  <div className={styles.starItemHeader}>
                    <span className={styles.starLetter}>T</span>
                    <span className={styles.starName}>Task (任务)</span>
                  </div>
                  <p className={styles.starFeedbackText}>{latestEval.star_feedback.task}</p>
                </div>
                
                <div className={styles.starItem}>
                  <div className={styles.starItemHeader}>
                    <span className={styles.starLetter}>A</span>
                    <span className={styles.starName}>Action (行动)</span>
                  </div>
                  <p className={styles.starFeedbackText}>{latestEval.star_feedback.action}</p>
                </div>
                
                <div className={styles.starItem}>
                  <div className={styles.starItemHeader}>
                    <span className={styles.starLetter}>R</span>
                    <span className={styles.starName}>Result (结果)</span>
                  </div>
                  <p className={styles.starFeedbackText}>{latestEval.star_feedback.result}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
