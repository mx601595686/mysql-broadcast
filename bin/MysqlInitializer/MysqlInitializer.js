"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const mysql = require("mysql");
const service_starter_1 = require("service-starter");
class MysqlInitializer extends service_starter_1.ServiceModule {
    async onStart() {
        await this.startMysqld();
    }
    startMysqld() {
        return new Promise((resolve, reject) => {
            service_starter_1.log.l('正在启动 MySQL Deamon');
            this._mysqld = child_process.spawn('/usr/local/bin/docker-entrypoint.sh', ["mysqld"]);
            this._mysqld.on('error', this.emit.bind(this, 'error'));
            this._mysqld.stdout.on('data', (data) => {
                service_starter_1.log.l(`mysqld-stdout: ${data}`);
            });
            this._mysqld.stderr.on('data', (data) => {
                service_starter_1.log.l(`mysqld-stderr: ${data}`);
            });
            let retry = 0;
            const timer = setInterval(() => {
                if (retry++ < 3) {
                    service_starter_1.log.l(`开始尝试第${retry}次连接mysql`);
                    const con = mysql.createConnection({
                        user: 'root',
                        connectTimeout: 9500,
                        multipleStatements: true,
                        socketPath: '/var/run/mysqld/mysqld.sock'
                    });
                    con.connect((err) => {
                        if (err) {
                            service_starter_1.log.e(`第${retry}次连接失败: `, err);
                        }
                        else {
                            service_starter_1.log.l('MySQL Deamon启动成功！');
                            service_starter_1.log.l('成功连接到MySQL！');
                            this._mysql = con;
                            clearInterval(timer);
                            resolve();
                        }
                    });
                }
                else {
                    clearInterval(timer);
                    reject(new Error('无法连接到MySQL，超过了重试次数'));
                }
            }, 10000);
        });
    }
    checkUDF() {
        return new Promise((resolve, reject) => {
            service_starter_1.log.l('开始检查 mysql-udf-http');
            this._mysql.query("select * from mysql.func where dl = 'mysql-udf-http.so'", (err, result, fields) => {
                if (err) {
                    reject(new Error('检查mysql-udf-http配置时发生异常' + err));
                }
                else if (result.length === 4) {
                    service_starter_1.log.l('mysql-udf-http正常');
                    resolve();
                }
                else {
                    service_starter_1.log.l('开始配置mysql-udf-http');
                    this._mysql.query(`
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
                        `, err => {
                        if (err) {
                            reject(new Error('配置mysql-udf-http失败' + err));
                        }
                        else {
                            service_starter_1.log.l('配置mysql-udf-http完成');
                            resolve();
                        }
                    });
                }
            });
        });
    }
    onStop() {
        return new Promise((resolve, reject) => {
            service_starter_1.log.l('正在终止mysql服务');
            if (this._mysqld === undefined) {
                resolve();
                return;
            }
            if (this._mysql)
                this._mysql.end();
            this._mysqld.kill();
            this._mysqld.once('exit', (err, code) => {
                if (err) {
                    reject(new Error('终止mysql服务失败：' + err));
                }
                else {
                    resolve();
                }
            });
            setTimeout(() => {
                this._mysql = undefined;
                this._mysqld = undefined;
                reject(new Error('终止mysql服务失败：终止超时'));
            }, 5000);
        });
    }
    onHealthChecking() {
        return new Promise((resolve) => {
            this._mysql.query('select 1', (err) => {
                if (err) {
                    resolve(service_starter_1.HealthStatus.unhealthy);
                }
                else {
                    resolve(service_starter_1.HealthStatus.success);
                }
            });
        });
    }
    getConnection() {
        return this._mysql;
    }
}
exports.default = MysqlInitializer;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk15c3FsSW5pdGlhbGl6ZXIvTXlzcWxJbml0aWFsaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtDQUFnRDtBQUNoRCwrQkFBZ0M7QUFDaEMscURBQW1FO0FBTW5FLHNCQUFzQyxTQUFRLCtCQUFhO0lBT3ZELEtBQUssQ0FBQyxPQUFPO1FBQ1QsTUFBTSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFFN0IsQ0FBQztJQUdPLFdBQVc7UUFDZixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTTtZQUMvQixxQkFBRyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1lBRTNCLElBQUksQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxxQ0FBcUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDdEYsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBR3hELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJO2dCQUNoQyxxQkFBRyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNwQyxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJO2dCQUNoQyxxQkFBRyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNwQyxDQUFDLENBQUMsQ0FBQztZQUdILElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztZQUVkLE1BQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQztnQkFFdEIsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFD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LE9BQU8sQ0FBQyxDQUFDO2dCQUNsQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUE7UUFDTixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFRRCxhQUFhO1FBQ1QsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztDQUNKO0FBOUpELG1DQThKQyIsImZpbGUiOiJNeXNxbEluaXRpYWxpemVyL015c3FsSW5pdGlhbGl6ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2hpbGRfcHJvY2VzcyA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTtcbmltcG9ydCBteXNxbCA9IHJlcXVpcmUoJ215c3FsJyk7XG5pbXBvcnQgeyBsb2csIFNlcnZpY2VNb2R1bGUsIEhlYWx0aFN0YXR1cyB9IGZyb20gXCJzZXJ2aWNlLXN0YXJ0ZXJcIjtcblxuLyoqXG4gKiBNeVNRTOWIneWni+WMluWZqCAgICAgXG4gKiDlkK/liqhNeVNRTCBEZWFtb27vvIzliJvlu7rkuI5NeVNRTOeahOi/nuaOpeOAguajgOafpW15c3FsLXVkZi1odHRwLnNv5o+S5Lu2XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE15c3FsSW5pdGlhbGl6ZXIgZXh0ZW5kcyBTZXJ2aWNlTW9kdWxlIHtcblxuICAgIC8vTXlTUUwgRGVhbW9u6L+b56iLXG4gICAgcHJpdmF0ZSBfbXlzcWxkOiBjaGlsZF9wcm9jZXNzLkNoaWxkUHJvY2VzcztcbiAgICAvL+S4jk15U1FM55qE6L+e5o6lXG4gICAgcHJpdmF0ZSBfbXlzcWw6IG15c3FsLklDb25uZWN0aW9uO1xuXG4gICAgYXN5bmMgb25TdGFydCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgYXdhaXQgdGhpcy5zdGFydE15c3FsZCgpO1xuICAgICAgICAvL2F3YWl0IHRoaXMuY2hlY2tVREYoKTtcbiAgICB9XG5cbiAgICAvLyDlkK/liqhNeVNRTCBEZWFtb25cbiAgICBwcml2YXRlIHN0YXJ0TXlzcWxkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbG9nLmwoJ+ato+WcqOWQr+WKqCBNeVNRTCBEZWFtb24nKTtcblxuICAgICAgICAgICAgdGhpcy5fbXlzcWxkID0gY2hpbGRfcHJvY2Vzcy5zcGF3bignL3Vzci9sb2NhbC9iaW4vZG9ja2VyLWVudHJ5cG9pbnQuc2gnLCBbXCJteXNxbGRcIl0pO1xuICAgICAgICAgICAgdGhpcy5fbXlzcWxkLm9uKCdlcnJvcicsIHRoaXMuZW1pdC5iaW5kKHRoaXMsICdlcnJvcicpKTtcblxuICAgICAgICAgICAgLy8g55So5LqO5rWL6K+V5omT5Y2wXG4gICAgICAgICAgICB0aGlzLl9teXNxbGQuc3Rkb3V0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBsb2cubChgbXlzcWxkLXN0ZG91dDogJHtkYXRhfWApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLl9teXNxbGQuc3RkZXJyLm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICBsb2cubChgbXlzcWxkLXN0ZGVycjogJHtkYXRhfWApO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8v5bCd6K+V5qyh5pWwXG4gICAgICAgICAgICBsZXQgcmV0cnkgPSAwO1xuXG4gICAgICAgICAgICBjb25zdCB0aW1lciA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvL+acgOWkmuWwneivlTPmrKFcbiAgICAgICAgICAgICAgICBpZiAocmV0cnkrKyA8IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nLmwoYOW8gOWni+WwneivleesrCR7cmV0cnl95qyh6L+e5o6lbXlzcWxgKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyDliJvlu7rov57mjqVcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29uID0gbXlzcWwuY3JlYXRlQ29ubmVjdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiAncm9vdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25uZWN0VGltZW91dDogOTUwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpcGxlU3RhdGVtZW50czogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvY2tldFBhdGg6ICcvdmFyL3J1bi9teXNxbGQvbXlzcWxkLnNvY2snXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbi5jb25uZWN0KChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZShg56ysJHtyZXRyeX3mrKHov57mjqXlpLHotKU6IGAsIGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5sKCdNeVNRTCBEZWFtb27lkK/liqjmiJDlip/vvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cubCgn5oiQ5Yqf6L+e5o6l5YiwTXlTUUzvvIEnKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8v5L+d5a2Y6L+e5o6lXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbXlzcWwgPSBjb247XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL+e7keWumumUmeivr+S6i+S7tuebkeWQrFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vdGhpcy5fbXlzcWwub24oJ2Vycm9yJywgdGhpcy5lbWl0LmJpbmQodGhpcywgJ2Vycm9yJykpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcign5peg5rOV6L+e5o6l5YiwTXlTUUzvvIzotoXov4fkuobph43or5XmrKHmlbAnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMTAwMDApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvL+ajgOafpW15c3FsLXVkZi1odHRw5pa55rOV5piv5ZCm5bey57uP5q2j56Gu5a6J6KOF5LqGXG4gICAgcHJpdmF0ZSBjaGVja1VERigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxvZy5sKCflvIDlp4vmo4Dmn6UgbXlzcWwtdWRmLWh0dHAnKTtcblxuICAgICAgICAgICAgdGhpcy5fbXlzcWwucXVlcnkoXCJzZWxlY3QgKiBmcm9tIG15c3FsLmZ1bmMgd2hlcmUgZGwgPSAnbXlzcWwtdWRmLWh0dHAuc28nXCIsIChlcnIsIHJlc3VsdCwgZmllbGRzKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCfmo4Dmn6VteXNxbC11ZGYtaHR0cOmFjee9ruaXtuWPkeeUn+W8guW4uCcgKyBlcnIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocmVzdWx0Lmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBsb2cubCgnbXlzcWwtdWRmLWh0dHDmraPluLgnKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZy5sKCflvIDlp4vphY3nva5teXNxbC11ZGYtaHR0cCcpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX215c3FsLnF1ZXJ5KGBcbiAgICAgICAgICAgICAgICAgICAgICAgICMg5Yig6Zmk5bey5pyJ55qEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgRFJPUCBGVU5DVElPTiBJRiBFWElTVFMgaHR0cF9nZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgRFJPUCBGVU5DVElPTiBJRiBFWElTVFMgaHR0cF9wb3N0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIERST1AgRlVOQ1RJT04gSUYgRVhJU1RTIGh0dHBfcHV0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIERST1AgRlVOQ1RJT04gSUYgRVhJU1RTIGh0dHBfZGVsZXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICMg5Yib5bu6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlIGZ1bmN0aW9uIGh0dHBfZ2V0IHJldHVybnMgc3RyaW5nIHNvbmFtZSAnbXlzcWwtdWRmLWh0dHAuc28nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZSBmdW5jdGlvbiBodHRwX3Bvc3QgcmV0dXJucyBzdHJpbmcgc29uYW1lICdteXNxbC11ZGYtaHR0cC5zbyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlIGZ1bmN0aW9uIGh0dHBfcHV0IHJldHVybnMgc3RyaW5nIHNvbmFtZSAnbXlzcWwtdWRmLWh0dHAuc28nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZSBmdW5jdGlvbiBodHRwX2RlbGV0ZSByZXR1cm5zIHN0cmluZyBzb25hbWUgJ215c3FsLXVkZi1odHRwLnNvJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGAsIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCfphY3nva5teXNxbC11ZGYtaHR0cOWksei0pScgKyBlcnIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cubCgn6YWN572ubXlzcWwtdWRmLWh0dHDlrozmiJAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDnu4jmraJteXNxbCDov5DooYxcbiAgICBvblN0b3AoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsb2cubCgn5q2j5Zyo57uI5q2ibXlzcWzmnI3liqEnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9teXNxbGQgPT09IHVuZGVmaW5lZCkgeyByZXNvbHZlKCk7IHJldHVybjsgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5fbXlzcWwpIHRoaXMuX215c3FsLmVuZCgpO1xuXG4gICAgICAgICAgICB0aGlzLl9teXNxbGQua2lsbCgpO1xuXG4gICAgICAgICAgICB0aGlzLl9teXNxbGQub25jZSgnZXhpdCcsIChlcnIsIGNvZGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ+e7iOatom15c3Fs5pyN5Yqh5aSx6LSl77yaJyArIGVycikpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAodGhpcy5fbXlzcWwgYXMgYW55KSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICAodGhpcy5fbXlzcWxkIGFzIGFueSkgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCfnu4jmraJteXNxbOacjeWKoeWksei0pe+8mue7iOatoui2heaXticpKTtcbiAgICAgICAgICAgIH0sIDUwMDApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvL+WBpeW6t+ajgOafpVxuICAgIG9uSGVhbHRoQ2hlY2tpbmcoKTogUHJvbWlzZTxIZWFsdGhTdGF0dXM+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9teXNxbC5xdWVyeSgnc2VsZWN0IDEnLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKEhlYWx0aFN0YXR1cy51bmhlYWx0aHkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoSGVhbHRoU3RhdHVzLnN1Y2Nlc3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiOt+WPlm15c3Fs6L+e5o6lXG4gICAgICogXG4gICAgICogQHJldHVybnMgXG4gICAgICogQG1lbWJlcm9mIE15c3FsSW5pdGlhbGl6ZXJcbiAgICAgKi9cbiAgICBnZXRDb25uZWN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbXlzcWw7XG4gICAgfVxufSJdfQ==
