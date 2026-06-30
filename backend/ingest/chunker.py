"""
Hybrid Chunker for PM Knowledge Hub
=====================================
混合切片策略：
  第一层（硬切）：按 Markdown 章节标题 (## / ###) 切分段落
  第二层（软切）：对超过 max_tokens 字符的段落，使用滑动窗口继续切割
  
每个切片 (Chunk) 的结构：
{
  "chunk_id":       str,     # 唯一标识符，格式：<文件相对路径>_chunk<N>
  "text":           str,     # 切片正文
  "source_path":    str,     # 原始笔记的相对路径
  "title":          str,     # 原始笔记的标题
  "chapter":        str,     # 所属章节目录
  "section":        str,     # 切片所属的标题（如 ## 概念定义）
  "tags":           List[str],
  "obsidian_uri":   str,     # 一键跳转 URI
  "chunk_index":    int,     # 该笔记内的切片序号（从 0 开始）
  "token_count":    int,     # 粗估 token 数（以中英文字符数 / 1.5 计算）
}
"""

import re
from typing import List, Dict, Any

# --- 切片参数 ---
# 每切片的目标 token 上限（估算：中英文平均约 1.5 字符/token）
DEFAULT_MAX_TOKENS = 300
# 滑动窗口重叠 token 数
DEFAULT_OVERLAP_TOKENS = 50

# 匹配 Markdown 标题行（## 级别以上，忽略一级标题 H1 因为 H1 是文章标题）
HEADING_REGEX = re.compile(r'^(#{2,6})\s+(.+)$', re.MULTILINE)


def estimate_tokens(text: str) -> int:
    """
    粗估 token 数，规则：字符数 / 1.5（适用于中英文混排文本）
    """
    return max(1, int(len(text) / 1.5))


def _slide_window(text: str, section: str, max_tokens: int, overlap_tokens: int) -> List[str]:
    """
    对单段超长文本进行滑动窗口切割，返回切割后的字符串列表。
    以句子（。！？\n\n）为最小切割原子，尽量不在句子中间截断。
    """
    max_chars = int(max_tokens * 1.5)
    overlap_chars = int(overlap_tokens * 1.5)

    # 按段落和句子边界切割
    # 优先从段落边界（空行）断开，其次从中文句尾标点断开
    sentence_ends = re.compile(r'(?<=[。！？\n])\s*')
    sentences = sentence_ends.split(text)
    # 过滤空字符串
    sentences = [s for s in sentences if s.strip()]

    if not sentences:
        return [text]

    chunks = []
    current_chars = []
    current_len = 0

    for sent in sentences:
        sent_len = len(sent)
        if current_len + sent_len > max_chars and current_chars:
            # 保存当前窗口
            chunks.append(''.join(current_chars).strip())
            # 保留 overlap 部分（从尾部向前截取）
            overlap_text = ''.join(current_chars)[-overlap_chars:]
            current_chars = [overlap_text]
            current_len = len(overlap_text)

        current_chars.append(sent)
        current_len += sent_len

    if current_chars:
        last_chunk = ''.join(current_chars).strip()
        if last_chunk:
            chunks.append(last_chunk)

    return chunks if chunks else [text]


def _split_by_headings(content: str) -> List[Dict[str, str]]:
    """
    将笔记正文按 ## / ### 级标题切分为多个段落。
    返回：[{"section": "标题文本", "text": "段落正文"}, ...]
    
    如果文章开头没有标题，归入 section="" 的导言段落。
    """
    sections = []
    last_pos = 0
    current_section = ""

    for m in HEADING_REGEX.finditer(content):
        # 记录上一个标题到这个标题之间的正文
        segment_text = content[last_pos:m.start()].strip()
        if segment_text:
            sections.append({"section": current_section, "text": segment_text})

        current_section = m.group(2).strip()
        last_pos = m.end()

    # 最后一个段落
    tail_text = content[last_pos:].strip()
    if tail_text:
        sections.append({"section": current_section, "text": tail_text})

    # 如果没有找到任何标题，整篇文章当作一个段落
    if not sections:
        sections.append({"section": "", "text": content.strip()})

    return sections


