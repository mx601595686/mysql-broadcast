import ServicesExposer from './ServicesExposer';
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
export default class Broadcast {

    //保存客户端要监听的路径
    private _receivePath: Map<string, Set<string>> = new Map();

    private _es = new es.EventSpace();

    addSocket(socket: SocketIO.Socket) {
        //向其他接口广播数据。path：要广播的路径
        socket.on('broadcast', (path: string, data: any, callback: Function) => {
            if (!_.isString(path)) {
                this.servicesExposer.emit('error', new Error(`发现有接口传递过来的广播路径不为字符串。socketId:${socket.id},路径：${path}`));
                return;
            }
            this._es.send(path, data);
        });

        //监听指定路径上的广播消息
        socket.on('receive', (path: string) => {
            if (!_.isString(path)) {
                this.servicesExposer.emit('error', new Error(`发现有接口传递过来的广播路径不为字符串。socketId:${socket.id},路径：${path}`));
                return;
            }

            let receiveList = this._receivePath.get(socket.id);
            if (receiveList === undefined) {
                receiveList = new Set();
                this._receivePath.set(socket.id, receiveList);
            }

            if (receiveList.has(path)) {
                this.servicesExposer.emit('error', new Error(`发现有接口重复注册了广播监听器。socketId:${socket.id},路径：${path}`));
            } else {
                receiveList.add(path);
                const pathArray = path.split('.');
                pathArray.push(socket.id);
                this._es.receive(pathArray, (data: any) => {
                    socket.emit('receiveBroadcast', path, data);
                });
            }
        });

        // 如果接口连接断开，取消该接口注册过的所有监听路径
        socket.on('disconnect', () => {
            const receiveList = this._receivePath.get(socket.id);
            if (receiveList) {
                this._receivePath.delete(socket.id);
                for (let path of receiveList) {
                    const pathArray = path.split('.');
                    pathArray.push(socket.id);
                    this._es.cancel(pathArray);
                }
            }
        });
    }
}