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

mb.start();