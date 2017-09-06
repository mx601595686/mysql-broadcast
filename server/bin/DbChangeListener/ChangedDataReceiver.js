"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const raw = require("raw-body");
const service_starter_1 = require("service-starter");
const ChangedData_1 = require("./ChangedData");
class ChangedDataReceiver extends service_starter_1.ServiceModule {
    onStart() {
        return new Promise((resolve, reject) => {
            this._http = http.createServer(async (req, res) => {
                if (req.method === 'POST') {
                    try {
                        const body = await raw(req, {
                            length: req.headers['content-length'],
                            encoding: true
                        });
                        if (this.onData === undefined) {
                            throw new Error('没有注册数据接收回调函数onData');
                        }
                        this.onData(new ChangedData_1.default(body));
                        res.statusCode = 200;
                    }
                    catch (err) {
                        this.emit('error', err);
                        res.statusCode = 500;
                    }
                }
                else {
                    res.statusCode = 403;
                    res.statusMessage = 'only post';
                }
                res.end(res.statusCode.toString());
            });
            this._http.on('error', this.emit.bind(this, 'error'));
            this._http.listen(2233, (err) => {
                err ? reject(err) : resolve();
            });
        });
    }
    onStop() {
        return new Promise((resolve, reject) => {
            if (this._http !== undefined) {
                this._http.close((err) => {
                    err ? reject(err) : resolve();
                });
                setTimeout(() => {
                    this._http = undefined;
                    reject(new Error('关闭服务器超时'));
                }, 1000);
            }
            else {
                resolve();
            }
        });
    }
    onHealthChecking() {
        return new Promise((resolve, reject) => {
            http.get('http://localhost:2233', (res) => {
                if (res.statusCode === 403) {
                    resolve();
                }
                else {
                    reject(new Error('程序逻辑出现错误，期望收到的状态码是403，而实际上收到的却是：' + res.statusCode));
                }
            }).on('error', err => {
                reject(new Error('无法连接到 localhost:2233 服务器无响应。' + err));
            });
        });
    }
}
exports.default = ChangedDataReceiver;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRiQ2hhbmdlTGlzdGVuZXIvQ2hhbmdlZERhdGFSZWNlaXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDZCQUE4QjtBQUM5QixnQ0FBaUM7QUFDakMscURBQXFEO0FBRXJELCtDQUF3QztBQVN4Qyx5QkFBeUMsU0FBUSwrQkFBYTtJQU0xRCxPQUFPO1FBQ0gsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFPLENBQUMsT0FBTyxFQUFFLE1BQU07WUFDckMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRztnQkFDMUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUN4QixJQUFJLENBQUM7d0JBQ0QsTUFBTSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxFQUFFOzRCQUN4QixNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs0QkFDckMsUUFBUSxFQUFFLElBQUk7eUJBQ2pCLENBQUMsQ0FBQzt3QkFHSCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7NEJBQzVCLE1BQU0sSUFBSSxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQzt3QkFDMUMsQ0FBQzt3QkFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUkscUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO3dCQUNuQyxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztvQkFDekIsQ0FBQztvQkFBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO3dCQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUN4QixHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQztvQkFDekIsQ0FBQztnQkFDTCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLEdBQUcsQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO29CQUNyQixHQUFHLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQTtnQkFDbkMsQ0FBQztnQkFFRCxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUN2QyxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUN0RCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFVO2dCQUMvQixHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDO1lBQ2xDLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsTUFBTTtRQUNGLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNO1lBQy9CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFVO29CQUN4QixHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDO2dCQUNsQyxDQUFDLENBQUMsQ0FBQztnQkFFSCxVQUFVLENBQUM7b0JBQ1AsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7b0JBQ3ZCLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDYixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osT0FBTyxFQUFFLENBQUM7WUFDZCxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsZ0JBQWdCO1FBQ1osTUFBTSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU07WUFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyx1QkFBdUIsRUFBRSxDQUFDLEdBQUc7Z0JBQ2xDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDekIsT0FBTyxFQUFFLENBQUM7Z0JBQ2QsQ0FBQztnQkFBQyxJQUFJLENBQUMsQ0FBQztvQkFDSixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsa0NBQWtDLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQzNFLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUc7Z0JBQ2QsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLDhCQUE4QixHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDNUQsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXhFRCxzQ0F3RUMiLCJmaWxlIjoiRGJDaGFuZ2VMaXN0ZW5lci9DaGFuZ2VkRGF0YVJlY2VpdmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGh0dHAgPSByZXF1aXJlKCdodHRwJyk7XG5pbXBvcnQgcmF3ID0gcmVxdWlyZSgncmF3LWJvZHknKTtcbmltcG9ydCB7IFNlcnZpY2VNb2R1bGUsIGxvZyB9IGZyb20gXCJzZXJ2aWNlLXN0YXJ0ZXJcIjtcblxuaW1wb3J0IENoYW5nZWREYXRhIGZyb20gJy4vQ2hhbmdlZERhdGEnO1xuXG4vKipcbiAqIOaOpeWPl+aVsOaNruW6k+WPkeadpeeahOiiq+aUueWPmOS6hueahOaVsOaNrlxuICogXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgRGJDaGFuZ2VkRGF0YVJlY2VpdmVyXG4gKiBAZXh0ZW5kcyB7U2VydmljZU1vZHVsZX1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hhbmdlZERhdGFSZWNlaXZlciBleHRlbmRzIFNlcnZpY2VNb2R1bGUge1xuXG4gICAgcHJpdmF0ZSBfaHR0cDogaHR0cC5TZXJ2ZXIgfCB1bmRlZmluZWQ7XG5cbiAgICBvbkRhdGE6ICgoZGF0YTogQ2hhbmdlZERhdGEpID0+IHZvaWQpIHwgdW5kZWZpbmVkO1xuXG4gICAgb25TdGFydCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2h0dHAgPSBodHRwLmNyZWF0ZVNlcnZlcihhc3luYyAocmVxLCByZXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ1BPU1QnKSB7IC8v5Y+q5YWB6K64cG9zdFxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYm9keSA9IGF3YWl0IHJhdyhyZXEsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZW5ndGg6IHJlcS5oZWFkZXJzWydjb250ZW50LWxlbmd0aCddLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVuY29kaW5nOiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy/ovazpgIHmjqXmlLbliLDnmoTmlbDmja5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uRGF0YSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCfmsqHmnInms6jlhozmlbDmja7mjqXmlLblm57osIPlh73mlbBvbkRhdGEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkRhdGEobmV3IENoYW5nZWREYXRhKGJvZHkpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwMztcbiAgICAgICAgICAgICAgICAgICAgcmVzLnN0YXR1c01lc3NhZ2UgPSAnb25seSBwb3N0J1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJlcy5lbmQocmVzLnN0YXR1c0NvZGUudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5faHR0cC5vbignZXJyb3InLCB0aGlzLmVtaXQuYmluZCh0aGlzLCAnZXJyb3InKSk7XG4gICAgICAgICAgICB0aGlzLl9odHRwLmxpc3RlbigyMjMzLCAoZXJyOiBFcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGVyciA/IHJlamVjdChlcnIpIDogcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9uU3RvcCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9odHRwICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9odHRwLmNsb3NlKChlcnI6IEVycm9yKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGVyciA/IHJlamVjdChlcnIpIDogcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2h0dHAgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ+WFs+mXreacjeWKoeWZqOi2heaXticpKTtcbiAgICAgICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvbkhlYWx0aENoZWNraW5nKCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgaHR0cC5nZXQoJ2h0dHA6Ly9sb2NhbGhvc3Q6MjIzMycsIChyZXMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocmVzLnN0YXR1c0NvZGUgPT09IDQwMykge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcign56iL5bqP6YC76L6R5Ye6546w6ZSZ6K+v77yM5pyf5pyb5pS25Yiw55qE54q25oCB56CB5pivNDAz77yM6ICM5a6e6ZmF5LiK5pS25Yiw55qE5Y205piv77yaJyArIHJlcy5zdGF0dXNDb2RlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkub24oJ2Vycm9yJywgZXJyID0+IHtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCfml6Dms5Xov57mjqXliLAgbG9jYWxob3N0OjIyMzMg5pyN5Yqh5Zmo5peg5ZON5bqU44CCJyArIGVycikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn0iXX0=