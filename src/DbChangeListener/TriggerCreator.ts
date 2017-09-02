import { ServiceModule, log } from "service-starter";
import _ = require('lodash');

import MysqlConnection from '../MySQL/MysqlConnection';
import TriggerType from './TriggerType';

/**
 * 在数据库中创建所需的触发器
 * 
 * @export
 * @class TriggerCreator
 * @extends {ServiceModule}
 */
export default class TriggerCreator extends ServiceModule {

    private get _connection() {
        return (this.services.MysqlConnection as MysqlConnection).connection;
    }

    //mysql表信息
    private get _tableInfo() {
        return this.services.QueryTableInfo.tableInfo;
    }

    onStart(): Promise<void> {
        return this.createInsertTrigger('test', 'test_t');
        //return Promise.resolve();
    }

    /**
     * 创建字段更新触发器
     * 
     * @param schema 数据库名
     * @param table 表名
     * @param fields 要监控变化的字段列表
     * @returns {Promise<void>} 
     */
    createUpdateTrigger(schema: string, table: String, fields: string[]): Promise<void> {
        return new Promise((resolve, reject) => {

        });
    }

    /**
     * 创建插入记录触发器
     * 创建的Trigger名称为：__mb__表名__insert__trigger
     * 
     * @param {string} schema 数据库名
     * @param {String} table 表名
     * @returns {Promise<void>} 
     */
    createInsertTrigger(schema: string, table: String): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!_.has(this._tableInfo, [schema, table])) {
                reject(new Error(`数据库[${schema}] 下的表 [${table}] 不存在，无法创建触发器`));
            } else {
                const serializedSQL = this._statement_serialize_data(schema, table, TriggerType.insert);

                // 不需要替换MySQL分隔符，否则会出错
                const sql = `
                    DROP TRIGGER IF EXISTS \`${schema}\`.\`__mb__${table}__insert__trigger\`;
                    CREATE DEFINER = CURRENT_USER TRIGGER \`${schema}\`.\`__mb__${table}__insert__trigger\` AFTER INSERT ON \`${table}\` FOR EACH ROW
                    BEGIN
                        ${serializedSQL.serialize}
                        ${serializedSQL.http}
                    END
                `;

                this._connection.query(sql, (err, result) => {
                    err ? reject(err) : resolve(result);
                });
            }
        });
    }

    /**
     * 创建删除记录触发器
     * 
     * @param {string} schema 数据库名
     * @param {String} table 表名
     * @returns {Promise<void>} 
     */
    createDeleteTrigger(schema: string, table: String): Promise<void> {
        return new Promise((resolve, reject) => {

        });
    }

    /**
     * 用于生成序列化数据的那一段SQL，和发送http数据的那一段sql。   
     * 序列化后的结果保存在 @new_data , @old_data , @trigger_type 这几个sql变量中。    
     * 
     * 返回的结果{serialize：序列化数据的sql，http：发送数据的sql}
     * 
     * @param {string} schema 数据库名
     * @param {String} table 表名
     * @param type 触发器的类型
     */
    private _statement_serialize_data(schema: string, table: String, type: TriggerType) {

        const args = (isNew: boolean) => {
            // 这里reduce方法必须提供一个初始值，否则当数组元素只有一个时，reduce方法不会执行
            return Object.keys(_.get(this._tableInfo, [schema, table]))
                .reduce((pre, cur, index) => {
                    const result = `, '${cur}', ${isNew ? '`NEW`' : '`OLD`'}.\`${cur}\``;
                    if (index === 0) {    //第一个前面不带逗号
                        return pre + result.slice(1);
                    } else {
                        return pre + result;
                    }
                }, '');
        }

        //insert 触发器中没有old，delete触发器中没有new
        const newData = type != TriggerType.delete ? `SELECT JSON_OBJECT(${args(true)}) INTO @new_data;` : 'set @new_data = NULL;';
        const oldData = type != TriggerType.insert ? `SELECT JSON_OBJECT(${args(false)}) INTO @old_data;` : 'set @old_data = NULL;';

        return {
            serialize: `
                set @trigger_type = ${type};
                ${newData}
                ${oldData}
            `,
            http: "SELECT http_post('http://localhost:2233', JSON_ARRAY(@trigger_type, @new_data, @old_data)) INTO @N;"
        }
    }
}