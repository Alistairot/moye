import { IPEndPoint } from "../../../../common/Network/IPEndPoint"
import { IProcessCfg } from "./IProcessCfg"

export interface IProcessInfo extends IProcessCfg{
    /**
     * 外网ip
     */
    outerIp: string

    /**
     * 内网ip
     */
    innerIp: string

    /**
     * 进程在同一台机器用内网地址通信
     */
    innerAddress: IPEndPoint

    /**
     * 进程在不同机器用外网地址通信
     */
    outerAddress: IPEndPoint
}