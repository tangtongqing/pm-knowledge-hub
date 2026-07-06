# TASK-023 — Phase C-3：学习地图知识图谱（react-force-graph）

> **任务类型**：工作智能体实现任务（跨 backend + frontend）
> **前置依赖**：TASK-022（Phase C-2）已验收通过 ✅
> **验收标准文档**：`docs/acceptance/phase-c-criteria.md` 第 6 节「学习地图（C-3）」
> **创建时间**：2026-07-03
> **派发人**：主导智能体 (ZCode)

---

## 1. 任务背景

Phase C-1 / C-2 已通过独立验收复核（2026-07-03）：首页工作台、知识库浏览、AI 问答、模拟面试四大模块均已端到端接入 FastAPI 真实接口并跑通。

**Phase C 仅剩唯一未通过项**：C-3 学习地图（`/map` 页）。当前 `frontend/src/app/map/page.tsx` 是纯静态 SVG 占位，文案标注「图谱功能开发中 / Phase D 推出」。本任务要把占位升级为可交互的真实知识图谱，打通 Phase C 最后一环。

数据源已就绪，无需重新入库：
- 后端 `backend/ingest/parser.py` 的 `ObsidianNoteParser.parse_note()` 已提取每篇笔记的 `links`（Obsidian `[[双链]]` 出链列表）。
- 后端 `backend/ingest/vectorizer.py` 的 `get_all_documents()` 已能按 chapter 聚合返回全部文档及其 metadata（title / chapter / tags / source_path）。

---

## 2. 目标产物

### 2.1 后端（新增 1 个接口）

**文件**：`backend/api/routes/graph.py`（新建）

**接口**：`GET /api/v1/graph`

- **职责**：聚合 Obsidian 笔记为图谱数据（节点 + 边），供前端力导向渲染。
- **查询参数**（均为可选）：
  - `level`：聚合层级，默认 `chapter`。可选值 `chapter`（按 13 个一级目录聚合）/ `note`（按单篇笔记展开）。前端默认请求 `chapter`，避免 204+ 篇笔记同时平铺造成信息过载。
  - `chapter`：过滤指定一级目录，仅返回该目录子图。
- **响应模型**（Pydantic，需在 `graph.py` 内定义）：

```python
class GraphNode(BaseModel):
    id: str               # chapter 名 或 source_path
    label: str            # 显示名（如 "06-面试"）
    type: str             # "chapter" | "note"
    chapter: str          # 所属一级目录
    note_count: int       # 该节点包含的笔记数（chapter 层级聚合用）
    tags: list[str]       # 代表性标签（取前 N 个去重）

class GraphLink(BaseModel):
    source: str           # 源节点 id
    target: str           # 目标节点 id（双链指向的笔记/章节）
    weight: int           # 该方向的链接数

class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    links: list[GraphLink]
    level: str            # 回显 level
    total_notes: int
```

- **实现要点**：
  - 复用 `get_collection()` + `collection.get(include=["metadatas"])` 拉取全部切片 metadata。
  - `chapter` 层级：节点 = 13 个一级目录；边 = 跨目录的双链（源笔记所在 chapter → 目标笔记所在 chapter），`weight` 为该方向双链计数。同一 chapter 内的双链不计入（避免自环）。
  - `note` 层级：节点 = 单篇笔记；边 = 笔记间双链。目标笔记不在库内的边，归并到一个虚拟 `__external__` 节点并保留（用于展示「未解析引用」）。
  - 边的双向：Obsidian 双链是单向出链，保留单向语义即可（source→target）。

- **路由注册**：在 `backend/api/main.py` 的 router 列表中挂载 `graph.router`，prefix 与既有路由一致（`/api/v1`，由 main 统一加 prefix，参考 `search.py`）。

- **测试**：在 `backend/tests/test_api.py` 新增 ≥2 个集成测试：
  1. `test_graph_chapter_level`：`GET /api/v1/graph?level=chapter` 返回 nodes/links 非空，`total_notes > 0`，无自环。
  2. `test_graph_note_level_filter`：`GET /api/v1/graph?level=note&chapter=06-面试` 返回的节点 chapter 字段全部为 `06-面试` 或外部节点。
  - 全部基于既有 ephemeral ChromaDB 测试夹具，不得依赖本地真实数据库。

### 2.2 前端（重写 `/map` 页 + 新增 api 客户端方法）

**依赖**：在 `frontend/` 执行 `npm install react-force-graph-2d`（及其 peer `d3`，react-force-graph 会自动带）。如该包对 Next.js 16 / Turbopack 有 SSR 兼容问题，回退方案见 §4。

**文件 1**：`frontend/src/lib/api.ts`（修改）
- 新增类型 `GraphNode` / `GraphLink` / `GraphResponse`（与后端响应模型对齐）。
- 在 `api` 对象新增方法：

```ts
async getGraph(level: "chapter" | "note" = "chapter", chapter?: string): Promise<GraphResponse>
```

