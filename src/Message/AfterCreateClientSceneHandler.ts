import { AEventHandler, AfterCreateClientScene, EventDecorator, EventSystem, Scene, SceneType } from "../Core/Core";
import { NetCom } from "./NetCom";
import { SessionCom } from "./SessionCom";

@EventDecorator(AfterCreateClientScene, SceneType.CLIENT)
export class AfterCreateClientSceneHandler extends AEventHandler<AfterCreateClientScene>{
    protected run(scene: Scene, args: AfterCreateClientScene) {
        scene.addCom(NetCom);
        scene.addCom(SessionCom);
    }
}