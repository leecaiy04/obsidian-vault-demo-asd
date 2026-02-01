<%*
// ===============================================================
//  工作流主控脚本 (QuickAdd + Templater)
//  需求来源：99-文档/工作流.md
// ===============================================================

const TEMPLATE_DIR = "99-模板/工作流子模板";
const typeOptions = ["审批", "要素", "全生命周期", "上级检查", "OA及交办", "财务", "铁路", "小白球", "其他"];
const areaOptionsMap = {
    "审批": ["可研", "初步设计", "备案", "核准", "前期计划", "其他"],
    "要素": ["整体", "国债-两重", "国债-两新", "预算内", "专项债","新型政策性金融工具"],
    "全生命周期": ["全生命周期"],
    "上级检查": ["LTGS", "GEF", "要素督导"],
    "OA及交办": ["OA答复", "交办事项"],
    "财务": ["可研、概算第三方", "下达资金管理支付"],
    "铁路": ["铁路"],
    "小白球": ["小白球回头看"],
    "其他": ["其他"]
};
const statusOptions = ["即将开始", "进行中", "阻塞", "已完成", "归档", "取消"];
const priorityOptions = ["高", "中", "低","待定"];
const tagOptions = ["work", "personal"];

// 标题处理：自动添加日期前缀 (YYYYMMDD-Title)
const rawFileTitle = tp.file.title || "";
const defaultTitle = rawFileTitle.replace(/^\d{8}-/, "");
const inputTitle = await tp.system.prompt("输入标题（将自动添加日期前缀）", defaultTitle || "");
const noteBaseTitle = inputTitle || defaultTitle || "未命名";
// 最终文件名
const finalFileName = `${tp.date.now("YYYYMMDD")}-${noteBaseTitle}`;

// 选择类型与领域
const selectedType = await tp.system.suggester(typeOptions, typeOptions, false, "选择类型");
if (!selectedType) { new Notice("已取消：未选择类型"); return; }

const areas = areaOptionsMap[selectedType] || ["其他"];
const selectedArea = await tp.system.suggester(areas, areas, false, `选择「${selectedType}」领域`) || areas[0];

// 选择属性
const selectedStatus = await tp.system.suggester(statusOptions, statusOptions, false, "状态") || "未开始";
const selectedPriority = await tp.system.suggester(priorityOptions, priorityOptions, false, "重要性") || "低";

// 标签处理：选择或输入关联话题
// 定义配置文件路径
const configPath = "99-模板/Scripts/custom_topics.json";
const defaultTopics = ["新能源", "数字化", "年终检查", "专项债", "十四五"];

// 尝试读取自定义话题
let customTopics = [];
const configFile = app.vault.getAbstractFileByPath(configPath);
if (configFile) {
    const content = await app.vault.read(configFile);
    try {
        customTopics = JSON.parse(content);
    } catch (e) {
        console.error("解析 custom_topics.json 失败", e);
    }
}

// 合并话题并去重
let topicOptions = [...new Set([...defaultTopics, ...customTopics])];
topicOptions.push("手动输入 (新建话题)");
topicOptions.push("无话题");

const selectedTopicOption = await tp.system.suggester(topicOptions, topicOptions, false, "选择关联话题 (Topic)") || "无话题";

let inputTopic = "";
if (selectedTopicOption === "手动输入 (新建话题)") {
    inputTopic = await tp.system.prompt("请输入新话题名称 (无需加#)", "");
    if (inputTopic) {
        // 保存新话题到配置文件
        if (!customTopics.includes(inputTopic)) {
            customTopics.push(inputTopic);
            if (configFile) {
                await app.vault.modify(configFile, JSON.stringify(customTopics, null, 2));
            } else {
                // 如果文件不存在，先确保 Scripts 目录存在
                const scriptDir = "99-模板/Scripts";
                const scriptFolder = app.vault.getAbstractFileByPath(scriptDir);
                if (!scriptFolder) {
                    await app.vault.createFolder(scriptDir);
                }
                await app.vault.create(configPath, JSON.stringify(customTopics, null, 2));
            }
        }
    }
} else if (selectedTopicOption !== "无话题") {
    inputTopic = selectedTopicOption;
}

const finalTags = ["work"];
if (inputTopic) {
    finalTags.push(`Topic/${inputTopic}`);
}

// 读取子模板
let templateContent = "";
const targetPath = `${TEMPLATE_DIR}/tpl-${selectedType}.md`;
let tFile = app.vault.getAbstractFileByPath(targetPath);
if (!tFile) tFile = tp.file.find_tfile("tpl-通用");

if (tFile) {
    templateContent = await app.vault.read(tFile);
} else {
    templateContent = `## 错误详情\n> [!error] 模板缺失\n> 未找到 "${targetPath}" 或 "tpl-通用"`;
}

// 记录到今日工作流水（日记）
const dailyPath = `20-日志/01-Daily/${tp.date.now("YYYY-MM-DD")}.md`;
const dailyHeader = "## 工作流水";
// 注意：这里链接的是重命名后的 finalFileName
const dailyLine = `- ${tp.date.now("HH:mm")} [[${finalFileName}]] (${selectedType}/${selectedArea}) ${selectedPriority}`;

async function ensureDailyAndAppend() {
    let dailyFile = app.vault.getAbstractFileByPath(dailyPath);
    if (!dailyFile) {
        const stub = `# ${tp.date.now("YYYY-MM-DD")}\n\n## 今日待办\n\n### 今日新增\n- [ ] \n\n## 工作流水\n\n## 每日反思\n`;
        dailyFile = await app.vault.create(dailyPath, stub);
    }
    await app.vault.process(dailyFile, (content) => {
        if (content.includes(dailyHeader)) {
            return content.replace(dailyHeader, `${dailyHeader}\n${dailyLine}`);
        }
        return `${content}\n\n${dailyHeader}\n${dailyLine}`;
    });
}

await ensureDailyAndAppend();

// 移动文件到 00-Inbox，并重命名
const targetDirPath = "00-Inbox";

// 确保目标文件夹存在
async function ensureFolder(path) {
    if (!app.vault.getAbstractFileByPath(path)) {
        await app.vault.createFolder(path);
    }
}

await ensureFolder(targetDirPath);

// 执行重命名并移动
const newPath = `${targetDirPath}/${finalFileName}`;
await tp.file.move(newPath);

_%>

---
created: <% tp.date.now("YYYY-MM-DD HH:mm") %>
updated: <% tp.date.now("YYYY-MM-DD HH:mm") %>
type: <% selectedType %>
area: <% selectedArea %>
status: <% selectedStatus %>
priority: <% selectedPriority %>
dueDate: 
completedDate: 
relatedProject: 
tags: [<% finalTags.join(", ") %>]
---

# <% noteBaseTitle %>

<%* tR += templateContent %>

---
## 今日待办


## 工作流水

## 每日反思


---
> [!info] 操作面板 (自动流转)
> 
```dataviewjs
// 加载控制脚本
const scriptPath = "99-模板/Scripts/task_autoflow.js";
const scriptFile = app.vault.getAbstractFileByPath(scriptPath);

if (scriptFile) {
    const scriptContent = await app.vault.read(scriptFile);
    // 使用 Function 构造函数或 eval 执行脚本内容
    // 这里我们简单地 eval 脚本，它定义了 TaskAutoflow 类
    eval(scriptContent);
    
    // 初始化并渲染
    const autoflow = new TaskAutoflow(app, dv);
    autoflow.renderControls();
} else {
    dv.paragraph("⚠️ 未找到控制脚本: " + scriptPath);
}
```
