import { Entity } from "../../../../common/Entity/Entity";
import { Scene } from "../../../../common/Entity/Scene";
import { ClientSceneRefCom } from "../Scene/ClientSceneRefCom";
import { CurrentSceneComponent } from "../Scene/CurrentSceneComponent";

declare module "../../../../common/Entity/Entity" {
    interface Entity {
        currentScene(): Scene
        clientScene(): Scene
    }
}

Entity.prototype.clientScene = function () {
    let self: Entity = this
    let clientScene = self.domainScene().getComponent(ClientSceneRefCom).client

    return clientScene
}

Entity.prototype.currentScene = function () {
    let self: Entity = this
    let clientScene = self.clientScene()
    let currentScene = clientScene.getComponent(CurrentSceneComponent).scene

    return currentScene
}