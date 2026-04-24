# Lesson-PPT-Generator 改进计划

> 基于 school-pptx 已验证的设计经验，对 lesson-ppt-generator 进行架构升级和功能填充。
> 编写日期：2026-04-24 | 状态：待确认

---

## 一、当前现状诊断

### 1.1 完成度快照

| 模块 | 状态 | 问题 |
|------|------|------|
| 前端 UI | ±梳子骨架 | 4 步流程外壳完整，但全是 mock 数据和 placeholder |
| Electron IPC | ±全是 TODO | 3 个 handler 全为空实现 |
| Python Parser | ±基础正则 | 只能处理最简单的文本格式，无法处理 DOCX |
| Python PPT Builder | ±基础模板 | 只能生成标准模板页，无样式/动画/自定义布局 |
| AI 集成 | ×未接入 | 完全依赖正则，未接入任何 LLM |
| 数据持久化 | ×没有 | 无数据库，无状态保存，刷新即丢失 |
| 文件解析 | ×未实现 | 选了文件但不读取内容 |

### 1.2 与 school-pptx 对比（已验证设计）

| 能力 | school-pptx (v0.3.0) | lesson-ppt-generator |
|------|---------------------|---------------------|
| 文档解析 | ✓ mammoth/pdf-parse/turndown + LLM 补全 | × 纯正则，不支持 DOCX |
| AI 接入 | ✓ claude-agent-sdk + CLI fallback | × 未接入 |
| 专家团队 | ✓ 6 人 DAG + 质量评分 + 重跑 | × 只有单个 ParserAgent |
| 持久化 | ✓ SQLite 6 表 + JSON 迁移 | × 无数据库 |
| 渲染层 | ✓ Preact + Signals | ✓ React 18 (但无状态管理) |
| PPT 生成 | ✓ HTML 演放器 | ± python-pptx 基础 |
| 配置管理 | ✓ 模型配置 UI + 多 profile | × 无 |

---

## 二、改进路线图

```
P0 MVP闭环（2-3天）        P1 架构升级（1-2天）      P2 专家团队（2-3天）
electron main打通         →     Backend Child 模式     →     DAG 调度器
Python worker 通信       →     SQLite 持久化        →     8 人专家阵容
AI 解析 + Overview      →     状态管理 Zustand    →     流式输出面板
增强 PPT 样式          →     文档预处理 pipeline  →     单人重跑 + 历史
↓                          ↓                          ↓
用户能上传文件→解析→    →   数据可持久化、可回溯   →   全流程可视化、可干预
编辑→生成→下载 PPT    →   多课时/多主题管理    →   质量可控、每步可编辑
```

---

## 三、分阶段详情

### P0 — MVP 闭环（优先级最高）

**目标**：让用户能够：上传 DOCX/TXT 教案 → AI 解析 → 编辑 Overview → 生成样式化 PPT → 下载

**具体任务**：

| # | 任务 | 变更文件 |
|---|------|---------|
| P0.1 | 安装前端依赖：Tailwind CSS 官方配置、lucide-react | package.json, tailwind.config.js |
| P0.2 | Python Worker 主入口：stdin/stdout JSON RPC 模式 | `python/worker.py` (新建) |
| P0.3 | 增强 ParserAgent：支持 DOCX 读取 + OpenAI 智能解析 | `python/agents/parser.py` 重写 |
| P0.4 | 创建 OverviewAgent：LLM 生成结构化的 LessonOverview | `python/agents/overview.py` (新建) |
| P0.5 | 增强 PPTBuilder：4 种布局模板 + 浙江数学配色方案 | `python/ppt_builder.py` 重写 |
| P0.6 | Electron main 集成 Python worker：spawn 子进程 + 通信 | `electron/main.ts` 重写 |
| P0.7 | preload API 扩展：文件读取 + 全流程 API | `electron/preload.ts` 扩展 |
| P0.8 | UploadView 打通：文件读取 + 上传给 main | `src/components/UploadView.tsx` |
| P0.9 | OverviewEditor 绑定真实数据 + 可编辑 | `src/components/OverviewEditor.tsx` 重写 |
| P0.10 | PreviewView 实际渲染（HTML 预览优先） | `src/components/PreviewView.tsx` 重写 |
| P0.11 | 设置面板：API Key 配置、模型选择 | `src/components/SettingsModal.tsx` (新建) |
| P0.12 | App.tsx 状态机改为真实数据流 | `src/App.tsx` 重写 |

