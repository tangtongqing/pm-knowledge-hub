"""
FastAPI Routes for Runtime Metrics
===================================
"""

from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/metrics")
async def get_metrics(request: Request):
    """
    获取系统运行时指标 (L1 & L2)
    包含：向量库分片数、会话总查询量、真实大模型调用量、降级模式调用量。
    """
    collection = getattr(request.app.state, "collection", None)
    collection_count = collection.count() if collection is not None else 0
    
    return {
        "collection_count": collection_count,
        "total_queries": getattr(request.app.state, "total_queries", 0),
        "mock_queries": getattr(request.app.state, "mock_queries", 0),
        "live_queries": getattr(request.app.state, "live_queries", 0),
    }
