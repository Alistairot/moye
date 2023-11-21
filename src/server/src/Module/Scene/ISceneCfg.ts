export interface ISceneCfg{
    id: number
    name: string
    sceneType: string
    /**
     * 属于哪一个进程
     */
    processId: number

    /**
     * 外网端口
     * 这个端口是给客户端连接的 不填写则代表不需要对外网开放
     */
    outerPort?: number

    /**
     * 数据库地址
     * dbCache scene填写
     * 格式: mongodb://[账号]:[密码]@[ip]:[端口]/[数据库名]
     * 例如: mongodb://abcjus:sdgfdsds@149.221.52.87:15782/game1
     */
    dbAddress?: string;
    /**
     * 数据库名称
     * dbCache scene填写
     */
    dbName?: string;

    /**
     * 数据库缓存间隔
     */
    dbCacheInterval?: number
}