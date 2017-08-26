import DbChangeListener from "./DbChangeListener/DbChangeListener";
import MysqlInitializer from "./MysqlInitializer/MysqlInitializer";
import log from './common/Log';

// 要启动的服务列表（注意启动的顺序）
const serviceModules = [
    MysqlInitializer,   //mysql初始化器
    DbChangeListener,   //数据库表变化监听器
];


// ------------------ 下面是程序代码 -------------------------

// 实例化模块
const services = serviceModules.map(item => new item());

/**
 * 启动服务
 * 启动时按照serviceModules数组的顺序进行启动，如果中途启动失败则关闭已启动的服务
 */
async function startServices() {
    log.l('开始启动MySQL-broadcast');

    for (let m of services) {
        try {
            await m.start();
            m.on('error', (error: Error) => {
                log.e(m.constructor.name, ': ', error);
            });
        } catch (error) {
            log.e('启动失败：', m.constructor.name, ': ', error);
            break;
        }
    }
}

// 关闭服务
async function stopServices() {
    log.l('开始关闭MySQL-broadcast');

    //关闭时从后向前关闭服务
    for (let m of services.reverse()) {
        try {
            await m.start();
            m.removeAllListeners();
        } catch (error) {
            log.e('终止服务时出现异常：', m.constructor.name, ': ', error)
        }
    }

    log.l('成功关闭MySQL-broadcast');

    //退出程序
    process.exit();
}

// 当收到终止信号时
process.once('SIGTERM', stopServices);