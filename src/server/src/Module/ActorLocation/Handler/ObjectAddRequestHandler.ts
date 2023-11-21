import { Scene } from "../../../../../common/Entity/Scene";
import { ObjectAddRequest, ObjectAddResponse } from "../../../Game/Message/InnerMessageCore/InnerMessageCore";
import { AMActorRpcHandler } from "../../Actor/AMActorRpcHandler";
import { ActorMessageHandlerDecorator } from "../../Actor/ActorMessageHandlerDecorator";
import { SceneTypeCore } from "../../Scene/SceneTypeCore";
import { LocationComponent } from "../LocationComponent";

@ActorMessageHandlerDecorator(ObjectAddRequest, SceneTypeCore.Location, ObjectAddResponse)
export class ObjectAddRequestHandler extends AMActorRpcHandler<ObjectAddRequest, ObjectAddResponse>
{
    protected async run(scene: Scene, request: ObjectAddRequest, response: ObjectAddResponse) {
        await scene.getComponent(LocationComponent).add(request.key, request.instanceId);
    }
}