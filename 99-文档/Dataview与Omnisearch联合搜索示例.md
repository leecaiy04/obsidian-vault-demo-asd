# 🔍 DataviewJS + Omnisearch 联合搜索

> [!info] 原理说明
> 标准的 Dataview 只能搜索文件名或 YAML 属性。
> 结合 Omnisearch API，我们可以**先**用全文检索找到包含特定文字（甚至 PDF 内容）的文件，**再**用 Dataview 渲染出漂亮的表格。

## 示例 1: 基础全文检索列表

这是一个最简单的例子，用 DataviewJS 渲染 Omnisearch 的搜索结果。

```dataviewjs
// 定义搜索关键词
const query = "新能源";

// 调用 Omnisearch API
// 注意：Omnisearch 返回的是 Promise，需要处理异步
const results = await omnisearch.search(query);

if (results.length === 0) {
    dv.paragraph(`未找到包含 "${query}" 的文档`);
} else {
    dv.header(3, `包含 "${query}" 的文档 (${results.length})`);
    
    // 转换结果为 Dataview 链接格式
    // Omnisearch 返回的 path 是字符串，需要转为链接
    dv.list(results.map(r => `[[${r.path}|${r.basename}]] (匹配度: ${Math.round(r.score)})`));
}
```

---

## 示例 2: 🔍 混合查询（全文检索 + 属性过滤）

**场景**：我想找所有内容里提到了“**资金**”，且状态是“**进行中**”的“**审批**”类文档。

```dataviewjs
// 1. 定义搜索条件
const keyword = "资金";
const targetStatus = "进行中";
const targetType = "审批";

// 2. 先运行 Omnisearch 全文检索
const searchResults = await omnisearch.search(keyword);

// 3. 提取搜索到的文件路径
const matchedPaths = searchResults.map(r => r.path);

// 4. 使用 Dataview 获取这些文件的页面对象，并进行二次过滤
// p.file.path 在 matchedPaths 数组中，且满足状态和类型
const finalPages = dv.pages('"30-业务档案"')
    .where(p => matchedPaths.includes(p.file.path))
    .where(p => p.status == targetStatus && p.type == targetType);

// 5. 渲染表格
if (finalPages.length == 0) {
    dv.paragraph(`未找到内容包含 "${keyword}" 且状态为 "${targetStatus}" 的审批文档`);
} else {
    dv.table(
        ["文档", "领域", "优先级", "最后更新"],
        finalPages
        .sort(p => p.updated, "desc")
        .map(p => [
            p.file.link,
            p.area,
            p.priority,
            p.updated
        ])
    );
}
```

---

## 示例 3: 动态交互式搜索栏

这个脚本会在页面上生成一个输入框，实时搜索并展示结果（无需修改代码）。

```dataviewjs
// 创建输入框容器
const container = this.container;
container.innerHTML = `
    <style>
        .search-box { width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid var(--background-modifier-border); border-radius: 4px; background: var(--background-primary); color: var(--text-normal); }
    </style>
    <input type="text" class="search-box" placeholder="输入关键词搜索全库内容..." id="omni-input">
    <div id="omni-results"></div>
`;

const input = container.querySelector("#omni-input");
const resultDiv = container.querySelector("#omni-results");

// 监听输入事件 (简单的防抖处理建议加上，这里演示核心逻辑)
input.addEventListener("change", async (e) => {
    const query = e.target.value;
    if (!query) {
        resultDiv.innerHTML = "";
        return;
    }

    // 调用搜索
    const results = await omnisearch.search(query);
    
    // 渲染结果
    if (results.length === 0) {
        resultDiv.innerHTML = "无结果";
        return;
    }

    // 构建结果 HTML
    let html = "<ul>";
    for (const r of results.slice(0, 10)) { // 限制显示前10条
        // 尝试获取上下文摘录 (Omnisearch 结果通常包含 excerpt)
        const excerpt = r.excerpt ? `<br><small style='color:var(--text-muted)'>...${r.excerpt.replace(/<mark>/g, "<strong style='color:var(--text-accent)'>").replace(/<\/mark>/g, "</strong>")}...</small>` : "";
        
        // 创建 Obsidian 内部链接
        // 注意：在 innerHTML 中生成链接比较麻烦，这里简化处理，
        // 实际建议使用 dv.el() 或 Obsidian API 来渲染可点击链接
        html += `<li><a class="internal-link" href="${r.path}">${r.basename}</a>${excerpt}</li>`;
    }
    html += "</ul>";
    
    resultDiv.innerHTML = html;
});
```
