
/**
 * 受ServicesManager所管理的服务
 */
interface ManagedService {
    //模块类
    moduleClass: typeof BaseModule;
    //构建的实例
    instance: BaseModule;
    //模块运行时出现错如何处理
    onError: ServiceOnError
}