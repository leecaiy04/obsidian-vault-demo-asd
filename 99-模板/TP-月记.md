---
tags: diary/monthly
month: <% tp.date.now("YYYY-MM") %>
---
---
created: <% tp.file.creation_date() %>
week: <% tp.file.title %>
# 自动计算本周的起始和结束日期，供 Dataview 查询使用
date_start: <% tp.date.weekday("YYYY-MM-DD", 0, tp.file.title, "YYYY-[W]WW") %>
date_end: <% tp.date.weekday("YYYY-MM-DD", 6, tp.file.title, "YYYY-[W]WW") %>
tags: [周记]
---

# 📅 <% tp.file.title %> 周度复盘

<< [[<% tp.date.weekday("YYYY-[W]WW", -7, tp.file.title, "YYYY-[W]WW") %>|上一周]] | [[<% tp.date.weekday("YYYY-[W]WW", 7, tp.file.title, "YYYY-[W]WW") %>|下一周]] >>

## 📊 核心指标达成 (自动统计)

```dataviewjs
// === 配置区域 ===
const start = dv.current().date_start;
const end = dv.current().date_end;
const workFolder = "30-业务档案"; // 您的业务归档文件夹

// 1. 获取本周创建的所有业务文档
const pages = dv.pages(`"${workFolder}"`)
    .where(p => {
        const ctime = moment(p.file.ctime.ts).format("YYYY-MM-DD");
        return ctime >= start && ctime <= end;
    });

// 2. 统计【审批】类项目
const approvalCount = pages.where(p => p.category == "审批").length;

// 3. 统计【资金/要素】涉及金额
// 筛选分类为 "资金支付" 或 "要素" 或 "财务" 的文档
const moneyPages = pages.where(p => 
    p.category == "资金支付" || p.category == "要素" || p.category == "财务" || p.category == "全生命周期"
);

// 计算总金额 (假设属性名为 '涉及金额' 或 'amount')
let totalAmount = 0;
for (let p of moneyPages) {
    // 优先取中文属性，没有则取英文
    let amt = p["涉及金额"] || p.amount || 0;
    totalAmount += Number(amt);
}
// 格式化金额 (保留2位小数，加逗号)
const formattedAmount = totalAmount.toLocaleString('zh-CN', { style: 'currency', currency: 'CNY' });

// 4. 输出结果