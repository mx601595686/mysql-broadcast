import BaseExportService from './BaseExportService';
import es = require('eventspace');
import _ = require('lodash');

/**
 * 用于向客户端提供广播服务    
 * 提供的接口：     
 * broadcast：向其他socket广播数据    
 * receive：监听指定路径上的广播消息    
 * receiveBroadcast：向socket发送广播数据    
 * 
 * @export
 * @class Broadcast
 */
export default class Broadcast extends BaseExportService {

    //保存接口要监听的路径列表，key是socket.id，value是path列表
    private _receivePath: Map<string, Set<string>> = new Map();

    private _es = new es.EventSpace();

    //向其他接口广播数据。path：要广播的路径
    private broadcast = this.export('broadcast', (data: any) => {
        if (!_.isString(data.path)) {
            throw new Error(`广播路径必须为为字符串`)
        }
        this._es.send(data.path, data.data);
    });
    
    //监听指定路径上的广播消息
    private receive = this.export('receive', (data: any, socket: SocketIO.Socket) => {
        if (!_.isString(data.path)) {
            throw new Error(`广播路径必须为为字符串`)
        }

        let receiveList = this._receivePath.get(socket.id);
        if (receiveList === undefined) {
            receiveList = new Set();
            this._receivePath.set(socket.id, receiveList);
        }

        if (receiveList.has(data.path)) {
            throw new Error(`不可以重复注册了广播监听器。路径：${data.path}`);
        } else {
            receiveList.add(data.path);
            const pathArray = data.path.split('.');
            pathArray.push(socket.id);
            this._es.receive(pathArray, (data: any) => {
                socket.emit('receiveBroadcast', data.path, data);
            });
        }
    });

    // 如果接口连接断开，取消该接口注册过的所有监听路径
    protected onDisconnect(socket: SocketIO.Socket){
        const receiveList = this._receivePath.get(socket.id);
        if (receiveList) {
            for (let path of receiveList) {
                const pathArray = path.split('.');
                pathArray.push(socket.id);
                this._es.cancel(pathArray);
            }
            this._receivePath.delete(socket.id);
        }
    }
}