import child_process = require('child_process');
import mysql = require('mysql');
import { log, ServiceModule, HealthStatus } from "service-starter";

/**
 * MySQL初始化器     
 * 启动MySQL Deamon，创建与MySQL的连接。检查mysql-udf-http.so插件
 */
export default class MysqlInitializer extends ServiceModule {

    //MySQL Deamon进程
    private _mysqld: child_process.ChildProcess;
    //与MySQL的连接
    private _mysql: mysql.IConnection;

    async onStart(): Promise<void> {
        await this.startMysqld();
        //await this.checkUDF();
    }

    // 启动MySQL Deamon
    private startMysqld(): Promise<void> {
        return new Promise((resolve, reject) => {
            log.l('正在启动 MySQL Deamon');

            this._mysqld = child_process.spawn('/usr/local/bin/docker-entrypoint.sh', ["mysqld"]);
            this._mysqld.on('error', this.emit.bind(this, 'error'));

            // 用于测试打印
            this._mysqld.stdout.on('data', (data) => {
                log.l(`mysqld-stdout: ${data}`);
            });
            this._mysqld.stderr.on('data', (data) => {
                log.l(`mysqld-stderr: ${data}`);
            });

            //尝试次数
            let retry = 0;

            const timer = setInterval(() => {
                //最多尝试3次
                if (retry++ < 3) {
                    log.l(`开始尝试第${retry}次连接mysql`);

                    // 创建连接
                    const con = mysql.createConnection({
                        user: 'root',
                        connectTimeout: 9500,
                        multipleStatements: true,
                        socketPath: '/var/run/mysqld/mysqld.sock'
                    });

                    con.connect((err) => {
                        if (err) {
                            log.e(`第${retry}次连接失败: `, err);
                        } else {
                            log.l('MySQL Deamon启动成功！');
                            log.l('成功连接到MySQL！');

                            //保存连接
                            this._mysql = con;

                            //绑定错误事件监听
                            //this._mysql.on('error', this.emit.bind(this, 'error'));

                            clearInterval(timer);
                            resolve();
                        }
                    });
                } else {
                    clearInterval(timer);
                    reject(new Error('无法连接到MySQL，超过了重试次数'));
                }
            }, 10000);
        });
    }

    //检查mysql-udf-http方法是否已经正确安装了
    private checkUDF(): Promise<void> {
        return new Promise((resolve, reject) => {
            log.l('开始检查 mysql-udf-http');

            this._mysql.query("select * from mysql.func where dl = 'mysql-udf-http.so'", (err, result, fields) => {
                if (err) {
                    reject(new Error('检查mysql-udf-http配置时发生异常' + err));
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
                                reject(new Error('配置mysql-udf-http失败' + err));
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
    onStop(): Promise<void> {
        return new Promise((resolve, reject) => {
            log.l('正在终止mysql服务');
            if (this._mysqld === undefined) { resolve(); return; }

            if (this._mysql) this._mysql.end();

            this._mysqld.kill();

            this._mysqld.once('exit', (err, code) => {
                if (err) {
                    reject(new Error('终止mysql服务失败：' + err))
                } else {
                    resolve();
                }
            });

            setTimeout(() => {
                (this._mysql as any) = undefined;
                (this._mysqld as any) = undefined;

                reject(new Error('终止mysql服务失败：终止超时'));
            }, 5000);
        });
    }

    //健康检查
    onHealthChecking(): Promise<HealthStatus> {
        return new Promise((resolve) => {
            this._mysql.query('select 1', (err) => {
                if (err) {
                    resolve(HealthStatus.unhealthy);
                } else {
                    resolve(HealthStatus.success);
                }
            })
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