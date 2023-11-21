import { Scene } from "../../../../../common/Entity/Scene"
import { DBDeleteRequest, DBDeleteResponse } from "../../../Game/Message/InnerMessageCore/InnerMessageCore"
import { AMActorRpcHandler } from "../../Actor/AMActorRpcHandler"
import { ActorMessageHandlerDecorator } from "../../Actor/ActorMessageHandlerDecorator"
import { SceneTypeCore } from "../../Scene/SceneTypeCore"
import { ObjectSerializeMgr } from "../../Serialize/ObjectSerializeMgr"
import { DBCacheComponentMgr } from "../DBCacheComponentMgr"

@ActorMessageHandlerDecorator(DBDeleteRequest, SceneTypeCore.DBCache, DBDeleteResponse)
export class DBDeleteRequestHandler extends AMActorRpcHandler<DBDeleteRequest, DBDeleteResponse>{
    protected async run(scene: Scene, request: DBDeleteRequest, response: DBDeleteResponse) {
        let cacheComponentMgr = scene.getComponent(DBCacheComponentMgr);
        let objectSerializeMgr = ObjectSerializeMgr.getInst();
        let type = objectSerializeMgr.getType(request.typeCode);
        let cacheCom = cacheComponentMgr.getCacheCom(type);

        await cacheCom.delete(request.numberKey || request.stringKey);
    }
}