"""
FastAPI Routes for Interview Agent
==================================
"""

from typing import Optional, Dict
from fastapi import APIRouter, Request, HTTPException
from starlette.concurrency import run_in_threadpool
from pydantic import BaseModel, Field
from agents.interview_agent import StartResponse, EvaluateRequest, InterviewEvaluation
from api.security import limiter, sanitize_user_input

router = APIRouter()


# ── 请求模型 ──────────────────────────────────────────────────────────────

class StartRequest(BaseModel):
    chapter: Optional[str] = Field(default=None, description="可选，按指定章节出题（如 '06-面试'）")


class EvaluateResponse(BaseModel):
    score: int
    evaluation: str
    star_feedback: Dict = Field(description="STAR 反馈结构")
    suggested_answer: str
    next_question: str
    is_mock: bool = False


# ── 路由接口 ──────────────────────────────────────────────────────────────

@router.post("/interview/start", response_model=StartResponse)
@limiter.limit("10/minute")
async def start_interview(request: Request, body: StartRequest) -> StartResponse:
    """
    启动/获取模拟面试题目
    ...
    """
    interview_agent = request.app.state.interview_agent
    try:
        response = await run_in_threadpool(
            interview_agent.generate_question,
            chapter=body.chapter,
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成面试题失败: {str(e)}")


@router.post("/interview/evaluate")
@limiter.limit("10/minute")
async def evaluate_answer(request: Request, body: EvaluateRequest):
    """
    评估候选人面试回答
    ...
    """
    interview_agent = request.app.state.interview_agent
    try:
        clean_answer = sanitize_user_input(body.user_answer)
        response = await run_in_threadpool(
            interview_agent.evaluate,
            question=body.question,
            user_answer=clean_answer
        )
        # 递增指标计数
        request.app.state.total_queries += 1
        if response.get("is_mock", False):
            request.app.state.mock_queries += 1
        else:
            request.app.state.live_queries += 1
            
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"评估面试回答失败: {str(e)}")
