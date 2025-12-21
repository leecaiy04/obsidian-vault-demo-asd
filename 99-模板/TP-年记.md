#### 4. 模板：`TP-年记`
*文件名建议：TP-Yearly*

```markdown
---
tags: diary/yearly
year: <% tp.date.now("YYYY") %>
---
# 🏆 <% tp.file.title %> 年度概览

## 🎯 年度核心目标
1. 
2. 

## 📂 季度/月度回顾
```dataview
TABLE WITHOUT ID file.link as "月份", file.mday as "最后修改"
FROM "20-日志/03-Monthly"
WHERE startswith(file.name, "<% tp.date.now("YYYY") %>")
SORT file.name ASC