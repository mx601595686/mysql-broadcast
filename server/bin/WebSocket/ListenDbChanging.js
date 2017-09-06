"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseExportService_1 = require("./BaseExportService");
const _ = require("lodash");
class ListenDbChanging extends BaseExportService_1.default {
    constructor() {
        super(...arguments);
        this._registeredListener = {};
        this.listen = this.export('listen', async (data, socket) => {
            let { schema, table, type, field = '_' } = data;
            if (_.has(this._registeredListener, [socket.id, schema, table, type, field])) {
                throw new Error(`不可以重复注册数据库改变监听器。[${schema}, ${table}, ${type}, ${field}]`);
            }
            function callback(data) {
                socket.emit('receive', data);
            }
            await this._dbcl.listen(callback, schema, table, type, field);
            _.set(this._registeredListener, [socket.id, schema, table, type, field], callback);
        });
        this.remove = this.export('remove', async (data, socket) => {
            let { schema, table, type, field = '_' } = data;
            const callback = _.get(this._registeredListener, [socket.id, schema, table, type, field]);
            if (callback === undefined) {
                throw new Error(`要删除的监听器不存在。[${schema}, ${table}, ${type}, ${field}]`);
            }
            await this._dbcl.remove(callback, schema, table, type, field);
        });
    }
    get _dbcl() {
        return this.services.DbChangeListener;
    }
    onDisconnect(socket) {
        _.forEach(_.get(this._registeredListener, [socket.id], {}), (l1, schema) => {
            _.forEach(_.get(l1, [schema], {}), (l2, table) => {
                _.forEach(_.get(l2, [table], {}), (l3, type) => {
                    _.forEach(_.get(l3, [type], {}), (callback, field) => {
                        this._dbcl.remove(callback, schema, table, type, field).catch(this.emit.bind(this, 'error'));
                    });
                });
            });
        });
        delete this._registeredListener[socket.id];
    }
}
exports.default = ListenDbChanging;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldlYlNvY2tldC9MaXN0ZW5EYkNoYW5naW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkRBQW9EO0FBSXBELDRCQUE2QjtBQVc3QixzQkFBc0MsU0FBUSwyQkFBaUI7SUFBL0Q7O1FBT3FCLHdCQUFtQixHQUFRLEVBQUUsQ0FBQztRQUcvQyxXQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQVMsRUFBRSxNQUF1QjtZQUNwRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxHQUFHLEdBQUcsRUFBRSxHQUF3RSxJQUFJLENBQUM7WUFFckgsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzRSxNQUFNLElBQUksS0FBSyxDQUFDLG9CQUFvQixNQUFNLEtBQUssS0FBSyxLQUFLLElBQUksS0FBSyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2hGLENBQUM7WUFDRCxrQkFBa0IsSUFBaUI7Z0JBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ2pDLENBQUM7WUFDRCxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM5RCxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDdkYsQ0FBQyxDQUFDLENBQUM7UUFFSCxXQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQVMsRUFBRSxNQUF1QjtZQUNwRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxHQUFHLEdBQUcsRUFBRSxHQUF3RSxJQUFJLENBQUM7WUFDckgsTUFBTSxRQUFRLEdBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDL0YsRUFBRSxDQUFDLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBZSxNQUFNLEtBQUssS0FBSyxLQUFLLElBQUksS0FBSyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQzNFLENBQUM7WUFDRCxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNsRSxDQUFDLENBQUMsQ0FBQztJQWVQLENBQUM7SUEzQ0csSUFBWSxLQUFLO1FBQ2IsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQW9DLENBQUE7SUFDN0QsQ0FBQztJQTZCUyxZQUFZLENBQUMsTUFBdUI7UUFDMUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxNQUFNO1lBQ25FLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxLQUFLO2dCQUN6QyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBUztvQkFDNUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsUUFBYSxFQUFFLEtBQUs7d0JBQ2xELElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0JBQ2pHLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMvQyxDQUFDO0NBQ0o7QUE3Q0QsbUNBNkNDIiwiZmlsZSI6IldlYlNvY2tldC9MaXN0ZW5EYkNoYW5naW5nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJhc2VFeHBvcnRTZXJ2aWNlIGZyb20gJy4vQmFzZUV4cG9ydFNlcnZpY2UnO1xuaW1wb3J0IERiQ2hhbmdlTGlzdGVuZXIgZnJvbSAnLi4vRGJDaGFuZ2VMaXN0ZW5lci9EYkNoYW5nZUxpc3RlbmVyJztcbmltcG9ydCBUcmlnZ2VyVHlwZSBmcm9tICcuLi9EYkNoYW5nZUxpc3RlbmVyL1RyaWdnZXJUeXBlJztcbmltcG9ydCBDaGFuZ2VkRGF0YSBmcm9tICcuLi9EYkNoYW5nZUxpc3RlbmVyL0NoYW5nZWREYXRhJztcbmltcG9ydCBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbi8qKlxuICog55So5LqO5ZCR5a6i5oi356uv5o+Q5L6b55uR5ZCs5pWw5o2u5bqT5Y+Y5YyW5pyN5YqhICAgIFxuICog5o+Q5L6b55qE5o6l5Y+j77yaICAgICBcbiAqIGxpc3Rlbu+8muebkeWQrOaVsOaNruW6k+WPmOWMliAgICBcbiAqIHJlbW92Ze+8muenu+mZpOaVsOaNruW6k+ebkeWQrFxuICogXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgTGlzdGVuRGJDaGFuZ2luZ1xuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaXN0ZW5EYkNoYW5naW5nIGV4dGVuZHMgQmFzZUV4cG9ydFNlcnZpY2Uge1xuXG4gICAgcHJpdmF0ZSBnZXQgX2RiY2woKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNlcnZpY2VzLkRiQ2hhbmdlTGlzdGVuZXIgYXMgRGJDaGFuZ2VMaXN0ZW5lclxuICAgIH1cblxuICAgIC8vIOS/neWtmOW3suazqOWGjOeahOebkeWQrOWZqO+8jOaMieeFp3NvY2tldC5pZCAtPiBzY2hlbWEgLT4gdGFibGUgLT50eXBlIC0+IGZpZWxkIC0+IGNhbGxiYWNrIOeahOW9ouW8j1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX3JlZ2lzdGVyZWRMaXN0ZW5lcjogYW55ID0ge307XG5cbiAgICAvL+WuouaIt+err+azqOWGjOebkeWQrOaVsOaNruW6k+WPmOWMllxuICAgIGxpc3RlbiA9IHRoaXMuZXhwb3J0KCdsaXN0ZW4nLCBhc3luYyAoZGF0YTogYW55LCBzb2NrZXQ6IFNvY2tldElPLlNvY2tldCkgPT4ge1xuICAgICAgICBsZXQgeyBzY2hlbWEsIHRhYmxlLCB0eXBlLCBmaWVsZCA9ICdfJyB9OiB7IHNjaGVtYTogc3RyaW5nLCB0YWJsZTogc3RyaW5nLCB0eXBlOiBUcmlnZ2VyVHlwZSwgZmllbGQ6IHN0cmluZyB9ID0gZGF0YTtcblxuICAgICAgICBpZiAoXy5oYXModGhpcy5fcmVnaXN0ZXJlZExpc3RlbmVyLCBbc29ja2V0LmlkLCBzY2hlbWEsIHRhYmxlLCB0eXBlLCBmaWVsZF0pKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYOS4jeWPr+S7pemHjeWkjeazqOWGjOaVsOaNruW6k+aUueWPmOebkeWQrOWZqOOAglske3NjaGVtYX0sICR7dGFibGV9LCAke3R5cGV9LCAke2ZpZWxkfV1gKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBjYWxsYmFjayhkYXRhOiBDaGFuZ2VkRGF0YSkge1xuICAgICAgICAgICAgc29ja2V0LmVtaXQoJ3JlY2VpdmUnLCBkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB0aGlzLl9kYmNsLmxpc3RlbihjYWxsYmFjaywgc2NoZW1hLCB0YWJsZSwgdHlwZSwgZmllbGQpO1xuICAgICAgICBfLnNldCh0aGlzLl9yZWdpc3RlcmVkTGlzdGVuZXIsIFtzb2NrZXQuaWQsIHNjaGVtYSwgdGFibGUsIHR5cGUsIGZpZWxkXSwgY2FsbGJhY2spO1xuICAgIH0pO1xuXG4gICAgcmVtb3ZlID0gdGhpcy5leHBvcnQoJ3JlbW92ZScsIGFzeW5jIChkYXRhOiBhbnksIHNvY2tldDogU29ja2V0SU8uU29ja2V0KSA9PiB7XG4gICAgICAgIGxldCB7IHNjaGVtYSwgdGFibGUsIHR5cGUsIGZpZWxkID0gJ18nIH06IHsgc2NoZW1hOiBzdHJpbmcsIHRhYmxlOiBzdHJpbmcsIHR5cGU6IFRyaWdnZXJUeXBlLCBmaWVsZDogc3RyaW5nIH0gPSBkYXRhO1xuICAgICAgICBjb25zdCBjYWxsYmFjazogYW55ID0gXy5nZXQodGhpcy5fcmVnaXN0ZXJlZExpc3RlbmVyLCBbc29ja2V0LmlkLCBzY2hlbWEsIHRhYmxlLCB0eXBlLCBmaWVsZF0pO1xuICAgICAgICBpZiAoY2FsbGJhY2sgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGDopoHliKDpmaTnmoTnm5HlkKzlmajkuI3lrZjlnKjjgIJbJHtzY2hlbWF9LCAke3RhYmxlfSwgJHt0eXBlfSwgJHtmaWVsZH1dYCk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGhpcy5fZGJjbC5yZW1vdmUoY2FsbGJhY2ssIHNjaGVtYSwgdGFibGUsIHR5cGUsIGZpZWxkKTtcbiAgICB9KTtcblxuICAgIC8vIOa4hemZpOaOpeWPo+azqOWGjOi/h+eahOebkeWQrFxuICAgIHByb3RlY3RlZCBvbkRpc2Nvbm5lY3Qoc29ja2V0OiBTb2NrZXRJTy5Tb2NrZXQpIHtcbiAgICAgICAgXy5mb3JFYWNoKF8uZ2V0KHRoaXMuX3JlZ2lzdGVyZWRMaXN0ZW5lciwgW3NvY2tldC5pZF0sIHt9KSwgKGwxLCBzY2hlbWEpID0+IHtcbiAgICAgICAgICAgIF8uZm9yRWFjaChfLmdldChsMSwgW3NjaGVtYV0sIHt9KSwgKGwyLCB0YWJsZSkgPT4ge1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChfLmdldChsMiwgW3RhYmxlXSwge30pLCAobDMsIHR5cGU6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2goXy5nZXQobDMsIFt0eXBlXSwge30pLCAoY2FsbGJhY2s6IGFueSwgZmllbGQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2RiY2wucmVtb3ZlKGNhbGxiYWNrLCBzY2hlbWEsIHRhYmxlLCB0eXBlLCBmaWVsZCkuY2F0Y2godGhpcy5lbWl0LmJpbmQodGhpcywgJ2Vycm9yJykpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgZGVsZXRlIHRoaXMuX3JlZ2lzdGVyZWRMaXN0ZW5lcltzb2NrZXQuaWRdO1xuICAgIH1cbn1cbiJdfQ==
