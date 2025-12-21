---
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
updated: <% tp.date.now("YYYY-MM-DD HH:mm") %>
type: 项目
status: 进行中
priority: 高
startDate: <% tp.date.now("YYYY-MM-DD") %>
endDate: 
manager: 
tags: [project]
---

# 🏗️ <% tp.file.title %>

> [!abstract] 项目概况
> - **负责人**: `VIEW[{manager}]`
> - **周期**: `VIEW[{startDate}]` -> `VIEW[{endDate}]`
> - **进度**: `$= const t = dv.page(dv.current().file.path).file.tasks; if(t.length > 0) { const c = t.where(x => x.completed).length; const p = Math.round((c/t.length)*100); dv.span(p + "%"); } else { dv.span("0%"); }`

## 📊 进度总览 (Progress)

### 关联文档任务统计
```dataviewjs
// 获取关联到本项目的所有文档
let pages = dv.pages('"30-业务档案"')
    .where(p => p.relatedProject && p.relatedProject.path == dv.current().file.path);

// 统计这些文档里的任务
let totalTasks = 0;
let completedTasks = 0;

for (let p of pages) {
    let tasks = p.file.tasks;
    totalTasks += tasks.length;
    completedTasks += tasks.where(t => t.completed).length;
}

// 渲染进度条
if (totalTasks > 0) {
    let percent = Math.round((completedTasks / totalTasks) * 100);
    dv.paragraph(`**项目整体完成度**: ${percent}% (${completedTasks}/${totalTasks})`);
    dv.paragraph(`<progress value="${percent}" max="100"></progress>`);
} else {
    dv.paragraph("暂无关联任务");
}
```

---

## 📂 项目文档 (Docs)
> 所有 `relatedProject` 指向本项目的文档会自动出现在这里。

```dataview
TABLE type as "类型", status as "状态", updated as "更新时间"
FROM "30-业务档案"
WHERE relatedProject = this.file.link
SORT updated desc
```

## 📝 待办事项 (Project Tasks)
> 聚合所有关联文档中的未完成任务。

```dataview
TASK
FROM "30-业务档案"
WHERE relatedProject = this.file.link AND !completed
GROUP BY file.link
```

## 🗣️ 会议与沟通
```dataview
TABLE created as "日期"
FROM "30-业务档案"
WHERE relatedProject = this.file.link AND type = "会议"
SORT created desc
```

## 风险与复盘
- [ ] 风险点1：
- [ ] 风险点2：
