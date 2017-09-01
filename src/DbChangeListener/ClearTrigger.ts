import { ServiceModule, log } from "service-starter";

import MysqlConnection from '../MySQL/MysqlConnection';

/**
 * 清理程序在数据库中注册的触发器。   
 * 所有程序注册的触发器都是以“_mb_”开头
 * 
 * @export
 * @class ClearTrigger
 * @extends {ServiceModule}
 */
export default class ClearTrigger extends ServiceModule {

    private get _connection() {
        return (this.services.MysqlConnection as MysqlConnection).connection;
    }

    async onStart(): Promise<void> {
        const triggers = await this._query();
        await this._delete(triggers);
    }

    // 查询系统注册的Trigger
    private _query(): Promise<any[]> {
        return new Promise((resolve, reject) => {

            const queryTrigger = "\
                SELECT \
                    `TRIGGER_NAME` as `name`, `TRIGGER_SCHEMA` as `schema` \
                FROM \
                    `INFORMATION_SCHEMA`.`TRIGGERS` \
                WHERE \
                    `TRIGGER_NAME` LIKE '__mb__%' \
            ";

            this._connection.query(queryTrigger, (err, result) => {
                err ? reject(err) : resolve(result);
            });
        });
    }

    // 删除系统注册了的触发器
    private _delete(triggers: { name: string, schema: string }[]): Promise<any> {
        const task = triggers.map(item => new Promise((resolve, reject) => {
            const sql = 'DROP TRIGGER IF EXISTS `' + item.schema + '`.`' + item.name + '`';
            this._connection.query(sql, (err) => {
                err ? reject(err) : resolve();
            });
        }));

        return Promise.all(task);
    }

    constructor() {
        super();
        this.onStop = this.onStart;
    }
}