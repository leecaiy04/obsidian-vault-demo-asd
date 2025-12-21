---
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
tags: diary/daily
---
# 📅 <% tp.file.title %>

<< [[<% tp.date.now("YYYY-MM-DD", -1) %>]] | [[<% tp.date.now("YYYY-MM-DD", 1) %>]] >>
📆 所属周：[[<% tp.date.now("YYYY-[W]WW") %>]]

## 今日待办

### 🚀 正在进行的项目任务
```dataview
TASK
FROM "30-业务档案" AND -"99-模板"
WHERE !completed 
  AND status != "归档"
  AND text != "" 
  AND text != " "
GROUP BY file.link
```

### 📅 近期未完成的日记待办
```dataview
TASK
FROM "20-日志" AND -"99-模板"
WHERE !completed 
  AND file.name != this.file.name
  AND text != "" 
  AND text != " "
  AND !contains(text, "今日新增")
GROUP BY file.link
```

### 今日新增
- [ ] 

## 工作流水

- <% tp.date.now("HH:mm") %> <% tp.file.cursor() %>

## 每日反思

### 📝 今日修改的文档
```dataview
TABLE type, area, status
FROM "30-业务档案"
WHERE file.mday = date(today)
SORT file.mtime desc
```

- <% tp.date.now("HH:mm") %> 
