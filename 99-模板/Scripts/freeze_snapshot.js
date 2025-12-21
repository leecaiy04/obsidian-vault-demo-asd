/**
 * QuickAdd Script: Freeze Dataview to Static Snapshot
 *
 * 功能：
 * 1. 读取当前文件内容。
 * 2. 查找 ```dataview 代码块，并使用 Dataview API 执行查询，获取 Markdown 结果。
 * 3. 用静态结果替换代码块。
 * 4. 另存为带时间戳的快照文件到 _Archive 目录。
 *
 * 限制：
 * - 目前仅支持 DQL (```dataview) 的静态化。
 * - ```dataviewjs 块将保持原样（因为 JS 渲染通常涉及 DOM 操作，难以直接转为 Markdown 文本）。
 */

module.exports = async (params) => {
    const { app, quickAddApi } = params;
    const activeFile = app.workspace.getActiveFile();

    if (!activeFile) {
        new Notice("❌ 未检测到活动文件");
        return;
    }

    // 检查 Dataview 插件是否可用
    const dv = app.plugins.plugins.dataview?.api;
    if (!dv) {
        new Notice("❌ Dataview 插件未启用或 API 不可用");
        return;
    }

    new Notice("⏳ 正在生成静态快照...");

    // 1. 准备文件名和路径
    const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12); // YYYYMMDDHHmm
    const snapshotName = `${activeFile.basename}_Snapshot_${timestamp}.${activeFile.extension}`;
    const parentPath = activeFile.parent.path;
    const archiveFolder = `${parentPath}/_Archive`;

    // 确保归档目录存在
    if (!app.vault.getAbstractFileByPath(archiveFolder)) {
        await app.vault.createFolder(archiveFolder);
    }
    const snapshotPath = `${archiveFolder}/${snapshotName}`;

    // 2. 读取并处理内容
    let content = await app.vault.read(activeFile);
    
    // 正则匹配 ```dataview 块
    const regex = /```dataview\s*\n([\s\S]*?)\n```/g;
    let newContent = "";
    let lastIndex = 0;
    let match;

    try {
        while ((match = regex.exec(content)) !== null) {
            // 将匹配前的文本添加到新内容中
            newContent += content.substring(lastIndex, match.index);
            
            const query = match[1];
            let replacement = match[0]; // 默认保留原样（如果查询失败）

            try {
                // 使用 Dataview API 执行查询并获取 Markdown
                const result = await dv.queryMarkdown(query, activeFile.path);
                
                if (result.successful) {
                    replacement = result.value;
                    // 如果结果为空，给一个提示
                    if (!replacement.trim()) {
                        replacement = "> [!info] Snapshot: Query returned no results.\n";
                    }
                } else {
                    replacement = `> [!warn] Snapshot: Dataview Query Error\n> ${result.error}\n\n${match[0]}`;
                }
            } catch (queryError) {
                console.error("Dataview query failed:", queryError);
                replacement = `> [!error] Snapshot: Script Error\n> ${queryError.message}\n\n${match[0]}`;
            }

            newContent += replacement + "\n"; // 保持一个换行
            lastIndex = regex.lastIndex;
        }
        // 添加剩余内容
        newContent += content.substring(lastIndex);

    } catch (e) {
        new Notice(`❌ 处理 Dataview 失败: ${e.message}`);
        console.error(e);
        return;
    }

    // 3. 写入新文件
    try {
        const snapshotFile = await app.vault.create(snapshotPath, newContent);
        
        // 4. 更新 Frontmatter (标记为快照)
        await app.fileManager.processFrontMatter(snapshotFile, (frontmatter) => {
            frontmatter["type"] = "快照";
            frontmatter["status"] = "归档";
            frontmatter["snapshot_source"] = `[[${activeFile.basename}]]`;
            frontmatter["snapshot_date"] = timestamp;
            // 可以在这里移除一些不需要的属性，如 aliases 等
        });

        new Notice(`✅ 快照已保存: ${snapshotName}`);
        
        // 可选：打开新生成的快照文件
        // await app.workspace.openLinkText(snapshotPath, "", true);

    } catch (e) {
        new Notice(`❌ 保存文件失败: ${e.message}`);
    }
};
