import { log, ServiceModule } from "service-starter";

import MysqlConnection from './MysqlConnection';

/**
 * 检查mysql-udf-http.so插件
 * 
 * @export
 * @class MysqlHttpPlugin
 * @extends {ServiceModule}
 */
export default class MysqlHttpPlugin extends ServiceModule {

    private get _connection() {
        return (this.services.MysqlConnection as MysqlConnection).connection;
    }

    onStart(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._connection.query("select * from mysql.func where dl = 'mysql-udf-http.so'", (err, result, fields) => {
                if (err) {
                    reject(new Error('检查mysql-udf-http配置时发生异常：' + err));
                }
                else if (result.length === 4) {
                    resolve();
                } else {
                    log.s1.l(`服务：${this.name}`, '开始配置：', 'mysql-udf-http');
                    
                    this._connection.query(`
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
                    `, (err) => {
                            if (err) {
                                reject(new Error('配置mysql-udf-http失败：' + err));
                            } else {
                                log.s1.l(`服务：${this.name}`, '成功配置：', 'mysql-udf-http');
                                resolve();
                            }
                        }
                    );
                }
            });
        });
    }
}