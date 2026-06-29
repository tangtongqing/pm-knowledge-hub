import pytest
from pathlib import Path
from ingest.parser import ObsidianNoteParser

def test_clean_text_and_extract_links():
    # 模拟初始化，因为我们只是测试独立函数，所以传入临时目录即可
    parser = ObsidianNoteParser(".")
    
    # 1. 测试带自定义显示文本的双链
    raw_text = "阅读 [[01-入门/1.1-需求|1.1 需求]] 之后"
    cleaned, links = parser.clean_text_and_extract_links(raw_text)
    assert cleaned == "阅读 1.1 需求 之后"
    assert links == ["01-入门/1.1-需求"]
    
    # 2. 测试不带显示文本的双链
    raw_text_2 = "参考 [[1.1-需求]]"
    cleaned_2, links_2 = parser.clean_text_and_extract_links(raw_text_2)
    assert cleaned_2 == "参考 1.1-需求"
    assert links_2 == ["1.1-需求"]
    
    # 3. 测试图片嵌入
    raw_text_3 = "架构图： ![[architecture.png]]"
    cleaned_3, links_3 = parser.clean_text_and_extract_links(raw_text_3)
    assert cleaned_3 == "架构图： ![architecture.png](../_images/architecture.png)"
    assert len(links_3) == 0

def test_extract_inline_tags():
    parser = ObsidianNoteParser(".")
    
    text = "这是一个 #产品经理 的日常，主要是进行 #需求分析 与 #AI 系统设计。"
    tags = parser.extract_inline_tags(text)
    assert len(tags) == 3
    assert "产品经理" in tags
    assert "需求分析" in tags
    assert "AI" in tags

def test_parse_frontmatter():
    parser = ObsidianNoteParser(".")
    
    # 1. 正常 frontmatter
    raw_note = "---\ntitle: 测试标题\ntags: [tag1, tag2]\n---\n# 章节正文\n这里是正文内容。"
    meta, body = parser.parse_frontmatter(raw_note)
    assert meta == {"title": "测试标题", "tags": ["tag1", "tag2"]}
    assert body.strip() == "# 章节正文\n这里是正文内容。"
    
    # 2. 无 frontmatter
    raw_note_2 = "# 章节正文\n这里是没有 yaml 的正文。"
    meta_2, body_2 = parser.parse_frontmatter(raw_note_2)
    assert meta_2 == {}
    assert body_2 == raw_note_2
