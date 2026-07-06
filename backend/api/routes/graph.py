import os
import re
from pathlib import Path
from typing import List, Dict, Any, Optional, Set
from fastapi import APIRouter, Request, Query, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

# ─── Pydantic 模型 ───────────────────────────────────────────────────

class GraphNode(BaseModel):
    id: str               # chapter 名 或 source_path (e.g. "01-入门" or "01-入门/1.1-需求.md")
    label: str            # 显示名
    type: str             # "chapter" | "note"
    chapter: str          # 所属一级目录
    note_count: int = 1   # 该节点包含的笔记数 (chapter 层级使用)
    tags: List[str] = []  # 代表性标签 (本项目中通常为空)

class GraphLink(BaseModel):
    source: str           # 源节点 id
    target: str           # 目标节点 id
    weight: int = 1       # 权重

class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    links: List[GraphLink]
    level: str
    total_notes: int

# ─── 帮助函数 ─────────────────────────────────────────────────────────

def parse_learning_path(notes_dir: str) -> Dict[str, List[Dict[str, str]]]:
    """
    解析 `学习路线总览.md` 提取章节目录下的笔记顺序。
    返回结构: { "01-入门": [{"path": "01-入门/1.1-需求.md", "title": "1.1 需求"}, ...], ... }
    """
    toc_path = Path(notes_dir) / "学习路线总览.md"
    if not toc_path.exists():
        return {}

    with open(toc_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 正则匹配双链 [[01-入门/1.1-需求|1.1 需求]]
    pattern = re.compile(r'\[\[([^\]|]+)(?:\|([^\]]+))?\]\]')
    matches = pattern.findall(content)

    chapters_dict = {}
    for target_path, label in matches:
        # 排除 README 等目录节点
        if "README" in target_path or "学习路线总览" in target_path:
            continue
        
        parts = target_path.split("/")
        if len(parts) == 2:
            chapter = parts[0]
            note_file = parts[1]
            
            # 补齐 .md 后缀以便与数据库 source_path 匹配
            if not note_file.endswith(".md"):
                note_file += ".md"
            
            full_path = f"{chapter}/{note_file}"
            display_label = label if label else note_file.replace(".md", "")
            
            if chapter not in chapters_dict:
                chapters_dict[chapter] = []
                
            chapters_dict[chapter].append({
                "path": full_path,
                "title": display_label
            })
            
    return chapters_dict

def get_cross_links(notes: List[Dict[str, Any]]) -> List[GraphLink]:
    """
    提取跨章节的关键词交织关联线（如两篇笔记标题都包含 "AI"、"数据"、"需求"）
    限制数量以避免图谱过密。
    """
    keywords = ["AI", "数据", "需求", "评估", "商业", "面试", "模型", "PRD", "产品经理", "指标", "用户"]
    keyword_map = {k: [] for k in keywords}
    
    for note in notes:
        title = note.get("title", "")
        path = note.get("path", "")
        for kw in keywords:
            if kw in title:
                keyword_map[kw].append(path)
                
    links = []
    seen_edges = set()
    for kw, paths in keyword_map.items():
        # 如果某个关键词匹配的笔记太多，仅连接相邻的前几个以防出现蜘蛛网
        if len(paths) > 1:
            for i in range(min(15, len(paths) - 1)):
                u, v = paths[i], paths[i+1]
                edge = tuple(sorted([u, v]))
                if edge not in seen_edges:
                    seen_edges.add(edge)
                    links.append(GraphLink(source=u, target=v, weight=1))
    return links

# ─── 路由实现 ─────────────────────────────────────────────────────────

@router.get("/graph", response_model=GraphResponse)
async def get_graph(
    request: Request,
    level: str = Query(default="chapter", description="聚合层级: chapter 或 note"),
    chapter: Optional[str] = Query(default=None, description="过滤章节名，仅在 level=note 时有效"),
) -> GraphResponse:
    """
    获取知识库拓扑图数据
    
    - level=chapter: 返回按 13 个一级目录聚合的图谱。
    - level=note: 返回笔记级别的细粒度力导向图，建议配合 chapter 参数过滤单章子图。
    """
    notes_dir = os.getenv("NOTES_DIR", "")
    if not notes_dir:
        raise HTTPException(status_code=500, detail="未配置 NOTES_DIR 环境变量")

    # 1. 解析总览获得大纲层级结构
    try:
        chapters_dict = parse_learning_path(notes_dir)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"解析学习路线大纲失败: {str(e)}")

    if not chapters_dict:
        return GraphResponse(nodes=[], links=[], level=level, total_notes=0)

    # 2. 从 ChromaDB 获取实际入库的笔记以保证数据同步
    collection = request.app.state.collection
    try:
        db_results = collection.get(include=["metadatas"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"读取向量库失败: {str(e)}")

    # 提取向量库里真实的去重笔记路径
    db_paths = set()
    if db_results and db_results["metadatas"]:
        for meta in db_results["metadatas"]:
            path = meta.get("source_path")
            if path:
                db_paths.add(path)

    total_notes_count = len(db_paths)

    # ─── 章节聚合层级 (level = chapter) ──────────────────────────────────
    if level == "chapter":
        nodes = []
        links = []
        
        # 13个章节列表
        chapter_names = list(chapters_dict.keys())
        
        # 构建节点
        for ch_name in chapter_names:
            # 仅统计实际入库的笔记数
            note_list = chapters_dict[ch_name]
            actual_count = sum(1 for n in note_list if n["path"] in db_paths)
            
            nodes.append(GraphNode(
                id=ch_name,
                label=ch_name,
                type="chapter",
                chapter=ch_name,
                note_count=actual_count,
                tags=[]
            ))
            
        # 构建章节级主干学习连线（首尾相接）
        for i in range(len(chapter_names) - 1):
            links.append(GraphLink(
                source=chapter_names[i],
                target=chapter_names[i+1],
                weight=3
            ))
            
        return GraphResponse(nodes=nodes, links=links, level="chapter", total_notes=total_notes_count)

    # ─── 笔记展开层级 (level = note) ─────────────────────────────────────
    else:
        nodes = []
        links = []
        
        # 过滤要处理的章节
        target_chapters = [chapter] if (chapter and chapter != "all") else list(chapters_dict.keys())
        
        all_flat_notes = []
        for ch_name in target_chapters:
            note_list = chapters_dict.get(ch_name, [])
            for n in note_list:
                # 必须存在于真实数据库中
                if n["path"] in db_paths:
                    all_flat_notes.append({
                        "path": n["path"],
                        "title": n["title"],
                        "chapter": ch_name
                    })

        # 构建节点
        for n in all_flat_notes:
            nodes.append(GraphNode(
                id=n["path"],
                label=n["title"],
                type="note",
                chapter=n["chapter"],
                note_count=1,
                tags=[]
            ))
            
        # 构建各个章节内部的顺序主干线
        # 如果未指定过滤章节，则把各个章节尾-头串联成单条大路线
        for ch_name in target_chapters:
            ch_notes = [n for n in all_flat_notes if n["chapter"] == ch_name]
            for i in range(len(ch_notes) - 1):
                links.append(GraphLink(
                    source=ch_notes[i]["path"],
                    target=ch_notes[i+1]["path"],
                    weight=2
                ))
                
        # 如果是全图，添加跨章首尾连接线
        if not chapter or chapter == "all":
            for i in range(len(target_chapters) - 1):
                ch_curr = target_chapters[i]
                ch_next = target_chapters[i+1]
                notes_curr = [n for n in all_flat_notes if n["chapter"] == ch_curr]
                notes_next = [n for n in all_flat_notes if n["chapter"] == ch_next]
                if notes_curr and notes_next:
                    links.append(GraphLink(
                        source=notes_curr[-1]["path"],
                        target=notes_next[0]["path"],
                        weight=3
                    ))

        # 提取基于标题相似度的交叉跨章细引线（增色图谱）
        cross_links = get_cross_links(all_flat_notes)
        links.extend(cross_links)
        
        return GraphResponse(nodes=nodes, links=links, level="note", total_notes=total_notes_count)
