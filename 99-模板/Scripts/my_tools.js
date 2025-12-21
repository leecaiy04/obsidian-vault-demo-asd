/**
 * Templater User Script 示例
 * 函数必须通过 module.exports 导出
 */

function generateID() {
    // 生成一个随机的 6 位字符串 ID
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function formatTitle(title, type) {
    // 简单的格式化逻辑
    const date = window.moment().format("YYMMDD");
    return `${date}-${type}-${title}`;
}

// 导出函数 (如果是单个函数直接 module.exports = func)
// 如果是多个函数，建议导出对象，或者每个文件只放一个函数
module.exports = {
    generateID,
    formatTitle
};
