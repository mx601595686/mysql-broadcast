import http = require('http');
import raw = require('raw-body');
import { ServiceModule, log } from "service-starter";

import ChangedData from './ChangedData';

/**
 * 数据表变化监听器。   
 * 监听在localhost:2233
 */
export default class DbChangeListener extends ServiceModule {

    private _http: http.Server | undefined;

    onStart(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._http = http.createServer(async (req, res) => {
                if (req.method === 'POST') { //只允许post
                    try {
                        const body = await raw(req, {
                            length: req.headers['content-length'],
                            encoding: true
                        });

                        //分发接收到的数据
                        this.dispatch(new ChangedData(body));
                        res.statusCode = 200;
                    } catch (err) {
                        this.emit('error', err);
                        res.statusCode = 500;
                    }
                } else {
                    res.statusCode = 403;
                    res.statusMessage = 'only post'
                }

                res.end(res.statusCode.toString());
            });

            this._http.on('error', this.emit.bind(this, 'error'));
            this._http.listen(2233, (err: Error) => {
                err ? reject(err) : resolve();
            });
        });
    }

    onStop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._http !== undefined) {
                this._http.close((err: Error) => {
                    this._http = undefined;
                    err ? reject(err) : resolve();
                });
            } else {
                resolve();
            }
        });
    }

    onHealthChecking(): Promise<void> {
        return new Promise((resolve, reject) => {
            http.get('http://localhost:2233', (res) => {
                if (res.statusCode === 403) {
                    resolve();
                } else {
                    reject(new Error('程序逻辑出现错误，期望收到的状态码是403，而实际上收到的却是：' + res.statusCode));
                }
            }).on('error', err => {
                reject(new Error('无法连接到 localhost:2233 服务器无响应。' + err));
            });
        });
    }

    //负责分发接收到的数据
    dispatch(data: ChangedData): void {
        console.log(data);
    }
}