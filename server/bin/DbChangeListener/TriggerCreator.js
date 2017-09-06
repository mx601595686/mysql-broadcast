"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const service_starter_1 = require("service-starter");
const _ = require("lodash");
const TriggerType_1 = require("./TriggerType");
class TriggerCreator extends service_starter_1.ServiceModule {
    get _mysqlCon() {
        return this.services.MysqlConnection;
    }
    get _tableInfo() {
        return this.services.QueryTableInfo.tableInfo;
    }
    onStart() {
        return Promise.resolve();
    }
    async createInsertTrigger(schema, table) {
        const serialized = this._statement_serialize_data(schema, table, TriggerType_1.default.insert);
        const send = this._statement_send_data();
        const triggerName = `\`${schema}\`.\`__mb__${table}__insert__trigger\``;
        const sql = `
            DROP TRIGGER IF EXISTS ${triggerName};
            CREATE DEFINER = CURRENT_USER TRIGGER ${triggerName} AFTER INSERT ON \`${table}\` FOR EACH ROW
            BEGIN
                ${serialized.changedFields}
                ${serialized.toArray}
                ${send}
            END
        `;
        await this._mysqlCon.query(sql);
    }
    async createDeleteTrigger(schema, table) {
        const serialized = this._statement_serialize_data(schema, table, TriggerType_1.default.delete);
        const send = this._statement_send_data();
        const triggerName = `\`${schema}\`.\`__mb__${table}__delete__trigger\``;
        const sql = `
            DROP TRIGGER IF EXISTS ${triggerName};
            CREATE DEFINER = CURRENT_USER TRIGGER ${triggerName} AFTER DELETE ON \`${table}\` FOR EACH ROW
            BEGIN
                ${serialized.changedFields}
                ${serialized.toArray}
                ${send}
            END
        `;
        await this._mysqlCon.query(sql);
    }
    async createUpdateTrigger(schema, table, fields) {
        const serialized = this._statement_serialize_data(schema, table, TriggerType_1.default.update);
        const send = this._statement_send_data();
        const triggerName = `\`${schema}\`.\`__mb__${table}__update__trigger\``;
        const fieldsIsChange = fields.reduce((pre, cur) => {
            return `
                ${pre}
                IF \`NEW\`.\`${cur}\` != \`OLD\`.\`${cur}\` THEN
                    SET @changed_fields = JSON_ARRAY_APPEND(@changed_fields, '$', '${cur}');
                END IF;
            `;
        }, '');
        const sql = `
            DROP TRIGGER IF EXISTS ${triggerName};
            CREATE DEFINER = CURRENT_USER TRIGGER ${triggerName} AFTER UPDATE ON \`${table}\` FOR EACH ROW
            BEGIN
                ${serialized.changedFields}
                ${fieldsIsChange}
                IF JSON_LENGTH(@changed_fields) > 0 THEN
                    ${serialized.toArray}
                    ${send}
                END IF;
            END
        `;
        await this._mysqlCon.query(sql);
    }
    async removeInsertTrigger(schema, table) {
        const triggerName = `\`${schema}\`.\`__mb__${table}__insert__trigger\``;
        await this._mysqlCon.query(`DROP TRIGGER IF EXISTS ${triggerName};`);
    }
    async removeDeleteTrigger(schema, table) {
        const triggerName = `\`${schema}\`.\`__mb__${table}__delete__trigger\``;
        await this._mysqlCon.query(`DROP TRIGGER IF EXISTS ${triggerName};`);
    }
    async removeUpdateTrigger(schema, table) {
        const triggerName = `\`${schema}\`.\`__mb__${table}__update__trigger\``;
        await this._mysqlCon.query(`DROP TRIGGER IF EXISTS ${triggerName};`);
    }
    _statement_serialize_data(schema, table, type) {
        const args = (isNew) => {
            return Object.keys(_.get(this._tableInfo, [schema, table]))
                .reduce((pre, cur, index) => {
                const result = `, '${cur}', ${isNew ? '`NEW`' : '`OLD`'}.\`${cur}\``;
                if (index === 0) {
                    return pre + result.slice(1);
                }
                else {
                    return pre + result;
                }
            }, '');
        };
        const newData = type != TriggerType_1.default.delete ? `SELECT JSON_OBJECT(${args(true)})  INTO @new_data;` : 'set @new_data = NULL;';
        const oldData = type != TriggerType_1.default.insert ? `SELECT JSON_OBJECT(${args(false)}) INTO @old_data;` : 'set @old_data = NULL;';
        return {
            changedFields: "set @changed_fields = JSON_ARRAY();",
            toArray: `
                ${newData}
                ${oldData}
                SET @value = JSON_ARRAY(${type}, '${schema}', '${table}', @changed_fields, @new_data, @old_data);
            `
        };
    }
    _statement_send_data() {
        return `
            SELECT http_post('http://localhost:2233', @value) INTO @return;
            IF @return != 200 THEN
                CALL \`__mb__\`.\`log_error\`(CONCAT_WS('\n', '向服务器发送数据异常。', '返回状态码：', @return, '发送的数据：', @value));
            END IF; 
        `;
    }
}
exports.default = TriggerCreator;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRiQ2hhbmdlTGlzdGVuZXIvVHJpZ2dlckNyZWF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBcUQ7QUFDckQsNEJBQTZCO0FBRzdCLCtDQUF3QztBQVN4QyxvQkFBb0MsU0FBUSwrQkFBYTtJQUVyRCxJQUFZLFNBQVM7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBa0MsQ0FBQztJQUM1RCxDQUFDO0lBR0QsSUFBWSxVQUFVO1FBQ2xCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUM7SUFDbEQsQ0FBQztJQUVELE9BQU87UUFDSCxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFVRCxLQUFLLENBQUMsbUJBQW1CLENBQUMsTUFBYyxFQUFFLEtBQWE7UUFDbkQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUscUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUN6QyxNQUFNLFdBQVcsR0FBRyxLQUFLLE1BQU0sY0FBYyxLQUFLLHFCQUFxQixDQUFDO1FBR3hFLE1BQU0sR0FBRyxHQUFHO3FDQUNpQixXQUFXO29EQUNJLFdBQVcsc0JBQXNCLEtBQUs7O2tCQUV4RSxVQUFVLENBQUMsYUFBYTtrQkFDeEIsVUFBVSxDQUFDLE9BQU87a0JBQ2xCLElBQUk7O1NBRWIsQ0FBQztRQUVGLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQVVELEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxNQUFjLEVBQUUsS0FBYTtRQUNuRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxxQkFBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JGLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQ3pDLE1BQU0sV0FBVyxHQUFHLEtBQUssTUFBTSxjQUFjLEtBQUsscUJBQXFCLENBQUM7UUFFeEUsTUFBTSxHQUFHLEdBQUc7cUNBQ2lCLFdBQVc7b0RBQ0ksV0FBVyxzQkFBc0IsS0FBSzs7a0JBRXhFLFVBQVUsQ0FBQyxhQUFhO2tCQUN4QixVQUFVLENBQUMsT0FBTztrQkFDbEIsSUFBSTs7U0FFYixDQUFDO1FBRUYsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBV0QsS0FBSyxDQUFDLG1CQUFtQixDQUFDLE1BQWMsRUFBRSxLQUFhLEVBQUUsTUFBZ0I7UUFDckUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUscUJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUN6QyxNQUFNLFdBQVcsR0FBRyxLQUFLLE1BQU0sY0FBYyxLQUFLLHFCQUFxQixDQUFDO1FBR3hFLE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRztZQUMxQyxNQUFNLENBQUM7a0JBQ0QsR0FBRzsrQkFDVSxHQUFHLG1CQUFtQixHQUFHO3FGQUM2QixHQUFHOzthQUUzRSxDQUFDO1FBQ04sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBR1AsTUFBTSxHQUFHLEdBQUc7cUNBQ2lCLFdBQVc7b0RBQ0ksV0FBVyxzQkFBc0IsS0FBSzs7a0JBRXhFLFVBQVUsQ0FBQyxhQUFhO2tCQUN4QixjQUFjOztzQkFFVixVQUFVLENBQUMsT0FBTztzQkFDbEIsSUFBSTs7O1NBR2pCLENBQUM7UUFFRixNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFRRCxLQUFLLENBQUMsbUJBQW1CLENBQUMsTUFBYyxFQUFFLEtBQWE7UUFDbkQsTUFBTSxXQUFXLEdBQUcsS0FBSyxNQUFNLGNBQWMsS0FBSyxxQkFBcUIsQ0FBQztRQUN4RSxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLDBCQUEwQixXQUFXLEdBQUcsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFRRCxLQUFLLENBQUMsbUJBQW1CLENBQUMsTUFBYyxFQUFFLEtBQWE7UUFDbkQsTUFBTSxXQUFXLEdBQUcsS0FBSyxNQUFNLGNBQWMsS0FBSyxxQkFBcUIsQ0FBQztRQUN4RSxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLDBCQUEwQixXQUFXLEdBQUcsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFRRCxLQUFLLENBQUMsbUJBQW1CLENBQUMsTUFBYyxFQUFFLEtBQWE7UUFDbkQsTUFBTSxXQUFXLEdBQUcsS0FBSyxNQUFNLGNBQWMsS0FBSyxxQkFBcUIsQ0FBQztRQUN4RSxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLDBCQUEwQixXQUFXLEdBQUcsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFhTyx5QkFBeUIsQ0FBQyxNQUFjLEVBQUUsS0FBYSxFQUFFLElBQWlCO1FBRTlFLE1BQU0sSUFBSSxHQUFHLENBQUMsS0FBYztZQUV4QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztpQkFDdEQsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLO2dCQUNwQixNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsTUFBTSxLQUFLLEdBQUcsT0FBTyxHQUFHLE9BQU8sTUFBTSxHQUFHLElBQUksQ0FBQztnQkFDckUsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2QsTUFBTSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDO2dCQUN4QixDQUFDO1lBQ0wsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2YsQ0FBQyxDQUFBO1FBR0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxJQUFJLHFCQUFXLENBQUMsTUFBTSxHQUFHLHNCQUFzQixJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLHVCQUF1QixDQUFDO1FBQzVILE1BQU0sT0FBTyxHQUFHLElBQUksSUFBSSxxQkFBVyxDQUFDLE1BQU0sR0FBRyxzQkFBc0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsR0FBRyx1QkFBdUIsQ0FBQztRQUU1SCxNQUFNLENBQUM7WUFDSCxhQUFhLEVBQUUscUNBQXFDO1lBQ3BELE9BQU8sRUFBRTtrQkFDSCxPQUFPO2tCQUNQLE9BQU87MENBQ2lCLElBQUksTUFBTSxNQUFNLE9BQU8sS0FBSzthQUN6RDtTQUNKLENBQUE7SUFDTCxDQUFDO0lBS08sb0JBQW9CO1FBQ3hCLE1BQU0sQ0FBQzs7Ozs7U0FLTixDQUFDO0lBQ04sQ0FBQztDQUNKO0FBak1ELGlDQWlNQyIsImZpbGUiOiJEYkNoYW5nZUxpc3RlbmVyL1RyaWdnZXJDcmVhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2VydmljZU1vZHVsZSwgbG9nIH0gZnJvbSBcInNlcnZpY2Utc3RhcnRlclwiO1xuaW1wb3J0IF8gPSByZXF1aXJlKCdsb2Rhc2gnKTtcblxuaW1wb3J0IE15c3FsQ29ubmVjdGlvbiBmcm9tICcuLi9NeVNRTC9NeXNxbENvbm5lY3Rpb24nO1xuaW1wb3J0IFRyaWdnZXJUeXBlIGZyb20gJy4vVHJpZ2dlclR5cGUnO1xuXG4vKipcbiAqIOWcqOaVsOaNruW6k+S4reWIm+W7uuaJgOmcgOeahOinpuWPkeWZqFxuICogXG4gKiBAZXhwb3J0XG4gKiBAY2xhc3MgVHJpZ2dlckNyZWF0b3JcbiAqIEBleHRlbmRzIHtTZXJ2aWNlTW9kdWxlfVxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBUcmlnZ2VyQ3JlYXRvciBleHRlbmRzIFNlcnZpY2VNb2R1bGUge1xuXG4gICAgcHJpdmF0ZSBnZXQgX215c3FsQ29uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5NeXNxbENvbm5lY3Rpb24gYXMgTXlzcWxDb25uZWN0aW9uO1xuICAgIH1cblxuICAgIC8vbXlzcWzooajkv6Hmga9cbiAgICBwcml2YXRlIGdldCBfdGFibGVJbmZvKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXJ2aWNlcy5RdWVyeVRhYmxlSW5mby50YWJsZUluZm87XG4gICAgfVxuXG4gICAgb25TdGFydCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWIm+W7uuaPkuWFpeiusOW9leinpuWPkeWZqCAgIFxuICAgICAqIOWIm+W7uueahFRyaWdnZXLlkI3np7DkuLrvvJpfX21iX1/ooajlkI1fX2luc2VydF9fdHJpZ2dlclxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzY2hlbWEg5pWw5o2u5bqT5ZCNXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRhYmxlIOihqOWQjVxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fSBcbiAgICAgKi9cbiAgICBhc3luYyBjcmVhdGVJbnNlcnRUcmlnZ2VyKHNjaGVtYTogc3RyaW5nLCB0YWJsZTogU3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IHNlcmlhbGl6ZWQgPSB0aGlzLl9zdGF0ZW1lbnRfc2VyaWFsaXplX2RhdGEoc2NoZW1hLCB0YWJsZSwgVHJpZ2dlclR5cGUuaW5zZXJ0KTtcbiAgICAgICAgY29uc3Qgc2VuZCA9IHRoaXMuX3N0YXRlbWVudF9zZW5kX2RhdGEoKTtcbiAgICAgICAgY29uc3QgdHJpZ2dlck5hbWUgPSBgXFxgJHtzY2hlbWF9XFxgLlxcYF9fbWJfXyR7dGFibGV9X19pbnNlcnRfX3RyaWdnZXJcXGBgO1xuXG4gICAgICAgIC8vIOS4jemcgOeUqGRlbGltaXRlcuimgeadpeabv+aNok15U1FM5YiG6ZqU56ym77yM5ZCm5YiZ5Lya5Ye66ZSZXG4gICAgICAgIGNvbnN0IHNxbCA9IGBcbiAgICAgICAgICAgIERST1AgVFJJR0dFUiBJRiBFWElTVFMgJHt0cmlnZ2VyTmFtZX07XG4gICAgICAgICAgICBDUkVBVEUgREVGSU5FUiA9IENVUlJFTlRfVVNFUiBUUklHR0VSICR7dHJpZ2dlck5hbWV9IEFGVEVSIElOU0VSVCBPTiBcXGAke3RhYmxlfVxcYCBGT1IgRUFDSCBST1dcbiAgICAgICAgICAgIEJFR0lOXG4gICAgICAgICAgICAgICAgJHtzZXJpYWxpemVkLmNoYW5nZWRGaWVsZHN9XG4gICAgICAgICAgICAgICAgJHtzZXJpYWxpemVkLnRvQXJyYXl9XG4gICAgICAgICAgICAgICAgJHtzZW5kfVxuICAgICAgICAgICAgRU5EXG4gICAgICAgIGA7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5fbXlzcWxDb24ucXVlcnkoc3FsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDliJvlu7rliKDpmaTorrDlvZXop6blj5HlmaggICBcbiAgICAgKiDliJvlu7rnmoRUcmlnZ2Vy5ZCN56ew5Li677yaX19tYl9f6KGo5ZCNX19kZWxldGVfX3RyaWdnZXJcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2NoZW1hIOaVsOaNruW6k+WQjVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0YWJsZSDooajlkI1cbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn0gXG4gICAgICovXG4gICAgYXN5bmMgY3JlYXRlRGVsZXRlVHJpZ2dlcihzY2hlbWE6IHN0cmluZywgdGFibGU6IFN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBzZXJpYWxpemVkID0gdGhpcy5fc3RhdGVtZW50X3NlcmlhbGl6ZV9kYXRhKHNjaGVtYSwgdGFibGUsIFRyaWdnZXJUeXBlLmRlbGV0ZSk7XG4gICAgICAgIGNvbnN0IHNlbmQgPSB0aGlzLl9zdGF0ZW1lbnRfc2VuZF9kYXRhKCk7XG4gICAgICAgIGNvbnN0IHRyaWdnZXJOYW1lID0gYFxcYCR7c2NoZW1hfVxcYC5cXGBfX21iX18ke3RhYmxlfV9fZGVsZXRlX190cmlnZ2VyXFxgYDtcblxuICAgICAgICBjb25zdCBzcWwgPSBgXG4gICAgICAgICAgICBEUk9QIFRSSUdHRVIgSUYgRVhJU1RTICR7dHJpZ2dlck5hbWV9O1xuICAgICAgICAgICAgQ1JFQVRFIERFRklORVIgPSBDVVJSRU5UX1VTRVIgVFJJR0dFUiAke3RyaWdnZXJOYW1lfSBBRlRFUiBERUxFVEUgT04gXFxgJHt0YWJsZX1cXGAgRk9SIEVBQ0ggUk9XXG4gICAgICAgICAgICBCRUdJTlxuICAgICAgICAgICAgICAgICR7c2VyaWFsaXplZC5jaGFuZ2VkRmllbGRzfVxuICAgICAgICAgICAgICAgICR7c2VyaWFsaXplZC50b0FycmF5fVxuICAgICAgICAgICAgICAgICR7c2VuZH1cbiAgICAgICAgICAgIEVORFxuICAgICAgICBgO1xuXG4gICAgICAgIGF3YWl0IHRoaXMuX215c3FsQ29uLnF1ZXJ5KHNxbCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Yib5bu65a2X5q615pu05paw6Kem5Y+R5ZmoICAgXG4gICAgICog5Yib5bu655qEVHJpZ2dlcuWQjeensOS4uu+8ml9fbWJfX+ihqOWQjV9fdXBkYXRlX190cmlnZ2VyXG4gICAgICogXG4gICAgICogQHBhcmFtIHNjaGVtYSDmlbDmja7lupPlkI1cbiAgICAgKiBAcGFyYW0gdGFibGUg6KGo5ZCNXG4gICAgICogQHBhcmFtIGZpZWxkcyDopoHnm5Hmjqflj5jljJbnmoTlrZfmrrXliJfooahcbiAgICAgKiBAcmV0dXJucyB7UHJvbWlzZTx2b2lkPn0gXG4gICAgICovXG4gICAgYXN5bmMgY3JlYXRlVXBkYXRlVHJpZ2dlcihzY2hlbWE6IHN0cmluZywgdGFibGU6IFN0cmluZywgZmllbGRzOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCBzZXJpYWxpemVkID0gdGhpcy5fc3RhdGVtZW50X3NlcmlhbGl6ZV9kYXRhKHNjaGVtYSwgdGFibGUsIFRyaWdnZXJUeXBlLnVwZGF0ZSk7XG4gICAgICAgIGNvbnN0IHNlbmQgPSB0aGlzLl9zdGF0ZW1lbnRfc2VuZF9kYXRhKCk7XG4gICAgICAgIGNvbnN0IHRyaWdnZXJOYW1lID0gYFxcYCR7c2NoZW1hfVxcYC5cXGBfX21iX18ke3RhYmxlfV9fdXBkYXRlX190cmlnZ2VyXFxgYDtcblxuICAgICAgICAvLyDliKTlrprlrZfmrrXmmK/lkKbmlLnlj5jnmoRzcWzjgILlpoLmnpzlj5HnlJ/kuoblj5jljJblsIblj5jljJblrZfmrrXnmoTlrZfmrrXlkI3liqDlhaVAY2hhbmdlZF9maWVsZHPmlbDnu4TkuK1cbiAgICAgICAgY29uc3QgZmllbGRzSXNDaGFuZ2UgPSBmaWVsZHMucmVkdWNlKChwcmUsIGN1cikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGBcbiAgICAgICAgICAgICAgICAke3ByZX1cbiAgICAgICAgICAgICAgICBJRiBcXGBORVdcXGAuXFxgJHtjdXJ9XFxgICE9IFxcYE9MRFxcYC5cXGAke2N1cn1cXGAgVEhFTlxuICAgICAgICAgICAgICAgICAgICBTRVQgQGNoYW5nZWRfZmllbGRzID0gSlNPTl9BUlJBWV9BUFBFTkQoQGNoYW5nZWRfZmllbGRzLCAnJCcsICcke2N1cn0nKTtcbiAgICAgICAgICAgICAgICBFTkQgSUY7XG4gICAgICAgICAgICBgO1xuICAgICAgICB9LCAnJyk7XG5cbiAgICAgICAgLy8g56Gu5L+d5omA5YWz5rOo5a2X5q6155qE5YC85Y+R55Sf5pS55Y+Y5LmL5ZCO5YaN5Y+R6YCB5pWw5o2uXG4gICAgICAgIGNvbnN0IHNxbCA9IGBcbiAgICAgICAgICAgIERST1AgVFJJR0dFUiBJRiBFWElTVFMgJHt0cmlnZ2VyTmFtZX07XG4gICAgICAgICAgICBDUkVBVEUgREVGSU5FUiA9IENVUlJFTlRfVVNFUiBUUklHR0VSICR7dHJpZ2dlck5hbWV9IEFGVEVSIFVQREFURSBPTiBcXGAke3RhYmxlfVxcYCBGT1IgRUFDSCBST1dcbiAgICAgICAgICAgIEJFR0lOXG4gICAgICAgICAgICAgICAgJHtzZXJpYWxpemVkLmNoYW5nZWRGaWVsZHN9XG4gICAgICAgICAgICAgICAgJHtmaWVsZHNJc0NoYW5nZX1cbiAgICAgICAgICAgICAgICBJRiBKU09OX0xFTkdUSChAY2hhbmdlZF9maWVsZHMpID4gMCBUSEVOXG4gICAgICAgICAgICAgICAgICAgICR7c2VyaWFsaXplZC50b0FycmF5fVxuICAgICAgICAgICAgICAgICAgICAke3NlbmR9XG4gICAgICAgICAgICAgICAgRU5EIElGO1xuICAgICAgICAgICAgRU5EXG4gICAgICAgIGA7XG5cbiAgICAgICAgYXdhaXQgdGhpcy5fbXlzcWxDb24ucXVlcnkoc3FsKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDliKDpmaTmj5LlhaXorrDlvZXop6blj5HlmaggXG4gICAgICogXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHNjaGVtYSDmlbDmja7lupPlkI1cbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdGFibGUg6KGo5ZCNXG4gICAgICovXG4gICAgYXN5bmMgcmVtb3ZlSW5zZXJ0VHJpZ2dlcihzY2hlbWE6IHN0cmluZywgdGFibGU6IFN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBjb25zdCB0cmlnZ2VyTmFtZSA9IGBcXGAke3NjaGVtYX1cXGAuXFxgX19tYl9fJHt0YWJsZX1fX2luc2VydF9fdHJpZ2dlclxcYGA7XG4gICAgICAgIGF3YWl0IHRoaXMuX215c3FsQ29uLnF1ZXJ5KGBEUk9QIFRSSUdHRVIgSUYgRVhJU1RTICR7dHJpZ2dlck5hbWV9O2ApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOenu+mZpOWIoOmZpOiusOW9leinpuWPkeWZqCBcbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2NoZW1hIOaVsOaNruW6k+WQjVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0YWJsZSDooajlkI1cbiAgICAgKi9cbiAgICBhc3luYyByZW1vdmVEZWxldGVUcmlnZ2VyKHNjaGVtYTogc3RyaW5nLCB0YWJsZTogU3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIGNvbnN0IHRyaWdnZXJOYW1lID0gYFxcYCR7c2NoZW1hfVxcYC5cXGBfX21iX18ke3RhYmxlfV9fZGVsZXRlX190cmlnZ2VyXFxgYDtcbiAgICAgICAgYXdhaXQgdGhpcy5fbXlzcWxDb24ucXVlcnkoYERST1AgVFJJR0dFUiBJRiBFWElTVFMgJHt0cmlnZ2VyTmFtZX07YCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Yig6Zmk5pu05paw6K6w5b2V6Kem5Y+R5ZmoIFxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBzY2hlbWEg5pWw5o2u5bqT5ZCNXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHRhYmxlIOihqOWQjVxuICAgICAqL1xuICAgIGFzeW5jIHJlbW92ZVVwZGF0ZVRyaWdnZXIoc2NoZW1hOiBzdHJpbmcsIHRhYmxlOiBTdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgY29uc3QgdHJpZ2dlck5hbWUgPSBgXFxgJHtzY2hlbWF9XFxgLlxcYF9fbWJfXyR7dGFibGV9X191cGRhdGVfX3RyaWdnZXJcXGBgO1xuICAgICAgICBhd2FpdCB0aGlzLl9teXNxbENvbi5xdWVyeShgRFJPUCBUUklHR0VSIElGIEVYSVNUUyAke3RyaWdnZXJOYW1lfTtgKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDnlKjkuo7nlJ/miJDluo/liJfljJbmlbDmja7nmoTpgqPkuIDmrrVTUUzjgIIgXG4gICAgICog5bqP5YiX5YyW5ZCO55qE57uT5p6c5L+d5a2Y5ZyoIEBuZXdfZGF0YSAsIEBvbGRfZGF0YSDov5nlh6DkuKpzcWzlj5jph4/kuK3jgIIgICAgXG4gICAgICog5pWw5o2u5Y+R55Sf5pS55Y+Y55qE5a2X5q61IEBjaGFuZ2VkX2ZpZWxkc1xuICAgICAqIFxuICAgICAqIOi/lOWbnueahOe7k+aenHtjaGFuZ2VkRmllbGRzOuS/neWtmOWAvOWPkeeUn+aUueWPmOS6hueahOWtl+auteeahOWtl+auteWQjSwgdG9BcnJhee+8muWwhuWQhOS4quWtl+autee7k+WQiOaIkOS4gOS4quaVsOe7hOeahHNxbH1cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc2NoZW1hIOaVsOaNruW6k+WQjVxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0YWJsZSDooajlkI1cbiAgICAgKiBAcGFyYW0gdHlwZSDop6blj5HlmajnmoTnsbvlnotcbiAgICAgKi9cbiAgICBwcml2YXRlIF9zdGF0ZW1lbnRfc2VyaWFsaXplX2RhdGEoc2NoZW1hOiBzdHJpbmcsIHRhYmxlOiBTdHJpbmcsIHR5cGU6IFRyaWdnZXJUeXBlKSB7XG5cbiAgICAgICAgY29uc3QgYXJncyA9IChpc05ldzogYm9vbGVhbikgPT4ge1xuICAgICAgICAgICAgLy8g6L+Z6YeMcmVkdWNl5pa55rOV5b+F6aG75o+Q5L6b5LiA5Liq5Yid5aeL5YC877yM5ZCm5YiZ5b2T5pWw57uE5YWD57Sg5Y+q5pyJ5LiA5Liq5pe277yMcmVkdWNl5pa55rOV5LiN5Lya5omn6KGMXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoXy5nZXQodGhpcy5fdGFibGVJbmZvLCBbc2NoZW1hLCB0YWJsZV0pKVxuICAgICAgICAgICAgICAgIC5yZWR1Y2UoKHByZSwgY3VyLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSBgLCAnJHtjdXJ9JywgJHtpc05ldyA/ICdgTkVXYCcgOiAnYE9MRGAnfS5cXGAke2N1cn1cXGBgO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHsgICAgLy/nrKzkuIDkuKrliY3pnaLkuI3luKbpgJflj7dcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwcmUgKyByZXN1bHQuc2xpY2UoMSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJlICsgcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgJycpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9pbnNlcnQg6Kem5Y+R5Zmo5Lit5rKh5pyJb2xk77yMZGVsZXRl6Kem5Y+R5Zmo5Lit5rKh5pyJbmV3XG4gICAgICAgIGNvbnN0IG5ld0RhdGEgPSB0eXBlICE9IFRyaWdnZXJUeXBlLmRlbGV0ZSA/IGBTRUxFQ1QgSlNPTl9PQkpFQ1QoJHthcmdzKHRydWUpfSkgIElOVE8gQG5ld19kYXRhO2AgOiAnc2V0IEBuZXdfZGF0YSA9IE5VTEw7JztcbiAgICAgICAgY29uc3Qgb2xkRGF0YSA9IHR5cGUgIT0gVHJpZ2dlclR5cGUuaW5zZXJ0ID8gYFNFTEVDVCBKU09OX09CSkVDVCgke2FyZ3MoZmFsc2UpfSkgSU5UTyBAb2xkX2RhdGE7YCA6ICdzZXQgQG9sZF9kYXRhID0gTlVMTDsnO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjaGFuZ2VkRmllbGRzOiBcInNldCBAY2hhbmdlZF9maWVsZHMgPSBKU09OX0FSUkFZKCk7XCIsXG4gICAgICAgICAgICB0b0FycmF5OiBgXG4gICAgICAgICAgICAgICAgJHtuZXdEYXRhfVxuICAgICAgICAgICAgICAgICR7b2xkRGF0YX1cbiAgICAgICAgICAgICAgICBTRVQgQHZhbHVlID0gSlNPTl9BUlJBWSgke3R5cGV9LCAnJHtzY2hlbWF9JywgJyR7dGFibGV9JywgQGNoYW5nZWRfZmllbGRzLCBAbmV3X2RhdGEsIEBvbGRfZGF0YSk7XG4gICAgICAgICAgICBgXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogIFxuICAgICAqIOWPkemAgeaVsOaNrueahOmCo+S4gOautXNxbOOAguWMheWQq+mUmeivr+WkhOeQhlxuICAgICAqL1xuICAgIHByaXZhdGUgX3N0YXRlbWVudF9zZW5kX2RhdGEoKSB7XG4gICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICBTRUxFQ1QgaHR0cF9wb3N0KCdodHRwOi8vbG9jYWxob3N0OjIyMzMnLCBAdmFsdWUpIElOVE8gQHJldHVybjtcbiAgICAgICAgICAgIElGIEByZXR1cm4gIT0gMjAwIFRIRU5cbiAgICAgICAgICAgICAgICBDQUxMIFxcYF9fbWJfX1xcYC5cXGBsb2dfZXJyb3JcXGAoQ09OQ0FUX1dTKCdcXG4nLCAn5ZCR5pyN5Yqh5Zmo5Y+R6YCB5pWw5o2u5byC5bi444CCJywgJ+i/lOWbnueKtuaAgeegge+8micsIEByZXR1cm4sICflj5HpgIHnmoTmlbDmja7vvJonLCBAdmFsdWUpKTtcbiAgICAgICAgICAgIEVORCBJRjsgXG4gICAgICAgIGA7XG4gICAgfVxufSJdfQ==
