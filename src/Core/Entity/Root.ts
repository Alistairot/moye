
import { IdGenerator } from "../IdGenerator/IdGenerator";
import { Singleton } from "../Singleton/Singleton";
import { Scene } from "./Scene";
import { SceneType } from "./SceneType";

/**
 * 保存根节点
 */
export class Root extends Singleton {
    public get scene(): Scene {
        return this._scene;
    }

    private _scene: Scene;

    awake() {
        const scene = new Scene();
        scene.init({
            id: 0n,
            sceneType: SceneType.PROCESS,
            name: "Process",
            instanceId: IdGenerator.get().generateInstanceId(),
        });

        this._scene = scene;
    }
}