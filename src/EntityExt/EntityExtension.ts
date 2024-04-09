import { Entity, Scene, SceneType } from "../Core/Core";
import { SceneMgr } from "../Core/Scene/SceneMgr";


declare module "../Core/Core" {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Entity {
        currentScene(): Scene
        clientScene(): Scene
    }
}

Entity.prototype.clientScene = function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    // const self: Entity = this;
    // const domainScene = self.domainScene();

    // if(domainScene.sceneType == SceneType.CLIENT) {
    //     return domainScene;
    // }else if(domainScene.sceneType == SceneType.CURRENT) {
    //     return domainScene.parent.parent as Scene;
    // }else if(domainScene.sceneType == SceneType.PROCESS) {
    //     return domainScene.getCom(SceneRefCom).scene;
    // }

    return SceneMgr.get().client;
};

Entity.prototype.currentScene = function () {
    return SceneMgr.get().current;
};