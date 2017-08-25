import events = require('events');

/**
 * 所有系统模块的父类
 */
export default abstract class BaseModule extends events.EventEmitter {

    // 启动任务
    abstract start(): Promise<void>;

    // 销毁任务
    destroy(): Promise<void>{
        return Promise.resolve();
    }
}