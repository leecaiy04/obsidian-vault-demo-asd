/**
 * QuickAdd 脚本：更新当前文件的状态
 * 
 * 使用方法：
 * 1. 在 QuickAdd Macro 中添加此脚本
 * 2. 在按钮调用时传递参数（如 "进行中", "已完成", "归档"）
 */

module.exports = async (params) => {
    const { app, quickAddApi } = params;
    const activeFile = app.workspace.getActiveFile();

    if (!activeFile) {
        new Notice("没有打开的文件");
        return;
    }

    // 获取目标状态（从参数传递，或弹出选择框）
    let targetStatus = params.variables["targetStatus"];
    
    if (!targetStatus) {
        const options = ["未开始", "进行中", "阻塞", "已完成", "归档", "取消"];
        targetStatus = await quickAddApi.suggester(options, options);
    }

    if (!targetStatus) return;

    // 使用 Obsidian 官方 API 更新 YAML
    await app.fileManager.processFrontMatter(activeFile, (frontmatter) => {
        frontmatter["status"] = targetStatus;
        frontmatter["updated"] = String(new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'));

        // 如果标记为已完成，自动填入完成日期
        if (targetStatus === "已完成") {
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            frontmatter["completedDate"] = dateStr;
        }
        
        // 如果是归档，也可以做额外处理
        if (targetStatus === "归档") {
            frontmatter["archived"] = true;
        }
    });

    new Notice(`状态已更新为: ${targetStatus}`);
};
