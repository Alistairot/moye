import { SceneFactory } from "./SceneFactory";
import { SceneManagerComponent } from "./SceneManagerComponent";
import { SceneMgr } from "./SceneMgr";

/**
 * 负责创建所有的scene
 */
export class SceneCreator {
    static run() {
        let sceneInfos = SceneMgr.getInst().curProcessScenes()

        for (let i = 0; i < sceneInfos.length; i++) {
            let sceneInfo = sceneInfos[i];

            SceneFactory.createByInfo(SceneManagerComponent.inst, sceneInfo)
        }
    }
}