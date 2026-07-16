# PM Knowledge Hub 🧠

> 基于 RAG 技术的 AI 产品经理垂直知识库，集语义知识检索、AI 问答助手、模拟面试、知识图谱于一体的智能知识管理系统。

[![Version](https://img.shields.io/badge/version-v1.6.0--rc.1-blue)]()
[![Status](https://img.shields.io/badge/status-local%20release%20candidate-orange)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 📌 项目概述

当前工作树是 `v1.6.0-rc.1` 本地发布候选版；远端稳定版本仍为 `v1.4.0`。候选版完成产品设计 P1 收口并通过复验后，才会进入提交、打 tag 与发布流程。

本项目为产品经理（PM）提供了一套本地化的智能学习与复习工作台。系统读取并向量化解析了 **204 篇 AI 产品经理学习笔记**（共计 739 个核心切片），通过多模态与语义检索，将碎片化的知识有机融合：

1. 📚 **语义知识检索**：支持对本地知识库进行语义向量和精确关键词双轨召回，解决笔记查找困难的问题。
2. 🤖 **RAG 问答助手**：基于私有知识库实时生成回答，精确展示引用证据链并支持一键回跳 Obsidian。
3. 🎤 **STAR 面试模拟**：结合 Gemini API 与 STAR 评估法则，提供真实的 AI 模拟面试和多维度考核打分。
4. 🗺️ **知识图谱可视化**：使用 `react-force-graph-2d` 绘制可交互的学习大纲及笔记网络，让知识脉络立体化。

---

## 🎨 核心模块展示

| 📚 语义知识检索 | 🤖 RAG 问答助手 |
| :---: | :---: |
| ![Knowledge Search](docs/screenshots/knowledge-search.png) | ![Workspace](docs/screenshots/workspace.png) |
| *多模态检索结果，直观展示相关度评分* | *带有证据源标注的私有问答控制台* |

| 🎤 STAR 面试模拟 | 🗺️ 知识图谱可视化 |
| :---: | :---: |
| ![Interview STAR](docs/screenshots/interview-star.png) | ![Knowledge Graph](docs/screenshots/knowledge-graph.png) |
| *基于大模型的 STAR 回答四维评价雷达* | *炫酷的可视化学习网络与一度聚焦高亮* |

---

## ⚙️ 系统架构

本系统由**前端展示层**、**后端服务与智能体编排层**、**本地知识存储层**三个核心层次组成：

```mermaid
graph TB
    subgraph Frontend [前端展示层 - Next.js]
        WebUI[Clarity Console UI]
        GraphView[react-force-graph-2d 知识图谱]
        ChatView[AI 问答工作台]
    end

    subgraph Backend [后端服务与智能体编排层 - FastAPI + LangChain]
        API[FastAPI Web 路由]
        Router{智能体路由分发}
        
        subgraph Agents [Agent Core]
            QA[问答 Agent]
            Interview[面试 Agent]
        end
        
        subgraph RAG_Engine [RAG 检索引擎]
            Retriever[混合检索器 Retriever]
            Parser[Markdown 解析器]
            Splitter[标题 & 滑动窗口切片]
        end
    end

    subgraph Storage [知识存储层]
        VectorDB[(ChromaDB 本地向量库)]
        RawDocs[(204篇 Obsidian 笔记)]
    end

    subgraph External [外部大模型层]
        Gemini[Gemini Flash API]
    end

    %% 数据流与调用关系
    WebUI -->|HTTP / JSON| API
    API --> Router
    Router --> QA
    Router --> Interview
    
    QA -->|调用| Retriever
    Retriever -->|语义检索| VectorDB
    Retriever -->|关键词检索| RawDocs
    
    QA -->|召回切片| Gemini
    Interview -->|生成与评估| Gemini
    
    %% 初始化与写入流程
    Parser -->|读取| RawDocs
    Parser --> Splitter
    Splitter -->|向量化并写入| VectorDB
```

---

## 🛠️ 技术栈

* **后端**：Python 3.10+ · FastAPI · LangChain · ChromaDB · Sentence-Transformers (MiniLM) · Gemini Flash API
* **前端**：Next.js 16 (App Router) · React 19 · TypeScript · Vanilla CSS · react-force-graph-2d
* **测试与校验**：pytest · ESLint

---

## 🚀 快速开始

### 1. 前置依赖
* 操作系统：Windows 10/11
* 开发环境：Python 3.10+ / Node.js 18+

### 2. 后端部署 (FastAPI)
1. 进入后端目录，创建并激活虚拟环境：
   ```bash
   cd backend
   python -m venv venv
   # Windows 环境下激活虚拟环境
   .\venv\Scripts\activate
   ```
2. 安装依赖包：
   ```bash
   pip install -r requirements.txt
   ```
3. 在 `backend/` 目录下创建配置文件 `.env`：
   ```env
   # 本地 Obsidian 知识库笔记所在绝对路径
   NOTES_DIR="C:/Users/tangtongqing/Desktop/学习/从零开始成为产品经理/从零开始成为ai产品经理"
   # Chroma 向量数据库存放目录
   CHROMA_DB_PATH="./data/chroma_db"
   # 文本 Embedding 模型名称
   EMBEDDING_MODEL="paraphrase-multilingual-MiniLM-L12-v2"
   # Google Gemini API 密钥 (用于模拟面试与智能对话)
   GEMINI_API_KEY="你的密钥"
   ```
4. 启动后端服务：
   ```bash
   python -m uvicorn api.main:app --port 8000
   ```
   > ⚠️ **注意**：首次启动或运行单元测试时，系统将通过联网下载 `paraphrase-multilingual-MiniLM-L12-v2` 嵌入模型（大小约 120MB）。此后将完全在本地离线调用。

### 3. 前端部署 (Next.js)
1. 进入前端目录，安装相关依赖：
   ```bash
   cd ../frontend
   npm install
   ```
2. 启动前端开发服务器：
   ```bash
   npm run dev
   ```
3. 打开浏览器访问 `http://localhost:3000` 即可开始使用。

---

## 📁 项目结构

```text
pm-knowledge-hub/
├── docs/                  # 📋 项目设计与管理文档
│   ├── pm/                # AI产品管理文档（BRD/MRD/PRD）
│   ├── plans/             # 迭代阶段计划
│   ├── versions/          # 版本发布记录 (CHANGELOG)
│   ├── acceptance/        # 各阶段验收报告
│   └── screenshots/       # 系统运行核心截图
├── backend/               # 🐍 Python 后端服务
│   ├── api/               # FastAPI 路由逻辑 (含图谱 API)
│   ├── ingest/            # Markdown 向量化入库脚本
│   ├── agents/            # QA 问答与面试 Agent
│   ├── tests/             # Pytest 单元与集成测试
│   └── requirements.txt   # 后端依赖配置
├── frontend/              # ⚛️ Next.js 前端界面
│   ├── src/
│   │   ├── app/           # Next.js App Router (首页/知识库/问答/面试/地图)
│   │   └── lib/           # API 通信与客户端接口
│   ├── package.json       # 前端依赖配置
│   └── README.md          # 前端说明文档
└── acceptance_test.md     # 📌 系统验收 checklist（v1.6 RC 发布门禁已通过）
```

---

## 🔗 相关文档索引

* **项目看板**：[PROGRESS.md](docs/PROGRESS.md)
* **任务历史**：[TASKS.md](docs/TASKS.md)
* **发布历史**：[CHANGELOG.md](docs/versions/CHANGELOG.md)
* **系统验收报告**：[acceptance_test.md](acceptance_test.md)
* **产品管理文档体系**：
  * [BRD.md — 商业需求](docs/pm/BRD.md) | [MRD.md — 竞品与市场](docs/pm/MRD.md) | [PRD.md — 核心功能需求说明](docs/pm/PRD.md)
  * [ARCHITECTURE.md — 拓扑图与数据流设计](docs/pm/ARCHITECTURE.md) | [METRICS.md — 指标监控](docs/pm/METRICS.md) | [ROADMAP.md — 路线图规划](docs/pm/ROADMAP.md)

---

## 🔒 数据流向与隐私

作为一款面向个人知识库的数据智能体，我们高度重视您的隐私和本地数据安全性：
1. **本地存储**：您的原始 Obsidian 笔记、向量分片及本地向量数据库（ChromaDB）均完全保存在本地磁盘（`backend/data/` 目录下），**不向任何第三方上传笔记全文**。
2. **数据外发披露**：仅当您在 `.env` 中配置了 `GEMINI_API_KEY` 并且**主动发起**「AI 问答」或「模拟面试评估」时，系统为了生成回答，会把**检索召回的笔记分片（非笔记全文）**与您的提问通过加密连接发送至 Google Gemini API 服务。
3. **完全本地化降级**：如果不希望数据外传，只需**留空** `GEMINI_API_KEY`。系统将自动切换为本地 Mock 模式（离线静态模板回答），确保本地网络环境的绝对安全与保密。

---

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 协议发布。
