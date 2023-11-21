import { EntitySceneFactory } from "../../../../common/Entity/EntitySceneFactory";
import { Scene } from "../../../../common/Entity/Scene";
import { SceneTypeCore } from "../../../../common/Entity/SceneTypeCore";
import { EventSystem } from "../../../../common/EventSystem/EventSystem";
import { IdGenerator } from "../../../../common/Core/IdGenerator/IdGenerator";
import { ObjectWait } from "../../../../common/ObjectWait/ObjectWait";
import { NetClientComponent } from "../../Module/Network/NetClientComponent";
import { SessionComponent } from "../../Module/Network/SessionComponent";
import { ClientSceneComponent } from "../../Module/Scene/ClientSceneComponent";
import { ClientSceneRefCom } from "../../Module/Scene/ClientSceneRefCom";
import { CurrentSceneComponent } from "../../Module/Scene/CurrentSceneComponent";
import { UIManager } from "../../Module/UI/Window/UIManager";
import { AfterCreateClientScene, AfterCreateCurrentScene } from "../Event/EventTypeCore";
import { LoginComponent } from "../Login/LoginComponent";

export class SceneFactory {
    static createClientScene(): Scene {
        let clientScene = EntitySceneFactory.createScene({
            id: 1,
            sceneType: SceneTypeCore.Client,
            name: "Game",
            parent: ClientSceneComponent.inst
        });

        clientScene.addComponent(CurrentSceneComponent);
        clientScene.addComponent(NetClientComponent);
        clientScene.addComponent(SessionComponent);
        clientScene.addComponent(ClientSceneRefCom).client = clientScene;
        clientScene.addComponent(LoginComponent);
        clientScene.addComponent(UIManager);
        clientScene.addComponent(ObjectWait);

        EventSystem.getInst().publish(clientScene, AfterCreateClientScene.create());
        return clientScene;
    }

    static createCurrentScene(clientScene: Scene, id: number, name: string): Scene {
        let currentSceneCom = clientScene.getComponent(CurrentSceneComponent);
        currentSceneCom.scene?.dispose(); // 删除之前的CurrentScene，创建新的

        let currentScene = EntitySceneFactory.createScene({
            id: id,
            sceneType: SceneTypeCore.Current,
            name: name,
            parent: currentSceneCom
        });

        currentSceneCom.scene = currentScene;

        currentScene.addComponent(ClientSceneRefCom).client = currentSceneCom.domainScene();

        EventSystem.getInst().publish(currentScene, AfterCreateCurrentScene.create());

        return currentScene;
    }
}