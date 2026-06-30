"""
FastAPI Routes for Interview Agent
==================================
"""

from typing import Optional, Dict
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
from agents.interview_agent import StartResponse, EvaluateRequest, InterviewEvaluation

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
async def start_interview(request: Request, body: StartRequest) -> StartResponse:
    """
    启动/获取模拟面试题目
    
    根据知识库内容，动态生成（或从经典题库检索）一道具有深度、贴近大厂业务的产品经理面试题。
    支持可选按 chapter 进行定向出题。
    """
    interview_agent = request.app.state.interview_agent
    try:
        response = interview_agent.generate_question(chapter=body.chapter)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成面试题失败: {str(e)}")


@router.post("/interview/evaluate")
async def evaluate_answer(request: Request, body: EvaluateRequest):
    """
    评估候选人面试回答
    
    接收问题与用户作答，使用大模型进行专业的 STAR（情境-任务-行动-结果）拆解与诊断，
    并给出百分制评分、优化版标准参考回答以及更具深度的下一轮追问。
    
    **演示模式：** 当未在 `.env` 中配置 `GEMINI_API_KEY` 时，接口将自动降级为本地合成演示模式，保证功能可用且不报错。
    """
    interview_agent = request.app.state.interview_agent
    try:
        response = interview_agent.evaluate(
            question=body.question,
            user_answer=body.user_answer
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"评估面试回答失败: {str(e)}")
