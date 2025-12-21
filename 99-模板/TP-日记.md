---
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
tags: diary/daily
---
# 📅 <% tp.file.title %>

<< [[<% tp.date.now("YYYY-MM-DD", -1) %>]] | [[<% tp.date.now("YYYY-MM-DD", 1) %>]] >>
📆 所属周：[[<% tp.date.now("YYYY-[W]WW") %>]]

```dataviewjs
const currentFile = dv.current();
const currentDay = currentFile.file.day;

if (currentDay) {
    const pastTasks = dv.pages('"20-日志/01-Daily"')
        .where(p => p.file.day && p.file.day < currentDay)
        .file.tasks
        .where(t => !t.completed && t.text.trim() !== "" && !t.text.includes("今日新增"));

    if (pastTasks.length > 0) {
        dv.header(2, "往日待办");
        dv.taskList(pastTasks);
    }
}
```

## 今日待办
 <% tp.file.cursor() %>

## 工作流水



## 每日反思


##  今日修改的文档
```dataview
TABLE type, area, status
FROM "30-业务档案"
WHERE file.mday = date(today)
SORT file.mtime desc
```

