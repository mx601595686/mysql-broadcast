import TriggerType from "./TriggerType";


/**
 * 数据库中发生变化的数据
 * 
 * @export
 * @class ChangedData
 */
export default class ChangedData {
    /**
     * 发生变化的类型
     */
    readonly type: TriggerType;

    /**
     * 数据库名称
     */
    readonly schema: string;

    /**
     * 表名
     */
    readonly table: string;

    /**
     * 发生改变的字段名称
     */
    readonly changedFields: string[];

    /**
     * 发生变化之前的那一行数据
     */
    readonly oldData: any;

    /**
     * 发生变化之后的那一行数据
     */
    readonly newData: any;

    constructor(body: any) {
        // 解析发来的数据
        const data = JSON.parse(body);
        this.type = data[0];
        this.schema = data[1];
        this.table = data[2];
        this.changedFields = data[3];
        this.newData = data[4];
        this.oldData = data[5];
    }
}