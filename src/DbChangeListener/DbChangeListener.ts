import { ServiceModule, log } from "service-starter";
import _ = require('lodash');

import ChangedData from './ChangedData';
import TriggerType from './TriggerType';
import ChangedDataReceiver from './ChangedDataReceiver';
import TriggerCreator from './TriggerCreator';


/**
 * 数据表变化监听器。   
 * 监听在localhost:2233
 */
export default class DbChangeListener extends ServiceModule {

    // 保存注册了的监听器
    private readonly registeredListener: any = {};

    //mysql表信息
    private get _tableInfo() {
        return this.services.QueryTableInfo.tableInfo;
    }

    private get _triggerCreator() {
        return this.services.TriggerCreator as TriggerCreator;
    }

    async onStart() {
        (this.services.ChangedDataReceiver as ChangedDataReceiver).onData = this._dispatch.bind(this);
    }

    async onStop() {
        (this.services.ChangedDataReceiver as ChangedDataReceiver).onData = undefined;
    }

    /**
     * 注册数据库表中字段变化的监听器
     * 
     * @param {(data: ChangedData) => void} callback 发生变化后要执行的回调函数
     * @param {string} schema 要监听的数据库
     * @param {string} table 要监听的表
     * @param {TriggerType} type 要监听的类型
     * @param {string[]} field 如果监听的类型是update，那么还要指定要监听的字段。
     */
    async listen(callback: (data: ChangedData) => void, schema: string, table: string, type: TriggerType, field: string) {
        if (type === TriggerType.update) {
            if (field === undefined)
                throw new Error('update 类型的监听器，未提供要监听的字段（field）');
            this._check_table_and_fields_exists(schema, table, field);
        } else {
            this._check_table_and_fields_exists(schema, table);
            field = '-';    // 为其他触发器类型提供一个默认值
        }

        // 找到对应的位置，存放监听器
        let listener: Set<Function> = _.get(this.registeredListener, [schema, table, type, field]);

        // 如果还没有注册过，就向数据库创建trigger
        if (listener === undefined) {
            // 保存监听器
            listener = new Set<Function>();
            listener.add(callback);
            _.set(this.registeredListener, [schema, table, type, field], listener);

            //向数据库创建Trigger
            switch (type) {
                case TriggerType.insert:
                    await this._triggerCreator.createInsertTrigger(schema, table);
                    break;
                case TriggerType.delete:
                    await this._triggerCreator.createDeleteTrigger(schema, table);
                    break;
                case TriggerType.update:
                    // 获取已注册过了的字段名称
                    const fields = Object.keys(_.get(this.registeredListener, [schema, table, type]));
                    await this._triggerCreator.createUpdateTrigger(schema, table, fields);
                    break;
            }
        } else {
            // 检查是否已经注册过了
            if (listener.has(callback))
                throw new Error('相同的回调函数被重复注册');

            // 保存监听器
            listener.add(callback);
        }
    }

    /**
     * 移除之前注册的监听器
     * 
     * @param {(data: ChangedData) => void} callback 发生变化后要执行的回调函数
     * @param {string} schema 要监听的数据库
     * @param {string} table 要监听的表
     * @param {TriggerType} type 要监听的类型
     * @param {string[]} field 如果监听的类型是update，那么还要指定要监听的字段。
     */
    async remove(callback: (data: ChangedData) => void, schema: string, table: string, type: TriggerType, field: string = '_') {
        const listener: Set<Function> = _.get(this.registeredListener, [schema, table, type, field]);

        if (listener !== undefined) {
            listener.delete(callback);

            // 如果没有了监听器再监听了，就清除数据库中注册过的Trigger
            if (listener.size === 0) {
                const target: any = _.get(this.registeredListener, [schema, table, type]);
                delete target[field];

                switch (type) {
                    case TriggerType.insert:
                        await this._triggerCreator.removeInsertTrigger(schema, table);
                        break;
                    case TriggerType.delete:
                        await this._triggerCreator.removeDeleteTrigger(schema, table);
                        break;
                    case TriggerType.update:
                        // 获取已注册过了的字段名称
                        const fields = Object.keys(_.get(this.registeredListener, [schema, table, type]));
                        if (fields.length === 0)
                            await this._triggerCreator.removeUpdateTrigger(schema, table);
                        else
                            await this._triggerCreator.createUpdateTrigger(schema, table, fields);
                        break;
                }
            }
        }
    }

    // 根据收到的数据触发相应的监听器
    private _dispatch(data: ChangedData): void {
        // 用于触发监听器
        const emit = (listener: Set<Function>) => {
            if (listener) {
                for (let item of listener.values()) {
                    item(data);
                }
            }
        }

        if (data.type === TriggerType.update) {
            for (let item of data.changedFields) {
                emit(_.get(this.registeredListener, [data.schema, data.table, data.type, item]));
            }
        } else {
            emit(_.get(this.registeredListener, [data.schema, data.table, data.type, '_']));
        }
    }

    /**
     * 检查要创建触发器的表是否存在，不存在就抛出异常
     * 
     * @param {string} schema 数据库名
     * @param {String} table 表名
     * @param {String} field 字段名
     */
    private _check_table_and_fields_exists(schema: string, table: String, field?: string) {
        const tb: any = _.get(this._tableInfo, [schema, table]);

        //检查数据库是否存在
        if (tb === undefined) {
            throw new Error(`数据库[${schema}] 下的表 [${table}] 不存在，无法创建Trigger`);
        }

        //检查相关字段是否存在
        if (field !== undefined) {
            if (tb[field] !== true) {
                throw new Error(`数据库[${schema}] 下的表 [${table}] 下的字段 [${field}] 不存在，无法创建Trigger`);
            }
        }
    }
}