"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const io = require("socket.io-client");
const emitter = require("component-emitter");
class MysqlBroadcastClient extends emitter {
    /**
     * @param {string} ip 服务器ip，默认localhost
     * @param {string} port 服务器端口，默认3000
     */
    constructor(ip = 'localhost', port = 3000) {
        super();
        // 打开websocket，但不使用这个接口
        const socket = io(`${ip}:${port}`, { autoConnect: false });
        socket.on('error', this.emit.bind(this, 'error'));
        socket.on('disconnect', this.emit.bind(this, 'disconnect'));
        socket.on('connect', this.emit.bind(this, 'connect'));
        this.socket_QuerySql = io(`${ip}:${port}/QuerySql`, { autoConnect: false });
        this.socket_Broadcast = io(`${ip}:${port}/Broadcast`, { autoConnect: false });
        this.socket_ListenDbChanging = io(`${ip}:${port}/ListenDbChanging`, { autoConnect: false });
    }
    /**
     * 执行sql查询，使用方法与mysql.js的query方法是一样的
     *
     * @param {string} sql
     * @param {any[]} args
     * @returns {Promise<{ results: any[], fields: any[] }>}
     */
    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.socket_QuerySql.emit('query', [sql, args], function (err, data) {
                err ? reject(new Error(err)) : resolve(data);
            });
        });
    }
}
exports.default = MysqlBroadcastClient;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk15c3FsQnJvYWRjYXN0Q2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQXdDO0FBQ3hDLDZDQUE4QztBQUU5QywwQkFBMEMsU0FBUSxPQUFPO0lBTXJEOzs7T0FHRztJQUNILFlBQVksS0FBYSxXQUFXLEVBQUUsT0FBZSxJQUFJO1FBQ3JELEtBQUssRUFBRSxDQUFDO1FBQ1IsdUJBQXVCO1FBQ3ZCLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzNELE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQzVELE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBRXRELElBQUksQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLElBQUksV0FBVyxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxJQUFJLFlBQVksRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzlFLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxtQkFBbUIsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxLQUFLLENBQUMsR0FBVyxFQUFFLElBQVk7UUFDM0IsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU07WUFDL0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLFVBQVUsR0FBVyxFQUFFLElBQVM7Z0JBQzVFLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakQsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXJDRCx1Q0FxQ0MiLCJmaWxlIjoiTXlzcWxCcm9hZGNhc3RDbGllbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaW8gPSByZXF1aXJlKCdzb2NrZXQuaW8tY2xpZW50Jyk7XG5pbXBvcnQgZW1pdHRlciA9IHJlcXVpcmUoJ2NvbXBvbmVudC1lbWl0dGVyJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE15c3FsQnJvYWRjYXN0Q2xpZW50IGV4dGVuZHMgZW1pdHRlciB7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IHNvY2tldF9RdWVyeVNxbDogU29ja2V0SU9DbGllbnQuU29ja2V0O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc29ja2V0X0Jyb2FkY2FzdDogU29ja2V0SU9DbGllbnQuU29ja2V0O1xuICAgIHByaXZhdGUgcmVhZG9ubHkgc29ja2V0X0xpc3RlbkRiQ2hhbmdpbmc6IFNvY2tldElPQ2xpZW50LlNvY2tldDtcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBpcCDmnI3liqHlmahpcO+8jOm7mOiupGxvY2FsaG9zdFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBwb3J0IOacjeWKoeWZqOerr+WPo++8jOm7mOiupDMwMDBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihpcDogc3RyaW5nID0gJ2xvY2FsaG9zdCcsIHBvcnQ6IG51bWJlciA9IDMwMDApIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgLy8g5omT5byAd2Vic29ja2V077yM5L2G5LiN5L2/55So6L+Z5Liq5o6l5Y+jXG4gICAgICAgIGNvbnN0IHNvY2tldCA9IGlvKGAke2lwfToke3BvcnR9YCwgeyBhdXRvQ29ubmVjdDogZmFsc2UgfSk7XG4gICAgICAgIHNvY2tldC5vbignZXJyb3InLCB0aGlzLmVtaXQuYmluZCh0aGlzLCAnZXJyb3InKSk7XG4gICAgICAgIHNvY2tldC5vbignZGlzY29ubmVjdCcsIHRoaXMuZW1pdC5iaW5kKHRoaXMsICdkaXNjb25uZWN0JykpO1xuICAgICAgICBzb2NrZXQub24oJ2Nvbm5lY3QnLCB0aGlzLmVtaXQuYmluZCh0aGlzLCAnY29ubmVjdCcpKTtcblxuICAgICAgICB0aGlzLnNvY2tldF9RdWVyeVNxbCA9IGlvKGAke2lwfToke3BvcnR9L1F1ZXJ5U3FsYCwgeyBhdXRvQ29ubmVjdDogZmFsc2UgfSk7XG4gICAgICAgIHRoaXMuc29ja2V0X0Jyb2FkY2FzdCA9IGlvKGAke2lwfToke3BvcnR9L0Jyb2FkY2FzdGAsIHsgYXV0b0Nvbm5lY3Q6IGZhbHNlIH0pO1xuICAgICAgICB0aGlzLnNvY2tldF9MaXN0ZW5EYkNoYW5naW5nID0gaW8oYCR7aXB9OiR7cG9ydH0vTGlzdGVuRGJDaGFuZ2luZ2AsIHsgYXV0b0Nvbm5lY3Q6IGZhbHNlIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOaJp+ihjHNxbOafpeivou+8jOS9v+eUqOaWueazleS4jm15c3FsLmpz55qEcXVlcnnmlrnms5XmmK/kuIDmoLfnmoRcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3FsIFxuICAgICAqIEBwYXJhbSB7YW55W119IGFyZ3MgXG4gICAgICogQHJldHVybnMge1Byb21pc2U8eyByZXN1bHRzOiBhbnlbXSwgZmllbGRzOiBhbnlbXSB9Pn0gXG4gICAgICovXG4gICAgcXVlcnkoc3FsOiBzdHJpbmcsIGFyZ3M/OiBhbnlbXSk6IFByb21pc2U8eyByZXN1bHRzOiBhbnlbXSwgZmllbGRzOiBhbnlbXSB9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNvY2tldF9RdWVyeVNxbC5lbWl0KCdxdWVyeScsIFtzcWwsIGFyZ3NdLCBmdW5jdGlvbiAoZXJyOiBzdHJpbmcsIGRhdGE6IGFueSkge1xuICAgICAgICAgICAgICAgIGVyciA/IHJlamVjdChuZXcgRXJyb3IoZXJyKSkgOiByZXNvbHZlKGRhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0iXX0=
