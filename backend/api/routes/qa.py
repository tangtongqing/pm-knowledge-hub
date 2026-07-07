"""
FastAPI Routes for QA Agent
===========================
"""

from fastapi import APIRouter, Request, HTTPException
from agents.qa_agent import QARequest, QAServiceResponse
from api.security import limiter, sanitize_user_input

router = APIRouter()


@router.post("/qa/ask", response_model=QAServiceResponse)
@limiter.limit("10/minute")
async def ask_question(request: Request, body: QARequest) -> QAServiceResponse:
    """
    PM 知识检索问答接口
    
    1. 通过 ChromaDB 检索最相关的 204 篇 Obsidian 笔记切片
    2. 基于检索到的文本上下文，调用 Gemini API 生成高质量的、带有格式的 Markdown 回答
    3. 输出包含：回答、参考资料来源（含 Obsidian 一键唤醒 URI）、延伸推荐问题
    
    **演示模式：** 当未在 `.env` 中配置 `GEMINI_API_KEY` 时，接口将自动降级为本地合成演示模式，保证功能可用且不报错。
    """
    qa_agent = request.app.state.qa_agent
    try:
        clean_query = sanitize_user_input(body.query)
        response = qa_agent.answer(
            query=clean_query,
            top_k=body.top_k,
            chapter_filter=body.chapter,
            tag_filter=body.tag
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"QA 问答执行失败: {str(e)}")
