import { ServiceModule, log } from "service-starter";

import MysqlConnection from '../../MySQL/MysqlConnection';

/**
 * 获取数据库中所有表名，以及每张表的字段名
 * 
 * @export
 * @class ObtainDbInfo
 * @extends {ServiceModule}
 */
export default class ObtainDbInfo extends ServiceModule {

    //保存获取到了的数据库信息
    readonly dbInfo: any = {};

    private get _connection() {
        return (this.services.MysqlConnection as MysqlConnection).connection;
    }

    async onStart() {

    }

    private _getDatabases(): Promise<void> {
        return new Promise((resolve, reject) => {
            const sql = '\
                SELECT \
                    `SCHEMA_NAME`, `DEFAULT_CHARACTER_SET_NAME`\
                FROM\
                    `INFORMATION_SCHEMA`.`SCHEMATA`\
            ';
            this._connection.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    
                }
            })
        });
    }
}