/**
 * 数据库信息。
 * 
 * @export
 * @class DbInfo
 */
export class DbInfo {

    /**
     * 数据库表
     */
    readonly tables = new Map<string, TableInfo>();

    /**
     * 数据库名称
     */
    readonly name: string;
     /**
     * 字符集编码
     */
    readonly charset: string;

    constructor() { }
}

/**
 * 数据库表信息
 * 
 * @export
 * @class TableInfo
 */
export class TableInfo {

}

