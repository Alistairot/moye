import { IdGenerator } from "../../../../../common/Core/IdGenerator/IdGenerator";
import { Singleton } from "../../../../../common/Core/Singleton/Singleton"
import { Scene } from "./Scene"
import { SceneType } from "./SceneType";

/**
 * 保存根节点
 */
export class Root extends Singleton {
    public get scene(): Scene {
        return this._scene
    }

    private _scene: Scene

    awake() {
        let scene = new Scene();
        scene.init({
            id: 0,
            sceneType: SceneType.Process,
            name: "Process",
            instanceId: IdGenerator.getInst().generateInstanceId(),
        });

        this._scene = scene;
    }
}