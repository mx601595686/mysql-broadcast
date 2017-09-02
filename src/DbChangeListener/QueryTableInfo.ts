import { ServiceModule, log } from "service-starter";
import _ = require('lodash');

import MysqlConnection from '../MySQL/MysqlConnection';

/**
 * 查询数据库中所有表的字段信息
 * 
 * @export
 * @class QueryTableInfo
 * @extends {ServiceModule}
 */
export default class QueryTableInfo extends ServiceModule {

    private get _connection() {
        return (this.services.MysqlConnection as MysqlConnection).connection;
    }

    /**
     * 数据库表信息
     * 按照：数据库名->表名->字段名->true 的方式组织
     */
    readonly tableInfo: any = {};

    onStart(): Promise<void> {
        return new Promise((resolve, reject) => {
            const sql = "\
                SELECT \
                    `TABLE_SCHEMA` AS `schema`, \
                    `TABLE_NAME` AS `table`, \
                    `COLUMN_NAME` AS `name` \
                FROM \
                    `INFORMATION_SCHEMA`.`COLUMNS` \
            ";

            this._connection.query(sql, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    result.forEach((item: { schema: string, table: string, name: string }) => {
                        _.set(this.tableInfo, [item.schema, item.table, item.name], true);
                    });

                    resolve();
                }
            });
        });
    }
}