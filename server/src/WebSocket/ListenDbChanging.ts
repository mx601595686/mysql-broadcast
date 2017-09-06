import BaseExportService from './BaseExportService';
import DbChangeListener from '../DbChangeListener/DbChangeListener';
import TriggerType from '../DbChangeListener/TriggerType';
import ChangedData from '../DbChangeListener/ChangedData';
import _ = require('lodash');

/**
 * 用于向客户端提供监听数据库变化服务    
 * 提供的接口：     
 * listen：监听数据库变化    
 * remove：移除数据库监听
 * 
 * @export
 * @class ListenDbChanging
 */
export default class ListenDbChanging extends BaseExportService {

    private get _dbcl() {
        return this.services.DbChangeListener as DbChangeListener
    }

    // 保存已注册的监听器，按照socket.id -> schema -> table ->type -> field -> callback 的形式
    private readonly _registeredListener: any = {};

    //客户端注册监听数据库变化
    listen = this.export('listen', async (data: any, socket: SocketIO.Socket) => {
        let { schema, table, type, field = '_' }: { schema: string, table: string, type: TriggerType, field: string } = data;

        if (_.has(this._registeredListener, [socket.id, schema, table, type, field])) {
            throw new Error(`不可以重复注册数据库改变监听器。[${schema}, ${table}, ${type}, ${field}]`);
        }
        function callback(data: ChangedData) {
            socket.emit('receive', data);
        }
        await this._dbcl.listen(callback, schema, table, type, field);
        _.set(this._registeredListener, [socket.id, schema, table, type, field], callback);
    });

    remove = this.export('remove', async (data: any, socket: SocketIO.Socket) => {
        let { schema, table, type, field = '_' }: { schema: string, table: string, type: TriggerType, field: string } = data;
        const callback: any = _.get(this._registeredListener, [socket.id, schema, table, type, field]);
        if (callback === undefined) {
            throw new Error(`要删除的监听器不存在。[${schema}, ${table}, ${type}, ${field}]`);
        }
        await this._dbcl.remove(callback, schema, table, type, field);
    });

    // 清除接口注册过的监听
    protected onDisconnect(socket: SocketIO.Socket) {
        _.forEach(_.get(this._registeredListener, [socket.id], {}), (l1, schema) => {
            _.forEach(_.get(l1, [schema], {}), (l2, table) => {
                _.forEach(_.get(l2, [table], {}), (l3, type: any) => {
                    _.forEach(_.get(l3, [type], {}), (callback: any, field) => {
                        this._dbcl.remove(callback, schema, table, type, field).catch(this.emit.bind(this, 'error'));
                    });
                });
            });
        });
        delete this._registeredListener[socket.id];
    }
}