**文件 2**：`frontend/src/app/map/page.tsx`（重写，替换当前静态 SVG 占位）
- 改为 `"use client"` 组件，使用 `react-force-graph-2d` 渲染力导向图。
- **交互要求**（逐条对应验收清单）：
  - 节点聚焦：点击节点 → 以该节点为中心 zoom & pan，并在右侧 `<aside>` 预览面板展示节点详情（label / chapter / note_count / tags，note 层级额外展示 source_path 与「在 Obsidian 打开」按钮，复用 `obsidian://open?vault=...` URI 约定）。
  - 高亮一度关联：hover 节点 → 该节点及其直连边/节点高亮，其余节点降透明度（opacity 0.15）。
  - 层级切换：顶部提供 `chapter` / `note` 两个切换按钮；切到 `note` 时若未指定 chapter，给出提示「笔记较多，建议先选择一个章节」并提供章节下拉。
  - loading / empty / error 三态：参考 `knowledge/page.tsx` 的既有写法。
- **视觉**：遵循既有 Design Tokens（`var(--brand)` / `var(--surface-1)` / `var(--text-1)` 等，见 `globals.css`）。节点按 chapter 用既有的 13 色调色板或按 `--brand` 浓淡区分；边用 `var(--border-component)`。不得引入新的颜色系统。

**文件 3**：`frontend/src/app/map/page.module.css`（修改）
- 移除占位相关样式，新增图谱容器、侧边预览面板、层级切换按钮样式，复用既有 tokens。

### 2.3 文档与验收准备

- `frontend/README.md`：补充 `/map` 图谱页说明 + 新增依赖 `react-force-graph-2d`。
- 自检命令（工作智能体完成后必须全部跑通并贴结果）：
  - 后端：`cd backend && source venv/Scripts/activate && python -m pytest -q`（应仍为全绿，用例数 ≥ 41）。
  - 前端：`cd frontend && npm.cmd run lint`（0 error）、`npm.cmd run build`（7→路由全部静态生成成功）。

---

## 3. 工作空间与提交规范

- **当前分支**：`feature/phase-b-backend`。本任务请从该分支切出 **`feature/phase-c3-graph`** 子分支工作，避免污染主线。
- **提交信息**（按 `docs/AGENT_WORKFLOW.md` 的规范）：
  - `feat(backend): add /api/v1/graph endpoint with chapter/note aggregation`
  - `feat(frontend): implement interactive knowledge graph with react-force-graph`
  - `test(backend): add graph endpoint integration tests`
- **不要**提交 `backend/data/`、`.env`、`node_modules/`（`.gitignore` 已覆盖，复核时确认未误加）。

---

## 4. 风险与回退方案

| 风险 | 回退方案 |
|------|---------|
| `react-force-graph-2d` 与 Next.js 16 / Turbopack SSR 冲突 | 用 `next/dynamic` + `ssr: false` 动态导入；或在 `next.config.ts` 的 `transpilePackages` 加入该包。若仍失败，回退到 `reactflow`（React 原生、SSR 友好，验收点同样满足）。 |
| `note` 层级节点过多（200+）导致卡顿 | 默认 `chapter` 层级；`note` 层级强制要求先选 chapter，单次渲染节点数控制在 50 以内。 |
| 双链目标笔记不在库（悬空引用） | 归并到虚拟 `__external__` 节点，label 显示「外部引用」，不计 note_count。 |
| 既有 grep/编码问题影响自检 | 自检用 `python -m pytest` 与 `npm.cmd run ...`，不要依赖 bash 管道 grep。 |

---

## 5. 验收对照（工作智能体自查 + 验收智能体复核）

对应 `docs/acceptance/phase-c-criteria.md` 第 6 节，全部 4 项必须通过：

- [ ] 实现 react-force-graph（或等价）可交互图谱，支持节点聚焦、高亮一度关联、侧边预览。
- [ ] 图谱默认按目录聚合（`level=chapter`），避免 204 篇笔记同时平铺造成信息过载。
- [ ] 拖拽与聚焦交互在主流浏览器保持流畅（Chrome/Edge 桌面端验证）。
- [ ] 后端新增 `/api/v1/graph` 接口 + 集成测试，前端 lint/build 通过。

**完成判定**：上述 4 项 + 后端 pytest 全绿 + 前端 lint/build 通过，即可在 `phase-c-criteria.md` 第 6 节勾选并提请验收智能体做 Phase C 整体验收。

---

## 6. 交付清单（工作智能体完成后回报）

按 `docs/AGENT_WORKFLOW.md` 的「工作报告」格式输出，必须包含：
1. 新增/修改文件清单。
2. `pytest` / `lint` / `build` 三条命令的实际输出尾段。
3. `react-force-graph-2d` 是否成功集成；若走了回退方案，说明回退到哪个库及原因。
4. 一次本地启动（后端 8000 + 前端 3000）后 `/map` 页的截图路径（自证可交互）。
5. 遗留问题（无则写「无」）。
