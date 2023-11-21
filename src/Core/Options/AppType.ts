export enum AppType
{
    /**
     * 启动指定进程
     */
    Server,
    /**
     * 守护进程 用来启动本台机器上的所有进程
     */
    Watcher,

    /**
     * 将所有进程合并到一个进程启动
     * 如果有监听外网的端口 要确保不会冲突
     */
    AllInOne,
}