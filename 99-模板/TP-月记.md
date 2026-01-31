---
created: <% tp.file.creation_date() %>
month: <% tp.file.title %>
tags: [月记]
---
# 📅 <% tp.file.title %> 月度复盘

<< [[<% moment(tp.file.title).subtract(1, 'months').format("YYYY-MM") %>|上一月]] | [[<% moment(tp.file.title).add(1, 'months').format("YYYY-MM") %>|下一月]] >>

## ✅ 本月重点成果
```dataview
TASK
FROM "20-日志/01-Daily"
WHERE completed
AND file.name >= "<% moment(tp.file.title).startOf('month').format("YYYY-MM-DD") %>"
AND file.name <= "<% moment(tp.file.title).endOf('month').format("YYYY-MM-DD") %>"
GROUP BY file.link
```

## 📝 本月工作流水汇总
> [!info] 过程记录 聚合每天 `## 📝 工作流水` 下的列表内容
```dataview
TABLE WITHOUT ID 
	link(file.link, dateformat(date(file.name), "MM-dd cccc")) as "日期", 
	L.text as "工作内容"
FROM "20-日志/01-Daily"
FLATTEN file.lists as L
WHERE contains(meta(L.section).subpath, "工作流水")
AND file.name >= "<% moment(tp.file.title).startOf('month').format("YYYY-MM-DD") %>"
AND file.name <= "<% moment(tp.file.title).endOf('month').format("YYYY-MM-DD") %>"
SORT file.name ASC
```

## 🧠 本月每日反思汇总
> [!quote] 每日反思 聚合每天 `## 🧠 每日反思` 下的列表内容
```dataview
TABLE WITHOUT ID 
	link(file.link, dateformat(date(file.name), "MM-dd cccc")) as "日期", 
	L.text as "反思与复盘"
FROM "20-日志/01-Daily"
FLATTEN file.lists as L
WHERE contains(meta(L.section).subpath, "每日反思")
AND file.name >= "<% moment(tp.file.title).startOf('month').format("YYYY-MM-DD") %>"
AND file.name <= "<% moment(tp.file.title).endOf('month').format("YYYY-MM-DD") %>"
SORT file.name ASC
```