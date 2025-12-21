// ============================================================
//  归档 + 同步到日记（基于 type + area 路径规则）
// ============================================================

// 日记配置
const DAILY_NOTE_FOLDER = "20-日志/01-Daily";
const DATE_FORMAT = "YYYY-MM-DD";

// 归档路径配置
const ARCHIVE_ROOT = "30-业务档案";
const TYPE_FOLDER_MAP = {
    "审批": "01-工作-审批",
    "要素": "02-工作-要素争取",
    "全生命周期": "03-工作-全生命周期",
    "上级检查": "04-工作-投资条线",
    "OA及交办": "06-工作-交办任务",
    "财务": "05-工作-财务事项",
    "铁路": "04-工作-投资条线/01-铁路",
    "其他": "07-工作-政策"
};

// 领域映射到子目录（不存在则停在 type 目录）
const AREA_FOLDER_MAP = {
    "审批": {
        "可研": "01-可研",
        "初步设计": "02-初步设计",
        "备案": "03-备案",
        "前期计划": "04-前期计划"
    },
    "要素": {
        "整体": "00-整体情况",
        "专项债": "01-专项债",
        "政策性金融工具": "02-政策性金融工具",
        "国债-两重": "03-超长期国债-两重",
        "国债-两新": "04-超长期国债-两新",
        "预算内": "05-预算内投资"
    },
    "上级检查": {
        "LTGS": "03-ltgs"
    },
    "铁路": {
        "铁路": "."
    }
};

module.exports = async (params) => {
    const { app } = params;
    const file = app.workspace.getActiveFile();
    
    if (!file) { new Notice("⚠️ 未找到活动文件"); return; }

    new Notice(`🚚 开始处理：${file.basename}`);

    // 1. 同步到日记
    await syncToDailyNote(app, file);

    // 2. 移动归档
    await archiveFile(app, file);
};

// --- 功能 A: 同步到日记 ---
async function syncToDailyNote(app, file) {
    const content = await app.vault.read(file);
    
    const sections = [
        { header: "## 今日待办", label: "待办" },
        { header: "## 工作流水", label: "流水" },
        { header: "## 每日反思", label: "反思" }
    ];

    let extractedText = "";

    for (const sec of sections) {
        const regex = new RegExp(`${sec.header}([\\s\\S]*?)(?=(^## |\\z))`, "m");
        const match = content.match(regex);
        
        if (match && match[1]) {
            const text = match[1].trim();
            if (text && text !== "- [ ]" && text !== "- [ ] ") {
                extractedText += `> **${sec.label}**\n${text}\n\n`;
            }
        }
    }

    if (!extractedText) {
        new Notice("ℹ️ 待办/流水/反思为空，跳过日记同步");
        return;
    }

    const todayDate = window.moment().format(DATE_FORMAT);
    const dailyNotePath = `${DAILY_NOTE_FOLDER}/${todayDate}.md`;
    
    let dailyFile = app.vault.getAbstractFileByPath(dailyNotePath);

    if (!dailyFile) {
        try {
            if (!app.vault.getAbstractFileByPath(DAILY_NOTE_FOLDER)) {
                await app.vault.createFolder(DAILY_NOTE_FOLDER);
            }
            dailyFile = await app.vault.create(dailyNotePath, `# ${todayDate}\n\n`);
            new Notice("✅ 已创建当日日记");
        } catch (e) {
            new Notice(`⚠️ 创建日记失败：${e.message}`);
            return;
        }
    }

    const appendContent = `\n### 🗂️ [[${file.basename}]] 归档摘要\n${extractedText}\n---`;
    
    try {
        await app.vault.append(dailyFile, appendContent);
        new Notice("✅ 内容已写入日记");
    } catch (e) {
        new Notice(`⚠️ 写入日记出错：${e.message}`);
    }
}

// --- 功能 B: 移动归档 (type + area 路径) ---
async function archiveFile(app, file) {
    const cache = app.metadataCache.getFileCache(file);
    const frontmatter = cache?.frontmatter;
    
    if (!frontmatter || !frontmatter.type) {
        new Notice(`⚠️ 缺少 type 属性，无法归档`);
        return;
    }

    const type = frontmatter.type;
    const area = frontmatter.area;

    const typeFolder = TYPE_FOLDER_MAP[type] || TYPE_FOLDER_MAP["其他"];
    if (!typeFolder) { new Notice(`⚠️ 未配置类型目录：${type}`); return; }

    const typePath = `${ARCHIVE_ROOT}/${typeFolder}`;
    let finalFolder = app.vault.getAbstractFileByPath(typePath);
    if (!finalFolder) { new Notice(`⚠️ 找不到目录：${typePath}`); return; }

    const areaRel = AREA_FOLDER_MAP[type]?.[area];
    if (areaRel && areaRel !== ".") {
        const candidatePath = `${typePath}/${areaRel}`;
        const candidateFolder = app.vault.getAbstractFileByPath(candidatePath);
        if (candidateFolder) finalFolder = candidateFolder;
    }

    // 记录附件（非 md 文件）
    const attachments = getAttachments(app, file);

    const targetPath = `${finalFolder.path}/${file.name}`;
    if (file.path === targetPath) { new Notice("ℹ️ 已在目标目录，无需移动"); return; }

    if (app.vault.getAbstractFileByPath(targetPath)) {
        new Notice(`⚠️ 目标存在同名文件：${targetPath}`);
        return;
    }

    // 先移动笔记
    await app.fileManager.renameFile(file, targetPath);

    // 再移动附件到 目标/附件
    if (attachments.length > 0) {
        const attachFolderPath = `${finalFolder.path}/附件`;
        await ensureFolder(app, attachFolderPath);

        for (const att of attachments) {
            const attTarget = `${attachFolderPath}/${att.name}`;
            if (att.path === attTarget) continue;
            if (app.vault.getAbstractFileByPath(attTarget)) {
                new Notice(`⚠️ 附件同名存在，跳过：${att.name}`);
                continue;
            }
            await app.fileManager.renameFile(att, attTarget);
        }
    }

    new Notice(`✅ 归档完成：${targetPath}`);
}

// 收集当前文件引用的附件（非 md）
function getAttachments(app, file) {
    const links = app.metadataCache.resolvedLinks[file.path] || {};
    const paths = Object.keys(links);
    return paths
        .map(p => app.vault.getAbstractFileByPath(p))
        .filter(f => f && f.extension && f.extension.toLowerCase() !== "md");
}

async function ensureFolder(app, folderPath) {
    if (app.vault.getAbstractFileByPath(folderPath)) return;
    const parts = folderPath.split("/");
    let current = "";
    for (const part of parts) {
        current = current ? `${current}/${part}` : part;
        if (!app.vault.getAbstractFileByPath(current)) {
            await app.vault.createFolder(current);
        }
    }
}
