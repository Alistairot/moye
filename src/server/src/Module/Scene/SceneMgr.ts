import { MultiMap } from "../../../../common/DataStructure/MultiMap";
import { IPEndPoint } from "../../../../common/Network/IPEndPoint";
import { AppType } from "../../../../common/Core/Options/AppType";
import { Options } from "../../../../common/Core/Options/Options";
import { Singleton } from "../../../../common/Core/Singleton/Singleton";
import { ProcessMgr } from "../Process/ProcessMgr";
import { ISceneCfg } from "./ISceneCfg";
import { ISceneInfo } from "./ISceneInfo";
import { InstanceIdHelper } from "./InstanceIdHelper";

/**
 * 动态scene自行管理
 * 所有的顶层scene都需要在这里注册 包括不是当前进程的scene
 * 什么是顶层scene呢？就是不会被其他scene包含的scene,比如gate realm
 * 跟ProcessMgr差不多 需要在一开始就注册好
 * scene id是唯一的
 */
export class SceneMgr extends Singleton {
    private _scenes: ISceneCfg[];

    private _allSceneInfo: ISceneInfo[] = [];
    // key是scene id
    private _sceneInfoMap: Map<number, ISceneInfo> = new Map<number, ISceneInfo>();

    // key是进程id 同一进程的所有scene
    private _processSceneMap: MultiMap<number, ISceneInfo> = new MultiMap<number, ISceneInfo>();

    // key是sceneType 同一类型的所有scene
    private _sceneTypeMap: MultiMap<string, ISceneInfo> = new MultiMap<string, ISceneInfo>();

    // key是scene name
    private _sceneNameMap: Map<string, ISceneInfo> = new Map<string, ISceneInfo>();

    /**
     * scene配置
     * @param list 
     */
    init(cfgs: ISceneCfg[]) {
        this._scenes = cfgs;
    }

    isInit(): boolean {
        return this._scenes != null && this._scenes.length > 0;
    }

    /**
     * 在配置都加载完成后进行一些初始化操作
     */
    start() {
        let curProcessInfo = ProcessMgr.getInst().getCurProcessInfo();

        for (let i = 0; i < this._scenes.length; i++) {
            let cfg = this._scenes[i];
            let processId = cfg.processId;

            if(Options.getInst().appType == AppType.AllInOne){
                processId = curProcessInfo.id;
            }

            let instanceId = InstanceIdHelper.getSceneInstanceId(processId, cfg.id);
            let processInfo = ProcessMgr.getInst().getProcessInfo(processId);
            let sceneInfo: ISceneInfo = {
                id: cfg.id,
                name: cfg.name,
                sceneType: cfg.sceneType,
                processId: processId,
                outerPort: cfg.outerPort,
                dbAddress: cfg.dbAddress,
                dbName: cfg.dbName,
                instanceId: instanceId,
                machineId: processInfo.machineId,
                innerIp: processInfo.innerIp,
                outerIp: processInfo.outerIp,
                dbCacheInterval: cfg.dbCacheInterval,
            }

            if(cfg.outerPort){
                sceneInfo.outerAddress = new IPEndPoint(processInfo.outerIp, cfg.outerPort)
            }

            this._sceneInfoMap.set(sceneInfo.id, sceneInfo)
            this._processSceneMap.add(sceneInfo.processId, sceneInfo)
            this._sceneTypeMap.add(sceneInfo.sceneType, sceneInfo)
            this._sceneNameMap.set(sceneInfo.name, sceneInfo)
            this._allSceneInfo.push(sceneInfo)
        }
    }

    getSceneCfgs(): ISceneCfg[] {
        return this._scenes;
    }

    /**
     * 获取当前进程的所有scene
     * @returns 
     */
    curProcessScenes(): ISceneInfo[] {
        let currentProcessId = Options.getInst().process;

        return this._processSceneMap.get(currentProcessId)
    }

    /**
     * 获取同类型的第一个scene
     * @param sceneType 
     * @returns 
     */
    getFirstSceneByType(sceneType: string): ISceneInfo {
        return this.getSceneByType(sceneType)[0]
    }

    /**
     * 获取同类型的所有scene
     * @param sceneType 
     * @returns 
     */
    getSceneByType(sceneType: string): ISceneInfo[] {
        return this._sceneTypeMap.get(sceneType)
    }

    getSceneById(sceneId: number): ISceneInfo {
        return this._sceneInfoMap.get(sceneId)
    }

    getSceneByName(sceneName: string): ISceneInfo {
        return this._sceneNameMap.get(sceneName)
    }
}