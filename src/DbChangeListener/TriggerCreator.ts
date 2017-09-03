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

    private get _mysqlCon() {
        return this.services.MysqlConnection as MysqlConnection;
    }

    //mysql表信息
    private get _tableInfo() {
        return this.services.QueryTableInfo.tableInfo;
    }

    async onStart(): Promise<void> {
        await this.createInsertTrigger('test', 'test_t');
        await this.createDeleteTrigger('test', 'test_t');
        await this.createUpdateTrigger('test', 'test_t', ['id']);
        //return Promise.resolve();
    }

    /**
     * 创建插入记录触发器   
     * 创建的Trigger名称为：__mb__表名__insert__trigger
     * 
     * @param {string} schema 数据库名
     * @param {String} table 表名
     * @returns {Promise<void>} 
     */
    async createInsertTrigger(schema: string, table: String): Promise<void> {
        const serialized = this._statement_serialize_data(schema, table, TriggerType.insert);
        const send = this._statement_send_data();
        const triggerName = `\`${schema}\`.\`__mb__${table}__insert__trigger\``;

        // 不需用delimiter要来替换MySQL分隔符，否则会出错
        const sql = `
            DROP TRIGGER IF EXISTS ${triggerName};
            CREATE DEFINER = CURRENT_USER TRIGGER ${triggerName} AFTER INSERT ON \`${table}\` FOR EACH ROW
            BEGIN
                ${serialized.changedFields}
                ${serialized.toArray}
                ${send}
            END
        `;

        await this._mysqlCon.query(sql);
    }

    /**
     * 创建删除记录触发器   
     * 创建的Trigger名称为：__mb__表名__delete__trigger
     * 
     * @param {string} schema 数据库名
     * @param {String} table 表名
     * @returns {Promise<void>} 
     */
    async createDeleteTrigger(schema: string, table: String): Promise<void> {
        const serialized = this._statement_serialize_data(schema, table, TriggerType.delete);
        const send = this._statement_send_data();
        const triggerName = `\`${schema}\`.\`__mb__${table}__delete__trigger\``;

        const sql = `
            DROP TRIGGER IF EXISTS ${triggerName};
            CREATE DEFINER = CURRENT_USER TRIGGER ${triggerName} AFTER DELETE ON \`${table}\` FOR EACH ROW
            BEGIN
                ${serialized.changedFields}
                ${serialized.toArray}
                ${send}
            END
        `;

        await this._mysqlCon.query(sql);
    }

    /**
     * 创建字段更新触发器   
     * 创建的Trigger名称为：__mb__表名__update__trigger
     * 
     * @param schema 数据库名
     * @param table 表名
     * @param fields 要监控变化的字段列表
     * @returns {Promise<void>} 
     */
    async createUpdateTrigger(schema: string, table: String, fields: string[]): Promise<void> {
        const serialized = this._statement_serialize_data(schema, table, TriggerType.update);
        const send = this._statement_send_data();
        const triggerName = `\`${schema}\`.\`__mb__${table}__update__trigger\``;

        // 判定字段是否改变的sql。如果发生了变化将变化字段的字段名加入@changed_fields数组中
        const fieldsIsChange = fields.reduce((pre, cur) => {
            return `
                ${pre}
                IF \`NEW\`.\`${cur}\` != \`OLD\`.\`${cur}\` THEN
                    SET @changed_fields = JSON_ARRAY_APPEND(@changed_fields, '$', '${cur}');
                END IF;
            `;
        }, '');

        // 确保所关注字段的值发生改变之后再发送数据
        const sql = `
            DROP TRIGGER IF EXISTS ${triggerName};
            CREATE DEFINER = CURRENT_USER TRIGGER ${triggerName} AFTER UPDATE ON \`${table}\` FOR EACH ROW
            BEGIN
                ${serialized.changedFields}
                ${fieldsIsChange}
                IF JSON_LENGTH(@changed_fields) > 0 THEN
                    ${serialized.toArray}
                    ${send}
                END IF;
            END
        `;

        await this._mysqlCon.query(sql);
    }

    /**
     * 删除插入记录触发器 
     * 
     * @param {string} schema 数据库名
     * @param {String} table 表名
     */
    async removeInsertTrigger(schema: string, table: String): Promise<void> {
        const triggerName = `\`${schema}\`.\`__mb__${table}__insert__trigger\``;
        await this._mysqlCon.query(`DROP TRIGGER IF EXISTS ${triggerName};`);
    }

    /**
     * 移除删除记录触发器 
     * 
     * @param {string} schema 数据库名
     * @param {String} table 表名
     */
    async removeDeleteTrigger(schema: string, table: String): Promise<void> {
        const triggerName = `\`${schema}\`.\`__mb__${table}__delete__trigger\``;
        await this._mysqlCon.query(`DROP TRIGGER IF EXISTS ${triggerName};`);
    }

    /**
     * 删除更新记录触发器 
     * 
     * @param {string} schema 数据库名
     * @param {String} table 表名
     */
    async removeUpdateTrigger(schema: string, table: String): Promise<void> {
        const triggerName = `\`${schema}\`.\`__mb__${table}__update__trigger\``;
        await this._mysqlCon.query(`DROP TRIGGER IF EXISTS ${triggerName};`);
    }

    /**
     * 用于生成序列化数据的那一段SQL。 
     * 序列化后的结果保存在 @new_data , @old_data 这几个sql变量中。    
     * 数据发生改变的字段 @changed_fields
     * 
     * 返回的结果{changedFields:保存值发生改变了的字段的字段名, toArray：将各个字段结合成一个数组的sql}
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
        const newData = type != TriggerType.delete ? `SELECT JSON_OBJECT(${args(true)})  INTO @new_data;` : 'set @new_data = NULL;';
        const oldData = type != TriggerType.insert ? `SELECT JSON_OBJECT(${args(false)}) INTO @old_data;` : 'set @old_data = NULL;';

        return {
            changedFields: "set @changed_fields = JSON_ARRAY();",
            toArray: `
                ${newData}
                ${oldData}
                SET @value = JSON_ARRAY(${type}, '${schema}', '${table}', @changed_fields, @new_data, @old_data);
            `
        }
    }

    /**  
     * 发送数据的那一段sql。包含错误处理
     */
    private _statement_send_data() {
        return `
            SELECT http_post('http://localhost:2233', @value) INTO @return;
            IF @return != 200 THEN
                CALL \`__mb__\`.\`log_error\`(CONCAT_WS('\n', '向服务器发送数据异常。', '返回状态码：', @return, '发送的数据：', @value));
            END IF; 
        `;
    }
}