import { log, ServiceModule } from "service-starter";
import WebSocket from './WebSocket';


/**
 * 所有使用websocket向外提供服务的基类
 */
export default abstract class BaseExportService extends ServiceModule {

    private get _ws() {
        return (this.services.WebSocket as WebSocket).ws;
    }

    // 保存向外提供服务的方法，通过本类的export方法进行注册
    private readonly _exportMethod: Map<string, Function> = new Map();

    /**
     * 当前的socket.io命名空间，命名空间默认是服务名
     * 
     * @protected
     * @type {SocketIO.Namespace}
     */
    protected nsp: SocketIO.Namespace | undefined;

    /**
     * 保存建立上连接的接口列表。key是socket.id
     * 
     * @protected
     * @type {Map<string, SocketIO.Socket>}
     */
    protected socketList: Map<string, SocketIO.Socket> = new Map();

    onStart(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.nsp = this._ws.of(`/${this.name}`);

            this.nsp.on('connection', (socket) => {
                this.socketList.set(socket.id, socket);

                this.onConnection(socket);

                // 根据暴露的服务方法名注册服务
                for (let [name, func] of this._exportMethod.entries()) {
                    socket.on(name, async (data: any, callback: Function) => {
                        try {
                            const result = await func(data, socket);
                            callback(result);
                        } catch (error) {
                            callback(error.toString());
                        }
                    });
                }

                socket.on('disconnet', () => {
                    this.socketList.delete(socket.id);
                    this.onDisconnect(socket);
                });
            });

            resolve();
        });
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
     * @param {SocketIO.Socket} socket 新的连接
     */
    protected onConnection(socket: SocketIO.Socket) { }

    /**
     * 当有接口断开连接的时候
     * 
     * @protected
     * @param {SocketIO.Socket} socket 要被断开的连接
     */
    protected onDisconnect(socket: SocketIO.Socket) { }
}