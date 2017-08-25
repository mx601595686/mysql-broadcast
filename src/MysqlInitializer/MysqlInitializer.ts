import BaseModule from "../common/BaseModule";
import child_process = require('child_process');
import mysql = require('mysql');

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

    start(): Promise<void> {
        return this.startMysql();
    }

    // 启动mysql
    private startMysql(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('[${}]开始尝试启动MySQL服务')
            // 启动mysqld服务
            this._mysqld = child_process.spawn('/usr/local/bin/docker-entrypoint.sh', ["mysqld"]);

            // 连接mysql
            this._mysql = mysql.createConnection({
                user: 'root',
            });

            // 用于测试打印
            this._mysqld.stdout.on('data', (data) => {
                console.log(`mysqld-stdout: ${data}`);
            });
            this._mysqld.stderr.on('data', (data) => {
                console.log(`mysqld-stderr: ${data}`);
            });

            let timer: NodeJS.Timer;
            let retry = 0;

            timer = setInterval(() => {
                //最多尝试3次
                if (retry++ > 3) {
                    this._mysql.connect(function (err) {
                        if (!err){  //连接上了
                            clearInterval(timer);
                            resolve();
                        } 
                    });
                }else{
                    clearInterval(timer);
                    reject();
                }
            }, 10000);
        });
    }

    //检查udf方法是否已经正确安装了
    private checkUDF(): Promise<void> {
        return new Promise((resolve, reject) => {
            //this._mysql.q
        });
    }

    // 终止mysql 运行
    destroy(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._mysqld.kill();
            this._mysqld.once('exit', (err, code) => {
                resolve();
            })
            setTimeout(function () {
                resolve();
            }, 3000);
        });
    }
}