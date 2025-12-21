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

    const inboxPath = "00-Inbox";
    const inboxFolder = app.vault.getAbstractFileByPath(inboxPath);
    if (!inboxFolder) { new Notice(`⚠️ 未找到 "${inboxPath}" 文件夹`); return; }

    const files = inboxFolder.children.filter(f => f.extension === "md");
    if (files.length === 0) { new Notice("ℹ️ Inbox 已空"); return; }

    new Notice(`🚚 开始归档 Inbox，共 ${files.length} 个文件`);

    let successCount = 0;
    let skipCount = 0;
    let missingMeta = 0;
    let missingFolder = 0;
    let conflict = 0;

    for (const file of files) {
        const result = await archiveFile(app, file);
        if (result === true) successCount++;
        else {
            skipCount++;
            if (result === "meta") missingMeta++;
            else if (result === "folder") missingFolder++;
            else if (result === "conflict") conflict++;
        }
    }

    new Notice(`✅ 完成：成功 ${successCount}，跳过/失败 ${skipCount}\n缺元数据:${missingMeta} 缺目录:${missingFolder} 重名:${conflict}`);
};

async function archiveFile(app, file) {
    const cache = app.metadataCache.getFileCache(file);
    const frontmatter = cache?.frontmatter;
    const type = frontmatter?.type || frontmatter?.category;
    const area = frontmatter?.area || frontmatter?.category;
    if (!type) return "meta";

    const typeFolder = TYPE_FOLDER_MAP[type] || TYPE_FOLDER_MAP["其他"];
    if (!typeFolder) return "folder";

    const typePath = `${ARCHIVE_ROOT}/${typeFolder}`;
    let finalFolder = app.vault.getAbstractFileByPath(typePath);
    if (!finalFolder) {
        const create = await confirmCreate(`缺少目录：${typePath}\n是否创建？`);
        if (!create) return "folder";
        await ensureFolder(app, typePath);
        finalFolder = app.vault.getAbstractFileByPath(typePath);
        if (!finalFolder) return "folder";
    }

    const areaRel = AREA_FOLDER_MAP[type]?.[area];
    if (areaRel && areaRel !== ".") {
        const candidatePath = `${typePath}/${areaRel}`;
        let candidateFolder = app.vault.getAbstractFileByPath(candidatePath);
        if (candidateFolder) finalFolder = candidateFolder;
        else {
            const createArea = await confirmCreate(`缺少目录：${candidatePath}\n是否创建？`);
            if (createArea) {
                await ensureFolder(app, candidatePath);
                const newFolder = app.vault.getAbstractFileByPath(candidatePath);
                if (newFolder) finalFolder = newFolder;
            }
        }
    }

    const attachments = getAttachments(app, file);
    const targetPath = `${finalFolder.path}/${file.name}`;
    if (file.path === targetPath) return true;
    if (app.vault.getAbstractFileByPath(targetPath)) return "conflict";

    try {
        await app.fileManager.renameFile(file, targetPath);

        if (attachments.length > 0) {
            const attachFolderPath = `${finalFolder.path}/附件`;
            await ensureFolder(app, attachFolderPath);
            for (const att of attachments) {
                const attTarget = `${attachFolderPath}/${att.name}`;
                if (att.path === attTarget) continue;
                if (app.vault.getAbstractFileByPath(attTarget)) continue;
                await app.fileManager.renameFile(att, attTarget);
            }
        }
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

function getAttachments(app, file) {
    const links = app.metadataCache.resolvedLinks[file.path] || {};
    return Object.keys(links)
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

// 简单确认弹窗（QuickAdd 用户脚本环境可用）
function confirmCreate(message) {
    return new Promise((resolve) => {
        const choice = window.confirm(message);
        resolve(choice);
    });
}
