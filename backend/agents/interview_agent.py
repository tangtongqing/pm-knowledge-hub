"""
Interview Agent — PM 模拟面试智能体
=====================================
职责：
  1. 基于用户的产品经理知识库内容，生成高质量的 PM 面试题（覆盖产品设计、数据指标、估算、策略及行为面试）
  2. 接收候选人（用户）的回答，从逻辑性、深度、结构化、亮点等多个维度进行评估与打分
  3. 基于标准的 STAR 面试法则（Situation-Task-Action-Result）生成针对性的诊断和改进建议
  4. 生成标准参考回答（Suggested Model Answer）并给出相关的追问（Next Question）
  5. 兼容本地演示模式：提供默认高质量题库及静态评估模板，防范 API 欠费与断网风险
"""

import os
import random
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, field_validator
from google import genai
from google.genai import types

# ── 结构化响应模型 ──────────────────────────────────────────────────────

class STARFeedback(BaseModel):
    situation: str = Field(description="S(情境)：评估候选人对业务场景和背景的描述是否清晰。")
    task: str = Field(description="T(任务)：评估候选人对核心痛点、业务目标或考核指标的定位是否准确。")
    action: str = Field(description="A(行动)：评估候选人提出的解决方案和具体执行动作是否逻辑自洽、具有可落地性。")
    result: str = Field(description="R(结果)：评估候选人是否给出了量化指标或可预期的商业/用户价值。")


class InterviewEvaluation(BaseModel):
    score: int = Field(description="综合评分（0-100分）。传统大厂/AI 独角兽的评估标准：90+杰出，80+合格，70+需改进，70以下不及格。")
    evaluation: str = Field(description="综合评估结论：指出候选人回答的闪光点与核心缺陷。使用 Markdown 格式。")
    star_feedback: STARFeedback = Field(description="基于 STAR 原则的四个维度的拆解与反馈。")
    suggested_answer: str = Field(description="一份参考范例回答，指导候选人如何更加完美地回答该问题。使用 Markdown 格式。")
    next_question: str = Field(description="针对候选人当前的回答，给出一个具有深度和挑战性的追问（Follow-up Question）。")


class QuestionResponse(BaseModel):
    question: str
    context_title: str
    suggested_topics: List[str]


class StartResponse(BaseModel):
    question: str
    context_title: str
    suggested_topics: List[str]
    is_mock: bool = False


class EvaluateRequest(BaseModel):
    question: str
    user_answer: str = Field(..., max_length=2000, description="候选人回答")
    history: Optional[List[Dict[str, str]]] = None

    @field_validator("user_answer")
    @classmethod
    def validate_user_answer(cls, v: str) -> str:
        if re.search(r'[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]', v):
            raise ValueError("输入包含非法的控制字符")
        return v


# ── 本地静态高质量题库 (用于 Mock 模式) ───────────────────────────────
STATIC_QUESTIONS = [
    {
        "question": "如果让你来为微信设计一个'长辈关怀模式'，你会如何进行用户调研和产品核心功能规划？",
        "context_title": "04-产品设计/4.1-需求定义.md",
        "suggested_topics": ["长辈模式", "用户调研", "无障碍设计"]
    },
    {
        "question": "作为 AI 产品经理，要设计一个垂直领域的 AI 翻译助手，如何设定冷启动阶段的北极星指标与核心指标？",
        "context_title": "05-数据指标/5.2-北极星指标.md",
        "suggested_topics": ["AI翻译", "北极星指标", "产品冷启动"]
    },
    {
        "question": "结合你学习到的 PRD 撰写方法，如果一个需求被研发评估为'不可行/延期'，你作为产品经理该如何处理？",
        "context_title": "03-全流程知识/3.11-PRD.md",
        "suggested_topics": ["研发沟通", "需求撕逼", "优先级排期"]
    },
    {
        "question": "字节跳动面试题：抖音想要给创作者增加一个'AI 辅助写脚本'的功能，如何进行核心价值评估与 MVP 规划？",
        "context_title": "06-面试/6.1.14-模拟面试.md",
        "suggested_topics": ["抖音AI", "MVP规划", "辅助工具"]
    },
    {
        "question": "请结合实际案例，讲一下你对 AARRR 漏斗模型中 'Activation (激活)' 阶段的理解，如何提升新用户激活率？",
        "context_title": "05-数据指标/5.3-AARRR模型.md",
        "suggested_topics": ["AARRR模型", "激活率提升", "漏斗分析"]
    }
]


# ── Agent 类实现 ────────────────────────────────────────────────────────

