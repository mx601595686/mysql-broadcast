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

    private get _mysqlCon() {
        return this.services.MysqlConnection as MysqlConnection;
    }

    constructor() {
        super();
        this.onStop = this.onStart;
    }

    async onStart(): Promise<void> {
        
        // 查询系统已注册的Trigger
        const queryTrigger = "\
            SELECT \
                `TRIGGER_NAME` as `name`, `TRIGGER_SCHEMA` as `schema` \
            FROM \
                `INFORMATION_SCHEMA`.`TRIGGERS` \
            WHERE \
                `TRIGGER_NAME` LIKE '__mb__%' \
        ";
        const triggers = await this._mysqlCon.query(queryTrigger);

        // 删除系统注册了的触发器
        for(let item of triggers) {
            const sql = 'DROP TRIGGER IF EXISTS `' + item.schema + '`.`' + item.name + '`';
            await this._mysqlCon.query(sql);
        }
    }
}