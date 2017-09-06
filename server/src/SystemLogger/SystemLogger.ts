import { log, ServiceModule } from "service-starter";

import MysqlConnection from '../MySQL/MysqlConnection';

/**
 * 在数据库中记录系统日志。检查数据库中是否有系统错误记录表
 * 
 * @export
 * @class SystemLogger
 * @extends {ServiceModule}
 */
export default class SystemLogger extends ServiceModule {

    private get _mysqlCon() {
        return this.services.MysqlConnection as MysqlConnection;
    }

    /**
     * 检查系统日志记录数据库__mb__
     * 检查系统日志记录类型表是否已经创建
     * 检查系统日志记录表
     * 
     * @returns {Promise<void>} 
     * @memberof SystemLogger
     */
    async onStart(): Promise<void> {
        // 创建__mb__
        await this._mysqlCon.query("CREATE DATABASE IF NOT EXISTS `__mb__` /*!40100 DEFAULT CHARACTER SET utf8 */");

        // 检查 log_type 表是否已经创建
        const has = await this._mysqlCon.query(" \
            SELECT  \
                `TABLE_NAME` \
            FROM \
                `INFORMATION_SCHEMA`.`TABLES` \
            WHERE \
                `TABLE_SCHEMA` = '__mb__' \
                    AND `TABLE_NAME` = 'log_type' \
        ");

        // 创建 log_type 表
        if (has.length == 0) {
            await this._mysqlCon.query(" \
                CREATE TABLE IF NOT EXISTS `__mb__`.`log_type` ( \
                    `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT, \
                    `name` VARCHAR(255) NOT NULL COMMENT '类型名称', \
                    PRIMARY KEY (`id`), \
                    UNIQUE KEY `id_UNIQUE` (`id`), \
                    UNIQUE KEY `name_UNIQUE` (`name`) \
                )  ENGINE=INNODB DEFAULT CHARSET=UTF8 COMMENT='日志类型'; \
            ");

            //插入数据
            await this._mysqlCon.query(" \
                INSERT INTO `__mb__`.`log_type` (`id`, `name`) VALUES ('1', 'system_log'); \
                INSERT INTO `__mb__`.`log_type` (`id`, `name`) VALUES ('2', 'system_warning'); \
                INSERT INTO `__mb__`.`log_type` (`id`, `name`) VALUES ('3', 'system_error'); \
            ");
        }

        //创建 log 表
        await this._mysqlCon.query(" \
            CREATE TABLE IF NOT EXISTS `__mb__`.`log` ( \
                `id` int(10) unsigned NOT NULL AUTO_INCREMENT, \
                `type` int(10) unsigned NOT NULL COMMENT '错误类型', \
                `time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '发生时间', \
                `msg` text NOT NULL COMMENT '错误消息', \
                PRIMARY KEY (`id`), \
                UNIQUE KEY `id_UNIQUE` (`id`), \
                KEY `type_idx` (`type`), \
                CONSTRAINT `log_type` FOREIGN KEY (`type`) REFERENCES `log_type` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION \
            ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COMMENT='系统日志记录'; \
        ");

        // 创建存储过程，方便记录日志
        await this._mysqlCon.query(" \
            DROP PROCEDURE IF EXISTS `__mb__`.`log`; \
            CREATE DEFINER = CURRENT_USER PROCEDURE `__mb__`.`log`(msg TEXT) \
            BEGIN \
                INSERT INTO `__mb__`.`log` (`type`, `msg`) VALUES ('1' , msg); \
            END \
        ");

        await this._mysqlCon.query(" \
            DROP PROCEDURE IF EXISTS `__mb__`.`log_warning`; \
            CREATE DEFINER = CURRENT_USER PROCEDURE `__mb__`.`log_warning`(msg TEXT) \
            BEGIN \
                INSERT INTO `__mb__`.`log` (`type`, `msg`) VALUES ('2' , msg); \
            END \
        ");

        await this._mysqlCon.query(" \
            DROP PROCEDURE IF EXISTS `__mb__`.`log_error`; \
            CREATE DEFINER = CURRENT_USER PROCEDURE `__mb__`.`log_error`(msg TEXT) \
            BEGIN \
                INSERT INTO `__mb__`.`log` (`type`, `msg`) VALUES ('3' , msg); \
            END \
        ");
    }

    /**
     * 在数据库中记录日志
     */
    async log(msg: string): Promise<void> {
        await this._mysqlCon.query("CALL `__mb__`.`log`(?)", [msg]);
    }

    /**
     * 在数据库中记录 错误日志
     */
    async error(msg: string): Promise<void> {
        await this._mysqlCon.query("CALL `__mb__`.`log_error`(?)", [msg]);
    }

    /**
     * 在数据库中记录 警告日志
     */
    async warning(msg: string): Promise<void> {
        await this._mysqlCon.query("CALL `__mb__`.`log_warning`(?)", [msg]);
    }
}