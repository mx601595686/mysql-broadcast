"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_starter_1 = require("service-starter");
class BaseExportService extends service_starter_1.ServiceModule {
    constructor() {
        super(...arguments);
        this._exportMethod = new Map();
        this.socketList = new Map();
    }
    get _ws() {
        return this.services.WebSocket.ws;
    }
    onStart() {
        return new Promise((resolve, reject) => {
            this.nsp = this._ws.of(`/${this.name}`);
            this.nsp.on('connection', (socket) => {
                this.socketList.set(socket.id, socket);
                this.onConnection(socket);
                for (let [name, func] of this._exportMethod.entries()) {
                    socket.on(name, async (data, callback) => {
                        try {
                            const result = await func(data, socket);
                            callback(result);
                        }
                        catch (error) {
                            callback(error.toString());
                        }
                    });
                }
                socket.on('disconnet', () => {
                    this.socketList.delete(socket.id);
                    this.onDisconnect(socket);
                });
            });
        });
    }
    onStop() {
        return new Promise((resolve, reject) => {
            this.nsp = undefined;
            this.socketList.clear();
        });
    }
    export(name, func) {
        this._exportMethod.set(name, func);
        return func;
    }
    onConnection(socket) { }
    onDisconnect(socket) { }
}
exports.default = BaseExportService;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldlYlNvY2tldC9CYXNlRXhwb3J0U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFEQUFxRDtBQU9yRCx1QkFBZ0QsU0FBUSwrQkFBYTtJQUFyRTs7UUFPcUIsa0JBQWEsR0FBMEIsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQWdCeEQsZUFBVSxHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBa0VuRSxDQUFDO0lBdkZHLElBQVksR0FBRztRQUNYLE1BQU0sQ0FBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQXVCLENBQUMsRUFBRSxDQUFDO0lBQ3JELENBQUM7SUFxQkQsT0FBTztRQUNILE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNO1lBQy9CLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUV4QyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNO2dCQUM3QixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUV2QyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUcxQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNwRCxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBUyxFQUFFLFFBQWtCO3dCQUNoRCxJQUFJLENBQUM7NEJBQ0QsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDOzRCQUN4QyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ3JCLENBQUM7d0JBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs0QkFDYixRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7d0JBQy9CLENBQUM7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQztnQkFFRCxNQUFNLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRTtvQkFDbkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNsQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM5QixDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsTUFBTTtRQUNGLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNO1lBQy9CLElBQUksQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBVVMsTUFBTSxDQUFDLElBQVksRUFBRSxJQUFjO1FBQ3pDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFRUyxZQUFZLENBQUMsTUFBdUIsSUFBSSxDQUFDO0lBUXpDLFlBQVksQ0FBQyxNQUF1QixJQUFJLENBQUM7Q0FDdEQ7QUF6RkQsb0NBeUZDIiwiZmlsZSI6IldlYlNvY2tldC9CYXNlRXhwb3J0U2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGxvZywgU2VydmljZU1vZHVsZSB9IGZyb20gXCJzZXJ2aWNlLXN0YXJ0ZXJcIjtcbmltcG9ydCBXZWJTb2NrZXQgZnJvbSAnLi9XZWJTb2NrZXQnO1xuXG5cbi8qKlxuICog5omA5pyJ5L2/55Sod2Vic29ja2V05ZCR5aSW5o+Q5L6b5pyN5Yqh55qE5Z+657G7XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIEJhc2VFeHBvcnRTZXJ2aWNlIGV4dGVuZHMgU2VydmljZU1vZHVsZSB7XG5cbiAgICBwcml2YXRlIGdldCBfd3MoKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5zZXJ2aWNlcy5XZWJTb2NrZXQgYXMgV2ViU29ja2V0KS53cztcbiAgICB9XG5cbiAgICAvLyDkv53lrZjlkJHlpJbmj5DkvpvmnI3liqHnmoTmlrnms5XvvIzpgJrov4fmnKznsbvnmoRleHBvcnTmlrnms5Xov5vooYzms6jlhoxcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9leHBvcnRNZXRob2Q6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKlxuICAgICAqIOW9k+WJjeeahHNvY2tldC5pb+WRveWQjeepuumXtO+8jOWRveWQjeepuumXtOm7mOiupOaYr+acjeWKoeWQjVxuICAgICAqIFxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAdHlwZSB7U29ja2V0SU8uTmFtZXNwYWNlfVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBuc3A6IFNvY2tldElPLk5hbWVzcGFjZSB8IHVuZGVmaW5lZDtcblxuICAgIC8qKlxuICAgICAqIOS/neWtmOW7uueri+S4iui/nuaOpeeahOaOpeWPo+WIl+ihqOOAgmtleeaYr3NvY2tldC5pZFxuICAgICAqIFxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAdHlwZSB7TWFwPHN0cmluZywgU29ja2V0SU8uU29ja2V0Pn1cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgc29ja2V0TGlzdDogTWFwPHN0cmluZywgU29ja2V0SU8uU29ja2V0PiA9IG5ldyBNYXAoKTtcblxuICAgIG9uU3RhcnQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLm5zcCA9IHRoaXMuX3dzLm9mKGAvJHt0aGlzLm5hbWV9YCk7XG5cbiAgICAgICAgICAgIHRoaXMubnNwLm9uKCdjb25uZWN0aW9uJywgKHNvY2tldCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc29ja2V0TGlzdC5zZXQoc29ja2V0LmlkLCBzb2NrZXQpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5vbkNvbm5lY3Rpb24oc29ja2V0KTtcblxuICAgICAgICAgICAgICAgIC8vIOagueaNruaatOmcsueahOacjeWKoeaWueazleWQjeazqOWGjOacjeWKoVxuICAgICAgICAgICAgICAgIGZvciAobGV0IFtuYW1lLCBmdW5jXSBvZiB0aGlzLl9leHBvcnRNZXRob2QuZW50cmllcygpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNvY2tldC5vbihuYW1lLCBhc3luYyAoZGF0YTogYW55LCBjYWxsYmFjazogRnVuY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZnVuYyhkYXRhLCBzb2NrZXQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycm9yLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzb2NrZXQub24oJ2Rpc2Nvbm5ldCcsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zb2NrZXRMaXN0LmRlbGV0ZShzb2NrZXQuaWQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uRGlzY29ubmVjdChzb2NrZXQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uU3RvcCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMubnNwID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5zb2NrZXRMaXN0LmNsZWFyKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWQkeWkluaatOmcsuacjeWKoVxuICAgICAqIFxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuYW1lIOimgeazqOWGjOeahOacjeWKoeWQjeensFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMg6KaB5rOo5YaM55qE5pyN5YqhXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZXhwb3J0KG5hbWU6IHN0cmluZywgZnVuYzogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgICAgIHRoaXMuX2V4cG9ydE1ldGhvZC5zZXQobmFtZSwgZnVuYyk7XG4gICAgICAgIHJldHVybiBmdW5jO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOW9k+acieaWsOeahOaOpeWPo+i/nuaOpeS4iueahOaXtuWAmVxuICAgICAqIFxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAcGFyYW0ge1NvY2tldElPLlNvY2tldH0gc29ja2V0IOaWsOeahOi/nuaOpVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBvbkNvbm5lY3Rpb24oc29ja2V0OiBTb2NrZXRJTy5Tb2NrZXQpIHsgfVxuXG4gICAgLyoqXG4gICAgICog5b2T5pyJ5o6l5Y+j5pat5byA6L+e5o6l55qE5pe25YCZXG4gICAgICogXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEBwYXJhbSB7U29ja2V0SU8uU29ja2V0fSBzb2NrZXQg6KaB6KKr5pat5byA55qE6L+e5o6lXG4gICAgICovXG4gICAgcHJvdGVjdGVkIG9uRGlzY29ubmVjdChzb2NrZXQ6IFNvY2tldElPLlNvY2tldCkgeyB9XG59Il19