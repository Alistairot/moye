import { Scene } from "../../../../../common/Entity/Scene";
import { coreLog } from "../../../../../common/Core/Logger/CoreLogHelper";
import { ObjectGetRequest, ObjectGetResponse } from "../../../Game/Message/InnerMessageCore/InnerMessageCore";
import { AMActorRpcHandler } from "../../Actor/AMActorRpcHandler";
import { ActorMessageHandlerDecorator } from "../../Actor/ActorMessageHandlerDecorator";
import { SceneTypeCore } from "../../Scene/SceneTypeCore";
import { LocationComponent } from "../LocationComponent";

@ActorMessageHandlerDecorator(ObjectGetRequest, SceneTypeCore.Location, ObjectGetResponse)
export class ObjectGetRequestHandler extends AMActorRpcHandler<ObjectGetRequest, ObjectGetResponse>
{
    protected async run(scene: Scene, request: ObjectGetRequest, response: ObjectGetResponse) {
        let instanceId = await scene.getComponent(LocationComponent).get(request.key);

        if(instanceId == null){
            instanceId = 0
        }

        response.instanceId = instanceId;
    }
}