**P0 退出标准**：
- [ ] 上传一份真实的 DOCX 教案，AI 能解析出结构化字段
- [ ] Overview 编辑器可编辑并确认
- [ ] 生成的 PPT 有基本样式（不是白底黑字）
- [ ] 能下载 .pptx 文件
- [ ] 无需数据库也能跑通全流程

---

### P1 — 架构升级

**目标**：从“能用”升级为“好用”——数据持久化、状态可回溯、多项目管理

**具体任务**：

| # | 任务 | 说明 |
|---|------|------|
| P1.1 | 引入 Zustand 状态管理 | 替代扇子 useState，支持跨组件状态 |
| P1.2 | 引入 SQLite 持久化 | better-sqlite3 或纯 Node SQLite3，5 表 schema |
| P1.3 | 课时库模型 | 浙教版小学数学 1-6 年级课时目录 |
| P1.4 | 教案历史管理 | 保存每次生成的记录，支持回溯 |
| P1.5 | 模型配置多 profile | 可切换不同 LLM provider 和模型 |
| P1.6 | Backend Child 模式 | 从 school-pptx 移植，fork Node.js 子进程隔离 AI/DB 操作 |

**P1 Schema 设计（预览）**：

```sql
-- 教案历史
CREATE TABLE lesson_plans (
  id TEXT PRIMARY KEY,
  title TEXT,
  grade TEXT,
  lesson_type TEXT,
  source_text TEXT,
  parsed_json TEXT,
  overview_json TEXT,
  created_at INTEGER,
  updated_at INTEGER
);

-- PPT 生成记录
CREATE TABLE ppt_generations (
  id TEXT PRIMARY KEY,
  plan_id TEXT,
  overview_json TEXT,
  slide_script_json TEXT,
  output_path TEXT,
  status TEXT,
  created_at INTEGER
);

-- 模型配置
CREATE TABLE model_profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  provider TEXT,
  model TEXT,
  api_key TEXT,
  is_default INTEGER
);
```

---

### P2 — 专家团队（从 school-pptx 移植并适配）

**目标**：把“单次 AI 调用”升级为“多专家分工协作”

**专家阵容**（从 school-pptx 的 6 人扩展到 8 人）：

```
ParserAgent       →  解析教案格式，提取原始字段
CompletenessAgent →  检查缺失，高置信度自动补全/低置信度弹窗确认
OverviewAgent     →  生成教学总览（目标、环节、时间分配）
ContentAgent      →  每页内容规划（标题、要点、例题、小结）
VisualAgent       →  图片/图表/示意图素材规划
LayoutAgent       →  每页布局设计（模板选择、元素位置）
AnimAgent         →  动画效果设计（入场、强调、过渡）
ReviewAgent       →  质量审校，5 维度评分
```

**DAG 执行顺序**：
```
[Parser] → [Completeness] → [Overview] → [Content ∥ Visual] → [Layout ∥ Anim] → [Review]
```

**移植事项**：
- 从 school-pptx 移植 `orchestrator.ts`、`runner.ts`、`schema.ts` 的核心逻辑
- 适配 prompt：将“教案/分页稿”改为“PPT 内容/布局/动画”
- UI 面板：移植 `ExpertTeamPanel`、DAG 可视化、流式输出

---

## 四、技术选型一览

| 维度 | 当前 | 改进后 | school-pptx 对标 |
|------|------|--------|-----------------|
| 渲染框架 | React 18 | React 18 + Tailwind | Preact + Tailwind |
| 状态管理 | useState | Zustand | @preact/signals |
| 桌面框架 | Electron 28 | Electron 28 | Electron 37 |
| 构建工具 | electron-vite | electron-vite | Vite |
| AI 接入 | 未接入 | OpenAI SDK | claude-agent-sdk |
| 文档解析 | 正则 | python-docx + LLM | mammoth + LLM |
| PPT 生成 | python-pptx | python-pptx 增强 | HTML 演放器 |
| 数据库 | 无 | SQLite (Node) | SQLite (spawn CLI) |
| 通信 | IPC 直连 | IPC → Python worker | IPC → Backend Child |
| 测试 | 无 | 逐步补充 | node --test |

---

## 五、文件结构变更

