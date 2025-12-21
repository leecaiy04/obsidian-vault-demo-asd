# ⚡ QuickAdd 配置指南

QuickAdd 是你的“自动化操作台”，用于快速创建文件、插入内容或运行复杂的工作流。

## 1. 四种核心模式

### A. Template (模板模式) 🌟 *最常用*
用于**新建文件**并应用模板。
- **场景**: 新建日记、新建项目、新建会议纪要。
- **关键设置**:
    - `Template Path`: 选择模板文件。
    - `File Name Format`: 定义文件名（支持 `{{DATE}}` 变量）。
    - `Create in folder`: 指定默认文件夹。

### B. Capture (捕获模式)
用于向**现有文件**追加内容。
- **场景**: 闪念笔记（添加到 Inbox）、向日记追加一条待办。
- **关键设置**:
    - `File Name`: 指定目标文件（如 `20-日志/01-Daily/{{DATE}}.md`）。
    - `Insert after`: 指定插入位置（如在 `## 待办` 标题后）。

### C. Macro (宏模式) 🚀 *最强大*
将多个动作串联起来（JS 脚本 + Template + Capture...）。
- **场景**: 状态流转（改 YAML -> 移动文件 -> 弹窗提示）。
- **配置步骤**:
    1. 点击 `Manage Macros`。
    2. 新建 Macro。
    3. 添加步骤 (User Script, Obsidian Command, Editor Command 等)。

### D. Multi (多选菜单)
将多个 QuickAdd 动作打包成一个文件夹菜单。

---

## 2. 常用变量 (Format Syntax)

在文件名或 Capture 内容中可以使用：

- `{{DATE}}`: 当前日期 (默认 YYYY-MM-DD)
- `{{DATE:YYYYMMDD}}`: 自定义格式日期
- `{{time}}`: 当前时间
- `{{VALUE}}`: 弹窗让用户输入
- `{{VALUE:提示语}}`: 带提示的弹窗
- `{{LINKCURRENT}}`: 插入当前笔记的链接

---

## 3. 本库配置详解

### "业务工作流" (Template)
- **作用**: 标准化创建业务文档。
- **逻辑**:
    1. 提示输入文件名。
    2. 应用 `TP-工作流初始化` 模板。
    3. 模板内的 JS 脚本负责移动文件到正确目录。

### "UpdateStatusMacro" (Macro)
- **作用**: 配合按钮修改文档状态。
- **核心**: 调用 `99-模板/Scripts/update_status.js`。
- **参数**: 必须在 Choice 设置的 Variables 中定义 `targetStatus` (进行中/已完成/归档)。

---

## 4. API 开发 (QuickAdd API)

在脚本中可以通过 `params.quickAddApi` 调用 QuickAdd 的能力：

```javascript
module.exports = async (params) => {
    const { quickAddApi } = params;
    
    // 1. 弹窗输入
    const input = await quickAddApi.inputPrompt("请输入标题");
    
    // 2. 弹窗选择
    const choice = await quickAddApi.suggester(["A", "B"], ["ValueA", "ValueB"]);
    
    // 3. 运行其他 Obsidian 命令
    await app.commands.executeCommandById("command-id");
}
```
