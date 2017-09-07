/// <reference path="../node_modules/@types/mocha/index.d.ts" />
import expect = require('expect.js');
import MysqlBroadcastClient = require('..');
import io = require('socket.io-client');

describe('连接服务器，并测试执行基本sql查询', function () {

    let con: MysqlBroadcastClient;

    before(function (done) {
        this.timeout(20000)
        con = new MysqlBroadcastClient();
        con.once('connect', done);
        con.once('error', done);
    /*     const socket = io(`http://localhost:3000`, { autoConnect: false});
        socket.on('error',()=>{
            debugger
        });
        socket.on('connect_timeout',()=>{
            debugger
        });
        socket.on('disconnect', ()=>{
            debugger
        });
        socket.on('connect',()=>{
            done()
            debugger
        });
        socket.open() */
    });

    it('测试SQL执行', async function () {
        debugger
        const result1 = await con.query('select 1');
        expect(result1.fields).be.a('Array');
    });
});