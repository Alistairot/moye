import { IdGenerator } from "../Core/IdGenerator/IdGenerator";
import { Scene, SceneInitArgs } from "./Scene";

export class EntitySceneFactory {
    public static createScene(args: SceneInitArgs): Scene {
        if (args.instanceId == null) {
            args.instanceId = IdGenerator.getInst().generateInstanceId();
        }

        let scene = new Scene();
        scene.init(args);
        return scene;
    }
}