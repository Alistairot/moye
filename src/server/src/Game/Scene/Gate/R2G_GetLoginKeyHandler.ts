import { Scene } from "../../../../../common/Entity/Scene";
import { AMActorRpcHandler } from "../../../Module/Actor/AMActorRpcHandler";
import { ActorMessageHandlerDecorator } from "../../../Module/Actor/ActorMessageHandlerDecorator";
import { SceneTypeCore } from "../../../Module/Scene/SceneTypeCore";
import { G2R_GetLoginKey, R2G_GetLoginKey } from "../../Message/InnerMessageCore/InnerMessageCore";
import { GateSessionKeyComponent } from "./GateSessionKeyComponent";

@ActorMessageHandlerDecorator(R2G_GetLoginKey, SceneTypeCore.Gate, G2R_GetLoginKey)
export class R2G_GetLoginKeyHandler extends AMActorRpcHandler<R2G_GetLoginKey, G2R_GetLoginKey>{
    protected async run(scene: Scene, request: R2G_GetLoginKey, response: G2R_GetLoginKey) {
        let key = scene.getComponent(GateSessionKeyComponent).newKey(request.account);

        response.key = key;
    }
}