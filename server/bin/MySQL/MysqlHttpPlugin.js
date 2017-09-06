"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_starter_1 = require("service-starter");
class MysqlHttpPlugin extends service_starter_1.ServiceModule {
    get _connection() {
        return this.services.MysqlConnection.connection;
    }
    onStart() {
        return new Promise((resolve, reject) => {
            this._connection.query("select * from mysql.func where dl = 'mysql-udf-http.so'", (err, result, fields) => {
                if (err) {
                    reject(new Error('检查mysql-udf-http配置时发生异常：' + err));
                }
                else if (result.length === 4) {
                    resolve();
                }
                else {
                    service_starter_1.log.s1.l(`服务：${this.name}`, '开始配置：', 'mysql-udf-http');
                    this._connection.query(`
                        # 删除已有的
                        DROP FUNCTION IF EXISTS http_get;
                        DROP FUNCTION IF EXISTS http_post;
                        DROP FUNCTION IF EXISTS http_put;
                        DROP FUNCTION IF EXISTS http_delete;
                        
                        # 创建
                        create function http_get returns string soname 'mysql-udf-http.so';
                        create function http_post returns string soname 'mysql-udf-http.so';
                        create function http_put returns string soname 'mysql-udf-http.so';
                        create function http_delete returns string soname 'mysql-udf-http.so';
                    `, (err) => {
                        if (err) {
                            reject(new Error('配置mysql-udf-http失败：' + err));
                        }
                        else {
                            service_starter_1.log.s1.l(`服务：${this.name}`, '成功配置：', 'mysql-udf-http');
                            resolve();
                        }
                    });
                }
            });
        });
    }
}
exports.default = MysqlHttpPlugin;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk15U1FML015c3FsSHR0cFBsdWdpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFEQUFxRDtBQVdyRCxxQkFBcUMsU0FBUSwrQkFBYTtJQUV0RCxJQUFZLFdBQVc7UUFDbkIsTUFBTSxDQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBbUMsQ0FBQyxVQUFVLENBQUM7SUFDekUsQ0FBQztJQUVELE9BQU87UUFDSCxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTTtZQUMvQixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyx5REFBeUQsRUFBRSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTTtnQkFDbEcsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDTixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsMEJBQTBCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDeEQsQ0FBQztnQkFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMzQixPQUFPLEVBQUUsQ0FBQztnQkFDZCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLHFCQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztvQkFFdkQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUM7Ozs7Ozs7Ozs7OztxQkFZdEIsRUFBRSxDQUFDLEdBQUc7d0JBQ0MsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs0QkFDTixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMscUJBQXFCLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDbkQsQ0FBQzt3QkFBQyxJQUFJLENBQUMsQ0FBQzs0QkFDSixxQkFBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixDQUFDLENBQUM7NEJBQ3ZELE9BQU8sRUFBRSxDQUFDO3dCQUNkLENBQUM7b0JBQ0wsQ0FBQyxDQUNKLENBQUM7Z0JBQ04sQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUExQ0Qsa0NBMENDIiwiZmlsZSI6Ik15U1FML015c3FsSHR0cFBsdWdpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGxvZywgU2VydmljZU1vZHVsZSB9IGZyb20gXCJzZXJ2aWNlLXN0YXJ0ZXJcIjtcblxuaW1wb3J0IE15c3FsQ29ubmVjdGlvbiBmcm9tICcuL015c3FsQ29ubmVjdGlvbic7XG5cbi8qKlxuICog5qOA5p+lbXlzcWwtdWRmLWh0dHAuc2/mj5Lku7ZcbiAqIFxuICogQGV4cG9ydFxuICogQGNsYXNzIE15c3FsSHR0cFBsdWdpblxuICogQGV4dGVuZHMge1NlcnZpY2VNb2R1bGV9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE15c3FsSHR0cFBsdWdpbiBleHRlbmRzIFNlcnZpY2VNb2R1bGUge1xuXG4gICAgcHJpdmF0ZSBnZXQgX2Nvbm5lY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5zZXJ2aWNlcy5NeXNxbENvbm5lY3Rpb24gYXMgTXlzcWxDb25uZWN0aW9uKS5jb25uZWN0aW9uO1xuICAgIH1cblxuICAgIG9uU3RhcnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9jb25uZWN0aW9uLnF1ZXJ5KFwic2VsZWN0ICogZnJvbSBteXNxbC5mdW5jIHdoZXJlIGRsID0gJ215c3FsLXVkZi1odHRwLnNvJ1wiLCAoZXJyLCByZXN1bHQsIGZpZWxkcykgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcign5qOA5p+lbXlzcWwtdWRmLWh0dHDphY3nva7ml7blj5HnlJ/lvILluLjvvJonICsgZXJyKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlc3VsdC5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZy5zMS5sKGDmnI3liqHvvJoke3RoaXMubmFtZX1gLCAn5byA5aeL6YWN572u77yaJywgJ215c3FsLXVkZi1odHRwJyk7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jb25uZWN0aW9uLnF1ZXJ5KGBcbiAgICAgICAgICAgICAgICAgICAgICAgICMg5Yig6Zmk5bey5pyJ55qEXG4gICAgICAgICAgICAgICAgICAgICAgICBEUk9QIEZVTkNUSU9OIElGIEVYSVNUUyBodHRwX2dldDtcbiAgICAgICAgICAgICAgICAgICAgICAgIERST1AgRlVOQ1RJT04gSUYgRVhJU1RTIGh0dHBfcG9zdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIERST1AgRlVOQ1RJT04gSUYgRVhJU1RTIGh0dHBfcHV0O1xuICAgICAgICAgICAgICAgICAgICAgICAgRFJPUCBGVU5DVElPTiBJRiBFWElTVFMgaHR0cF9kZWxldGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICMg5Yib5bu6XG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGUgZnVuY3Rpb24gaHR0cF9nZXQgcmV0dXJucyBzdHJpbmcgc29uYW1lICdteXNxbC11ZGYtaHR0cC5zbyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGUgZnVuY3Rpb24gaHR0cF9wb3N0IHJldHVybnMgc3RyaW5nIHNvbmFtZSAnbXlzcWwtdWRmLWh0dHAuc28nO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlIGZ1bmN0aW9uIGh0dHBfcHV0IHJldHVybnMgc3RyaW5nIHNvbmFtZSAnbXlzcWwtdWRmLWh0dHAuc28nO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlIGZ1bmN0aW9uIGh0dHBfZGVsZXRlIHJldHVybnMgc3RyaW5nIHNvbmFtZSAnbXlzcWwtdWRmLWh0dHAuc28nO1xuICAgICAgICAgICAgICAgICAgICBgLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCfphY3nva5teXNxbC11ZGYtaHR0cOWksei0pe+8micgKyBlcnIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuczEubChg5pyN5Yqh77yaJHt0aGlzLm5hbWV9YCwgJ+aIkOWKn+mFjee9ru+8micsICdteXNxbC11ZGYtaHR0cCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59Il19
