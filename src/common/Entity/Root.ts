import { Singleton } from "../Core/Singleton/Singleton";
import { EntitySceneFactory } from "./EntitySceneFactory";
import { Scene } from "./Scene";
import { SceneTypeCore } from "./SceneTypeCore";

/**
 * 保存根节点
 */
export class Root extends Singleton {
    public get scene(): Scene {
        return this._scene
    }

    private _scene: Scene

    awake() {
        this._scene = EntitySceneFactory.createScene({ id: 0, sceneType: SceneTypeCore.Process, name: "Process" })
    }
}