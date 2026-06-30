"""
搜索路由 — 语义检索 & 关键词检索接口
"""

from typing import List, Optional
from fastapi import APIRouter, Request, Query, HTTPException
from pydantic import BaseModel, Field

from ingest.vectorizer import search, keyword_search

router = APIRouter()


# ── 请求/响应模型 ─────────────────────────────────────────────────────────

class ChunkMeta(BaseModel):
    source_path:  str
    title:        str
    chapter:      str
    section:      str
    tags:         str   # 逗号分隔字符串（ChromaDB 存储格式）
    obsidian_uri: str
    chunk_index:  int
    token_count:  int


class SearchHit(BaseModel):
    text:     str
    metadata: ChunkMeta
    distance: float = Field(description="语义距离（越小越相似）")


class SearchResponse(BaseModel):
    query:   str
    results: List[SearchHit]
    total:   int


class KeywordSearchResponse(BaseModel):
    keyword: str
    results: List[SearchHit]
    total:   int


# ── 路由处理 ──────────────────────────────────────────────────────────────

@router.get("/search/semantic", response_model=SearchResponse)
async def semantic_search(
    request: Request,
    q: str = Query(..., description="语义搜索问题", min_length=1, max_length=500),
    top_k: int = Query(default=5, ge=1, le=20, description="返回结果数量"),
    chapter: Optional[str] = Query(default=None, description="按章节过滤，如 '01-入门'"),
    tag: Optional[str] = Query(default=None, description="按标签过滤，如 '产品经理'"),
) -> SearchResponse:
    """
    语义检索接口（RAG 核心功能）
    
    使用向量相似度检索最相关的知识库切片。
    支持按 chapter（章节）和 tag（标签）过滤结果范围。
    
    **示例请求：**
    ```
    GET /api/v1/search/semantic?q=产品经理需要哪些核心能力&top_k=5&chapter=01-入门
    ```
    """
    collection = request.app.state.collection
    
    try:
        raw_hits = search(
            query=q,
            collection=collection,
            top_k=top_k,
            chapter_filter=chapter,
            tag_filter=tag,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"检索失败：{str(e)}")
    
    hits = [
        SearchHit(
            text=h["text"],
            metadata=ChunkMeta(**h["metadata"]),
            distance=h["distance"],
        )
        for h in raw_hits
    ]
    
    return SearchResponse(query=q, results=hits, total=len(hits))


@router.get("/search/keyword", response_model=KeywordSearchResponse)
async def keyword_search_route(
    request: Request,
    q: str = Query(..., description="关键词", min_length=1, max_length=100),
    top_k: int = Query(default=10, ge=1, le=50, description="返回结果数量"),
) -> KeywordSearchResponse:
    """
    关键词精确检索接口（补充语义检索的盲区）
    
    对文档全文进行子串匹配，适合检索精确的专业术语或产品名称。
    
    **示例请求：**
    ```
    GET /api/v1/search/keyword?q=AARRR&top_k=5
    ```
    """
    collection = request.app.state.collection
    
    try:
        raw_hits = keyword_search(
            keyword=q,
            collection=collection,
            top_k=top_k,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"关键词检索失败：{str(e)}")
    
    hits = [
        SearchHit(
            text=h["text"],
            metadata=ChunkMeta(**h["metadata"]),
            distance=h["distance"],
        )
        for h in raw_hits
    ]
    
    return KeywordSearchResponse(keyword=q, results=hits, total=len(hits))
