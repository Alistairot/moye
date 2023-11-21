import { JsHelper } from "../../../../../common/Core/JavaScript/JsHelper";
import { coreLog } from "../../../../../common/Core/Logger/CoreLogHelper";
import { ISceneInfo } from "../../../Module/Scene/ISceneInfo";
import { SceneMgr } from "../../../Module/Scene/SceneMgr";
import { SceneTypeCore } from "../../../Module/Scene/SceneTypeCore";

export class RealmGateAddressHelper {
    public static getGate(account: string): ISceneInfo {
        let sceneMgr = SceneMgr.getInst();
        let sceneInfos = sceneMgr.getSceneByType(SceneTypeCore.Gate)
        let n = JsHelper.modeString(account, sceneInfos.length)

        coreLog(`${account} 网关=${n}`)

        return sceneInfos[n];
    }
}