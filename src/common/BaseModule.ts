import events = require('events');

export default abstract class BaseModule extends events.EventEmitter {

    // 启动任务
    abstract start(): Promise<void>;

    // 销毁任务
    destroy(): Promise<void>{
        return Promise.resolve();
    }
}