# 🤖 多智能体工作流约定

> 本文档规定PM Knowledge Hub项目中多智能体的角色分工、任务边界和交接协议。

---

## 智能体角色定义

### 主导智能体（Orchestrator）
- **职责**：任务分解、决策仲裁、协调各方、更新文档
- **触发**：用户直接对话
- **权限**：读写所有文件，可派遣子智能体

### 工作智能体（Worker）
- **职责**：实现具体功能模块（代码编写、文件创建）
- **触发**：由主导智能体通过 `invoke_subagent` 派遣
- **权限**：读写分配的模块目录（如 `backend/ingest/`）
- **工作空间模式**：`branch`（独立分支，不影响主线）

### 验收智能体（Reviewer）
- **职责**：代码审查、文档验收、测试检查、问题报告
- **触发**：某个Phase或任务完成后，由主导智能体派遣
- **权限**：只读（不修改代码，只报告问题）
- **工作空间模式**：`inherit`（读当前状态）

---

## 任务交接协议

### 工作智能体 → 主导智能体

工作智能体完成后，必须输出：
```
## 工作报告

**任务ID**: TASK-XXX
**状态**: ✅ 完成 / ❌ 失败 / ⚠️ 部分完成

**已完成内容**:
- 文件：xxx
- 功能：xxx

**测试情况**:
- 命令：xxx
- 结果：xxx

**遗留问题**:
- 无 / xxx

**需要主导智能体决策**:
- 无 / xxx
```

### 主导智能体 → 验收智能体

派遣验收智能体时，必须指定：
1. 验收对应的标准文档路径（`docs/acceptance/xxx.md`）
2. 需要验收的文件/目录范围
3. 关注的重点问题

---

## Git提交规范

```
feat(scope): 功能描述
fix(scope): 修复描述
docs(scope): 文档更新
test(scope): 测试相关
chore(scope): 工程配置
```

**scope选项**：`backend` · `frontend` · `docs` · `agents` · `infra`

---

## 分支策略

```
main              ← 稳定版本，只接受来自feature分支的合并
├── feature/phase-a-docs    ← Phase A文档工作
├── feature/phase-b-backend ← Phase B后端开发
└── feature/phase-c-frontend← Phase C前端开发
```

每个Phase完成验收后，合并到main并打tag：
- `v0.1.0-alpha` ← Phase A完成
- `v0.3.0-beta` ← Phase B完成
- `v0.8.0-rc` ← Phase C完成
- `v1.0.0` ← Phase D完成
