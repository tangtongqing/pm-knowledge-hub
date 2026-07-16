"""
QA Agent — PM 知识检索问答智能体
====================================
职责：
  1. 接收用户的提问，通过 ChromaDB 检索最相关的知识片段
  2. 调用 Gemini API 将检索到的上下文进行深度总结与回答
  3. 支持结构化输出：包括回答内容、引用来源、相关推荐
  4. 支持本地/演示模式（无 API Key 时进行本地合成，保证系统 100% 可演示）
"""

import os
import re
from typing import List, Dict, Any, Optional
from pathlib import Path
from pydantic import BaseModel, Field, field_validator
from google import genai
from google.genai import types

# ── 结构化响应模型 ──────────────────────────────────────────────────────

class QAAgentResponse(BaseModel):
    answer: str = Field(description="基于上下文生成的专业回答。使用 Markdown 格式，层级清晰，结构严谨，不要包含复读或无意义的前置词。")
    recommendations: List[str] = Field(description="3 个与当前问题及上下文相关的延伸提问或知识点（从检索到的笔记标签、双链或正文中提炼）。")


class QARequest(BaseModel):
    query: str = Field(..., max_length=2000, description="用户提问")
    top_k: int = 5
    chapter: Optional[str] = None
    tag: Optional[str] = None

    @field_validator("query")
    @classmethod
    def validate_query(cls, v: str) -> str:
        if re.search(r'[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]', v):
            raise ValueError("输入包含非法的控制字符")
        return v


class QASource(BaseModel):
    title: str
    source_path: str
    section: str
    obsidian_uri: str
    distance: float
    excerpt: str


class QAServiceResponse(BaseModel):
    query: str
    answer: str
    sources: List[QASource]
    recommendations: List[str]
    is_mock: bool = False


# ── Agent 类实现 ────────────────────────────────────────────────────────

