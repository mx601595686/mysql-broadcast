import mysql = require('mysql');
import { log, ServiceModule } from "service-starter";

/**
 * 管理创建MySQL连接。
 */
export default class MysqlConnection extends ServiceModule {

    /**
     * 与MySQL的连接
     * 
     * @readonly
     */
    get connection(): mysql.IConnection {
        if (this._connection === undefined) {
            throw new Error(`有服务在${this.name}还未启动之前尝试获取MySQL连接`);
        }

        return this._connection;
    }
    private _connection: mysql.IConnection | undefined;

    onStart(): Promise<void> {
        return new Promise((resolve, reject) => {
            let retry = 0;  //尝试次数

            let connect = () => {
                if (retry++ < 3) {  //最多尝试3次
                    log.s1.l(`服务：${this.name}`, `开始尝试第${retry}次连接mysql`);

                    // 创建连接
                    const con = mysql.createConnection({
                        user: 'root',
                        connectTimeout: 9500,
                        multipleStatements: true,
                        socketPath: '/var/run/mysqld/mysqld.sock'
                    });

                    con.connect((err) => {
                        if (err) {
                            log.s1.e(`服务：${this.name}`, `第${retry}次尝试连接失败: `, err);
                        } else {
                            //保存连接
                            this._connection = con;

                            //绑定错误事件监听
                            this._connection.on('error', this.emit.bind(this, 'error'));

                            clearInterval(timer);
                            resolve();
                        }
                    });
                } else {
                    clearInterval(timer);

                    reject(new Error('无法连接到MySQL，超过了重试次数'));
                }
            }

            connect();
            const timer = setInterval(connect, 10000);
        });
    }

    onStop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._connection) {
                this._connection.end(err => {
                    err ? reject(err) : resolve();
                });

                // 关闭超时
                setTimeout(() => {
                    this._connection = undefined;
                    reject(new Error('关闭超时'));
                }, 10000);
            } else {
                resolve();
            }
        });
    }

    //健康检查
    onHealthChecking(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._connection) {
                this._connection.query('select 1', (err) => {
                    err ? reject(err) : resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * 方便执行查询的promise方法，通过调用connection.query(),只返回错误与结果
     * 
     * @param {string} sql 
     * @returns {Promise<any[]>} 
     */
    query(sql: string, param: any[] = []): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, param, (err, result) => {
                err ? reject(err) : resolve(result);
            });
        });
    }
}