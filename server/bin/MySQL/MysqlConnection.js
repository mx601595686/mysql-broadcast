"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mysql = require("mysql");
const service_starter_1 = require("service-starter");
class MysqlConnection extends service_starter_1.ServiceModule {
    get connection() {
        if (this._connection === undefined) {
            throw new Error(`有服务在${this.name}还未启动之前尝试获取MySQL连接`);
        }
        return this._connection;
    }
    onStart() {
        return new Promise((resolve, reject) => {
            let retry = 0;
            let connect = () => {
                if (retry++ < 3) {
                    service_starter_1.log.s1.l(`服务：${this.name}`, `开始尝试第${retry}次连接mysql`);
                    const con = mysql.createConnection({
                        user: 'root',
                        connectTimeout: 9500,
                        multipleStatements: true,
                        socketPath: '/var/run/mysqld/mysqld.sock'
                    });
                    con.connect((err) => {
                        if (err) {
                            service_starter_1.log.s1.e(`服务：${this.name}`, `第${retry}次尝试连接失败: `, err);
                        }
                        else {
                            this._connection = con;
                            this._connection.on('error', this.emit.bind(this, 'error'));
                            clearInterval(timer);
                            resolve();
                        }
                    });
                }
                else {
                    clearInterval(timer);
                    reject(new Error('无法连接到MySQL，超过了重试次数'));
                }
            };
            connect();
            const timer = setInterval(connect, 10000);
        });
    }
    onStop() {
        return new Promise((resolve, reject) => {
            if (this._connection) {
                this._connection.end(err => {
                    err ? reject(err) : resolve();
                });
                setTimeout(() => {
                    this._connection = undefined;
                    reject(new Error('关闭超时'));
                }, 10000);
            }
            else {
                resolve();
            }
        });
    }
    onHealthChecking() {
        return new Promise((resolve, reject) => {
            if (this._connection) {
                this._connection.query('select 1', (err) => {
                    err ? reject(err) : resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
    query(sql, param = []) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, param, (err, result) => {
                err ? reject(err) : resolve(result);
            });
        });
    }
}
exports.default = MysqlConnection;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk15U1FML015c3FsQ29ubmVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUFnQztBQUNoQyxxREFBcUQ7QUFLckQscUJBQXFDLFNBQVEsK0JBQWE7SUFPdEQsSUFBSSxVQUFVO1FBQ1YsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sSUFBSSxLQUFLLENBQUMsT0FBTyxJQUFJLENBQUMsSUFBSSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUM1QixDQUFDO0lBR0QsT0FBTztRQUNILE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNO1lBQy9CLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztZQUVkLElBQUksT0FBTyxHQUFHO2dCQUNWLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2QscUJBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLFFBQVEsS0FBSyxVQUFVLENBQUMsQ0FBQztvQkFHckQsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLGdCQUFnQixDQUFDO3dCQUMvQixJQUFJLEVBQUUsTUFBTTt3QkFDWixjQUFjLEVBQUUsSUFBSTt3QkFDcEIsa0JBQWtCLEVBQUUsSUFBSTt3QkFDeEIsVUFBVSxFQUFFLDZCQUE2QjtxQkFDNUMsQ0FBQyxDQUFDO29CQUVILEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHO3dCQUNaLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7NEJBQ04scUJBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksS0FBSyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBQzNELENBQUM7d0JBQUMsSUFBSSxDQUFDLENBQUM7NEJBRUosSUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7NEJBR3ZCLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQzs0QkFFNUQsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUNyQixPQUFPLEVBQUUsQ0FBQzt3QkFDZCxDQUFDO29CQUNMLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUM7Z0JBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ0osYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUVyQixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO2dCQUM1QyxDQUFDO1lBQ0wsQ0FBQyxDQUFBO1lBRUQsT0FBTyxFQUFFLENBQUM7WUFDVixNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELE1BQU07UUFDRixNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTTtZQUMvQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDbkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRztvQkFDcEIsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQztnQkFDbEMsQ0FBQyxDQUFDLENBQUM7Z0JBR0gsVUFBVSxDQUFDO29CQUNQLElBQUksQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO29CQUM3QixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDOUIsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2QsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLE9BQU8sRUFBRSxDQUFDO1lBQ2QsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUdELGdCQUFnQjtRQUNaLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNO1lBQy9CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO2dCQUNuQixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxHQUFHO29CQUNuQyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDO2dCQUNsQyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixPQUFPLEVBQUUsQ0FBQztZQUNkLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFRRCxLQUFLLENBQUMsR0FBVyxFQUFFLFFBQWUsRUFBRTtRQUNoQyxNQUFNLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTTtZQUMvQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsR0FBRyxFQUFFLE1BQU07Z0JBQzFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0o7QUF0R0Qsa0NBc0dDIiwiZmlsZSI6Ik15U1FML015c3FsQ29ubmVjdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBteXNxbCA9IHJlcXVpcmUoJ215c3FsJyk7XG5pbXBvcnQgeyBsb2csIFNlcnZpY2VNb2R1bGUgfSBmcm9tIFwic2VydmljZS1zdGFydGVyXCI7XG5cbi8qKlxuICog566h55CG5Yib5bu6TXlTUUzov57mjqXjgIJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTXlzcWxDb25uZWN0aW9uIGV4dGVuZHMgU2VydmljZU1vZHVsZSB7XG5cbiAgICAvKipcbiAgICAgKiDkuI5NeVNRTOeahOi/nuaOpVxuICAgICAqIFxuICAgICAqIEByZWFkb25seVxuICAgICAqL1xuICAgIGdldCBjb25uZWN0aW9uKCk6IG15c3FsLklDb25uZWN0aW9uIHtcbiAgICAgICAgaWYgKHRoaXMuX2Nvbm5lY3Rpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGDmnInmnI3liqHlnKgke3RoaXMubmFtZX3ov5jmnKrlkK/liqjkuYvliY3lsJ3or5Xojrflj5ZNeVNRTOi/nuaOpWApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX2Nvbm5lY3Rpb247XG4gICAgfVxuICAgIHByaXZhdGUgX2Nvbm5lY3Rpb246IG15c3FsLklDb25uZWN0aW9uIHwgdW5kZWZpbmVkO1xuXG4gICAgb25TdGFydCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCByZXRyeSA9IDA7ICAvL+WwneivleasoeaVsFxuXG4gICAgICAgICAgICBsZXQgY29ubmVjdCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmV0cnkrKyA8IDMpIHsgIC8v5pyA5aSa5bCd6K+VM+asoVxuICAgICAgICAgICAgICAgICAgICBsb2cuczEubChg5pyN5Yqh77yaJHt0aGlzLm5hbWV9YCwgYOW8gOWni+WwneivleesrCR7cmV0cnl95qyh6L+e5o6lbXlzcWxgKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyDliJvlu7rov57mjqVcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29uID0gbXlzcWwuY3JlYXRlQ29ubmVjdGlvbih7XG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyOiAncm9vdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25uZWN0VGltZW91dDogOTUwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpcGxlU3RhdGVtZW50czogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvY2tldFBhdGg6ICcvdmFyL3J1bi9teXNxbGQvbXlzcWxkLnNvY2snXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbi5jb25uZWN0KChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2cuczEuZShg5pyN5Yqh77yaJHt0aGlzLm5hbWV9YCwgYOesrCR7cmV0cnl95qyh5bCd6K+V6L+e5o6l5aSx6LSlOiBgLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL+S/neWtmOi/nuaOpVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24gPSBjb247XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL+e7keWumumUmeivr+S6i+S7tuebkeWQrFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24ub24oJ2Vycm9yJywgdGhpcy5lbWl0LmJpbmQodGhpcywgJ2Vycm9yJykpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aW1lcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKTtcblxuICAgICAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCfml6Dms5Xov57mjqXliLBNeVNRTO+8jOi2hei/h+S6humHjeivleasoeaVsCcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbm5lY3QoKTtcbiAgICAgICAgICAgIGNvbnN0IHRpbWVyID0gc2V0SW50ZXJ2YWwoY29ubmVjdCwgMTAwMDApO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvblN0b3AoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY29ubmVjdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24uZW5kKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVyciA/IHJlamVjdChlcnIpIDogcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8g5YWz6Zet6LaF5pe2XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb24gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ+WFs+mXrei2heaXticpKTtcbiAgICAgICAgICAgICAgICB9LCAxMDAwMCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy/lgaXlurfmo4Dmn6VcbiAgICBvbkhlYWx0aENoZWNraW5nKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2Nvbm5lY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jb25uZWN0aW9uLnF1ZXJ5KCdzZWxlY3QgMScsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZXJyID8gcmVqZWN0KGVycikgOiByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5pa55L6/5omn6KGM5p+l6K+i55qEcHJvbWlzZeaWueazle+8jOmAmui/h+iwg+eUqGNvbm5lY3Rpb24ucXVlcnkoKSzlj6rov5Tlm57plJnor6/kuI7nu5PmnpxcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3FsIFxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPGFueVtdPn0gXG4gICAgICovXG4gICAgcXVlcnkoc3FsOiBzdHJpbmcsIHBhcmFtOiBhbnlbXSA9IFtdKTogUHJvbWlzZTxhbnlbXT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25uZWN0aW9uLnF1ZXJ5KHNxbCwgcGFyYW0sIChlcnIsIHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgIGVyciA/IHJlamVjdChlcnIpIDogcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0iXX0=
