/**
 * 数据改变的类型
 * 
 * @export
 * @enum {number}
 */
export const enum TriggerType {
    update, insert, delete
}

/**
 * 在数据库中发生变化的数据
 * 
 * @export
 * @class ChangedData
 */
export class ChangedData {
    
    /**
     * 表名
     */
    readonly table: string;

    /**
     * 发生变化的类型
     * 
     * @type {TriggerType}
     */
    readonly triggerType: TriggerType;

    /**
     * 发生变化之前的那一行数据
     */
    readonly oldData: any;

    /**
     * 发生变化之后的那一行数据
     */
    readonly newData: any;

    constructor(body: any) {
        this.table = body.table;
        this.triggerType = body.type;
        this.oldData = body.old;
        this.newData = body.new;
    }
}