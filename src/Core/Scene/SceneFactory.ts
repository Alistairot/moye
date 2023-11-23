import { Root } from "../Entity/Root";
import { Scene } from "../Entity/Scene";
import { SceneType } from "../Entity/SceneType";
import { AfterCreateClientScene, AfterCreateCurrentScene } from "../EventSystem/EventCore";
import { EventSystem } from "../EventSystem/EventSystem";
import { IdGenerator } from "../IdGenerator/IdGenerator";
import { SceneRefCom } from "./SceneRefCom";

export class SceneFactory {
    static createClientScene(): Scene {
        const parent = Root.get().scene.getCom(SceneRefCom);
        
        parent.scene?.dispose();
        
        const scene = new Scene();
        scene.init({
            id: 1n,
            sceneType: SceneType.CLIENT,
            name: "Game",
            instanceId: IdGenerator.get().generateInstanceId(),
            parent: parent
        });

        scene.addCom(SceneRefCom);

        parent.scene = scene;

        EventSystem.get().publish(scene, AfterCreateClientScene.create());

        return scene;
    }

    static createCurrentScene(id: bigint, name: string): Scene {
        const clientSceneRef = Root.get().scene.getCom(SceneRefCom);
        const clientScene = clientSceneRef.scene;
        const parent = clientScene.getCom(SceneRefCom);
        
        parent.scene?.dispose();
        
        const scene = new Scene();
        scene.init({
            id: id,
            sceneType: SceneType.CURRENT,
            name: name,
            instanceId: IdGenerator.get().generateInstanceId(),
            parent: parent
        });

        parent.scene = scene;

        EventSystem.get().publish(scene, AfterCreateCurrentScene.create());

        return scene;
    }
}