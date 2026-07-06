# PM Knowledge Hub 简历描述与面试问答要点

---

## 📄 简历项目描述模板

### 1. 一句话精简版 (用于项目标题或行描述 - 32字)
> 独立设计并开发基于 RAG 技术的产品经理本地智能知识管理与 AI 模拟面试系统。

### 2. 标准短版 (用于项目经历正文 - 90字左右)
> 基于 **FastAPI + Next.js** 独立搭建 RAG（检索增强生成）产品经理垂直知识库，对 **204 篇** Obsidian 笔记行进滑动窗口多层级切片（**739 个**向量块）并导入 **Chroma 本地向量数据库**。开发 **6 个**核心 API 路由及五大模块，打通 **15 点**全量集成测试，利用大语言模型提供实时 STAR 模拟面试评估。

### 3. 长版 (STAR 结构项目经历 - 260字左右)
* **Project Context**: 随着个人产品经理知识笔记体量的增加，传统搜索工具难以召回跨领域深层关联信息，且缺乏将理论知识向模拟面试转化的实战闭环。
* **Task & Action**: 
  - 独立负责该系统的全栈设计与实现，前端基于 **Next.js (React 19) + TypeScript** 搭建，后端基于 **FastAPI + LangChain**。
  - 构建 RAG 数据流，通过滑动窗口算法切分本地知识，导入本地 **ChromaDB** 实现语义向量与 BM25 精确关键词的双向检索融合。
  - 接入 Google Gemini 接口，开发 **STAR 评估算法**对作答开展 Situation、Task 等多维度百分制雷达图打分；使用 `react-force-graph-2d` 绘制高亮一度相连的动态学习路径力导向图谱。
* **Result**: 项目顺利实现 v1.0.0 交付，顺利通过 15 项集成用例自动化校验。实现毫秒级召回和 100% 具备来源证据的无幻觉 AI 问答，提供了闭环式 AI 辅导体验。

### 4. 英文版 (English Version - 90 words)
> Independently architected and implemented a local RAG-based (Retrieval-Augmented Generation) Product Manager Knowledge Hub using **FastAPI** and **Next.js**. Formulated a multi-level sliding-window text chunker to index **204 Obsidian markdown notes** (producing **739 chunks**) into **ChromaDB** with hybrid (dense & sparse) vector search. Designed **6 API routes** and integrated Google Gemini API to build a mock interview agent powered by the **STAR evaluation framework**. Achieved 100% pass rate on 15 integrated test cases.

---

## 🎤 面试高频追问与回答要点 (Q&A)

### Q1: 在向量数据库选型中，为什么选择本地的 ChromaDB 而不是 Pinecone 等云端数据库？
- **回答要点**：
  1. **隐私安全与离线可用性**：该项目定位为产品经理的“个人本地知识管家”，用户的 Obsidian 笔记属于极度私密的个人资产。使用本地轻量级数据库（ChromaDB 嵌入式客户端）可以实现所有原始文档切片在本地存储与检索，完全不经过云服务，隐私安全性最高。
  2. **低延迟与零维护成本**：Pinecone 等云端向量库每次检索都需要经过网络 HTTP 请求，且存在连接配额限制。ChromaDB 的 Ephemeral/Disk 模式在本地以内存或二进制文件形式运行，查询延迟在数毫秒级，且无需维护复杂的云端数据库连接凭证与订阅费用，极其适合本地知识库形态。

### Q2: 你们的项目是如何做 RAG 检索的？在防止大模型“幻觉”（即编造知识）方面做了哪些具体优化？
- **回答要点**：
  1. **混合检索 (Hybrid Search) 算法**：采用向量相似度检索（Dense Retrieval）和基于 BM25 算法的关键词检索（Sparse Retrieval）双轨召回，使用 RRF（倒数重排）算法以 7:3 比例融合结果，保证了既能理解语义泛化，又不会漏掉 PRD、AARRR 等专有名词的精确匹配。
  2. **严格的 Prompt 证据注入**：在 Prompt 中明确规定“大模型必须仅依据召回的前 K 个证据切片进行整理回答，若召回内容中不包含答案，大模型必须承认无法回答，绝不允许擅自外推”。
  3. **可追溯证据链设计**：前端在 RAG 对话卡片下方，专门做了一个“引用的证据来源（Evidence Sources）”模块，把所有匹配的切片、相似度分数、所属章节透明地展示给用户，并提供跳转 Obsidian 打开原文的原生链接，让用户有能力自行交叉核对，从交互上消除了对 AI 幻觉的隐患。

### Q3: 笔记里的 Obsidian 双向链接（Double Links）在图谱中是怎么处理的？
- **回答要点**：
  1. **文本剥离与解析**：在文档入库和图谱读取时，编写了正则表达式 `\[\[([^\]|]+)(?:\|([^\]]+))?\]\]` 逻辑，用以解析笔记中的双链并识别出所指向的目标笔记与显示 Label，并对 YAML 头部进行了正则过滤剥离，保证正文渲染的整洁。
  2. **逻辑妥协与合成连线**：经过对本地 204 篇物理笔记的调查，发现大部分子笔记内部并没有显式双链。为了不让力导向图呈现出一地“孤立散点”的尴尬，我们创新设计了**“主干学习链+相似度交叉链”**的复合连接方案。通过解析 `学习路线总览.md` 提取笔记的先后通关顺序，并对标题里共有的高频词（如 `AI`、`数据` 等）进行相邻串联，使得图谱拓扑非常连贯，展现出极好的脉络引导性。
