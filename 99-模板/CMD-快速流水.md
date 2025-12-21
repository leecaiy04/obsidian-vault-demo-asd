<%*
// 1. 弹出输入框
const input = await tp.system.prompt("✍️ 快速记录今日流水 (ESC取消)");

// 如果用户没输入或取消，直接退出，不报错
if (!input) return;

// 2. 准备数据
const time = tp.date.now("HH:mm");
const today = tp.date.now("YYYY-MM-DD");
// 格式化流水内容：换行 + 列表符 + 时间 + 输入内容
const logItem = `\n- ${time} ${input}`;
// 目标文件夹 (请确保和你之前的设置一致)
const targetFolder = "20-日志/01-Daily";

// 3. 寻找今天的日记文件
// tp.file.find_tfile 会在整个库里搜，为了精准，我们最好指定路径逻辑
// 这里简化逻辑：直接搜文件名
let tFile = tp.file.find_tfile(today);

// 4. 如果没找到今天的日记 (比如早上还没点日历)
if (!tFile) {
    new Notice("❌ 今天的日记还没创建！请先点击日历生成。");
    return;
}

// 5. 修改文件内容 (核心步骤)
// app.vault.process 是最安全修改文件的方法
await app.vault.process(tFile, (content) => {
    // 定义我们要插入的锚点标题 (要和你 TP-Daily 模板里的一模一样)
    const targetHeader = "## 📝 工作流水";

    if (content.includes(targetHeader)) {
        // 如果找到了标题，把新内容插在标题的紧下方
        return content.replace(targetHeader, `${targetHeader}${logItem}`);
    } else {
        // 如果万一找不到标题，就追加到文件最末尾
        return content + `\n\n${targetHeader}${logItem}`;
    }
});

// 6. 成功提示
new Notice(`✅ 已记录：${input}`);
%>