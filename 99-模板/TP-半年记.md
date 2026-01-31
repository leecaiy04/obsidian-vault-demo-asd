---
created: <% tp.file.creation_date() %>
period: <% tp.file.title %>
tags: [半年报]
---
# 🌗 <% tp.file.title %> 半年度总结

<%*
// 简单的逻辑判断 H1 还是 H2
let start, end;
if (tp.file.title.includes("H1")) {
    start = tp.file.title.substring(0, 4) + "-01-01";
    end = tp.file.title.substring(0, 4) + "-06-30";
} else {
    start = tp.file.title.substring(0, 4) + "-07-01";
    end = tp.file.title.substring(0, 4) + "-12-31";
}
%>

## 📅 时间范围
`<% start %>` 至 `<% end %>`

## 🎯 核心目标回顾
- [ ] 目标1
- [ ] 目标2

## 📊 重点成果聚合 (H1/H2)
```dataview
TASK
FROM "20-日志/01-Daily"
WHERE completed
AND file.name >= "<% start %>"
AND file.name <= "<% end %>"
GROUP BY file.link
```

## 📝 工作流水概览
```dataview
TABLE WITHOUT ID 
	link(file.link, dateformat(date(file.name), "MM-dd cccc")) as "日期", 
	L.text as "工作内容"
FROM "20-日志/01-Daily"
FLATTEN file.lists as L
WHERE contains(meta(L.section).subpath, "工作流水")
AND file.name >= "<% start %>"
AND file.name <= "<% end %>"
SORT file.name ASC
```
