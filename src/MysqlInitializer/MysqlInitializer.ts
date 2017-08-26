import BaseModule from "../common/BaseModule";
import child_process = require('child_process');
import mysql = require('mysql');
import log from '../common/Log';

/**
 * mysql 初始化器
 * 
 * @export
 * @class MysqlInitializer
 * @extends {BaseModule}
 */
export default class MysqlInitializer extends BaseModule {

    private _mysqld: child_process.ChildProcess;
    private _mysql: mysql.IConnection;

    get name() {
        return `MySQL初始化器(${super.name})`;
    }

    async start(): Promise<void> {
        await this.startMysql();
        await this.checkUDF();
    }

    // 启动mysql
    private startMysql(): Promise<void> {
        return new Promise((resolve, reject) => {

            log.l('启动MySQL Deamon');
            this._mysqld = child_process.spawn('/usr/local/bin/docker-entrypoint.sh', ["mysqld"]);

            // 用于测试打印
            /* this._mysqld.stdout.on('data', (data) => {
                log.l(`mysqld-stdout: ${data}`);
            });
            this._mysqld.stderr.on('data', (data) => {
                log.l(`mysqld-stderr: ${data}`);
            }); */

            //尝试次数
            let retry = 0;

            const timer = setInterval(() => {
                //最多尝试3次
                if (retry++ < 3) {
                    log.l(`开始第${retry}次尝试连接mysql`);

                    // 创建连接
                    const con = mysql.createConnection({
                        user: 'root',
                        connectTimeout: 9500,
                        multipleStatements: true,
                        socketPath: '/var/run/mysqld/mysqld.sock'
                    });

                    con.connect((err) => {
                        if (err) {
                            log.e(`第${retry}次尝试连接失败: `, err);
                        } else {
                            log.l('MySQL Deamon启动成功！')
                            log.l('成功连接到MySQL！');

                            //保存连接
                            this._mysql = con;

                            //绑定错误事件监听
                            this._mysql.on('error', this.emit.bind(this));
                            this._mysqld.on('error', this.emit.bind(this));

                            clearInterval(timer);
                            resolve();
                        }
                    });
                } else {
                    clearInterval(timer);
                    reject('无法连接到MySQL，超过了重试次数');
                }
            }, 10000);
        });
    }

    //检查mysql-udf-http方法是否已经正确安装了
    private checkUDF(): Promise<void> {
        return new Promise((resolve, reject) => {
            log.l('开始检查mysql-udf-http');

            this._mysql.query("select * from mysql.func where dl = 'mysql-udf-http.so'", (err, result, fields) => {
                if (err) {
                    log.e('检查mysql-udf-http配置时发生异常', err);
                    reject();
                }
                else if (result.length === 4) {
                    log.l('mysql-udf-http正常');
                    resolve();
                } else {
                    log.l('开始配置mysql-udf-http');

                    this._mysql.query(`
                    # 删除已有的
                        DROP FUNCTION IF EXISTS http_get;
                        DROP FUNCTION IF EXISTS http_post;
                        DROP FUNCTION IF EXISTS http_put;
                        DROP FUNCTION IF EXISTS http_delete;
                        
                        # 创建
                        create function http_get returns string soname 'mysql-udf-http.so';
                        create function http_post returns string soname 'mysql-udf-http.so';
                        create function http_put returns string soname 'mysql-udf-http.so';
                        create function http_delete returns string soname 'mysql-udf-http.so';
                    `, err => {
                            if (err) {
                                log.e('配置mysql-udf-http失败', err);
                                reject();
                            } else {
                                log.l('配置mysql-udf-http完成');
                                resolve();
                            }
                        });
                }
            });
        });
    }

    // 终止mysql 运行
    destroy(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._mysqld) {
                log.l('正在终止mysql服务');

                if (this._mysql) this._mysql.end();
                this._mysqld.kill();

                this._mysqld.once('exit', (err, code) => {
                    if (err) {
                        log.w('终止mysql服务失败：', err);
                    } else {
                        log.l('mysql服务已终止');
                    }
                    resolve();
                });

                setTimeout(function () {
                    log.w('终止mysql服务失败：终止超时');
                    resolve();
                }, 5000);
            } else {
                resolve();
            }
        });
    }

    /**
     * 获取mysql连接
     * 
     * @returns 
     * @memberof MysqlInitializer
     */
    getConnection() {
        return this._mysql;
    }
}