```
lesson-ppt-generator/
├── electron/
│   ├── main.ts              # 窗口管理 + Python worker spawn + IPC routing
│   ├── preload.ts           # 扩展 API：文件读取、Python 呼叫
│   └── python-bridge.ts     # (新增) Python 子进程管理和 JSON RPC
├── src/
│   ├── components/
│   │   ├── UploadView.tsx       # 文件读取真实实现
│   │   ├── OverviewEditor.tsx   # 绑定真实数据 + 编辑
│   │   ├── PreviewView.tsx      # HTML 预览 + 缩略图
│   │   ├── ProgressBar.tsx      # 保持
│   │   ├── SettingsModal.tsx    # (新增) API Key 配置
│   │   ├── SlideEditor.tsx      # (新增) 单页编辑器
│   │   └── ExpertTeamPanel.tsx  # (P2) 专家团队面板
│   ├── store/
│   │   └── appStore.ts          # (新增) Zustand 状态管理
│   ├── types/
│   │   └── index.ts             # 已存在，补充 Python 交互类型
│   ├── App.tsx
│   └── main.tsx
├── python/
│   ├── worker.py            # (新增) 统一入口，JSON RPC
│   ├── requirements.txt
│   ├── ppt_builder.py       # 增强版：多布局+配色+动画
│   └── agents/
│       ├── __init__.py
│       ├── parser.py            # 重写：DOCX支持 + LLM解析
│       ├── overview.py          # (新增) Overview 生成
│       ├── content.py           # (P2) 内容规划
│       ├── visual.py            # (P2) 视觉素材
│       ├── layout.py            # (P2) 布局设计
│       ├── animation.py         # (P2) 动画设计
│       └── review.py            # (P2) 质量审校
├── docs/
│   └── IMPROVEMENT_PLAN.md  # 本文件
├── package.json
└── ...
```

---

## 六、关键设计决策

### 决策 1：Python Worker vs Node.js Backend Child

- **school-pptx 做法**：fork Node.js 子进程，所有业务在 JS/TS 中完成，Python 只用于某些特定任务（如 markitdown）
- **lesson-ppt-generator 做法**：保留 Python 为主力后端，因为 python-pptx 和 OpenAI SDK 在 Python 中更成熟
- **具体方案**：Electron main spawn Python worker，通过 stdin/stdout JSON 通信，简单直接

### 决策 2：PPT 渲染策略

- **school-pptx**：HTML 演放器优先，`.pptx` 导出推到 v1.1+
- **lesson-ppt-generator**：直接生成 `.pptx`（因为这是用户的核心需求），同时提供 HTML 预览作为辅助

### 决策 3：AI Provider 选择

- 第一阶段：OpenAI API（gpt-4o/gpt-4o-mini）—— 接入简单，效果稳定
- 后续扩展：Claude 、本地 Ollama 、阿里通义 等
- 配置层做抽象，新增 provider = 增加一个适配器

### 决策 4：数据库选择

- 第一阶段（P0）：不引入数据库，保持简单，用 JSON 文件存储临时数据
- 第二阶段（P1）：引入 SQLite，用 `better-sqlite3`（同步 API，简单快速）

---

## 七、风险与缓解

| # | 风险 | 概率 | 缓解 |
|---|------|------|------|
| 1 | Python worker 进程管理复杂（崩溃/卡死） | 中 | 设计超时机制、心跳检测、自动重启 |
| 2 | OpenAI API 调用失败/延迟 | 高 | fallback 到本地 Ollama，或允许用户手动填写 |
| 3 | python-pptx 中文字体问题 | 中 | 预置中文字体 fallback 链（微软雅黑→宋体→系统默认） |
| 4 | DOCX 格式多样性导致解析失败 | 高 | 先用 python-docx 读取纯文本，再用 LLM 解析，正则作为 fallback |
| 5 | 大文件上传 IPC 传输限制 | 低 | 先写入临时文件，IPC 传路径而不是内容 |

---

## 八、接下来的行动

1. **等你生成设计稿** → 我根据设计稿调整 UI 细节
2. **我先实施 P0** —— 让整个 pipeline 跑通
3. **P0 验证后** → 进入 P1 架构升级
4. **P1 稳定后** → 进入 P2 专家团队

---

## 附录：与浙教版一年级相关的实际样本

需要准备 1-2 份真实的一年级数学教案（DOCX/TXT）作为测试输入，用于验证 ParserAgent 的解析能力。