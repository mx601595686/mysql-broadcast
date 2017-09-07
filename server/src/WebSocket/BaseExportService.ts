import { log, ServiceModule } from "service-starter";
import WebSocket from './WebSocket';
import ws = require('ws');

/**
 * 所有使用websocket向外提供服务的基类
 */
export default abstract class BaseExportService extends ServiceModule {

    protected get _sockets() {
        return (this.services.WebSocket as WebSocket).sockets;
    }

    // 保存向外提供服务的方法，通过本类的export方法进行注册
    private readonly _exportMethod: Map<string, Function> = new Map();

    async onStart(): Promise<void> {
        this.services.WebSocket.on('new_socket', (id: number, socket: ws) => {
            socket.on("message", async (data: any, callback: Function) => {
                console.log(data, callback);
                try {
                    const result = await func(data, socket);
                    callback(undefined, result);
                } catch (error) {
                    callback(error.toString());
                }
            });

            this.onConnection(id, socket);
        });

        this.services.WebSocket.on('close_socket', this.onDisconnect.bind(this));

        // 根据暴露的服务方法名注册服务
        for (let [name, func] of this._exportMethod.entries()) {
            console.log(name, func);

        }
    }

    onStop(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.nsp = undefined;
            this.socketList.clear();
            resolve();
        });
    }

    /**
     * 向外暴露服务
     * 
     * @protected
     * @param {Function} name 要注册的服务名称
     * @param {Function} func 要注册的服务
     * @returns {Function} 
     */
    protected export(name: string, func: Function): Function {
        this._exportMethod.set(name, func);
        return func;
    }

    /**
     * 当有新的接口连接上的时候
     * 
     * @protected
     * @param {number} id 接口的id
     * @param {ws} socket 接口
     */
    protected onConnection(id: number, socket: ws) { }

    /**
     * 当有接口断开连接的时候
     * 
     * @protected
     * @param {number} id 接口的id
     * @param {ws} socket 接口
     */
    protected onDisconnect(id: number, socket: ws) { }
}