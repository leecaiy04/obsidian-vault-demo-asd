# 🛠️ Templater 脚本开发指南

Templater 是 Obsidian 最强大的自动化插件，允许在模板中使用 JavaScript 代码。

## 1. 基础语法

- **`<% ... %>`**: **输出模式**。将代码的返回值直接插入到文档中。
    - 例：`<% tp.date.now() %>` -> `2025-12-21`
- **`<%* ... %>`**: **执行模式**。执行 JS 逻辑，默认不输出。
    - 如需输出，请向 `tR` 变量追加字符串：`<%* tR += "你好" %>`
- **`<%~ ... %>`**: **静态解析**。在应用模板前就解析（常用较少）。

---

## 2. 常用内置对象 (Built-in Modules)

### 📅 日期 (tp.date)
| 代码 | 说明 |
| :--- | :--- |
| `tp.date.now("YYYY-MM-DD")` | 今天日期 |
| `tp.date.now("YYYY-MM-DD", -1)` | 昨天 |
| `tp.date.now("YYYY-MM-DD", 1)` | 明天 |
| `tp.date.weekday(5, 1)` | 下周五 (5=周五, 1=下周) |

### 📄 文件 (tp.file)
| 代码 | 说明 |
| :--- | :--- |
| `tp.file.title` | 当前文件名 |
| `tp.file.cursor()` | 设定光标插入位置 |
| `await tp.file.move("路径/文件名")` | 移动文件 |
| `await tp.file.rename("新名")` | 重命名文件 |
| `tp.file.find_tfile("文件名")` | 查找文件对象 (供读取用) |

### 🖥️ 交互 (tp.system)
| 代码 | 说明 |
| :--- | :--- |
| `await tp.system.prompt("提示语")` | 弹窗输入框 |
| `await tp.system.suggester(["A","B"], ["valA","valB"])` | 弹窗选择框 (显示文本, 实际值) |

### 🌐 Obsidian API (app)
你可以直接访问 Obsidian 的核心 API：
```javascript
// 获取 Vault 对象
app.vault

// 读取文件内容
await app.vault.read(tFile)

// 创建文件夹
await app.vault.createFolder("NewFolder")
```

---

## 3. 自定义脚本 (User Scripts)

当逻辑太长时，建议写成 `.js` 文件。

### 配置
1.  在设置中将 **Script files folder location** 指向 `99-模板/Scripts`。
2.  Obsidian 会自动将该目录下的 js 文件注册为 `tp.user.文件名`。

### 编写规范
每个文件推荐只导出一个函数。

**示例：`99-模板/Scripts/generate_id.js`**
```javascript
module.exports = (prefix) => {
    return prefix + "-" + Math.random().toString(36).substring(2,8);
}
```

### 调用方式
在模板中：
```javascript
项目ID: <% tp.user.generate_id("PROJ") %>
```

---

## 4. 实战代码片段

### A. 自动移动文件
```javascript
<%*
const target = "30-业务档案/01-工作-审批/" + tp.file.title;
await tp.file.move(target);
%>
```

### B. 根据 Frontmatter 修改内容
```javascript
<%*
const file = tp.file.find_tfile("某模板");
const content = await app.vault.read(file);
tR += content; // 将读取的内容插入当前位置
%>
```
