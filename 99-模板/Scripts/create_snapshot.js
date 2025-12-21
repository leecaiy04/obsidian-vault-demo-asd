/**
 * QuickAdd 脚本：创建当前文件的快照副本
 * 
 * 功能：
 * 1. 复制当前文件内容
 * 2. 文件名追加时间戳 (如 _Snapshot_202512211530)
 * 3. 将快照移动到当前目录下的 _Archive 子文件夹
 * 4. 修改快照的 frontmatter，标记为只读/快照
 */

module.exports = async (params) => {
    const { app } = params;
    const activeFile = app.workspace.getActiveFile();

    if (!activeFile) {
        new Notice("没有打开的文件");
        return;
    }

    // 1. 生成快照文件名
    const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12); // YYYYMMDDHHmm
    const snapshotName = `${activeFile.basename}_Snapshot_${timestamp}.${activeFile.extension}`;
    
    // 2. 确定存放路径 (当前目录/_Archive)
    const parentPath = activeFile.parent.path;
    const archiveFolder = `${parentPath}/_Archive`;
    
    // 如果 _Archive 不存在，创建它
    if (!app.vault.getAbstractFileByPath(archiveFolder)) {
        await app.vault.createFolder(archiveFolder);
    }
    
    const snapshotPath = `${archiveFolder}/${snapshotName}`;

    // 3. 读取并处理内容
    let content = await app.vault.read(activeFile);
    
    // 简单处理：尝试将 frontmatter 中的 status 改为 快照
    // 注意：如果有复杂的 Dataview 查询，复制后它们仍然是动态的。
    // 如果要完全“冻结”数据，通常建议导出为 PDF 或使用专门的“Replace Dataview”命令。
    // 这里我们主要做文件级备份。
    
    // 使用 API 修改副本的元数据（先创建文件，再处理 frontmatter）
    const snapshotFile = await app.vault.create(snapshotPath, content);
    
    await app.fileManager.processFrontMatter(snapshotFile, (frontmatter) => {
        frontmatter["type"] = "快照";
        frontmatter["status"] = "归档";
        frontmatter["original"] = `[[${activeFile.basename}]]`;
        frontmatter["snapshotDate"] = timestamp;
        // 移除一些不需要的字段，或者保留原样
    });

    new Notice(`已创建快照：${snapshotName}`);
};
