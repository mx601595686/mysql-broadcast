import { log, ServiceModule } from "service-starter";

import MysqlConnection from '../MySQL/MysqlConnection';

/**
 * 向外界暴露服务
 * 
 * @export
 * @class ServicesExposer
 * @extends {ServiceModule}
 */
export default class ServicesExposer extends ServiceModule {
    onStart(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    private get _mysqlCon() {
        return this.services.MysqlConnection as MysqlConnection;
    }
}
