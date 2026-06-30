import pytest
from fastapi.testclient import TestClient
import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

from api.main import app
from agents.qa_agent import QAAgent
from agents.interview_agent import InterviewAgent


_TEST_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"


@pytest.fixture(scope="module")
def test_client():
    """
    创建一个测试用的 TestClient。
    在启动前，我们手动向 app.state 中注入一个内存 ChromaDB 和 mock 智能体，
    以避免它尝试读取真实的硬盘数据库或使用生产配置，从而保证测试的快速与隔离。
    """
    client = chromadb.EphemeralClient()
    ef = SentenceTransformerEmbeddingFunction(model_name=_TEST_MODEL)
    collection = client.get_or_create_collection(
        name="test_api_collection",
        embedding_function=ef,
    )
    
    # 写入一条 mock 记录以支持检索
    collection.upsert(
        ids=["mock_doc"],
        documents=["产品经理必须做需求分析。"],
        metadatas=[{
            "title": "什么是需求分析",
            "source_path": "01-入门/1.1.md",
            "section": "定义",
            "tags": "需求,产品经理",
            "obsidian_uri": "obsidian://open?vault=test&file=01-入门/1.1",
            "chapter": "01-入门",
            "chunk_index": 0,
            "token_count": 10
        }]
    )
    
    # 模拟 lifespan 中挂载对象
    app.state.collection = collection
    app.state.chroma_client = client
    app.state.qa_agent = QAAgent(collection)
    app.state.interview_agent = InterviewAgent(collection)
    
    # 禁用其真实的 GEMINI key，强制走 Mock
    app.state.qa_agent.client = None
    app.state.interview_agent.client = None
    
    # 用 TestClient 包装并运行，由于 app.state 已经初始化，lifespan 不会覆盖已有的 app.state.collection
    with TestClient(app) as tc:
        yield tc


# ─── API 接口测试 ────────────────────────────────────────────────────

def test_api_health_endpoint(test_client):
    """测试健康检查接口是否返回正确的基本状态"""
    response = test_client.get("/api/v1/health")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "ok"
    assert res_data["collection_count"] == 1
    assert "paraphrase-multilingual" in res_data["embedding_model"]


def test_api_search_semantic_endpoint(test_client):
    """测试语义检索接口响应"""
    response = test_client.get("/api/v1/search/semantic?q=需求分析&top_k=1")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["query"] == "需求分析"
    assert len(res_data["results"]) == 1
    assert res_data["results"][0]["metadata"]["title"] == "什么是需求分析"


def test_api_search_keyword_endpoint(test_client):
    """测试关键词精确检索接口响应"""
    response = test_client.get("/api/v1/search/keyword?q=需求&top_k=2")
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["keyword"] == "需求"
    assert len(res_data["results"]) == 1


def test_api_qa_ask_endpoint(test_client):
    """测试 QA 问答接口响应"""
    post_data = {
        "query": "什么是需求分析？",
        "top_k": 2
    }
    response = test_client.post("/api/v1/qa/ask", json=post_data)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["query"] == "什么是需求分析？"
    assert "演示模式" in res_data["answer"]
    assert len(res_data["sources"]) >= 1
    assert len(res_data["recommendations"]) == 3
    assert res_data["is_mock"] is True


def test_api_interview_start_endpoint(test_client):
    """测试开始面试接口，应返回随机问题"""
    response = test_client.post("/api/v1/interview/start", json={})
    assert response.status_code == 200
    res_data = response.json()
    assert "question" in res_data
    assert "suggested_topics" in res_data
    assert res_data["is_mock"] is True


def test_api_interview_evaluate_endpoint(test_client):
    """测试面试回答评估接口"""
    post_data = {
        "question": "如果让你为微信设计长辈关怀模式，如何调研？",
        "user_answer": "我会先对老年用户进行访谈，寻找核心障碍，设计大字体和大音量功能。"
    }
    response = test_client.post("/api/v1/interview/evaluate", json=post_data)
    assert response.status_code == 200
    res_data = response.json()
    assert "score" in res_data
    assert 60 <= res_data["score"] <= 100
    assert "evaluation" in res_data
    assert "star_feedback" in res_data
    assert res_data["is_mock"] is True
