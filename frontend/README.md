# PM Knowledge Hub Frontend

Phase C 前端界面，基于 Next.js 构建。

## 当前阶段

已完成 C-1：设计系统、浅色首页工作台、核心指标卡、检索趋势图、来源摘要、知识工作记录和匹配笔记列表。

下一步 C-2：接入 FastAPI 真实接口：

- `GET /api/v1/health`
- `GET /api/v1/search/semantic`
- `GET /api/v1/search/keyword`
- `POST /api/v1/qa/ask`
- `POST /api/v1/interview/start`
- `POST /api/v1/interview/evaluate`
- `GET /api/v1/graph` (C-3 学习地图图谱接口)

## 新增依赖

- `react-force-graph-2d`：力导向图可视化组件。
- `d3`：Peer 依赖库（react-force-graph 自动引入）。

## 本地启动

```bash
npm.cmd run dev
```

默认访问：

```text
http://localhost:3000
```

后端默认地址：

```text
http://localhost:8000
```

## 验证命令

```bash
npm.cmd run lint
npm.cmd run build
```

## 设计方向

视觉方向为 Clarity Console（浅色 SaaS 知识工作台）。界面参考成熟运营后台的低灰背景、白色卡片、蓝紫主色和轻量状态色，避免深色 AI 概念稿。核心差异化锚点是 Evidence Sources：所有 AI 回答后续都需要显式展示引用来源、章节、标签、相似度和 Obsidian 回跳入口。
