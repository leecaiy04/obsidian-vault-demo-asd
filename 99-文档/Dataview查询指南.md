# 📊 Dataview 查询指南

Dataview 是 Obsidian 的数据库引擎，它将你的笔记变成可查询的数据源。

## 1. 基础查询 (DQL)

Dataview Query Language (DQL) 类似 SQL，但更简单。

### 语法结构
```sql
TABLE/LIST/TASK  (展示类型)
field1, field2   (要显示的字段)
FROM "folder"    (数据来源：文件夹、标签、链接)
WHERE condition  (过滤条件)
SORT field asc   (排序)
LIMIT 10         (数量限制)
```

### 常用示例

**A. 列出“进行中”的审批项目**
```dataview
TABLE area, priority, updated
FROM "30-业务档案"
WHERE type = "审批" AND status = "进行中"
SORT priority desc
```

**B. 查找最近 3 天修改过的文件**
```dataview
LIST
FROM ""
WHERE file.mtime >= date(today) - dur(3 days)
```

**C. 聚合所有未完成的任务**
```dataview
TASK
FROM "30-业务档案"
WHERE !completed
GROUP BY file.link
```

---

## 2. 高级查询 (DataviewJS)

当 DQL 不够用时，使用 JavaScript 可以实现无限可能。使用 ` ```dataviewjs ` 代码块。

### 核心对象 `dv`

- `dv.pages(source)`: 获取页面数组
- `dv.current()`: 获取当前页面对象
- `dv.header(level, text)`: 渲染标题
- `dv.paragraph(text)`: 渲染文本
- `dv.table(headers, values)`: 渲染表格

### 示例：进度条统计
```javascript
// 获取所有项目文件
let pages = dv.pages('"30-业务档案"').where(p => p.type == "项目");

// 遍历并计算
dv.table(["项目", "进度"], pages.map(p => {
    let tasks = p.file.tasks;
    let completed = tasks.where(t => t.completed).length;
    let total = tasks.length;
    let percent = total == 0 ? 0 : Math.round((completed/total)*100);
    return [p.file.link, `<progress value="${percent}" max="100"></progress> ${percent}%`];
}));
```

---

## 3. 常用字段参考 (Implicit Fields)

每个文件自动包含以下元数据（无需自己在 YAML 写）：

- `file.name`: 文件名
- `file.link`: 文件的双向链接
- `file.path`: 完整路径
- `file.ctime`: 创建时间 (Date)
- `file.mtime`: 修改时间 (Date)
- `file.size`: 文件大小
- `file.folder`: 所属文件夹
- `file.tags`: 标签数组
- `file.tasks`: 包含的任务列表
- `file.inlinks`: 指向该文件的链接
- `file.outlinks`: 该文件发出的链接
