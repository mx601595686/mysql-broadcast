"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseModule_1 = require("../common/BaseModule");
const child_process = require("child_process");
const mysql = require("mysql");
const Log_1 = require("../common/Log");
class MysqlInitializer extends BaseModule_1.default {
    start() {
        return this.startMysql().then(this.checkUDF.bind(this));
    }
    startMysql() {
        return new Promise((resolve, reject) => {
            Log_1.default.l('开始尝试启动MySQL服务');
            this._mysqld = child_process.spawn('/usr/local/bin/docker-entrypoint.sh', ["mysqld"]);
            let retry = 0;
            const timer = setInterval(() => {
                if (retry++ < 3) {
                    Log_1.default.l(`开始第${retry}次尝试连接mysql`);
                    const con = mysql.createConnection({
                        user: 'root',
                        connectTimeout: 9500,
                        multipleStatements: true,
                        socketPath: '/var/run/mysqld/mysqld.sock'
                    });
                    con.connect((err) => {
                        if (!err) {
                            Log_1.default.l('mysql启动成功！成功连接到mysql');
                            this._mysql = con;
                            this._mysql.on('error', this.emit.bind(this));
                            this._mysqld.on('error', this.emit.bind(this));
                            clearInterval(timer);
                            resolve();
                        }
                        else {
                            Log_1.default.e(`第${retry}次尝试连接失败: `, err);
                        }
                    });
                }
                else {
                    Log_1.default.e('启动mysqld服务失败');
                    clearInterval(timer);
                    this.destroy().then(reject);
                }
            }, 10000);
        });
    }
    checkUDF() {
        return new Promise((resolve, reject) => {
            Log_1.default.l('开始检查mysql-udf-http');
            this._mysql.query("select * from mysql.func where dl = 'mysql-udf-http.so'", (err, result, fields) => {
                if (err) {
                    Log_1.default.e('检查mysql-udf-http配置时发生异常', err);
                    reject();
                }
                else if (result.length === 4) {
                    Log_1.default.l('mysql-udf-http正常');
                    resolve();
                }
                else {
                    Log_1.default.l('开始配置mysql-udf-http');
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
                            Log_1.default.e('配置mysql-udf-http失败', err);
                            reject();
                        }
                        else {
                            Log_1.default.l('配置mysql-udf-http完成');
                            resolve();
                        }
                    });
                }
            });
        });
    }
    destroy() {
        return new Promise((resolve, reject) => {
            Log_1.default.l('正在终止mysql服务');
            this._mysqld.kill();
            this._mysqld.once('exit', (err, code) => {
                if (err) {
                    Log_1.default.w('终止mysql服务失败：', err);
                }
                else {
                    Log_1.default.l('mysql服务已终止');
                }
                resolve();
            });
            setTimeout(function () {
                Log_1.default.w('终止mysql服务失败：终止超时');
                resolve();
            }, 3000);
        });
    }
}
exports.default = MysqlInitializer;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk15c3FsSW5pdGlhbGl6ZXIvTXlzcWxJbml0aWFsaXplci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFEQUE4QztBQUM5QywrQ0FBZ0Q7QUFDaEQsK0JBQWdDO0FBQ2hDLHVDQUFnQztBQVFoQyxzQkFBc0MsU0FBUSxvQkFBVTtJQUtwRCxLQUFLO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBR08sVUFBVTtRQUNkLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNO1lBQy9CLGFBQUcsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7WUFHdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQVd0RixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFFZCxNQUFNLEtBQUssR0FBRyxXQUFXLENBQUM7Z0JBRXRCLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2QsYUFBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssWUFBWSxDQUFDLENBQUM7b0JBRy9CLE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQzt3QkFDL0IsSUFBSSxFQUFFLE1BQU07d0JBQ1osY0FBYyxFQUFFLElBQUk7d0JBQ3BCLGtCQUFrQixFQUFFLElBQUk7d0JBQ3hCLFVBQVUsRUFBRSw2QkFBNkI7cUJBQzVDLENBQUMsQ0FBQztvQkFFSCxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRzt3QkFDWixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7NEJBQ1AsYUFBRyxDQUFDLENBQUMsQ0FBQyxz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QUM7b0JBQ04sYUFBRyxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQy9CLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ0osYUFBRyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDeEIsQ0FBQztnQkFDRCxPQUFPLEVBQUUsQ0FBQztZQUNkLENBQUMsQ0FBQyxDQUFDO1lBRUgsVUFBVSxDQUFDO2dCQUNQLGFBQUcsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDMUIsT0FBTyxFQUFFLENBQUM7WUFDZCxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDYixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQW5JRCxtQ0FtSUMiLCJmaWxlIjoiTXlzcWxJbml0aWFsaXplci9NeXNxbEluaXRpYWxpemVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJhc2VNb2R1bGUgZnJvbSBcIi4uL2NvbW1vbi9CYXNlTW9kdWxlXCI7XG5pbXBvcnQgY2hpbGRfcHJvY2VzcyA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTtcbmltcG9ydCBteXNxbCA9IHJlcXVpcmUoJ215c3FsJyk7XG5pbXBvcnQgbG9nIGZyb20gJy4uL2NvbW1vbi9Mb2cnO1xuLyoqXG4gKiBteXNxbCDliJ3lp4vljJblmahcbiAqIFxuICogQGV4cG9ydFxuICogQGNsYXNzIE15c3FsSW5pdGlhbGl6ZXJcbiAqIEBleHRlbmRzIHtCYXNlTW9kdWxlfVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNeXNxbEluaXRpYWxpemVyIGV4dGVuZHMgQmFzZU1vZHVsZSB7XG5cbiAgICBwcml2YXRlIF9teXNxbGQ6IGNoaWxkX3Byb2Nlc3MuQ2hpbGRQcm9jZXNzO1xuICAgIHByaXZhdGUgX215c3FsOiBteXNxbC5JQ29ubmVjdGlvbjtcblxuICAgIHN0YXJ0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFydE15c3FsKCkudGhlbih0aGlzLmNoZWNrVURGLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8vIOWQr+WKqG15c3FsXG4gICAgcHJpdmF0ZSBzdGFydE15c3FsKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbG9nLmwoJ+W8gOWni+WwneivleWQr+WKqE15U1FM5pyN5YqhJyk7XG5cbiAgICAgICAgICAgIC8vIOWQr+WKqG15c3FsZOacjeWKoVxuICAgICAgICAgICAgdGhpcy5fbXlzcWxkID0gY2hpbGRfcHJvY2Vzcy5zcGF3bignL3Vzci9sb2NhbC9iaW4vZG9ja2VyLWVudHJ5cG9pbnQuc2gnLCBbXCJteXNxbGRcIl0pO1xuXG4gICAgICAgICAgICAvLyDnlKjkuo7mtYvor5XmiZPljbBcbiAgICAgICAgICAgIC8qIHRoaXMuX215c3FsZC5zdGRvdXQub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGxvZy5sKGBteXNxbGQtc3Rkb3V0OiAke2RhdGF9YCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuX215c3FsZC5zdGRlcnIub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGxvZy5sKGBteXNxbGQtc3RkZXJyOiAke2RhdGF9YCk7XG4gICAgICAgICAgICB9KTsgKi9cblxuICAgICAgICAgICAgLy/lsJ3or5XmrKHmlbBcbiAgICAgICAgICAgIGxldCByZXRyeSA9IDA7XG5cbiAgICAgICAgICAgIGNvbnN0IHRpbWVyID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8v5pyA5aSa5bCd6K+VM+asoVxuICAgICAgICAgICAgICAgIGlmIChyZXRyeSsrIDwgMykge1xuICAgICAgICAgICAgICAgICAgICBsb2cubChg5byA5aeL56ysJHtyZXRyeX3mrKHlsJ3or5Xov57mjqVteXNxbGApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIOWIm+W7uui/nuaOpVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb24gPSBteXNxbC5jcmVhdGVDb25uZWN0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVzZXI6ICdyb290JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbm5lY3RUaW1lb3V0OiA5NTAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgbXVsdGlwbGVTdGF0ZW1lbnRzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgc29ja2V0UGF0aDogJy92YXIvcnVuL215c3FsZC9teXNxbGQuc29jaydcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uLmNvbm5lY3QoKGVycikgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cubCgnbXlzcWzlkK/liqjmiJDlip/vvIHmiJDlip/ov57mjqXliLBteXNxbCcpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy/kv53lrZjov57mjqVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9teXNxbCA9IGNvbjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8v57uR5a6a6ZSZ6K+v5LqL5Lu255uR5ZCsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbXlzcWwub24oJ2Vycm9yJywgdGhpcy5lbWl0LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX215c3FsZC5vbignZXJyb3InLCB0aGlzLmVtaXQuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvZy5lKGDnrKwke3JldHJ5feasoeWwneivlei/nuaOpeWksei0pTogYCwgZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nLmUoJ+WQr+WKqG15c3FsZOacjeWKoeWksei0pScpO1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKTtcblxuICAgICAgICAgICAgICAgICAgICAvL+a4heeQhui1hOa6kFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3koKS50aGVuKHJlamVjdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMTAwMDApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvL+ajgOafpW15c3FsLXVkZi1odHRw5pa55rOV5piv5ZCm5bey57uP5q2j56Gu5a6J6KOF5LqGXG4gICAgcHJpdmF0ZSBjaGVja1VERigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxvZy5sKCflvIDlp4vmo4Dmn6VteXNxbC11ZGYtaHR0cCcpO1xuXG4gICAgICAgICAgICB0aGlzLl9teXNxbC5xdWVyeShcInNlbGVjdCAqIGZyb20gbXlzcWwuZnVuYyB3aGVyZSBkbCA9ICdteXNxbC11ZGYtaHR0cC5zbydcIiwgKGVyciwgcmVzdWx0LCBmaWVsZHMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZy5lKCfmo4Dmn6VteXNxbC11ZGYtaHR0cOmFjee9ruaXtuWPkeeUn+W8guW4uCcsIGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChyZXN1bHQubGVuZ3RoID09PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZy5sKCdteXNxbC11ZGYtaHR0cOato+W4uCcpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nLmwoJ+W8gOWni+mFjee9rm15c3FsLXVkZi1odHRwJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX215c3FsLnF1ZXJ5KGBcbiAgICAgICAgICAgICAgICAgICAgIyDliKDpmaTlt7LmnInnmoRcbiAgICAgICAgICAgICAgICAgICAgICAgIERST1AgRlVOQ1RJT04gSUYgRVhJU1RTIGh0dHBfZ2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgRFJPUCBGVU5DVElPTiBJRiBFWElTVFMgaHR0cF9wb3N0O1xuICAgICAgICAgICAgICAgICAgICAgICAgRFJPUCBGVU5DVElPTiBJRiBFWElTVFMgaHR0cF9wdXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBEUk9QIEZVTkNUSU9OIElGIEVYSVNUUyBodHRwX2RlbGV0ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgIyDliJvlu7pcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZSBmdW5jdGlvbiBodHRwX2dldCByZXR1cm5zIHN0cmluZyBzb25hbWUgJ215c3FsLXVkZi1odHRwLnNvJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZSBmdW5jdGlvbiBodHRwX3Bvc3QgcmV0dXJucyBzdHJpbmcgc29uYW1lICdteXNxbC11ZGYtaHR0cC5zbyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGUgZnVuY3Rpb24gaHR0cF9wdXQgcmV0dXJucyBzdHJpbmcgc29uYW1lICdteXNxbC11ZGYtaHR0cC5zbyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGUgZnVuY3Rpb24gaHR0cF9kZWxldGUgcmV0dXJucyBzdHJpbmcgc29uYW1lICdteXNxbC11ZGYtaHR0cC5zbyc7XG4gICAgICAgICAgICAgICAgICAgIGAsIGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuZSgn6YWN572ubXlzcWwtdWRmLWh0dHDlpLHotKUnLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cubCgn6YWN572ubXlzcWwtdWRmLWh0dHDlrozmiJAnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyDnu4jmraJteXNxbCDov5DooYxcbiAgICBkZXN0cm95KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgbG9nLmwoJ+ato+WcqOe7iOatom15c3Fs5pyN5YqhJyk7XG4gICAgICAgICAgICB0aGlzLl9teXNxbGQua2lsbCgpO1xuXG4gICAgICAgICAgICB0aGlzLl9teXNxbGQub25jZSgnZXhpdCcsIChlcnIsIGNvZGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvZy53KCfnu4jmraJteXNxbOacjeWKoeWksei0pe+8micsIGVycik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbG9nLmwoJ215c3Fs5pyN5Yqh5bey57uI5q2iJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBsb2cudygn57uI5q2ibXlzcWzmnI3liqHlpLHotKXvvJrnu4jmraLotoXml7YnKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9LCAzMDAwKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSJdfQ==
