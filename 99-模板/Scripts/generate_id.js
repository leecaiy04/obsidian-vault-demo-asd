// 这是一个单函数脚本，文件名即函数名：tp.user.generate_id()
module.exports = (prefix = "ID") => {
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${randomStr}`;
}
