import { IPEndPoint } from "../../../../common/Network/IPEndPoint";
import { ISceneCfg } from "./ISceneCfg";

export interface ISceneInfo extends ISceneCfg {
    instanceId: number
    /**
     * 内网ip
     */
    innerIp: string

    /**
     * 外网ip
    */
    outerIp: string
    /**
     * 外网连接地址
     */
    outerAddress?: IPEndPoint
    machineId: number
}