---
created: <% tp.file.creation_date() %>
week: <% tp.file.title %>
tags: [周记]
---

# 📅 <% tp.file.title %> 周度复盘

<< [[<% tp.date.weekday("YYYY-[W]WW", -7, tp.file.title, "YYYY-[W]WW") %>|上一周]] | [[<% tp.date.weekday("YYYY-[W]WW", 7, tp.file.title, "YYYY-[W]WW") %>|下一周]] >>

## ✅ 本周已完成事项
> [!success] 成就清单
> 筛选范围：`<% tp.date.weekday("YYYY-MM-DD", 0, tp.file.title, "YYYY-[W]WW") %>` 至 `<% tp.date.weekday("YYYY-MM-DD", 6, tp.file.title, "YYYY-[W]WW") %>`

```dataview
TASK
FROM "20-日志/01-Daily"
WHERE completed
AND file.name >= "<% tp.date.weekday("YYYY-MM-DD", 0, tp.file.title, "YYYY-[W]WW") %>"
AND file.name <= "<% tp.date.weekday("YYYY-MM-DD", 6, tp.file.title, "YYYY-[W]WW") %>"
GROUP BY file.link
```

## 🔳 本周未完成/遗留事项
```dataview
TASK
FROM "20-日志/01-Daily"
WHERE !completed
AND file.name >= "<% tp.date.weekday("YYYY-MM-DD", 0, tp.file.title, "YYYY-[W]WW") %>"
AND file.name <= "<% tp.date.weekday("YYYY-MM-DD", 6, tp.file.title, "YYYY-[W]WW") %>"
GROUP BY file.link
```
## 📝 本周工作流水汇总

> [!info] 过程记录 聚合每天 `## 📝 工作流水` 下的列表内容
```dataview
TABLE WITHOUT ID 
	link(file.link, dateformat(date(file.name), "MM-dd cccc")) as "日期", 
	L.text as "工作内容"
FROM "20-日志/01-Daily"
FLATTEN file.lists as L
WHERE contains(meta(L.section).subpath, "工作流水")
AND file.name >= "<% tp.date.weekday("YYYY-MM-DD", 0, tp.file.title, "YYYY-[W]WW") %>"
AND file.name <= "<% tp.date.weekday("YYYY-MM-DD", 6, tp.file.title, "YYYY-[W]WW") %>"
SORT file.name ASC
```

## 🧠 本周每日反思汇总
> [!quote] 标题 心得感悟 聚合每天 `## 🧠 每日反思` 下的列表内容。
```dataview
TABLE WITHOUT ID 
	link(file.link, dateformat(date(file.name), "MM-dd cccc")) as "日期", 
	L.text as "反思与复盘"
FROM "20-日志/01-Daily"
FLATTEN file.lists as L
WHERE contains(meta(L.section).subpath, "每日反思")
AND file.name >= "<% tp.date.weekday("YYYY-MM-DD", 0, tp.file.title, "YYYY-[W]WW") %>"
AND file.name <= "<% tp.date.weekday("YYYY-MM-DD", 6, tp.file.title, "YYYY-[W]WW") %>"
SORT file.name ASC
```