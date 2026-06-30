import pytest
import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from agents.qa_agent import QAAgent, QAServiceResponse
from agents.interview_agent import InterviewAgent, StartResponse


# 使用较小的 multilingual 模型，与 vectorizer.py 单元测试保持一致
_TEST_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"


@pytest.fixture(scope="module")
def mock_collection():
    """初始化一个 EphemeralClient 的 collection 用于测试"""
    client = chromadb.EphemeralClient()
    ef = SentenceTransformerEmbeddingFunction(model_name=_TEST_MODEL)
    collection = client.get_or_create_collection(
        name="test_agents_collection",
        embedding_function=ef,
    )
    
    # 插入几条测试笔记
    collection.upsert(
        ids=["doc1", "doc2"],
        documents=[
            "产品经理需要具备需求分析能力，分析用户痛点并转化为功能需求。",
            "在数据分析中，北极星指标是引导公司业务方向的单一核心度量标准。"
        ],
        metadatas=[
            {
                "title": "什么是需求分析",
                "source_path": "01-入门/1.1-需求.md",
                "section": "需求定义",
                "tags": "产品经理,需求,方法论",
                "obsidian_uri": "obsidian://open?vault=test&file=01-入门/1.1-需求",
                "chapter": "01-入门",
                "chunk_index": 0,
                "token_count": 50
            },
            {
                "title": "如何设定北极星指标",
                "source_path": "05-数据/5.2-指标.md",
                "section": "指标设定",
                "tags": "数据分析,北极星指标,数据指标",
                "obsidian_uri": "obsidian://open?vault=test&file=05-数据/5.2-指标",
                "chapter": "05-数据",
                "chunk_index": 0,
                "token_count": 50
            }
        ]
    )
    return collection


def test_qa_agent_initialization(mock_collection):
    """QA Agent 应该可以成功初始化"""
    agent = QAAgent(mock_collection)
    assert agent.collection.name == mock_collection.name


def test_qa_agent_mock_fallback_on_no_key(mock_collection):
    """在无 API Key 时，QA Agent 应该退回到本地演示模式并正确返回结果"""
    agent = QAAgent(mock_collection)
    # 强制将 api_key 置为空，确保模拟演示模式触发
    agent.client = None
    
    response = agent.answer("什么是需求分析？", top_k=2)
    
    assert isinstance(response, QAServiceResponse)
    assert response.query == "什么是需求分析？"
    assert response.is_mock is True
    assert "演示模式" in response.answer
    assert len(response.sources) > 0
    assert response.sources[0].title == "什么是需求分析"
    assert len(response.recommendations) == 3


# ─── Interview Agent 测试 ─────────────────────────────────────────────

def test_interview_agent_initialization(mock_collection):
    """Interview Agent 应该可以成功初始化"""
    agent = InterviewAgent(mock_collection)
    assert agent.collection.name == mock_collection.name


def test_interview_agent_generate_question(mock_collection):
    """Interview Agent 应该能够生成面试问题"""
    agent = InterviewAgent(mock_collection)
    agent.client = None # 强制 mock 模式
    
    resp = agent.generate_question()
    
    assert isinstance(resp, StartResponse)
    assert len(resp.question) > 0
    assert len(resp.suggested_topics) > 0
    assert resp.is_mock is True


def test_interview_agent_evaluate_answer(mock_collection):
    """Interview Agent 应该可以对回答进行 STAR 结构的评估"""
    agent = InterviewAgent(mock_collection)
    agent.client = None # 强制 mock 模式
    
    question = "抖音想要给创作者增加一个'AI 辅助写脚本'的功能，如何进行核心价值评估与 MVP 规划？"
    user_answer = "我会先做用户调研，确定脚本写作是核心痛点。然后规划第一版 MVP，只上线一个核心的生成模型功能，观察数据留存。"
    
    eval_res = agent.evaluate(question, user_answer)
    
    assert "score" in eval_res
    assert 60 <= eval_res["score"] <= 100
    assert "evaluation" in eval_res
    assert "star_feedback" in eval_res
    assert "situation" in eval_res["star_feedback"]
    assert "task" in eval_res["star_feedback"]
    assert "action" in eval_res["star_feedback"]
    assert "result" in eval_res["star_feedback"]
    assert "suggested_answer" in eval_res
    assert "next_question" in eval_res
    assert eval_res["is_mock"] is True
