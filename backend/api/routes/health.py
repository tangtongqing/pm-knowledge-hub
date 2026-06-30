"""
健康检查路由
提供系统状态接口，供前端和运维监控使用
"""

from fastapi import APIRouter, Request
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    collection_count: int
    embedding_model: str
    version: str


@router.get("/health", response_model=HealthResponse)
async def health_check(request: Request) -> HealthResponse:
    """
    系统健康检查接口
    返回 ChromaDB 集合状态和当前 Embedding 模型信息
    """
    collection = request.app.state.collection
    count = collection.count()
    model = collection.metadata.get("embedding_model", "unknown")

    return HealthResponse(
        status="ok",
        collection_count=count,
        embedding_model=model,
        version="0.1.0",
    )
