import { log, ServiceModule } from "service-starter";
import http = require('http');
import io = require('socket.io');

/**
 * 向外界提供websocket服务接口。
 * 暴露在3000端口
 * 
 * @export
 * @class WebSocket
 * @extends {ServiceModule}
 */
export default class WebSocket extends ServiceModule {

    private _ws: SocketIO.Server | undefined;
    private _http: http.Server | undefined;

    get ws() {
        if (this._ws === undefined)
            throw new Error('发现有服务在WebSocket启动之前就尝试获取连接')
        return this._ws;
    }

    onStart(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._http = http.createServer()
            this._ws = io(this._http, { serveClient: false });
            this._http.listen(3000, (err: Error) => {
                err ? reject(err) : resolve();
            });
        });
    }

    onStop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._ws) {
                this._ws.close(() => {
                    this._ws = undefined;
                    this._http = undefined;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}
