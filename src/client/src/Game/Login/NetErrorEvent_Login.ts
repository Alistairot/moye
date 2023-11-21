import { Scene } from "../../../../common/Entity/Scene";
import { SceneTypeCore } from "../../../../common/Entity/SceneTypeCore";
import { AEventHandler, EventHandlerDecorator } from "../../../../common/EventSystem/Event";
import { NetErrorEvent } from "../../../../common/EventSystem/EventCore";
import { LoginComponent } from "./LoginComponent";

@EventHandlerDecorator(NetErrorEvent, SceneTypeCore.Client)
export class NetErrorEvent_Login extends AEventHandler<NetErrorEvent>{
    protected run(clientScene: Scene, args: NetErrorEvent) {
        let loginComponent = clientScene.getComponent(LoginComponent);

        loginComponent.onNetError(args.channelId, args.error);
    }
}