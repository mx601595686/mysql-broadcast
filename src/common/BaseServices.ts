import events = require('events');

/**
 * 所有系统服务的父类
 * 服务除了要实现start()与destroy()之外，还要实现error事件
 */
export default abstract class BaseServices extends events.EventEmitter {

    // 启动服务
    abstract start(): Promise<void>;

    // 获取服务的名称
    get name(): string {
        return this.constructor.name;
    }

    // 终止服务
    stop(): Promise<void> {
        return Promise.resolve();
    }
}