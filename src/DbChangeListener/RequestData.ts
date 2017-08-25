import _ = require('lodash');

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
 * 数据库发送请求的格式
 * 
 * @export
 * @class RequestData
 */
export class RequestData {
    readonly table: string;
    readonly triggerType: TriggerType;
    readonly oldData: any;
    readonly newData: any;
    readonly changes: string[] = [];

    constructor(body: any) {
        this.table = body.table;
        this.triggerType = body.type;
        this.oldData = body.old;
        this.newData = body.new;

        //对比新旧数据的差异
        _.forEach(this.oldData, (item, key: string) => {
            if (item !== this.newData[key])
                this.changes.push(key);
        })

        /* //对比新旧数据的差异
        let long: any, short: any;

        //找出较长数据的那组
        if (_.size(this.oldData) > _.size(this.newData)) {
            long = this.oldData;
            short = this.newData;
        } else {
            long = this.newData;
            short = this.oldData;
        }

        _.forEach(long, (item, key) => {
            if (short[key] !== item)
        }); */
    }
}