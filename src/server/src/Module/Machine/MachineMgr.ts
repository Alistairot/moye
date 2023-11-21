import { Singleton } from "../../../../common/Core/Singleton/Singleton";
import { IMachineCfg } from "./IMachineCfg";

/**
 * 机器管理
 * 在Program.start()之前注册
 * 比如你需要部署在多台机器 那就需要在这里注册
 */
export class MachineMgr extends Singleton{
    private _machines: IMachineCfg[];
    /**
     * key是machine id
     */
    private _machineMap: Map<number, IMachineCfg> = new Map<number, IMachineCfg>();

    init(cfgs: IMachineCfg[]){
        this._machines = cfgs;
    }

    isInit(): boolean{
        return this._machines != null && this._machines.length > 0;
    }

    /**
     * 在配置都加载完成后进行一些初始化操作
     */
    start(){
        for (let i = 0; i < this._machines.length; i++) {
            let cfg = this._machines[i];
            this._machineMap.set(cfg.id, cfg);
        }
    }

    getMachineCfg(machineId: number): IMachineCfg{
        return this._machineMap.get(machineId);
    }
}