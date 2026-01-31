<%*
// ===============================================================
//  工作流主控脚本 (QuickAdd + Templater)
//  需求来源：99-文档/工作流.md
// ===============================================================

const TEMPLATE_DIR = "99-模板/工作流子模板";
const typeOptions = ["审批", "要素", "全生命周期", "上级检查", "OA及交办", "财务", "铁路", "小白球", "其他"];
const areaOptionsMap = {
    "审批": ["可研", "初步设计", "备案", "核准", "前期计划", "其他"],
    "要素": ["整体", "国债-两重", "国债-两新", "预算内", "专项债"],
    "全生命周期": ["全生命周期"],
    "上级检查": ["LTGS", "GEF", "要素督导"],
    "OA及交办": ["OA答复", "交办事项"],
    "财务": ["可研、概算支付", "下达资金管理支付"],
    "铁路": ["铁路"],
    "小白球": ["日常练习", "比赛", "装备"],
    "其他": ["其他"]
};
const statusOptions = ["未开始", "进行中", "阻塞", "已完成", "归档", "取消"];
const priorityOptions = ["高", "中", "低"];
const tagOptions = ["work", "personal"];

// 标题处理：优先取文件名去掉日期前缀，其次用户输入
const rawFileTitle = tp.file.title || "";
const defaultTitle = rawFileTitle.replace(/^\d{8}-/, "");
const inputTitle = await tp.system.prompt("输入标题（将写入正文）", defaultTitle || "");
const noteTitle = inputTitle || defaultTitle || "未命名";

// 选择类型与领域
const selectedType = await tp.system.suggester(typeOptions, typeOptions, false, "选择类型");
if (!selectedType) { new Notice("已取消：未选择类型"); return; }

const areas = areaOptionsMap[selectedType] || ["其他"];
const selectedArea = await tp.system.suggester(areas, areas, false, `选择「${selectedType}」领域`) || areas[0];

// 选择属性
const selectedStatus = await tp.system.suggester(statusOptions, statusOptions, false, "状态") || "未开始";
const selectedPriority = await tp.system.suggester(priorityOptions, priorityOptions, false, "重要性") || "低";

// 标签处理：选择或输入关联话题
const topicOptions = ["新能源", "数字化", "年终检查", "专项债", "十四五", "手动输入 (新建话题)", "无话题"];
const selectedTopicOption = await tp.system.suggester(topicOptions, topicOptions, false, "选择关联话题 (Topic)") || "无话题";

let inputTopic = "";
if (selectedTopicOption === "手动输入 (新建话题)") {
    inputTopic = await tp.system.prompt("请输入新话题名称 (无需加#)", "");
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
const dailyLine = `- ${tp.date.now("HH:mm")} [[${tp.file.title}]] (${selectedType}/${selectedArea}) ${selectedPriority}`;

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

// 自动归档逻辑：根据类型和领域移动文件
const typeToFolder = {
    "审批": "30-业务档案/01-工作-审批",
    "要素": "30-业务档案/02-工作-要素争取",
    "投资条线": "30-业务档案/04-工作-投资条线",
    "财务": "30-业务档案/03-工作-财务",
    "全生命周期": "30-业务档案/05-全生命周期",
    "上级检查": "30-业务档案/06-上级检查",
    "OA及交办": "30-业务档案/07-OA及交办",
    "铁路": "30-业务档案/08-铁路",
    "小白球": "30-业务档案/09-个人-小白球"
};

let targetDirPath = typeToFolder[selectedType] || "30-业务档案";

// 尝试匹配子文件夹 (例如 selectedArea 为 "可研"，匹配 "01-可研")
const parentFolder = app.vault.getAbstractFileByPath(targetDirPath);
if (parentFolder && parentFolder.children) {
    const subFolder = parentFolder.children.find(f => f.children && f.name.includes(selectedArea));
    if (subFolder) {
        targetDirPath = subFolder.path;
    } else if (selectedArea && selectedArea !== "其他" && selectedArea !== selectedType) {
        // 如果是特定领域但没找到现有文件夹，则准备创建
        targetDirPath = `${targetDirPath}/${selectedArea}`;
    }
}

// 确保目标文件夹存在
async function ensureFolder(path) {
    const folders = path.split("/");
    let currentPath = "";
    for (const folder of folders) {
        currentPath += (currentPath ? "/" : "") + folder;
        if (!app.vault.getAbstractFileByPath(currentPath)) {
            await app.vault.createFolder(currentPath);
        }
    }
}

await ensureFolder(targetDirPath);

// 执行移动 (Templater 会在渲染后处理，或直接调用 vault API)
const newPath = `${targetDirPath}/${tp.file.title}`;
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

# <% noteTitle %>

<%* tR += templateContent %>

---
## 今日待办


## 工作流水

## 每日反思


---
> [!example]- 归档操作区
> 文档处理完毕后，选择以下操作 (会自动同步待办/流水/反思到日记)：
> 
> - ```button
> name 本文件归档
> type command
> action QuickAdd: 归档本文件
> class obsidian-button-primary
> ```
> - ```button
> name 全部归档
> type command
> action QuickAdd: 归档00Inbox所有文件
> class obsidian-button-danger
> ```
