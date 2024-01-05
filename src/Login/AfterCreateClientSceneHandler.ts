import { AEventHandler, AfterCreateClientScene, EventDecorator, EventSystem, Scene, SceneType } from "../Core/Core";
import { LoginCom } from "./LoginCom";
import { AfterAddLoginCom } from "./LoginEvent";

@EventDecorator(AfterCreateClientScene, SceneType.CLIENT)
export class AfterCreateClientSceneHandler extends AEventHandler<AfterCreateClientScene>{
    protected run(scene: Scene, args: AfterCreateClientScene) {
        scene.addCom(LoginCom);

        EventSystem.get().publish(scene, new AfterAddLoginCom());
    }
}