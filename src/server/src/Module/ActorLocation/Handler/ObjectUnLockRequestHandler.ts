import { Scene } from "../../../../../common/Entity/Scene";
import { ObjectUnLockRequest, ObjectUnLockResponse } from "../../../Game/Message/InnerMessageCore/InnerMessageCore";
import { AMActorRpcHandler } from "../../Actor/AMActorRpcHandler";
import { ActorMessageHandlerDecorator } from "../../Actor/ActorMessageHandlerDecorator";
import { SceneTypeCore } from "../../Scene/SceneTypeCore";
import { LocationComponent } from "../LocationComponent";

@ActorMessageHandlerDecorator(ObjectUnLockRequest, SceneTypeCore.Location, ObjectUnLockResponse)
export class ObjectUnLockRequestHandler extends AMActorRpcHandler<ObjectUnLockRequest, ObjectUnLockResponse>
{
    protected async run(scene: Scene, request: ObjectUnLockRequest, response: ObjectUnLockResponse) {
        scene.getComponent(LocationComponent).unLock(request.key, request.oldInstanceId, request.instanceId);
    }
}