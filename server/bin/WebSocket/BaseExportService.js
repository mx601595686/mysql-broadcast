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
            resolve();
        });
    }
    onStop() {
        return new Promise((resolve, reject) => {
            this.nsp = undefined;
            this.socketList.clear();
            resolve();
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldlYlNvY2tldC9CYXNlRXhwb3J0U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFEQUFxRDtBQU9yRCx1QkFBZ0QsU0FBUSwrQkFBYTtJQUFyRTs7UUFPcUIsa0JBQWEsR0FBMEIsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQWdCeEQsZUFBVSxHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBcUVuRSxDQUFDO0lBMUZHLElBQVksR0FBRztRQUNYLE1BQU0sQ0FBRSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQXVCLENBQUMsRUFBRSxDQUFDO0lBQ3JELENBQUM7SUFxQkQsT0FBTztRQUNILE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNO1lBQy9CLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUV4QyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNO2dCQUM3QixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUV2QyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUcxQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUNwRCxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBUyxFQUFFLFFBQWtCO3dCQUNoRCxJQUFJLENBQUM7NEJBQ0QsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDOzRCQUN4QyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQ3JCLENBQUM7d0JBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs0QkFDYixRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7d0JBQy9CLENBQUM7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQztnQkFFRCxNQUFNLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRTtvQkFDbkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNsQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM5QixDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxFQUFFLENBQUM7UUFDZCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxNQUFNO1FBQ0YsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU07WUFDL0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUM7WUFDckIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUN4QixPQUFPLEVBQUUsQ0FBQztRQUNkLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQVVTLE1BQU0sQ0FBQyxJQUFZLEVBQUUsSUFBYztRQUN6QyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkMsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBUVMsWUFBWSxDQUFDLE1BQXVCLElBQUksQ0FBQztJQVF6QyxZQUFZLENBQUMsTUFBdUIsSUFBSSxDQUFDO0NBQ3REO0FBNUZELG9DQTRGQyIsImZpbGUiOiJXZWJTb2NrZXQvQmFzZUV4cG9ydFNlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBsb2csIFNlcnZpY2VNb2R1bGUgfSBmcm9tIFwic2VydmljZS1zdGFydGVyXCI7XG5pbXBvcnQgV2ViU29ja2V0IGZyb20gJy4vV2ViU29ja2V0JztcblxuXG4vKipcbiAqIOaJgOacieS9v+eUqHdlYnNvY2tldOWQkeWkluaPkOS+m+acjeWKoeeahOWfuuexu1xuICovXG5leHBvcnQgZGVmYXVsdCBhYnN0cmFjdCBjbGFzcyBCYXNlRXhwb3J0U2VydmljZSBleHRlbmRzIFNlcnZpY2VNb2R1bGUge1xuXG4gICAgcHJpdmF0ZSBnZXQgX3dzKCkge1xuICAgICAgICByZXR1cm4gKHRoaXMuc2VydmljZXMuV2ViU29ja2V0IGFzIFdlYlNvY2tldCkud3M7XG4gICAgfVxuXG4gICAgLy8g5L+d5a2Y5ZCR5aSW5o+Q5L6b5pyN5Yqh55qE5pa55rOV77yM6YCa6L+H5pys57G755qEZXhwb3J05pa55rOV6L+b6KGM5rOo5YaMXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZXhwb3J0TWV0aG9kOiBNYXA8c3RyaW5nLCBGdW5jdGlvbj4gPSBuZXcgTWFwKCk7XG5cbiAgICAvKipcbiAgICAgKiDlvZPliY3nmoRzb2NrZXQuaW/lkb3lkI3nqbrpl7TvvIzlkb3lkI3nqbrpl7Tpu5jorqTmmK/mnI3liqHlkI1cbiAgICAgKiBcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQHR5cGUge1NvY2tldElPLk5hbWVzcGFjZX1cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgbnNwOiBTb2NrZXRJTy5OYW1lc3BhY2UgfCB1bmRlZmluZWQ7XG5cbiAgICAvKipcbiAgICAgKiDkv53lrZjlu7rnq4vkuIrov57mjqXnmoTmjqXlj6PliJfooajjgIJrZXnmmK9zb2NrZXQuaWRcbiAgICAgKiBcbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQHR5cGUge01hcDxzdHJpbmcsIFNvY2tldElPLlNvY2tldD59XG4gICAgICovXG4gICAgcHJvdGVjdGVkIHNvY2tldExpc3Q6IE1hcDxzdHJpbmcsIFNvY2tldElPLlNvY2tldD4gPSBuZXcgTWFwKCk7XG5cbiAgICBvblN0YXJ0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5uc3AgPSB0aGlzLl93cy5vZihgLyR7dGhpcy5uYW1lfWApO1xuXG4gICAgICAgICAgICB0aGlzLm5zcC5vbignY29ubmVjdGlvbicsIChzb2NrZXQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNvY2tldExpc3Quc2V0KHNvY2tldC5pZCwgc29ja2V0KTtcblxuICAgICAgICAgICAgICAgIHRoaXMub25Db25uZWN0aW9uKHNvY2tldCk7XG5cbiAgICAgICAgICAgICAgICAvLyDmoLnmja7mmrTpnLLnmoTmnI3liqHmlrnms5XlkI3ms6jlhozmnI3liqFcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBbbmFtZSwgZnVuY10gb2YgdGhpcy5fZXhwb3J0TWV0aG9kLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgICAgICAgICBzb2NrZXQub24obmFtZSwgYXN5bmMgKGRhdGE6IGFueSwgY2FsbGJhY2s6IEZ1bmN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZ1bmMoZGF0YSwgc29ja2V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnJvci50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc29ja2V0Lm9uKCdkaXNjb25uZXQnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc29ja2V0TGlzdC5kZWxldGUoc29ja2V0LmlkKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkRpc2Nvbm5lY3Qoc29ja2V0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uU3RvcCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMubnNwID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgdGhpcy5zb2NrZXRMaXN0LmNsZWFyKCk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWQkeWkluaatOmcsuacjeWKoVxuICAgICAqIFxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuYW1lIOimgeazqOWGjOeahOacjeWKoeWQjeensFxuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMg6KaB5rOo5YaM55qE5pyN5YqhXG4gICAgICogQHJldHVybnMge0Z1bmN0aW9ufSBcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZXhwb3J0KG5hbWU6IHN0cmluZywgZnVuYzogRnVuY3Rpb24pOiBGdW5jdGlvbiB7XG4gICAgICAgIHRoaXMuX2V4cG9ydE1ldGhvZC5zZXQobmFtZSwgZnVuYyk7XG4gICAgICAgIHJldHVybiBmdW5jO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOW9k+acieaWsOeahOaOpeWPo+i/nuaOpeS4iueahOaXtuWAmVxuICAgICAqIFxuICAgICAqIEBwcm90ZWN0ZWRcbiAgICAgKiBAcGFyYW0ge1NvY2tldElPLlNvY2tldH0gc29ja2V0IOaWsOeahOi/nuaOpVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBvbkNvbm5lY3Rpb24oc29ja2V0OiBTb2NrZXRJTy5Tb2NrZXQpIHsgfVxuXG4gICAgLyoqXG4gICAgICog5b2T5pyJ5o6l5Y+j5pat5byA6L+e5o6l55qE5pe25YCZXG4gICAgICogXG4gICAgICogQHByb3RlY3RlZFxuICAgICAqIEBwYXJhbSB7U29ja2V0SU8uU29ja2V0fSBzb2NrZXQg6KaB6KKr5pat5byA55qE6L+e5o6lXG4gICAgICovXG4gICAgcHJvdGVjdGVkIG9uRGlzY29ubmVjdChzb2NrZXQ6IFNvY2tldElPLlNvY2tldCkgeyB9XG59Il19
