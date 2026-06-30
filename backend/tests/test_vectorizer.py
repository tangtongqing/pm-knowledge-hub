"""
Unit tests for vectorizer.py
注意：这些测试使用 ChromaDB 的 EphemeralClient（内存模式），
不写磁盘，运行速度快。
Embedding 使用 SentenceTransformerEmbeddingFunction（与 vectorizer.py 保持一致）。
"""

import uuid
import pytest
from typing import List, Dict, Any
import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

# 导入被测模块（使用相对导入，从 backend/ 目录运行 pytest）
from ingest.vectorizer import (
    _prepare_chroma_batch,
    upsert_chunks,
    search,
    keyword_search,
    COLLECTION_NAME,
)

# 使用较小的 multilingual 模型，与生产配置一致
_TEST_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"


# ─── Fixtures ──────────────────────────────────────────────────────────────
def make_chunk(chunk_id: str,
               text: str,
               chapter: str = "01-测试",
               tags: List[str] = None,
               section: str = "测试节") -> Dict[str, Any]:
    """Helper: 构造一个模拟的 chunker 输出字典"""
    return {
        "chunk_id":     chunk_id,
        "text":         text,
        "source_path":  f"test/{chunk_id}.md",
        "title":        f"测试笔记 {chunk_id}",
        "chapter":      chapter,
        "section":      section,
        "tags":         tags or [],
        "obsidian_uri": f"obsidian://open?vault=test&file=test/{chunk_id}",
        "chunk_index":  0,
        "token_count":  len(text) // 2,
    }


@pytest.fixture(scope="function")
def ephemeral_collection():
    """
    每个测试函数都获得一个全新的内存 collection，并拥有唯一的名称，保证完全隔离。
    sentence-transformers 会缓存模型权重，所以不会每次重新下载。
    """
    client = chromadb.EphemeralClient()
    ef = SentenceTransformerEmbeddingFunction(model_name=_TEST_MODEL)
    unique_name = f"pm_notes_{uuid.uuid4().hex}"
    collection = client.create_collection(
        name=unique_name,
        embedding_function=ef,
    )
    return collection


SAMPLE_CHUNKS = [
    make_chunk("chunk_a", "产品经理需要具备需求分析能力", chapter="01-入门", tags=["产品经理", "需求"]),
    make_chunk("chunk_b", "用户研究是产品设计的基础步骤", chapter="02-方法论", tags=["用户研究"]),
    make_chunk("chunk_c", "数据分析帮助产品经理做出决策", chapter="01-入门", tags=["数据分析"]),
]


# ─── _prepare_chroma_batch ────────────────────────────────────────────────
def test_prepare_batch_structure():
    """_prepare_chroma_batch 应正确拆分为三个等长列表"""
    ids, docs, metas = _prepare_chroma_batch(SAMPLE_CHUNKS)
    assert len(ids) == len(docs) == len(metas) == 3


def test_prepare_batch_tags_serialized():
    """tags 列表应被序列化为逗号分隔字符串"""
    chunk = make_chunk("test", "文本", tags=["产品经理", "AI"])
    _, _, metas = _prepare_chroma_batch([chunk])
    assert metas[0]["tags"] == "产品经理,AI"


def test_prepare_batch_empty_tags():
    """空 tags 列表应序列化为空字符串"""
    chunk = make_chunk("test", "文本", tags=[])
    _, _, metas = _prepare_chroma_batch([chunk])
    assert metas[0]["tags"] == ""


def test_prepare_batch_required_meta_keys():
    """每个 metadata 必须包含所有预设字段"""
    _, _, metas = _prepare_chroma_batch(SAMPLE_CHUNKS)
    required = {"source_path", "title", "chapter", "section",
                "tags", "obsidian_uri", "chunk_index", "token_count"}
    for meta in metas:
        assert required.issubset(meta.keys())


# ─── upsert_chunks ────────────────────────────────────────────────────────
def test_upsert_returns_correct_count(ephemeral_collection):
    """upsert_chunks 应返回实际写入的数量"""
    written = upsert_chunks(SAMPLE_CHUNKS, ephemeral_collection)
    assert written == len(SAMPLE_CHUNKS)


def test_upsert_collection_count_matches(ephemeral_collection):
    """upsert 后 collection.count() 应等于写入数量"""
    upsert_chunks(SAMPLE_CHUNKS, ephemeral_collection)
    assert ephemeral_collection.count() == len(SAMPLE_CHUNKS)


def test_upsert_is_idempotent(ephemeral_collection):
    """重复 upsert 相同 chunk_id 不应产生重复记录"""
    upsert_chunks(SAMPLE_CHUNKS, ephemeral_collection)
    upsert_chunks(SAMPLE_CHUNKS, ephemeral_collection)
    assert ephemeral_collection.count() == len(SAMPLE_CHUNKS)


def test_upsert_empty_list(ephemeral_collection):
    """空切片列表不应写入任何记录"""
    written = upsert_chunks([], ephemeral_collection)
    assert written == 0
    assert ephemeral_collection.count() == 0


# ─── search ───────────────────────────────────────────────────────────────
def test_search_returns_results(ephemeral_collection):
    """语义检索应返回非空结果"""
    upsert_chunks(SAMPLE_CHUNKS, ephemeral_collection)
    results = search("产品经理需要哪些能力", ephemeral_collection, top_k=2)
    assert len(results) > 0


def test_search_result_structure(ephemeral_collection):
    """每个检索结果应包含 text, metadata, distance 字段"""
    upsert_chunks(SAMPLE_CHUNKS, ephemeral_collection)
    results = search("用户研究方法", ephemeral_collection, top_k=1)
    assert len(results) == 1
    assert "text" in results[0]
    assert "metadata" in results[0]
    assert "distance" in results[0]


def test_search_top_k_limit(ephemeral_collection):
    """检索结果数量不超过 top_k"""
    upsert_chunks(SAMPLE_CHUNKS, ephemeral_collection)
    results = search("产品经理", ephemeral_collection, top_k=2)
    assert len(results) <= 2


def test_search_chapter_filter(ephemeral_collection):
    """chapter_filter 过滤应只返回指定章节的切片"""
    upsert_chunks(SAMPLE_CHUNKS, ephemeral_collection)
    results = search("产品", ephemeral_collection, top_k=5,
                     chapter_filter="01-入门")
    for r in results:
        assert r["metadata"]["chapter"] == "01-入门"


# ─── keyword_search ────────────────────────────────────────────────────────
def test_keyword_search_returns_results(ephemeral_collection):
    """关键词检索应返回包含关键词的切片"""
    upsert_chunks(SAMPLE_CHUNKS, ephemeral_collection)
    results = keyword_search("需求分析", ephemeral_collection, top_k=5)
    assert len(results) > 0
    # 所有返回的 text 应包含关键词
    for r in results:
        assert "需求分析" in r["text"]
