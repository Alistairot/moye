import { coreError } from "../../../common/Core/Logger/CoreLogHelper";
import { MachineMgr } from "../Module/Machine/MachineMgr";
import { ProcessMgr } from "../Module/Process/ProcessMgr";
import { SceneMgr } from "../Module/Scene/SceneMgr";
import { SceneTypeCore } from "../Module/Scene/SceneTypeCore";

export class InitHelper{
    /**
     * 必不可少的scene
     */
    private static _needSceneTypes: Set<string> = new Set<string>([
        SceneTypeCore.Realm,
        SceneTypeCore.Gate,
        SceneTypeCore.DBCache,
        SceneTypeCore.Location,
    ])

    static checkInitStatus(): boolean{
        if(!MachineMgr.getInst().isInit()){
            coreError(`MachineMgr没有初始化`);
            return false;
        }
        
        if(!ProcessMgr.getInst().isInit()){
            coreError(`ProcessMgr没有初始化`);
            return false;
        }

        if(!this._checkScenes()){
            return false;
        }

        return true;
    }

    /**
     * 检查一下是否包含了必须的scene
     */
    private static _checkScenes(){
        if(!SceneMgr.getInst().isInit()){
            coreError(`SceneMgr没有初始化`);
            return false;
        }

        let cfgs = SceneMgr.getInst().getSceneCfgs();
        let needSceneTypeCount = new Set<string>;
        for (let i = 0; i < cfgs.length; i++) {
            let cfg = cfgs[i];

            if(this._needSceneTypes.has(cfg.sceneType)){
                needSceneTypeCount.add(cfg.sceneType)
            }
        }

        if(needSceneTypeCount.size != this._needSceneTypes.size){
            coreError(`SceneMgr初始化缺少必要的Scene`);
            return false;
        }

        return true;
    }
}