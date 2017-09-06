import { ServicesManager } from "service-starter";

import MysqlDaemon from "./MySQL/MysqlDaemon";
import MysqlConnection from "./MySQL/MysqlConnection";
import MysqlHttpPlugin from "./MySQL/MysqlHttpPlugin";

import SystemLogger from './SystemLogger/SystemLogger';

import ClearTrigger from "./DbChangeListener/ClearTrigger";
import QueryTableInfo from "./DbChangeListener/QueryTableInfo";
import DbChangeListener from "./DbChangeListener/DbChangeListener";
import TriggerCreator from "./DbChangeListener/TriggerCreator";
import ChangedDataReceiver from "./DbChangeListener/ChangedDataReceiver";

import WebSocket from './WebSocket/WebSocket';
import QuerySql from './WebSocket/QuerySql';
import Broadcast from './WebSocket/Broadcast';
import ListenDbChanging from './WebSocket/ListenDbChanging';

class MysqlBroadcast extends ServicesManager { }

const mb = new MysqlBroadcast();

//MySQL
mb.registerService(new MysqlDaemon());
mb.registerService(new MysqlConnection());
mb.registerService(new MysqlHttpPlugin());

//系统日志记录表
mb.registerService(new SystemLogger());

//表变化监听器
mb.registerService(new QueryTableInfo());
mb.registerService(new ClearTrigger());
mb.registerService(new TriggerCreator());
mb.registerService(new ChangedDataReceiver());
mb.registerService(new DbChangeListener());

//向外界提供websocket服务接口
mb.registerService(new WebSocket());
mb.registerService(new QuerySql());
mb.registerService(new Broadcast());
mb.registerService(new ListenDbChanging());

mb.start();