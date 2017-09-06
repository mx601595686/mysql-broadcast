import emitter = require('component-emitter');
export default class MysqlBroadcastClient extends emitter {
    private readonly socket_QuerySql;
    private readonly socket_Broadcast;
    private readonly socket_ListenDbChanging;
    /**
     * @param {string} ip 服务器ip，默认localhost
     * @param {string} port 服务器端口，默认3000
     */
    constructor(ip?: string, port?: number);
    /**
     * 执行sql查询，使用方法与mysql.js的query方法是一样的
     *
     * @param {string} sql
     * @param {any[]} args
     * @returns {Promise<{ results: any[], fields: any[] }>}
     */
    query(sql: string, args?: any[]): Promise<{
        results: any[];
        fields: any[];
    }>;
}
