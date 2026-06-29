# PM Knowledge Hub 🧠

> 基于RAG技术的AI产品经理垂直知识库，集知识检索、面试模拟于一体的智能知识管理系统

[![Version](https://img.shields.io/badge/version-v0.1.0--alpha-blue)]()
[![Status](https://img.shields.io/badge/status-Phase%20A%20In%20Progress-orange)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

---

## 项目概述

将204篇AI产品经理学习笔记（Obsidian格式）构建为可对话的垂直知识库，实现：
- 📚 **语义知识检索**：RAG混合检索，精准召回相关笔记
- 🤖 **AI对话助手**：基于私有知识库的问答，引用来源透明
- 🎤 **面试模拟官**：从知识库提取面试题，STAR结构评估回答
- 🗺️ **知识图谱可视化**：13个模块的知识关联网络

## 快速开始

```bash
# 克隆项目
git clone https://github.com/[your-username]/pm-knowledge-hub.git
cd pm-knowledge-hub

# 查看开发文档
cat docs/versions/CHANGELOG.md
cat docs/PROGRESS.md
```

## 文档体系

| 文档 | 路径 | 说明 |
|------|------|------|
| 进度看板 | [docs/PROGRESS.md](docs/PROGRESS.md) | 实时开发进度 |
| 变更日志 | [docs/versions/CHANGELOG.md](docs/versions/CHANGELOG.md) | 版本历史 |
| 任务清单 | [docs/TASKS.md](docs/TASKS.md) | 当前迭代任务 |
| BRD | [docs/pm/BRD.md](docs/pm/BRD.md) | 商业需求文档 |
| MRD | [docs/pm/MRD.md](docs/pm/MRD.md) | 市场需求文档 |
| PRD | [docs/pm/PRD.md](docs/pm/PRD.md) | 产品需求文档 |

## 技术栈

**后端**：Python 3.11+ · FastAPI · LangChain · ChromaDB · Gemini Flash API  
**前端**：Next.js 14 · TypeScript · D3.js  
**工具**：Git · GitHub Actions（待配置）

## 项目结构

```
pm-knowledge-hub/
├── docs/                  # 📋 项目文档
│   ├── pm/                # 产品文档（BRD/MRD/PRD）
│   ├── plans/             # 阶段执行计划
│   ├── versions/          # 版本记录
│   └── acceptance/        # 验收报告
├── backend/               # 🐍 Python后端
│   ├── ingest/            # 文档解析与向量化
│   ├── retrieval/         # 检索引擎
│   ├── agents/            # AI智能体
│   ├── api/               # FastAPI路由
│   └── tests/             # 单元测试
├── frontend/              # ⚛️ Next.js前端
│   └── src/
└── scripts/               # 🔧 工具脚本
```

---

*最后更新：2026-06-29 | 当前阶段：Phase A - 产品文档*
