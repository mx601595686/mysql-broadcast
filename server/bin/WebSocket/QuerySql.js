"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseExportService_1 = require("./BaseExportService");
class QuerySql extends BaseExportService_1.default {
    constructor() {
        super(...arguments);
        this.query = this.export('query', (data) => {
            return new Promise((resolve, reject) => {
                let { sql, values } = data;
                this._connection.query(sql, values, (err, results, fields) => {
                    err ? reject(err) : resolve([results, fields]);
                });
            });
        });
    }
    get _connection() {
        return this.services.MysqlConnection.connection;
    }
}
exports.default = QuerySql;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldlYlNvY2tldC9RdWVyeVNxbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJEQUFvRDtBQVdwRCxjQUE4QixTQUFRLDJCQUFpQjtJQUF2RDs7UUFTWSxVQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFTO1lBQzNDLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNO2dCQUMvQixJQUFJLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFzQyxJQUFJLENBQUM7Z0JBQzlELElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU07b0JBQ3JELEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7Z0JBQ25ELENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFmRyxJQUFZLFdBQVc7UUFDbkIsTUFBTSxDQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBbUMsQ0FBQyxVQUFVLENBQUM7SUFDekUsQ0FBQztDQWFKO0FBakJELDJCQWlCQyIsImZpbGUiOiJXZWJTb2NrZXQvUXVlcnlTcWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmFzZUV4cG9ydFNlcnZpY2UgZnJvbSAnLi9CYXNlRXhwb3J0U2VydmljZSc7XG5pbXBvcnQgTXlzcWxDb25uZWN0aW9uIGZyb20gJy4uL015U1FML015c3FsQ29ubmVjdGlvbic7XG5cbi8qKlxuICog55So5LqO5ZCR5a6i5oi356uv5o+Q5L6bc3Fs5p+l6K+iICAgICBcbiAqIOaPkOS+m+eahOaOpeWPo++8miAgICBcbiAqIHF1ZXJ577ya5omn6KGMc3Fs5p+l6K+i77yM55So5rOV5LiObXlzcWwucXVlcnnnm7jlkIxcbiAqIFxuICogQGV4cG9ydFxuICogQGNsYXNzIFF1ZXJ5U3FsXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFF1ZXJ5U3FsIGV4dGVuZHMgQmFzZUV4cG9ydFNlcnZpY2Uge1xuXG4gICAgcHJpdmF0ZSBnZXQgX2Nvbm5lY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5zZXJ2aWNlcy5NeXNxbENvbm5lY3Rpb24gYXMgTXlzcWxDb25uZWN0aW9uKS5jb25uZWN0aW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOebtOaOpeafpeivouaVsOaNruW6k1xuICAgICAqL1xuICAgIHByaXZhdGUgcXVlcnkgPSB0aGlzLmV4cG9ydCgncXVlcnknLCAoZGF0YTogYW55KSA9PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBsZXQgeyBzcWwsIHZhbHVlcyB9OiB7IHNxbDogc3RyaW5nLCB2YWx1ZXM6IHN0cmluZ1tdIH0gPSBkYXRhO1xuICAgICAgICAgICAgdGhpcy5fY29ubmVjdGlvbi5xdWVyeShzcWwsIHZhbHVlcywgKGVyciwgcmVzdWx0cywgZmllbGRzKSA9PiB7XG4gICAgICAgICAgICAgICAgZXJyID8gcmVqZWN0KGVycikgOiByZXNvbHZlKFtyZXN1bHRzLCBmaWVsZHNdKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0iXX0=
