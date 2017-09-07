import { log, ServiceModule } from "service-starter";
import ws = require('ws');

/**
 * 向外界提供websocket服务接口。
 * 暴露在3000端口
 * 
 * @export
 * @class WebSocket
 * @extends {ServiceModule}
 */
export default class WebSocket extends ServiceModule {

    private _ws: ws.Server | undefined;

    // 用于给接口编号
    private _socketNumber = 0;

    // 保存建立上连接的接口
    readonly sockets = new Map<number, ws>();

    onStart(): Promise<void> {
        return new Promise((resolve, reject) => {
            const _ws = new ws.Server({ port: 3000 }, (err: Error) => {
                if (err) {
                    reject(err);
                } else {
                    this._ws = _ws;
                    this._ws.on('error', this.emit.bind(this, 'error'));
                    this._ws.on('connection', (socket) => {
                        socket.once('open', () => {
                            const id = this._socketNumber++;
                            (<any>socket).id = id;  // 给socket标记一个id
                            this.sockets.set(id, socket);

                            //通知有新的连接建立了
                            this.emit('new_socket', id, socket);

                            socket.on("close", () => {
                                this.emit('close_socket', id, socket);
                                this.sockets.delete(id);
                            });
                        });
                    });
                    resolve();
                }
            });
        });
    }

    onStop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._ws) {
                this._ws.close(() => {
                    this._ws = undefined;
                    this.sockets.clear();
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}
