"""
Vectorizer — ChromaDB 本地向量化入库模块
==========================================
职责：
  1. 将 chunker 产出的切片列表向量化，存入本地 ChromaDB 集合
  2. 提供语义检索接口 `search(query, top_k, filters)`
  3. 提供关键词过滤接口（按 chapter / tags 过滤）

ChromaDB 存储路径：
  由 .env 中的 CHROMA_DB_PATH 控制，默认 backend/data/chroma_db

Embedding 模型：
  sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
  - 支持中英文混排语义检索
  - 首次运行会自动从 HF 镜像下载（约 120 MB）
  - 无需 API Key，完全离线可用
  - HF 镜像设置: HF_ENDPOINT=https://hf-mirror.com

Collection 设计：
  名称：pm_notes
  ID：chunk_id（来自 chunker 输出）
  document：chunk["text"]
  metadata：{
    source_path, title, chapter, section,
    tags (逗号拼接字符串，便于 ChromaDB where 过滤),
    obsidian_uri, chunk_index, token_count
  }
"""

import os
from typing import List, Dict, Any, Optional
from pathlib import Path

import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

# ── 常量 ──────────────────────────────────────────────────────────────
COLLECTION_NAME = "pm_notes"
DEFAULT_DB_PATH = str(Path(__file__).parent.parent / "data" / "chroma_db")
# 支持中英文的多语言模型，约 120 MB
DEFAULT_EMBED_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"


def _set_hf_mirror():
    """
    如果环境变量中配置了 HF_ENDPOINT，
    设置 HuggingFace Hub 下载内容使用镜像站点。
    """
    hf_endpoint = os.getenv("HF_ENDPOINT", "")
    if hf_endpoint:
        os.environ["HF_ENDPOINT"] = hf_endpoint
        os.environ["HUGGINGFACE_HUB_URL"] = hf_endpoint


def _get_db_path() -> str:
    """从环境变量读取 DB 路径，若未设置则使用默认路径"""
    return os.getenv("CHROMA_DB_PATH", DEFAULT_DB_PATH)


def get_client(db_path: Optional[str] = None) -> chromadb.PersistentClient:
    """
    创建 ChromaDB PersistentClient，数据落盘到本地目录。
    """
    path = db_path or _get_db_path()
    Path(path).mkdir(parents=True, exist_ok=True)
    return chromadb.PersistentClient(path=path)


def get_collection(client: chromadb.PersistentClient,
                   collection_name: str = COLLECTION_NAME,
                   model_name: Optional[str] = None):
    """
    获取或创建 pm_notes collection。
    使用 SentenceTransformerEmbeddingFunction 进行向量化，
    支持中英文混排，首次运行会自动从 HF 镜像下载模型。
    """
    _set_hf_mirror()
    model = model_name or os.getenv("EMBEDDING_MODEL", DEFAULT_EMBED_MODEL)
    ef = SentenceTransformerEmbeddingFunction(model_name=model)
    return client.get_or_create_collection(
        name=collection_name,
        embedding_function=ef,
        metadata={"description": "PM Knowledge Hub — Obsidian notes chunks",
                  "embedding_model": model}
    )


def _prepare_chroma_batch(chunks: List[Dict[str, Any]]):
    """
    将 chunker 格式的 chunks 转为 ChromaDB 批量插入所需的三元组：
    (ids, documents, metadatas)
    
    注意：ChromaDB metadata value 只支持 str / int / float / bool。
    tags 列表 -> 逗号分隔字符串，方便 where contains 过滤。
    """
    ids = []
    documents = []
    metadatas = []

    for chunk in chunks:
        chunk_id = chunk["chunk_id"]
        text = chunk["text"]
        tags_str = ",".join(chunk.get("tags", []))

        meta = {
            "source_path":  chunk.get("source_path", ""),
            "title":        chunk.get("title", ""),
            "chapter":      chunk.get("chapter", ""),
            "section":      chunk.get("section", ""),
            "tags":         tags_str,
            "obsidian_uri": chunk.get("obsidian_uri", ""),
            "chunk_index":  chunk.get("chunk_index", 0),
            "token_count":  chunk.get("token_count", 0),
        }

        ids.append(chunk_id)
        documents.append(text)
        metadatas.append(meta)

    return ids, documents, metadatas


def upsert_chunks(chunks: List[Dict[str, Any]],
                  collection,
                  batch_size: int = 100) -> int:
    """
    将切片批量 upsert 到 ChromaDB。
    使用 upsert 而不是 add，保证幂等性（重复运行不重复插入）。
    返回实际写入的切片数量。
    """
    if not chunks:
        return 0

    total = 0
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        ids, documents, metadatas = _prepare_chroma_batch(batch)
        collection.upsert(
            ids=ids,
            documents=documents,
            metadatas=metadatas,
        )
        total += len(batch)
        print(f"  [upsert] batch {i//batch_size + 1}: {len(batch)} chunks done "
              f"(total so far: {total})")

    return total


