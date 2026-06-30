import pytest
from ingest.chunker import chunk_note, chunk_all_notes, estimate_tokens, _slide_window, _split_by_headings


# ─── 公共测试 fixture ──────────────────────────────────────────────
def make_note(content: str, tags=None) -> dict:
    """Helper: 构建一个模拟的 parser 输出字典"""
    return {
        "title": "测试笔记",
        "file_path": "test/note.md",
        "obsidian_uri": "obsidian://open?vault=test&file=test/note",
        "content": content,
        "metadata": {
            "chapter": "01-测试章节",
            "tags": tags or [],
            "outgoing_links": [],
            "raw_metadata": {},
        }
    }


# ─── estimate_tokens ──────────────────────────────────────────────
def test_estimate_tokens_basic():
    """token 估算应返回正整数且与字符长度正相关"""
    short = "你好"
    long = "你好" * 100
    assert estimate_tokens(short) >= 1
    assert estimate_tokens(long) > estimate_tokens(short)


# ─── _split_by_headings ───────────────────────────────────────────
def test_split_by_headings_with_headers():
    """标题切分应正确识别 ## 并按标题分段"""
    content = "# 大标题\n\n导言段落\n\n## 第一节\n\n内容 A\n\n## 第二节\n\n内容 B"
    sections = _split_by_headings(content)
    # 应当至少分出导言和两节
    assert len(sections) >= 2
    section_names = [s["section"] for s in sections]
    assert "第一节" in section_names
    assert "第二节" in section_names


def test_split_by_headings_no_headers():
    """没有标题的文章应以整篇文章为单段"""
    content = "这是一篇没有标题的文章，内容在这里。"
    sections = _split_by_headings(content)
    assert len(sections) == 1
    assert sections[0]["section"] == ""
    assert sections[0]["text"] == content


# ─── _slide_window ────────────────────────────────────────────────
def test_slide_window_splits_long_text():
    """超长文本应被滑动窗口切分为多个子切片"""
    # 构建大约 500 tokens 的文本（约 750 字）
    long_text = "这是一个很长的句子，用来测试滑动窗口的切片功能。" * 30
    result = _slide_window(long_text, "测试标题", max_tokens=100, overlap_tokens=20)
    assert len(result) > 1, "超长文本应被切为多片"


def test_slide_window_short_text_single_chunk():
    """短文本应保持为单个切片"""
    short_text = "这是短文本。"
    result = _slide_window(short_text, "测试", max_tokens=300, overlap_tokens=50)
    assert len(result) == 1
    assert result[0] == short_text


# ─── chunk_note ───────────────────────────────────────────────────
def test_chunk_note_basic_structure():
    """chunk_note 应返回包含所有必需字段的切片列表"""
    content = "## 概念定义\n\n这是概念定义部分的内容。\n\n## 应用场景\n\n这是应用场景的内容。"
    note = make_note(content, tags=["产品经理", "AI"])
    chunks = chunk_note(note)
    
    assert len(chunks) >= 2
    required_keys = {"chunk_id", "text", "source_path", "title", "chapter",
                     "section", "tags", "obsidian_uri", "chunk_index", "token_count"}
    for chunk in chunks:
        assert required_keys.issubset(chunk.keys()), f"切片缺少必需字段: {required_keys - chunk.keys()}"


def test_chunk_note_ids_are_unique():
    """同一笔记的所有切片 ID 应唯一"""
    content = "## A\n\n内容A\n\n## B\n\n内容B\n\n## C\n\n内容C"
    note = make_note(content)
    chunks = chunk_note(note)
    ids = [c["chunk_id"] for c in chunks]
    assert len(ids) == len(set(ids)), "存在重复的 chunk_id"


def test_chunk_note_metadata_propagated():
    """解析器元数据应正确传播到每个切片"""
    content = "## 章节\n\n内容在这里。"
    note = make_note(content, tags=["标签1", "标签2"])
    chunks = chunk_note(note)
    
    assert len(chunks) > 0
    for chunk in chunks:
        assert chunk["chapter"] == "01-测试章节"
        assert chunk["title"] == "测试笔记"
        assert set(["标签1", "标签2"]).issubset(set(chunk["tags"]))


def test_chunk_note_empty_content_returns_empty():
    """空正文的笔记不应产生任何切片"""
    note = make_note("")
    chunks = chunk_note(note)
    assert chunks == []


def test_chunk_note_long_section_is_split():
    """超过 max_tokens 的单个段落应被滑动窗口进一步切分"""
    # 约 600 token（~900 字）
    long_paragraph = "这是一个超长的段落内容，反复出现以测试切片逻辑。" * 40
    content = f"## 长段落\n\n{long_paragraph}"
    note = make_note(content)
    chunks = chunk_note(note, max_tokens=200, overlap_tokens=30)
    # 单个超长段落应产生多于 1 个切片
    assert len(chunks) > 1, "超长段落未被正确切分"
    # 所有切片的 token 数应在合理范围
    for chunk in chunks:
        assert chunk["token_count"] <= 300, f"切片 {chunk['chunk_id']} 超过 token 上限"


# ─── chunk_all_notes ─────────────────────────────────────────────
def test_chunk_all_notes():
    """批量切片应返回所有笔记的切片合并列表"""
    notes = [
        make_note("## A\n\n内容A"),
        make_note("## B\n\n内容B"),
    ]
    # Override file_path to avoid collision
    notes[0]["file_path"] = "note_0.md"
    notes[1]["file_path"] = "note_1.md"
    
    all_chunks = chunk_all_notes(notes)
    assert len(all_chunks) >= 2
    # 两份笔记的 chunk_id 前缀应互不相同
    prefixes = {c["source_path"] for c in all_chunks}
    assert len(prefixes) == 2
