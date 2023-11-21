import { Scene } from "../../../../../common/Entity/Scene";
import { ObjectRemoveRequest, ObjectRemoveResponse } from "../../../Game/Message/InnerMessageCore/InnerMessageCore";
import { AMActorRpcHandler } from "../../Actor/AMActorRpcHandler";
import { ActorMessageHandlerDecorator } from "../../Actor/ActorMessageHandlerDecorator";
import { SceneTypeCore } from "../../Scene/SceneTypeCore";
import { LocationComponent } from "../LocationComponent";

@ActorMessageHandlerDecorator(ObjectRemoveRequest, SceneTypeCore.Location, ObjectRemoveResponse)
export class ObjectRemoveRequestHandler extends AMActorRpcHandler<ObjectRemoveRequest, ObjectRemoveResponse>
{
    protected async run(scene: Scene, request: ObjectRemoveRequest, response: ObjectRemoveResponse) {
        await scene.getComponent(LocationComponent).remove(request.key);
    }
}