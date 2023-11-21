import { Scene } from "../../../../../common/Entity/Scene";
import { ObjectLockRequest, ObjectLockResponse } from "../../../Game/Message/InnerMessageCore/InnerMessageCore";
import { AMActorRpcHandler } from "../../Actor/AMActorRpcHandler";
import { ActorMessageHandlerDecorator } from "../../Actor/ActorMessageHandlerDecorator";
import { SceneTypeCore } from "../../Scene/SceneTypeCore";
import { LocationComponent } from "../LocationComponent";

@ActorMessageHandlerDecorator(ObjectLockRequest, SceneTypeCore.Location, ObjectLockResponse)
export class ObjectLockRequestHandler extends AMActorRpcHandler<ObjectLockRequest, ObjectLockResponse>
{
    protected async run(scene: Scene, request: ObjectLockRequest, response: ObjectLockResponse) {
        await scene.getComponent(LocationComponent).lock(request.key, request.instanceId, request.time);
    }
}