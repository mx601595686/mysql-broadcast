/**
 * 服务出现异常时如何处理
 */
const enum ServiceOnError {
    /**
     * 只打印到控制台
     */
    printToConsole,
    /**
     * 将错误消息保存到数据库，并打印到控制台
     */
    saveToDB,
    /**
     * 关闭整个系统，并打印到控制台
     */
    shutdown
}

export default ServiceOnError;