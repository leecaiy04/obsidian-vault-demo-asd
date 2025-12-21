module.exports = async (params) => {
    const { quickAddApi, app } = params;
    
    // --- 配置区域 ---
    const rootFolder = '30-业务档案';
    const dailyFolder = '20-日志/01-Daily';
    const templatePath = '99-模板/工作流子模板/工作任务卡.md';
    // ----------------
    
    // 1. 获取所有业务子文件夹 (排除归档和附件)
    const allFiles = app.vault.getAllLoadedFiles();
    const folders = allFiles.filter(f => 
        f.children && 
        f.path.startsWith(rootFolder) && 
        !f.path.includes('_Archive') && 
        !f.path.includes('附件')
    ).map(f => f.path);

    // 2. 弹窗选择归档目录
    const selectedFolder = await quickAddApi.suggester(folders, folders);
    if (!selectedFolder) return;

    // 3. 输入任务名称
    const fileName = await quickAddApi.inputPrompt("输入工作任务名称");
    if (!fileName) return;

    // 4. 构建路径和文件名 (格式: 项目名-日期)
    const dateStr = window.moment().format('YYYY-MM-DD');
    const safeName = fileName.replace(/[\\/:*?"<>|]/g, ""); // 简单的文件名净化
    const fullPath = \\/\-\.md\;

    // 5. 创建文件 (使用 Templater 或 QuickAdd API)
    const fileExists = await app.vault.getAbstractFileByPath(fullPath);
    if (fileExists) {
        new Notice("文件已存在: " + fullPath);
        return;
    }
    
    // 创建空文件
    const newFile = await app.vault.create(fullPath, '');
    
    // 6. 应用模板 (如果有 Templater，建议在这里触发 Templater，这里简化为读取模板内容写入)
    const tFile = app.vault.getAbstractFileByPath(templatePath);
    if (tFile) {
        let tContent = await app.vault.read(tFile);
        // 简单的变量替换
        tContent = tContent.replace('{{date}}', dateStr).replace('{{VALUE:fileName}}', fileName);
        await app.vault.modify(newFile, tContent);
    }

    // 7. 打开新文件
    await app.workspace.getLeaf(true).openFile(newFile);

    // 8. 回写到今日日记
    const dailyPath = \\/\.md\;
    let dailyFile = app.vault.getAbstractFileByPath(dailyPath);
    
    if (dailyFile) {
        const linkText = \- [ ] [[\|\]]\;
        let content = await app.vault.read(dailyFile);
        const header = "## 💼 具体工作";
        
        if (content.includes(header)) {
            content = content.replace(header, \\\n\\);
        } else {
            content += \\n\n\\n\\;
        }
        await app.vault.modify(dailyFile, content);
        new Notice(\已创建任务并链接到日记: \\);
    } else {
        new Notice("未找到今日日记，仅创建了任务文件。");
    }
}
