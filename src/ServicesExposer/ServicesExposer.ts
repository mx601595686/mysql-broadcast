import { log, ServiceModule } from "service-starter";
import http = require('http');
import io = require('socket.io');

import QuerySql from './QuerySql';
import Broadcast from './Broadcast';
import ListenDbChanging from './ListenDbChanging';

/**
 * 向外界提供websocket服务接口。
 * 暴露在3000端口
 * 
 * @export
 * @class ServicesExposer
 * @extends {ServiceModule}
 */
export default class ServicesExposer extends ServiceModule {

    private _ws: SocketIO.Server;
    private _http: http.Server;

    private _querySql = new QuerySql(this);
    private _broadcast = new Broadcast(this);
    private _listenDbChanging = new ListenDbChanging(this);

    onStart(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._http = http.createServer()
            this._ws = io(this._http, { serveClient: false });
            this._ws.on('connection', (socket) => {
                this._querySql.addSocket(socket);
                this._broadcast.addSocket(socket);
                this._listenDbChanging.addSocket(socket);
            });

            this._http.listen(3000, (err: Error) => {
                err ? reject(err) : resolve();
            });
        });
    }

    onStop(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._http.close((err: Error) => {
                err ? reject(err) : resolve();
            });
        });
    }
}
