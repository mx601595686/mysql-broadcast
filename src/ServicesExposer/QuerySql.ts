import ServicesExposer from './ServicesExposer';
import MysqlConnection from '../MySQL/MysqlConnection';

/**
 * 用于向客户端提供sql查询     
 * 提供的接口：    
 * query：执行sql查询，用法与mysql.query相同
 * 
 * @export
 * @class QuerySql
 */
export default class QuerySql {

    private readonly _myCon: MysqlConnection;

    constructor(se: ServicesExposer) {
        this._myCon = se.services.MysqlConnection;
    }

    /**
     * 添加新接收到的连接
     * 
     * @param {SocketIO.Socket} socket 
     */
    addSocket(socket: SocketIO.Socket) {
        // 直接查询数据库
        socket.on('query', (sql: string, values: string[], callback: Function) => {
            this._myCon.connection.query(sql, values, (err, results, fields) => {
                callback(err.toString(), results, fields);
            });
        });
    }
}