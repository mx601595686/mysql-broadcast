import { ServicesManager } from "service-starter";
import MysqlInitializer from "./MysqlInitializer/MysqlInitializer";
import DbChangeListener from "./DbChangeListener/DbChangeListener";

class MysqlBroadcast extends ServicesManager {
}

const mb = new MysqlBroadcast();

mb.registerService(new MysqlInitializer());
mb.registerService(new DbChangeListener());

mb.start();