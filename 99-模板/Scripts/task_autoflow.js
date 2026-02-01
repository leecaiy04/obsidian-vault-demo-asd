class TaskAutoflow {
    constructor(app, dv) {
        this.app = app;
        this.dv = dv;

        // 定义分类到文件夹的映射
        this.typeToFolder = {
            "审批": "30-业务档案/01-工作-审批",
            "要素": "30-业务档案/02-工作-要素争取",
            "投资条线": "30-业务档案/04-工作-投资条线",
            "财务": "30-业务档案/03-工作-财务",
            "全生命周期": "30-业务档案/05-全生命周期",
            "上级检查": "30-业务档案/06-上级检查",
            "OA及交办": "30-业务档案/07-OA及交办",
            "铁路": "30-业务档案/08-铁路",
            "小白球": "30-业务档案/09-个人-小白球",
            "其他": "30-业务档案/其他"
        };
    }

    /**
     * 渲染控制面板
     */
    renderControls() {
        const container = this.dv.container;
        const file = this.app.workspace.getActiveFile();
        if (!file) return;

        // 样式
        const style = `padding: 4px 12px; margin-right: 8px; border-radius: 4px; border: 1px solid var(--background-modifier-border); cursor: pointer;`;

        // 1. 状态流转按钮
        this.dv.header(3, "⚡️ 状态流转");
        const statusContainer = this.dv.el("div", "", { cls: "status-buttons" });

        const statuses = ["进行中", "阻塞", "已完成", "取消"];
        statuses.forEach(status => {
            const btn = statusContainer.createEl("button", { text: status });
            btn.setAttribute("style", style);
            if (this.dv.current().status === status) {
                btn.setAttribute("style", style + "background-color: var(--interactive-accent); color: var(--text-on-accent);");
            }
            btn.onclick = async () => {
                await this.updateStatus(file, status);
            };
        });

        // 2. 归档按钮
        this.dv.header(3, "🗂️ 归档操作");
        const archiveBtn = this.dv.el("button", "📥 把本文件归档到业务文件夹");
        archiveBtn.setAttribute("style", style + "background-color: var(--text-accent); color: var(--text-normal); font-weight: bold;");
        archiveBtn.onclick = async () => {
            await this.archiveFile(file);
        };
    }

    /**
     * 更新状态
     */
    async updateStatus(file, newStatus) {
        await this.app.fileManager.processFrontMatter(file, (fm) => {
            fm.status = newStatus;
            fm.updated = moment().format("YYYY-MM-DD HH:mm");
        });
        new Notice(`状态已更新为: ${newStatus}`);
        // 刷新页面以显示更改
        // this.app.commands.executeCommandById("dataview:dataview-force-refresh-views");
    }

    /**
     * 归档文件
     */
    async archiveFile(file) {
        // 读取 Frontmatter
        const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
        if (!fm) {
            new Notice("无法读取文档元数据 (Type/Area)");
            return;
        }

        const type = fm.type || "其他";
        const area = fm.area || "其他";

        let targetDirPath = this.typeToFolder[type] || "30-业务档案";

        // 智能匹配子目录
        // 尝试查找包含 area 名称的子文件夹
        const parentFolder = this.app.vault.getAbstractFileByPath(targetDirPath);
        if (parentFolder && parentFolder.children) {
            const subFolder = parentFolder.children.find(f => f.children && f.name.includes(area));
            if (subFolder) {
                targetDirPath = subFolder.path;
            } else if (area && area !== "其他" && area !== type) {
                // 如果没有找到现有文件夹，则追加路径 (在移动时建立)
                targetDirPath = `${targetDirPath}/${area}`;
            }
        }

        // 确保目录存在
        await this.ensureFolder(targetDirPath);

        // 移动文件
        const newPath = `${targetDirPath}/${file.name}`;

        if (file.path === newPath) {
            new Notice("文件已经在目标目录中");
            return;
        }

        // 检查重名
        if (this.app.vault.getAbstractFileByPath(newPath)) {
            new Notice(`错误：目标目录已存在同名文件 \n${newPath}`);
            return;
        }

        await this.app.fileManager.renameFile(file, newPath);
        new Notice(`已归档到: ${targetDirPath}`);
    }

    async ensureFolder(path) {
        const folders = path.split("/");
        let currentPath = "";
        for (const folder of folders) {
            currentPath += (currentPath ? "/" : "") + folder;
            if (!this.app.vault.getAbstractFileByPath(currentPath)) {
                await this.app.vault.createFolder(currentPath);
            }
        }
    }
}
