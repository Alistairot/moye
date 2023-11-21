import { coreLog, coreWarn } from "../../../../common/Core/Logger/CoreLogHelper";
import { DEVELOP } from "../../../../common/Macro";
import { IPEndPoint } from "../../../../common/Network/IPEndPoint";
import { Options } from "../../../../common/Core/Options/Options";
import { Singleton } from "../../../../common/Core/Singleton/Singleton";
import { MachineMgr } from "../Machine/MachineMgr";
import { InstanceIdHelper } from "../Scene/InstanceIdHelper";
import { IProcessCfg } from "./IProcessCfg";
import { IProcessInfo } from "./IProcessInfo";

/**
 * 进程管理器 请在Program.start之前调用init方法初始化
 * 可以用来获取进程的内网地址(注意: 这里的内网地址是指进程间通信的地址, 不是指内网IP)
 * 一开始就需要初始化，因为后面需要用到
 * 比如你的gate是一个进程 map又是一个进程，那么你需要在一开始的时候就把他们的ip地址和端口号写好，这样他们才能互相通信
 */
export class ProcessMgr extends Singleton {
    private _processes: IProcessCfg[];
    private _processInfoMap: Map<number, IProcessInfo> = new Map<number, IProcessInfo>();

    /**
     * actorid对应的机器id
     */
    private _actorIdMachineMap: Map<number, number> = new Map<number, number>();
    private _processIdMachineMap: Map<number, number> = new Map<number, number>();
    /**
     * 当前进程所在的机器id
     */
    private _curMachineId: number;

    /**
     * 最多255个进程
     * @param list 进程信息列表
     */
    init(cfgs: IProcessCfg[]) {
        this._processes = cfgs;
    }

    isInit(): boolean {
        return this._processes != null && this._processes.length > 0;
    }

    /**
     * 在配置都加载完成后进行一些初始化操作
     */
    start() {
        for (let i = 0; i < this._processes.length; i++) {
            let cfg = this._processes[i];
            let machineCfg = MachineMgr.getInst().getMachineCfg(cfg.machineId);
            let info: IProcessInfo = {
                id: cfg.id,
                machineId: cfg.machineId,
                innerPort: cfg.innerPort,
                innerIp: machineCfg.innerIp,
                outerIp: machineCfg.outerIp,
                innerAddress: new IPEndPoint(machineCfg.innerIp, cfg.innerPort),
                outerAddress: new IPEndPoint(machineCfg.outerIp, cfg.innerPort),
            }

            this._processInfoMap.set(info.id, info);
        }

        let curProcessInfo = this.getCurProcessInfo();

        this._curMachineId = curProcessInfo.machineId;
    }

    getProcessInfo(processId: number): IProcessInfo {
        return this._processInfoMap.get(processId);
    }

    /**
     * 获取当前进程信息
     * @returns 
     */
    getCurProcessInfo(): IProcessInfo {
        return this.getProcessInfo(Options.getInst().process);
    }

    /**
     * 获取当前机器的所有进程信息
     * @returns 
     */
    getThisMachineProcessInfos(): IProcessInfo[] {
        let infos: IProcessInfo[] = [];
        let curProcessInfo = this.getCurProcessInfo();

        for (let info of this._processInfoMap.values()) {
            if (info.machineId == curProcessInfo.machineId) {
                infos.push(info);
            }
        }

        return infos;
    }

    /**
     * 判断某个actorid是否跟当前进程同一机器
     * @param actorId 
     */
    actorIdIsInMachine(actorId: number): boolean {
        let machineId = this._actorIdMachineMap.get(actorId);

        if (machineId == null) {
            let process = InstanceIdHelper.getProcessId(actorId);
            let machineCfg = this.getProcessInfo(process);
            machineId = machineCfg.machineId;
            this._actorIdMachineMap.set(actorId, machineId);

            if (this._actorIdMachineMap.size > 10000) {
                coreWarn(`_actorIdMachineMap.size > 10000: ${this._actorIdMachineMap.size}, 求优化`);
            }
        }

        return machineId == this._curMachineId;
    }

    processIdIsInMachine(processId: number): boolean {
        let machineId = this._processIdMachineMap.get(processId);

        if (machineId == null) {
            let machineCfg = this.getProcessInfo(processId);
            machineId = machineCfg.machineId;
            this._processIdMachineMap.set(processId, machineId);
        }
        
        return machineId == this._curMachineId;
    }
}