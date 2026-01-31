---
created: <% tp.file.creation_date() %>
quarter: <% tp.file.title %>
tags: [季报]
---
# 📊 <% tp.file.title %> 季度总结

<< [[<% moment(tp.file.title, "YYYY-[Q]Q").subtract(1, 'quarters').format("YYYY-[Q]Q") %>|上一季度]] | [[<% moment(tp.file.title, "YYYY-[Q]Q").add(1, 'quarters').format("YYYY-[Q]Q") %>|下一季度]] >>

## 📈 季度核心目标回顾
- [ ] 目标1
- [ ] 目标2

## ✅ 本季度重点成果 (自动聚合)
```dataview
TASK
FROM "20-日志/01-Daily"
WHERE completed
AND file.name >= "<% moment(tp.file.title, "YYYY-[Q]Q").startOf('quarter').format("YYYY-MM-DD") %>"
AND file.name <= "<% moment(tp.file.title, "YYYY-[Q]Q").endOf('quarter').format("YYYY-MM-DD") %>"
GROUP BY file.link
```

## 📝 季度工作流水概览
```dataview
TABLE WITHOUT ID 
	link(file.link, dateformat(date(file.name), "MM-dd cccc")) as "日期", 
	L.text as "工作内容"
FROM "20-日志/01-Daily"
FLATTEN file.lists as L
WHERE contains(meta(L.section).subpath, "工作流水")
AND file.name >= "<% moment(tp.file.title, "YYYY-[Q]Q").startOf('quarter').format("YYYY-MM-DD") %>"
AND file.name <= "<% moment(tp.file.title, "YYYY-[Q]Q").endOf('quarter').format("YYYY-MM-DD") %>"
SORT file.name ASC
```

## 🧠 季度反思与提升
> [!quote] 每日反思聚合
```dataview
TABLE WITHOUT ID 
	link(file.link, dateformat(date(file.name), "MM-dd cccc")) as "日期", 
	L.text as "反思"
FROM "20-日志/01-Daily"
FLATTEN file.lists as L
WHERE contains(meta(L.section).subpath, "每日反思")
AND file.name >= "<% moment(tp.file.title, "YYYY-[Q]Q").startOf('quarter').format("YYYY-MM-DD") %>"
AND file.name <= "<% moment(tp.file.title, "YYYY-[Q]Q").endOf('quarter').format("YYYY-MM-DD") %>"
SORT file.name ASC
```
