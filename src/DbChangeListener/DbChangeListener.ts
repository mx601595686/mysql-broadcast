import http = require('http');
import raw = require('raw-body');
import { ServiceModule } from "service-starter";

import { ChangedData } from './ChangedData';

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
                            limit: '3mb',   //最大数据大小3兆
                            encoding: true
                        });

                        //分发处理接收到的数据
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
                })
            } else {
                resolve();
            }
        });
    }

    //负责分发接收到的数据
    dispatch(data: ChangedData): void {
        console.log(data);
    }
}