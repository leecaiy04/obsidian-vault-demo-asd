---
created: <% tp.file.creation_date() %>
year: <% tp.file.title %>
tags: [年报]
---
# 🏆 <% tp.file.title %> 年度总结

<< [[<% moment(tp.file.title, "YYYY").subtract(1, 'years').format("YYYY") %>|上一年度]] | [[<% moment(tp.file.title, "YYYY").add(1, 'years').format("YYYY") %>|下一年度]] >>

## 🌟 年度高光时刻
- [ ] 

## 📊 年度数据概览
```dataview
TABLE WITHOUT ID
	length(rows) as "文档数量",
	sum(rows.amount) as "涉及金额(估)"
FROM "30-业务档案"
WHERE file.cday.year = <% tp.file.title %>
GROUP BY category
```

## 📝 年度工作流水聚合 (仅显示重要)
> [!info] 提示
> 由于数据量过大，建议仅查看月度或季度汇总。下方仅列出标有 "⚠️" 或 "⭐" 的重要事项。

```dataview
TABLE WITHOUT ID 
	link(file.link, dateformat(date(file.name), "MM-dd")) as "日期", 
	L.text as "重要事项"
FROM "20-日志/01-Daily"
FLATTEN file.lists as L
WHERE contains(meta(L.section).subpath, "工作流水")
AND (contains(L.text, "⭐") OR contains(L.text, "⚠️"))
AND file.name >= "<% moment(tp.file.title, "YYYY").startOf('year').format("YYYY-MM-DD") %>"
AND file.name <= "<% moment(tp.file.title, "YYYY").endOf('year').format("YYYY-MM-DD") %>"
SORT file.name ASC
```

## 🧠 年度反思聚合 (仅显示重要)
```dataview
TABLE WITHOUT ID 
	link(file.link, dateformat(date(file.name), "MM-dd")) as "日期", 
	L.text as "重要反思"
FROM "20-日志/01-Daily"
FLATTEN file.lists as L
WHERE contains(meta(L.section).subpath, "每日反思")
AND (contains(L.text, "⭐") OR contains(L.text, "⚠️"))
AND file.name >= "<% moment(tp.file.title, "YYYY").startOf('year').format("YYYY-MM-DD") %>"
AND file.name <= "<% moment(tp.file.title, "YYYY").endOf('year').format("YYYY-MM-DD") %>"
SORT file.name ASC
```