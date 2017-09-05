import ServicesExposer from './ServicesExposer';
import DbChangeListener from '../DbChangeListener/DbChangeListener';
import TriggerType from '../DbChangeListener/TriggerType';
import _ = require('lodash');

/**
 * 用于向客户端提供监听数据库变化服务    
 * 提供的接口：     
 * 
 * @export
 * @class ListenDbChanging
 */
export default class ListenDbChanging {

    private readonly _dbcl: DbChangeListener;

    // 保存已注册的监听器，按照socket.id -> schema -> table ->type -> field -> callback 的形式
    private readonly _registeredListener: any = {};

    constructor(private readonly servicesExposer: ServicesExposer) {
        this._dbcl = servicesExposer.services.DbChangeListener;
    }

    addSocket(socket: SocketIO.Socket) {

        //客户端注册监听数据库变化
        socket.on('listen', (schema: string, table: string, type: TriggerType, field: string) => {
            if(_.has([socket.id,schema,table,type,field]))
        });

        // 如果接口连接断开
        socket.on('disconnect', () => {

        });
    }
}
