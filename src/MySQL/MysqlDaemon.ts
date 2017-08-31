import child_process = require('child_process');
import { log, ServiceModule } from "service-starter";

/**
 * 管理MySQL Daemon的启动与关闭
 * 
 * @export
 * @class MySQLDaemon
 * @extends {ServiceModule}
 */
export default class MysqlDaemon extends ServiceModule {

    //MySQL Daemon进程
    private _mysqld: child_process.ChildProcess | undefined;

    onStart(): Promise<void> {
        return new Promise((resolve, reject) => {

            this._mysqld = child_process.spawn('/usr/local/bin/docker-entrypoint.sh', ["mysqld"]);
            this._mysqld.on('error', this.emit.bind(this, 'error'));

            // 当mysqld的标准输出流不在输出时，判定为启动成功了
            let timer: NodeJS.Timer;
            //是否已经启动了
            let started = false;

            //判定如果20秒中之内都没有新的内容输出则判定为启动成功了
            function judge() {
                if (started === false) {
                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        started = true;
                        resolve();
                    }, 20000);
                }
            }
            judge();

            // 打印标准输出流
            this._mysqld.stdout.on('data', (data) => {
                log.l(`mysqld-out: ${data}`);
                judge();
            });
            /* this._mysqld.stderr.on('data', (data) => {
                log.l(`mysqld-err: ${data}`);
            }); */
        });
    }

    onStop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this._mysqld) {

                this._mysqld.kill();
                this._mysqld.once('exit', resolve);

                //设置停止超时
                setTimeout(() => {
                    this._mysqld = undefined;
                    reject(new Error(
                        log.s1.format(
                            `服务：${this.name}`,
                            '关闭超时'
                        )
                    ));
                }, 20000);
            } else {
                resolve();
            }
        });
    }
}