def chunk_note(note: Dict[str, Any],
               max_tokens: int = DEFAULT_MAX_TOKENS,
               overlap_tokens: int = DEFAULT_OVERLAP_TOKENS) -> List[Dict[str, Any]]:
    """
    对单篇解析好的笔记（parser.py 输出的 dict）进行混合切片。
    返回该笔记产生的所有 Chunk 列表。
    """
    content = note.get("content", "")
    if not content.strip():
        return []

    file_path = note.get("file_path", "")
    title = note.get("title", "")
    chapter = note.get("metadata", {}).get("chapter", "")
    tags = note.get("metadata", {}).get("tags", [])
    obsidian_uri = note.get("obsidian_uri", "")

    # 第一层：按标题硬切
    heading_sections = _split_by_headings(content)

    chunks: List[Dict[str, Any]] = []
    chunk_index = 0

    for sec in heading_sections:
        section_text = sec["text"]
        section_name = sec["section"]

        # 第二层：如果段落超长，滑动窗口软切
        if estimate_tokens(section_text) > max_tokens:
            sub_chunks = _slide_window(section_text, section_name, max_tokens, overlap_tokens)
        else:
            sub_chunks = [section_text]

        for sub_text in sub_chunks:
            if not sub_text.strip():
                continue

            chunk_id = f"{file_path}_chunk{chunk_index}"
            chunks.append({
                "chunk_id":     chunk_id,
                "text":         sub_text.strip(),
                "source_path":  file_path,
                "title":        title,
                "chapter":      chapter,
                "section":      section_name,
                "tags":         tags,
                "obsidian_uri": obsidian_uri,
                "chunk_index":  chunk_index,
                "token_count":  estimate_tokens(sub_text),
            })
            chunk_index += 1

    return chunks


def chunk_all_notes(notes: List[Dict[str, Any]],
                    max_tokens: int = DEFAULT_MAX_TOKENS,
                    overlap_tokens: int = DEFAULT_OVERLAP_TOKENS) -> List[Dict[str, Any]]:
    """
    对所有笔记的列表进行批量切片。
    """
    all_chunks = []
    for note in notes:
        note_chunks = chunk_note(note, max_tokens, overlap_tokens)
        all_chunks.extend(note_chunks)
    return all_chunks


if __name__ == "__main__":
    # 本地快速测试
    import os
    from dotenv import load_dotenv
    import sys

    # 添加 backend 根目录到 sys.path，使 ingest.parser 可以正常导入
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    from ingest.parser import ObsidianNoteParser

    load_dotenv()
    notes_path = os.getenv("NOTES_DIR")

    if not notes_path:
        print("[Error] NOTES_DIR not found in .env")
    else:
        print(f"[Scan] dir: {notes_path}")
        parser = ObsidianNoteParser(notes_path)
        notes = parser.scan_and_parse_all()
        print(f"[Success] parsed {len(notes)} notes.")

        all_chunks = chunk_all_notes(notes)
        print(f"[Success] chunked into {len(all_chunks)} chunks.")

        # 统计摘要
        token_counts = [c["token_count"] for c in all_chunks]
        avg_tokens = sum(token_counts) / len(token_counts) if token_counts else 0
        max_tok = max(token_counts) if token_counts else 0
        min_tok = min(token_counts) if token_counts else 0
        print(f"\n--- Chunk Stats ---")
        print(f"Total:   {len(all_chunks)}")
        print(f"Avg tok: {avg_tokens:.1f}")
        print(f"Max tok: {max_tok}")
        print(f"Min tok: {min_tok}")

        # 打印前两个切片示例（text 截断并过滤不可打印字符）
        def safe(s: str) -> str:
            return s.encode("gbk", errors="replace").decode("gbk")

        print("\n--- First 2 Chunks ---")
        for chunk in all_chunks[:2]:
            print(f"\nchunk_id:    {safe(chunk['chunk_id'])}")
            print(f"title:       {safe(chunk['title'])}")
            print(f"chapter:     {safe(chunk['chapter'])}")
            print(f"section:     {safe(chunk['section'])}")
            print(f"tags:        {chunk['tags']}")
            print(f"token_count: {chunk['token_count']}")
            print(f"text (first 80 chars):\n{safe(chunk['text'][:80])}...")

