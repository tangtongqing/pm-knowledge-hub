"""
PM Knowledge Hub — FastAPI 应用入口
=====================================
运行方式：
  cd backend
  uvicorn api.main:app --reload --port 8000

API 根路径：http://localhost:8000
API 文档：  http://localhost:8000/docs
"""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from api.routes import search, health, qa, interview

# ── 环境变量 ────────────────────────────────────────────────────────────
# 加载 backend/.env（使用绝对路径，兼容从任意目录启动）
_ENV_PATH = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH)

# ── 生命周期：应用启动时初始化向量库连接 ────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    在 FastAPI 应用启动时初始化 ChromaDB 连接，
    并将 collection 对象和各智能体实例存储到 app.state 供所有路由共享。
    """
    from ingest.vectorizer import get_client, get_collection
    from agents.qa_agent import QAAgent
    from agents.interview_agent import InterviewAgent
    
    db_path = os.getenv("CHROMA_DB_PATH", "./data/chroma_db")
    model_name = os.getenv("EMBEDDING_MODEL", "paraphrase-multilingual-MiniLM-L12-v2")
    
    print(f"[startup] Connecting to ChromaDB at: {db_path}")
    client = get_client(db_path)
    collection = get_collection(client, model_name=model_name)
    
    # 将 collection 挂载到 app.state，路由通过 request.app.state.collection 访问
    app.state.collection = collection
    app.state.chroma_client = client
    
    # 初始化 智能体 并挂载到 app.state
    print("[startup] Initializing QAAgent and InterviewAgent...")
    app.state.qa_agent = QAAgent(collection)
    app.state.interview_agent = InterviewAgent(collection)
    
    count = collection.count()
    print(f"[startup] ChromaDB ready. Collection 'pm_notes' has {count} chunks.")
    
    yield  # 应用正常运行期间
    
    # 关闭阶段（可选清理）
    print("[shutdown] ChromaDB connection closed.")


# ── 应用实例 ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="PM Knowledge Hub API",
    description="产品经理知识库 RAG 系统 — 语义检索 & 问答接口",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS 配置（允许前端 Next.js 开发服务器访问）────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Next.js dev server
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 路由注册 ──────────────────────────────────────────────────────────────
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(search.router, prefix="/api/v1", tags=["Search"])
app.include_router(qa.router, prefix="/api/v1", tags=["QA"])
app.include_router(interview.router, prefix="/api/v1", tags=["Interview"])


@app.get("/", include_in_schema=False)
async def root():
    return {"message": "PM Knowledge Hub API is running", "docs": "/docs"}
