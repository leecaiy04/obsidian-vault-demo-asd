# 📘 Work Vault 知识库使用指南

> **核心理念**：以本地文件为基础，以时间轴为索引，以 AI 为辅助。
> **最后更新**：2025-12-21

---

## 📂 1. 目录结构说明

本仓库采用 **"功能区 + 业务区"** 分离的结构，确保文件归档清晰。

```text
D:\OBSIDIAN\WORK-VAULT
├── 00-工作台.md            # [NEW] 个人工作指挥中心 (Dashboard)
├── 00-Inbox/              # 收件箱：临时存放未分类的速记、截图、下载文件
├── 20-日志/                # 时间维度记录 (Periodic Notes)
│   ├── 01-Daily/          # 日记：流水账 (Dataview 自动聚合待办)
│   ├── 02-Weekly/         # 周记：周报与复盘
│   └── ...
├── 30-业务档案/            # 核心工作区 (按业务条线分类)
│   ├── 01-工作-审批/       # 可研、初设、备案
│   ├── 02-工作-要素争取/    # 专项债、国债、金融工具
│   ├── ...                # (其他业务目录，支持自动归档)
│   └── [业务子目录]/
│       ├── 附件/          # ⚠️ 自动存放拖入的 Word/Excel/PDF
│       └── _Archive/      # 归档区
└── 99-模板/                # 自动化核心
    ├── Scripts/           # 包含 update_status.js 等脚本
    ├── 工作流子模板/       # 业务专用子模板
    ├── TP-工作流初始化.md  # [核心] 新建文件入口
    └── TP-日记.md         # [核心] 包含自动待办聚合
```

---

## 🚀 2. 简明使用流程 (SOP)

### 🖥️ A. 工作台模式 (Dashboard)
你的工作起点是 **`00-工作台.md`**（建议拖拽到侧边栏常驻）。
*   **焦点区**：自动展示“高优先级”和“进行中”的任务。
*   **待办聚合**：一站式查看所有业务文档和日记中的未完成事项。
*   **快捷操作**：点击按钮快速写日记或新建业务文档。
*   **高级检索**：底部集成了 `Omnisearch + Dataview` 联合搜索，可对 PDF/Word 内容进行全文检索并按状态过滤。

### 📥 B. 新建任务流 (QuickAdd + Templater)
不再需要手动寻找文件夹，一切自动化：

1.  **触发**：在工作台点击 **"➕ 新建业务文档"** (或调用 QuickAdd)。
2.  **输入**：
    *   输入文件名。
    *   选择类型（如“审批”）、领域（如“可研”）。
    *   设置初始属性（状态、优先级）。
3.  **自动归档**：
    *   脚本会自动将文件**移动**到对应的 `30-业务档案/xx/xx` 目录下。
    *   如果目录不存在，会自动创建。

### 📝 C. 状态流转与日记
1.  **一键流转**：
    *   在业务文档顶部，使用 **状态控制按钮**。
    *   点击 `▶ 开始任务` -> 状态变为“进行中”，更新时间戳。
    *   点击 `✅ 标记完成` -> 状态变为“已完成”，自动填入完成日期。
2.  **写日记**：
    *   每天的日记会自动聚合 **"正在进行的任务"** 和 **"遗留待办"**。
    *   **每日反思** 区域会自动列出你 **今天修改过** 的所有文档，方便写日报。

---

## 🏷️ 3. 属性规范 (Properties)

所有业务文档统一使用以下标准 YAML 属性：

```yaml
---
created: 2025-12-21 10:00      # 创建时间 (自动)
updated: 2025-12-21 15:30      # 最后更新 (自动)
type: 审批                     # 业务大类
area: 可研                     # 业务子类
status: 进行中                 # 状态 (由按钮控制)
priority: 高                   # 优先级
dueDate: 2025-12-31            # 截止日期
completedDate:                 # 完成日期 (点击完成按钮时自动填入)
relatedProject:                # 关联项目
tags: [work]                   # 标签
---
```

---

### 标签规范 (Nested Tags)
我们采用 **"结构化标签"** 体系，标签主要用于跨文件夹聚合。
已配置 CSS 样式，特定标签会自动变色。

*   **`#Topic/xxx`**: 关联话题 (如 `#Topic/新能源`, `#Topic/年终检查`) -> 🔵 蓝色胶囊样式
*   **`#Dept/xxx`**: 关联部门 (如 `#Dept/财务部`) -> 🟡 黄色样式
*   **`#Status/Waiting`**: 阻塞/等待 (仅用于看板辅助，主要状态请用 YAML) -> 🔴 红色高亮
*   **`#重点`**: 关键文档 -> 🟣 紫色高亮

---

## ⚙️ 4. 关键配置说明 (Setup)

为了使上述流程正常工作，请确保以下插件配置：

### 1. QuickAdd 详细配置
这是实现自动化流转的核心，请按以下步骤操作：

#### A. 基础 Choice 设置
*   **业务工作流** (Template类型): 链接到 `99-模板/TP-工作流初始化.md`。文件名建议设为 `{{DATE:YYYYMMDD}}-{{VALUE:任务名}}`。
*   **新建项目** (Template类型): 链接到 `99-模板/TP-项目主页.md`。创建位置设为 `30-业务档案/00-项目库`。

#### B. 状态流转脚本 (Macro) 设置
1.  进入 QuickAdd -> **Manage Macros** -> 新建 `UpdateStatusMacro`。
2.  添加 User Script，选择 `99-模板/Scripts/update_status.js`。
3.  返回 QuickAdd 主界面，新建 3 个 **Macro** 类型的 Choice：
    *   **SetStatusToInProgress**: 绑定 `UpdateStatusMacro`，并在其齿轮设置的 **Variables** 中添加 `targetStatus` = `进行中`。
    *   **SetStatusToDone**: 绑定 `UpdateStatusMacro`，设置 `targetStatus` = `已完成`。
    *   **SetStatusToArchive**: 绑定 `UpdateStatusMacro`，设置 `targetStatus` = `归档`。

#### C. 文件快照 (Macro) 设置
1.  新建 `SnapshotMacro`。
2.  添加 User Script，选择 `99-模板/Scripts/create_snapshot.js`。
3.  新建一个 **Macro** 类型的 Choice，命名为 `创建快照`，绑定 `SnapshotMacro`。
4.  (可选) 将其添加到 `00-工作台` 的快捷按钮中。

### 2. 其他插件
*   **Dataview**: 开启 `Enable JavaScript Queries` 和 `Enable Inline JavaScript Queries`。
*   **Buttons**: 用于显示文档顶部的状态控制按钮。
*   **Templater**: 开启 `Trigger Templater on new file creation`。

---

> **保持简单 (Keep it simple)**
> 工具是为你服务的。现在的系统已经实现了“自动归档”、“一键状态更新”和“全自动待办聚合”，请专注于内容本身。