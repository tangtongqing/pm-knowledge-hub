# ✅ Phase B 验收标准

> **验收说明**：Phase B 后端开发完成后，由验收智能体对照此清单逐项检查，全部通过后才允许合并分支并进入 Phase C 前端界面开发。

---

## 验收负责人
验收智能体（独立派遣，与工作智能体隔离）

## 验收时间
Phase B 所有核心开发与测试任务（TASK-011 ~ TASK-018）完成后执行

---

## 📋 检查清单

### 1. 基础环境与配置 (Infrastructure)
- [ ] `backend/requirements.txt` 完整包含运行所须的 FastAPI, ChromaDB, Sentence-Transformers, PyTorch, PyYAML 等依赖。
- [ ] 本地 `.env` 配置规范，包含 `NOTES_DIR`、`CHROMA_DB_PATH`、`EMBEDDING_MODEL` 和国内镜像地址 `HF_ENDPOINT`。
- [ ] `.gitignore` 正确配置，避免将 `backend/data/` 本地数据库物理目录和 `.env` 敏感密钥文件提交至 GitHub。

### 2. Obsidian Markdown 解析器 (TASK-013)
- [ ] 能够递归扫描 `NOTES_DIR` 下的 204 篇 Markdown 笔记。
- [ ] 正确分离 YAML Frontmatter，提取 `title` 和标签。
- [ ] 支持清除 `[[双链]]` 并记录出链关联，支持把 `![[图片]]` 重写为标准的图片相对路径。
- [ ] 提取文章内行内 `#标签`，并能将双链转换成 obsidian 唤醒链接 `obsidian://open?vault=...`。
- [ ] 对应单元测试 `tests/test_parser.py` 通过。

### 3. 混合切片策略 (TASK-014)
- [ ] 实现双层切片：第一层按 Markdown 章节标题 (`##`/`###`) 物理切分；第二层对超长文本以 300 token 为上限进行滑动窗口软切，设置 50 token 的重叠度 (Overlap)。
- [ ] 滑动窗口切割以句子为原子单元，尽量不在句子中间断开。
- [ ] 切片输出结构符合规范，包含 `chunk_id`、`source_path`、`title`、`chapter`、`section`、`tags`、`obsidian_uri`、`token_count` 字段。
- [ ] 对应单元测试 `tests/test_chunker.py` 通过。

### 4. ChromaDB 本地向量库入库 (TASK-015)
- [ ] 采用 `SentenceTransformerEmbeddingFunction` 本地进行向量化，指定 `paraphrase-multilingual-MiniLM-L12-v2` 支持中英文混排的高质量语义搜索。
- [ ] 实现幂等性 upsert 逻辑，避免重复运行导致记录堆积。
- [ ] 支持按 chapter 和 tags 过滤的语义检索 Top-K 结果输出，并具有关键词全文搜索回退接口。
- [ ] 对应单元测试 `tests/test_vectorizer.py` 通过。

### 5. RAG 问答 Agent 与 模拟面试 Agent (TASK-017 & TASK-018)
- [ ] **QA 问答 Agent**：基于 ChromaDB 检索的知识片作为上下文生成回答；若 API Key 缺失，自动降级为本地 Synthesized 演示模式；输出内容格式化，包含 answer、sources 和 recommendations。
- [ ] **面试模拟 Agent**：能结合知识库或经典题库生成 PM 深度面试题；支持以 STAR 法则对用户作答进行评分和拆解诊断，提供标准参考回答与下一轮挑战性追问。
- [ ] 对应单元测试 `tests/test_agents.py` 通过。

### 6. FastAPI 路由层 (TASK-016 & TASK-016+)
- [ ] 提供端到端的 5 个业务接口 + 1 个健康检查接口：
  - `GET /api/v1/health`
  - `GET /api/v1/search/semantic` (支持 chapter / tag 过滤)
  - `GET /api/v1/search/keyword`
  - `POST /api/v1/qa/ask`
  - `POST /api/v1/interview/start`
  - `POST /api/v1/interview/evaluate`
- [ ] 所有请求与响应均通过 Pydantic 规范进行校验，正确返回 200 或错误状态。
- [ ] 全套集成测试 `tests/test_api.py` 基于内存 EphemeralClient 全面通过。

### 7. 版本控制与项目文档
- [ ] 后端测试覆盖 27 个单元测试 + 11 个接口集成测试，总计 38 个测试用例，运行成功率 100%。
- [ ] 所有修改已 Commit 并 Push 至 GitHub `feature/phase-b-backend` 分支。
- [ ] 任务清单 `TASKS.md` 和进度表 `PROGRESS.md` 已准确更新打卡。

---

## ✍️ 验收结论

> 此部分由验收智能体填写

| 检查大项 | 状态 | 问题说明 |
|----------|------|----------|
| 基础配置 | — | — |
| 解析器 | — | — |
| 切片器 | — | — |
| 向量库 | — | — |
| 智能体层 | — | — |
| 路由层 | — | — |
| 代码测试 | — | — |
| 版本控制 | — | — |

**整体结论**：⏳ 待验收

**验收时间**：—
**验收人**：验收智能体
