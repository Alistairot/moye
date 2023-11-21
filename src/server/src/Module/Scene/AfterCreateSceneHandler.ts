import { Scene } from "../../../../common/Entity/Scene";
import { DBCacheComponentMgr } from "../DB/DBCacheComponentMgr";
import { DBComponent } from "../DB/DBComponent";
import { GateMapComponent } from "../../Game/Scene/Gate/GateMapComponent";
import { GatePlayerComponent } from "../../Game/Scene/Gate/GatePlayer/GatePlayerComponent";
import { GateSessionKeyComponent } from "../../Game/Scene/Gate/GateSessionKeyComponent";
import { ISceneInfo } from "./ISceneInfo";
import { SceneTypeCore } from "./SceneTypeCore";
import { LocationComponent } from "../ActorLocation/LocationComponent";
import { UnitComponent } from "../Unit/UnitComponent";

/**
 * 为什么不用事件呢 因为事件没办法保证顺序
 * 这里需要在创建场景后比框架外先执行
 */
export class AfterCreateSceneHandler{
    static run(scene: Scene, sceneInfo: ISceneInfo) {
        switch (sceneInfo.sceneType) {
            case SceneTypeCore.DBCache: {
                // 允许不配置数据库 比如开发阶段
                if(sceneInfo.dbAddress!= null && sceneInfo.dbAddress.length > 0){
                    scene.addComponent(DBComponent).init(sceneInfo.dbAddress, sceneInfo.dbName);
                }

                let dbCacheInterval = sceneInfo.dbCacheInterval || 5 * 60 * 1000;
                scene.addComponent(DBCacheComponentMgr).init(dbCacheInterval);
                break;
            }

            case SceneTypeCore.Gate: {
                scene.addComponent(GateSessionKeyComponent);
                scene.addComponent(GatePlayerComponent);
                scene.addComponent(GateMapComponent);
                break;
            }

            case SceneTypeCore.Map: {
                scene.addComponent(UnitComponent);
                break;
            }

            case SceneTypeCore.Location: {
                scene.addComponent(LocationComponent);
                break;
            }
        }
    }
}