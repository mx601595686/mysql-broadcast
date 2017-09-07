import io = require('socket.io-client');
import emitter = require('component-emitter');

export default class MysqlBroadcastClient extends emitter {

    private readonly socket_QuerySql: SocketIOClient.Socket;
    private readonly socket_Broadcast: SocketIOClient.Socket;
    private readonly socket_ListenDbChanging: SocketIOClient.Socket;

    /**
     * @param {string} ip 服务器ip，默认localhost
     * @param {string} port 服务器端口，默认3000
     */
    constructor(ip: string = 'localhost', port: number = 3000) {
        super();
        // 打开websocket，但不使用这个接口
        const socket = io(`http://${ip}:${port}`, { autoConnect: false});
        socket.on('error', this.emit.bind(this, 'error'));
        socket.on('disconnect', this.emit.bind(this, 'disconnect'));
        socket.on('connect', this.emit.bind(this, 'connect'));
        socket.open();
        
        this.socket_QuerySql = io(`${ip}:${port}/QuerySql`, { autoConnect: false });
        this.socket_Broadcast = io(`${ip}:${port}/Broadcast`, { autoConnect: false });
        this.socket_ListenDbChanging = io(`${ip}:${port}/ListenDbChanging`, { autoConnect: false });
    }

    /**
     * 执行sql查询，使用方法与mysql.js的query方法是一样的
     * 
     * @param {string} sql 
     * @param {any[]} args 
     * @returns {Promise<{ results: any[], fields: any[] }>} 
     */
    query(sql: string, args?: any[]): Promise<{ results: any[], fields: any[] }> {
        return new Promise((resolve, reject) => {
            this.socket_QuerySql.emit('query', [sql, args], function (err: string, data: any) {
                err ? reject(new Error(err)) : resolve(data);
            });
        });
    }
}