class InterviewAgent:
    def __init__(self, collection):
        self.collection = collection
        self.api_key = os.getenv("GEMINI_API_KEY", "").strip()
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip()
        
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None
            print("⚠️ [Interview Agent] GEMINI_API_KEY 未配置，将以 [演示模式] 运行。")

    def generate_question(self, chapter: Optional[str] = None) -> StartResponse:
        """
        生成/获取面试问题。
        如果 API Key 存在，将从向量库中抽样相关笔记段落，用大模型动态生成深度面试题。
        如果 API Key 不存在，从本地静态高质量题库中随机抽取一个。
        """
        # 1. 尝试从 ChromaDB 中随机获取一些切片作为素材
        material_hits = []
        if self.collection.count() > 0:
            try:
                # 随机生成一个词来进行向量相似度模糊获取一些材料
                seed_words = ["产品经理", "核心能力", "需求分析", "面试题", "北极星指标", "AARRR"]
                query_seed = random.choice(seed_words)
                
                # 如果指定了 chapter 过滤，传入 chapter 过滤器
                from ingest.vectorizer import search
                material_hits = search(
                    query=query_seed,
                    collection=self.collection,
                    top_k=5,
                    chapter_filter=chapter
                )
            except Exception as e:
                print(f"⚠️ [Interview Agent] 获取笔记材料失败: {e}")
                
        # 2. 如果没有大模型 Key，或者没有获取到向量材料，则从静态题库中抽取
        if not self.client or not material_hits:
            q = random.choice(STATIC_QUESTIONS)
            return StartResponse(
                question=q["question"],
                context_title=q["context_title"],
                suggested_topics=q["suggested_topics"],
                is_mock=True
            )
            
        # 3. 拥有 API Key 且有材料，让大模型基于真实笔记来动态出题
        selected_material = random.choice(material_hits)
        title = selected_material["metadata"].get("title", "核心知识")
        section = selected_material["metadata"].get("section", "")
        sec_str = f" - 章节: {section}" if section else ""
        content = selected_material["text"]
        
        system_instruction = (
            "你是一个有着 10 年面试经验的腾讯、阿里大厂资深产品总监（产品经理面试官）。\n"
            "你的任务是根据提供的[参考知识点]，生成一道专业、极具大厂考察深度的高质量产品经理面试题。\n"
            "你可以出的题型包括：产品设计类、数据分析/指标类、估算类、产品策略类、工作冲突与行为面试类。\n\n"
            "出题规则：\n"
            "1. 题目必须要与[参考知识点]强相关。你可以根据知识点设想一个大厂业务应用场景，不要只问概念，要考场景实践（例如：'结合知识点提到的 AARRR 模型，如果让你负责... 你的激活方案是？'）。\n"
            "2. 题目要严谨，控制在一句话描述清楚，不要拖泥带水，并给出 2-3 个提示主题标签。\n"
            "3. 保持面试官专业、冷静的口吻。"
        )
        
        prompt = (
            f"[参考知识点来源]: 《{title}》{sec_str}\n"
            f"[知识点内容片段]:\n{content}\n\n"
            f"请生成一道深度面试题，以 JSON 格式输出。"
        )
        
        try:
            class QuestionSchema(BaseModel):
                question: str = Field(description="高度提炼且具有深度的产品经理面试问题。")
                suggested_topics: List[str] = Field(description="2-3 个提示性的技能或知识点标签。")

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=QuestionSchema,
                    temperature=0.7
                )
            )
            
            import json
            res_data = json.loads(response.text)
            
            return StartResponse(
                question=res_data.get("question", ""),
                context_title=f"《{title}》{sec_str}",
                suggested_topics=res_data.get("suggested_topics", []),
                is_mock=False
            )
            
        except Exception as e:
            print(f"⚠️ [Interview Agent] 出题异常: {e}。自动切换到静态题库。")
            q = random.choice(STATIC_QUESTIONS)
            return StartResponse(
                question=q["question"],
                context_title=q["context_title"],
                suggested_topics=q["suggested_topics"],
                is_mock=True
            )

    def evaluate(self, question: str, user_answer: str) -> Dict[str, Any]:
        """
        对用户的回答进行深度打分评估。
        如果 API Key 存在，调用大模型按照 STAR 面试法则提供专业的打分和反馈。
        如果 API Key 不存在，使用本地 Mock 模式生成结构化反馈（展示极强的容错设计）。
        """
        # 1. 如果没有大模型 API Key，返回静态结构化反馈模板
        if not self.client:
            # 根据字数简单做个 Mock 评分，字数多得分相对高，最高 88 分以示区别
            length_bonus = min(20, len(user_answer) // 15)
            mock_score = 65 + length_bonus
            
            return {
                "score": mock_score,
                "evaluation": (
                    f"💡 **[演示模式] 评估已成功生成。配置 `GEMINI_API_KEY` 后将开启大模型 STAR 深度诊断。**\n\n"
                    f"您的回答字数共 {len(user_answer)} 字。回答完整度表现尚可，逻辑框架基本符合面试逻辑。\n"
                    f"建议丰富具体的执行步骤与可衡量的结果指标。\n\n"
                    f"--- \n"
                    f"*提示：在 `backend/.env` 中配置大模型 API Key，即可获得多维度精准大厂产品经理面试反馈。*"
                ),
                "star_feedback": {
                    "situation": "场景描述基本清晰。如果能够交代面临的限制性条件和核心冲突，背景会更加饱满。",
                    "task": "核心痛点和指标定位清晰。建议把大目标拆解为冷启动的具体小指标（如首月种子用户数）。",
                    "action": "提出了基本行动方案。大模型评估会进一步根据你的具体方案做可行性逻辑纠错，并补充缺失链条。",
                    "result": "结果部分稍显简略。建议使用漏斗或具体占比来证明方案的效果，不要只有感性陈述。"
                },
                "suggested_answer": (
                    f"对于问题：**“{question}”**\n\n"
                    f"**参考答题结构：**\n"
                    f"1. **S (情境) & T (目标)**: 明确面临的背景，定义北极星指标或主要业务瓶颈。\n"
                    f"2. **A (具体行动)**: 细分三步走。第一步收集需求做优先级排序；第二步确定核心功能，采用 MVP 原则快速上线；第三步通过人机协同或定向渠道做冷启动推广。\n"
                    f"3. **R (结果反馈)**: 用数据指标来佐证结果，如留存率、满意度等。"
                ),
                "next_question": "追问：如果研发反馈本周期内因为排期无法上线你提到的 MVP 核心功能，你会如何做优先级腾挪？",
                "is_mock": True
            }
            
        # 2. 拥有 API Key，构建多维度评估 Prompts
        system_instruction = (
            "你是一个拥有 10 年以上产品团队管理经验的腾讯、阿里大厂资深产品总监（资深面试官）。\n"
            "你的任务是根据用户给出的产品经理面试[题目]以及用户的[回答]，进行极具含金量和专业深度的打分与评估。\n\n"
            "评估准则：\n"
            "1. 严格使用 STAR 法则对用户的回答进行四维度（S-T-A-R）拆解评估。指出其优点与致命缺陷。\n"
            "2. 给出 0-100 分的评分，传统互联网大厂招聘中：90+代表优秀，80+代表合格，70+代表有改进空间，70以下代表未通过。打分必须严谨、客观，不可一味迎合用户。\n"
            "3. 必须提供一份高质量的[参考标准回答]，向候选人示范完美的思路框架与话术逻辑。\n"
            "4. 必须给出一个高难度的追问（Next Question），用以考察候选人在该领域的应变与深入思考能力。\n"
            "5. 回答内容必须组织为 Markdown 排版，结构极其精美。"
        )
        
        prompt = (
            f"[面试题目]: {question}\n\n"
            f"[候选人回答]:\n{user_answer}\n\n"
            f"请对其回答进行 STAR 评估，并输出 JSON 数据。"
        )
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    response_mime_type="application/json",
                    response_schema=InterviewEvaluation,
                    temperature=0.4
                )
            )
            
            import json
            res_data = json.loads(response.text)
            
            # 返回统一结构的 dict
            return {
                "score":            res_data.get("score", 70),
                "evaluation":       res_data.get("evaluation", ""),
                "star_feedback":    res_data.get("star_feedback", {}),
                "suggested_answer": res_data.get("suggested_answer", ""),
                "next_question":    res_data.get("next_question", ""),
                "is_mock":          False
            }
            
        except Exception as e:
            print(f"❌ [Interview Agent] 评估调用失败: {e}。自动切换到本地静态评估模板。")
            return {
                "score": 75,
                "evaluation": f"大模型评估遇到异常，自动降级为静态评估模式。错误原因: {str(e)}",
                "star_feedback": {
                    "situation": "背景基本涵盖，细节有待补充。",
                    "task": "定义了核心的要解决的产品矛盾。",
                    "action": "提出了基本的需求拆解与优先级思考。",
                    "result": "缺乏数据指标的量化闭环。"
                },
                "suggested_answer": "建议以 S-T-A-R 分层陈述，第一步说明背景，第二步提炼核心挑战，第三步详细阐述解决方案，第四步总结量化成效。",
                "next_question": "追问：如果把该功能推广到海外市场，面临哪些本地化的挑战？",
                "is_mock": True
            }
