import BaseExportService from './BaseExportService';
import MysqlConnection from '../MySQL/MysqlConnection';

/**
 * 用于向客户端提供sql查询     
 * 提供的接口：    
 * query：执行sql查询，用法与mysql.query相同
 * 
 * @export
 * @class QuerySql
 */
export default class QuerySql extends BaseExportService {

    private get _connection() {
        return (this.services.MysqlConnection as MysqlConnection).connection;
    }

    /**
     * 直接查询数据库
     */
    private query = this.export('query', (data: any) => {
        return new Promise((resolve, reject) => {
            let { sql, values }: { sql: string, values: string[] } = data;
            this._connection.query(sql, values, (err, results, fields) => {
                err ? reject(err) : resolve([results, fields]);
            });
        });
    });
}