class QAAgent:
    def __init__(self, collection):
        self.collection = collection
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
        
        if self.api_key:
            # 初始化 Google GenAI 客户端
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None
            print("[WARN] [QA Agent] GEMINI_API_KEY 未配置，将以 [演示模式] 运行。")

    def _generate_mock_response(self, query: str, hits: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        无 API Key 时的本地回退逻辑：使用检索到的最相关片段合成回答。
        保证项目在任何情况下均可演示，展现鲁棒性。
        """
        if not hits:
            return {
                "answer": "抱歉，知识库中未找到与该问题相关的笔记。请尝试更换关键词，或者添加更多 Markdown 笔记到源文件夹中。",
                "recommendations": ["什么是需求分析？", "如何撰写 PRD？", "AI 产品经理的学习路线是什么？"]
            }
            
        best_hit = hits[0]
        title = best_hit["metadata"].get("title", "未命名笔记")
        chapter = best_hit["metadata"].get("chapter", "根目录")
        text = best_hit["text"]
        
        # 简单合成回答
        answer = (
            f"💡 **[演示模式] 知识库已成功检索到相关知识。配置 `GEMINI_API_KEY` 后，AI 将为您自动总结。**\n\n"
            f"以下是为您检索到的核心笔记 **《{title}》** ({chapter}) 中的内容片段 [1]：\n\n"
            f"{text}\n\n"
            f"--- \n"
            f"*提示：您可以在本地 `backend/.env` 文件中配置 `GEMINI_API_KEY=您的Key` 以开启 AI 智能体深度问答功能。*"
        )
        
        # 从元数据中提炼相关推荐
        recommendations = []
        # 提取 tags 作为推荐问题
        tags_str = best_hit["metadata"].get("tags", "")
        if tags_str:
            tags = [t.strip() for t in tags_str.split(",") if t.strip()]
            for t in tags[:3]:
                recommendations.append(f"能详细介绍一下与 #{t} 相关的知识吗？")
                
        # 补足 3 个推荐
        default_recs = ["如何做竞品分析？", "请解释一下 AARRR 模型", "PRD 包含哪些核心模块？"]
        while len(recommendations) < 3:
            rec = default_recs[len(recommendations)]
            if rec not in recommendations:
                recommendations.append(rec)
                
        return {
            "answer": answer,
            "recommendations": recommendations[:3]
        }

    def answer(self, query: str,
               top_k: int = 5,
               chapter_filter: Optional[str] = None,
               tag_filter: Optional[str] = None) -> QAServiceResponse:
        """
        问答执行主函数
        1. 检索 ChromaDB
        2. 格式化上下文
        3. 调用 Gemini API / 触发 Mock 回退
        4. 返回统一的结构化对象
        """
        from ingest.vectorizer import search
        
        # 1. 检索本地向量库
        hits = search(
            query=query,
            collection=self.collection,
            top_k=top_k,
            chapter_filter=chapter_filter,
            tag_filter=tag_filter
        )
        
        # 转换检索来源为标准的 QASource
        sources = [
            QASource(
                title=h["metadata"].get("title", ""),
                source_path=h["metadata"].get("source_path", ""),
                section=h["metadata"].get("section", ""),
                obsidian_uri=h["metadata"].get("obsidian_uri", ""),
                distance=h["distance"],
                excerpt=h["text"][:500].strip()
            )
            for h in hits
        ]
        
        # 2. 如果没有 API Key，或者客户端未初始化，使用本地 Mock 模式
        if not self.client:
            mock_res = self._generate_mock_response(query, hits)
            return QAServiceResponse(
                query=query,
                answer=mock_res["answer"],
                sources=sources,
                recommendations=mock_res["recommendations"],
                is_mock=True
            )
            
        # 3. 组装上下文，调用大模型
        context_parts = []
        for i, h in enumerate(hits, 1):
            title = h["metadata"].get("title", "未命名")
            section = h["metadata"].get("section", "")
            sec_str = f" - 章节: {section}" if section else ""
            context_parts.append(f"--- 资料库来源 #{i}: 《{title}》{sec_str} ---\n{h['text']}")
            
        context = "\n\n".join(context_parts)
        
        system_instruction = (
            "你是一个极其资深、专业的 AI 产品经理导师和求职教练。\n"
            "用户是正在求职传统产品经理或 AI 产品经理职位的候选人。\n"
            "你的任务是根据提供的[参考上下文]，以专业、系统、结构化的语言回答用户的问题。\n\n"
            "回答规则：\n"
            "1. 你的回答必须严格基于[参考上下文]中的事实，不得凭空捏造事实。如果参考上下文无法充分解答问题，请直白告知用户参考资料不足，但可以结合通用的产品经理方法论给出适当的补充，并明确区分哪部分是资料来源，哪部分是额外补充。\n"
            "2. 回答使用 Markdown 格式。善用粗体、列表、引用和代码块使排版极其精美。\n"
            "3. 保持客观、专业、干练的语气，避免任何废话或前置铺垫（例如：'好的，根据您提供的参考资料...'）。"
            "4. 每个来自参考上下文的关键结论后必须标注对应来源编号，例如 [1] 或 [2]；编号必须与资料库来源编号一致。"
        )
        
        prompt = (
            f"[参考上下文]:\n{context}\n\n"
            f"[用户问题]: {query}\n\n"
            f"请生成详细总结回答，并给出 3 个相关的延伸提问。"
        )
        
        try:
            # 4. 调用新版 google-genai 客户端，并要求结构化输出
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=QAAgentResponse,
                    temperature=0.3
                )
            )
            
            # 解析 JSON 响应
            import json
            res_data = json.loads(response.text)
            
            return QAServiceResponse(
                query=query,
                answer=res_data.get("answer", ""),
                sources=sources,
                recommendations=res_data.get("recommendations", []),
                is_mock=False
            )
            
        except Exception as e:
            print(f"[ERROR] [QA Agent] Gemini 调用异常: {e}。自动切换到本地 Mock 演示模式。")
            mock_res = self._generate_mock_response(query, hits)
            return QAServiceResponse(
                query=query,
                answer=mock_res["answer"] + f"\n\n*(注意：因大模型调用失败，系统自动降级为演示模式。错误详情: {str(e)})*",
                sources=sources,
                recommendations=mock_res["recommendations"],
                is_mock=True
            )
