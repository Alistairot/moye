import { Scene } from "../../../../../common/Entity/Scene"
import { coreLog } from "../../../../../common/Core/Logger/CoreLogHelper"
import { MsgPrinter } from "../../../../../common/Message/MsgPrinter"
import { DBQueryRequest, DBQueryResponse } from "../../../Game/Message/InnerMessageCore/InnerMessageCore"
import { AMActorRpcHandler } from "../../Actor/AMActorRpcHandler"
import { ActorMessageHandlerDecorator } from "../../Actor/ActorMessageHandlerDecorator"
import { ProcessMgr } from "../../Process/ProcessMgr"
import { SceneTypeCore } from "../../Scene/SceneTypeCore"
import { ObjectSerializeMgr } from "../../Serialize/ObjectSerializeMgr"
import { DBCacheComponentMgr } from "../DBCacheComponentMgr"

@ActorMessageHandlerDecorator(DBQueryRequest, SceneTypeCore.DBCache, DBQueryResponse)
export class DBQueryRequestHandler extends AMActorRpcHandler<DBQueryRequest, DBQueryResponse>{
    protected async run(scene: Scene, request: DBQueryRequest, response: DBQueryResponse) {
        let cacheComponentMgr = scene.getComponent(DBCacheComponentMgr);
        let objectSerializeMgr = ObjectSerializeMgr.getInst();
        let type = objectSerializeMgr.getType(request.typeCode);
        let cacheCom = cacheComponentMgr.getCacheCom(type);
        let obj = await cacheCom.query(request.numberKey || request.stringKey)

        if (obj != null) {
            let isSameMachine = ProcessMgr.getInst().processIdIsInMachine(this._fromProcess);
            response.data = isSameMachine ? objectSerializeMgr.serializeSameMachine(obj) : objectSerializeMgr.serialize(obj);
            // coreLog(`db 查询到类型=${obj.constructor.name}`)
            // MsgPrinter.getInst().print(obj, '查询到内容');
        } else {
            coreLog(`db 没查询到类型typecode=${request.typeCode}`)
        }
    }
}