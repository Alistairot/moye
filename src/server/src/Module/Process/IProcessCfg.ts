export interface IProcessCfg{
    id: number
    /**
     * 这个进程属于哪一台机器
     */
    machineId: number
    /**
     * 内网通信端口
     */
    innerPort: number
}