import events = require('events');

/**
 * 所有系统模块的父类
 * 服务模块除了要实现start()与destroy()之外，还要实现error事件
 */
export default abstract class BaseModule extends events.EventEmitter {

    // 启动任务
    abstract start(): Promise<void>;

    // 销毁任务
    destroy(): Promise<void>{
        return Promise.resolve();
    }
}