def search(query: str,
           collection,
           top_k: int = 5,
           chapter_filter: Optional[str] = None,
           tag_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    语义检索接口。
    
    Args:
        query:          自然语言查询字符串
        collection:     ChromaDB collection 对象
        top_k:          返回结果数量
        chapter_filter: 按章节名过滤（精确匹配），如 "01-入门"
        tag_filter:     按 tag 过滤（包含匹配），如 "产品经理"
    
    Returns:
        List[Dict]，每项包含：text, metadata, distance
    """
    where_clause = {}
    if chapter_filter:
        where_clause["chapter"] = {"$eq": chapter_filter}
    if tag_filter:
        # ChromaDB 支持 $contains 对 string 做子串匹配
        where_clause["tags"] = {"$contains": tag_filter}

    query_params: Dict[str, Any] = {
        "query_texts": [query],
        "n_results": top_k,
        "include": ["documents", "metadatas", "distances"],
    }
    if where_clause:
        query_params["where"] = where_clause

    results = collection.query(**query_params)

    hits = []
    if results and results["ids"] and results["ids"][0]:
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            hits.append({
                "text":     doc,
                "metadata": meta,
                "distance": round(dist, 4),
            })
    return hits


def get_all_documents(collection, chapter_filter: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    获取向量库中所有去重后的原始文档列表。
    从本地磁盘读取完整的 Markdown 文本，并清除 YAML Frontmatter，保证展示完整性。
    """
    import re
    where_clause = {}
    if chapter_filter and chapter_filter != "all":
        where_clause["chapter"] = {"$eq": chapter_filter}

    results = collection.get(
        where=where_clause if where_clause else None,
        include=["metadatas"]
    )

    notes_meta = {}
    if results and results["metadatas"]:
        for meta in results["metadatas"]:
            path = meta.get("source_path", "")
            if path and path not in notes_meta:
                notes_meta[path] = meta

    notes = []
    notes_dir = os.getenv("NOTES_DIR", "")
    
    # 前端用于匹配 YAML Frontmatter 的正则
    frontmatter_regex = re.compile(r'^---\s*\n(.*?)\n---\s*\n', re.DOTALL)

    for path, meta in notes_meta.items():
        full_text = ""
        if notes_dir:
            file_path = Path(notes_dir) / path
            if file_path.exists():
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        full_text = f.read()
                    
                    # 去除 Frontmatter
                    match = frontmatter_regex.match(full_text)
                    if match:
                        full_text = full_text[match.end():]
                except Exception as e:
                    print(f"⚠️ 读取本地文件失败 {file_path}: {e}")
        
        if not full_text:
            # 如果本地读取失败，回退到空提示
            full_text = f"# {meta.get('title', '无标题')}\n\n*(无法从磁盘读取该笔记完整内容)*"

        notes.append({
            "text": full_text,
            "metadata": meta,
            "distance": 0.0
        })
    
    return notes


def keyword_search(keyword: str,
                   collection,
                   top_k: int = 10) -> List[Dict[str, Any]]:
    """
    关键词检索接口（ChromaDB 的 where_document 子串匹配）。
    适用于精确关键词查找，补充语义检索的盲区。
    
    注意：ChromaDB 的 where_document 是全文扫描，适合中小规模数据集。
    """
    results = collection.query(
        query_texts=[keyword],
        n_results=top_k,
        where_document={"$contains": keyword},
        include=["documents", "metadatas", "distances"],
    )

    hits = []
    if results and results["ids"] and results["ids"][0]:
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            hits.append({
                "text":     doc,
                "metadata": meta,
                "distance": round(dist, 4),
            })
    return hits


# ── 完整 Ingest 流水线 ────────────────────────────────────────────────

def run_full_ingest(notes_dir: str,
                    db_path: Optional[str] = None,
                    max_tokens: int = 300,
                    overlap_tokens: int = 50) -> Dict[str, Any]:
    """
    端到端入库流水线：
      parse -> chunk -> upsert to ChromaDB
    
    Returns:
        stats dict: {notes_count, chunk_count, collection_count}
    """
    import sys
    # 保证 backend 根目录在 path 中
    backend_dir = str(Path(__file__).parent.parent)
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

    from ingest.parser import ObsidianNoteParser
    from ingest.chunker import chunk_all_notes

    # 1. 解析笔记
    parser = ObsidianNoteParser(notes_dir)
    notes = parser.scan_and_parse_all()
    print(f"[ingest] Parsed {len(notes)} notes.")

    # 2. 切片
    chunks = chunk_all_notes(notes, max_tokens=max_tokens, overlap_tokens=overlap_tokens)
    print(f"[ingest] Chunked into {len(chunks)} chunks.")

    # 3. 入库
    client = get_client(db_path)
    collection = get_collection(client)
    written = upsert_chunks(chunks, collection)
    print(f"[ingest] Upserted {written} chunks to ChromaDB.")
    print(f"[ingest] Collection total count: {collection.count()}")

    return {
        "notes_count":      len(notes),
        "chunk_count":      len(chunks),
        "collection_count": collection.count(),
    }


if __name__ == "__main__":
    import os
    from dotenv import load_dotenv

    load_dotenv()

    notes_path = os.getenv("NOTES_DIR")
    db_path = os.getenv("CHROMA_DB_PATH", DEFAULT_DB_PATH)

    if not notes_path:
        print("[Error] NOTES_DIR not found in .env")
    else:
        print(f"[Start] Full ingest pipeline")
        print(f"  notes_dir: {notes_path}")
        print(f"  db_path:   {db_path}")

        stats = run_full_ingest(notes_path, db_path)
        print(f"\n[Done] Ingest complete:")
        print(f"  notes:      {stats['notes_count']}")
        print(f"  chunks:     {stats['chunk_count']}")
        print(f"  collection: {stats['collection_count']}")

        # 快速验证：跑一个语义检索
        print("\n[Verify] Running semantic search: '产品经理的核心能力'")
        client = get_client(db_path)
        col = get_collection(client)
        hits = search("产品经理的核心能力", col, top_k=3)
        for i, h in enumerate(hits, 1):
            title = h["metadata"].get("title", "N/A")
            chapter = h["metadata"].get("chapter", "N/A")
            dist = h["distance"]
            text_preview = h["text"][:60].encode("gbk", errors="replace").decode("gbk")
            print(f"  [{i}] dist={dist:.4f} | {chapter} | {title} | {text_preview}...")
