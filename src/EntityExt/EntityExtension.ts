import { Entity, Scene, SceneRefCom, SceneType } from "../Core/Core";


declare module "../Core/Core" {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    interface Entity {
        currentScene(): Scene
        clientScene(): Scene
    }
}

Entity.prototype.clientScene = function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: Entity = this;
    const domainScene = self.domainScene();

    if(domainScene.sceneType == SceneType.CLIENT) {
        return domainScene;
    }else if(domainScene.sceneType == SceneType.CURRENT) {
        return domainScene.parent.parent as Scene;
    }else if(domainScene.sceneType == SceneType.PROCESS) {
        return domainScene.getCom(SceneRefCom).scene;
    }
};

Entity.prototype.currentScene = function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self: Entity = this;
    const clientScene = self.clientScene();

    return clientScene.getCom(SceneRefCom).scene;
};