import { Scene } from "../../../../../common/Entity/Scene"
import { coreError, coreLog } from "../../../../../common/Core/Logger/CoreLogHelper"
import { DEVELOP } from "../../../../../common/Macro"
import { MsgPrinter } from "../../../../../common/Message/MsgPrinter"
import { ErrorCore } from "../../../../../common/Network/ErrorCore"
import { DBCacheRequest, DBCacheResponse } from "../../../Game/Message/InnerMessageCore/InnerMessageCore"
import { AMActorRpcHandler } from "../../Actor/AMActorRpcHandler"
import { ActorMessageHandlerDecorator } from "../../Actor/ActorMessageHandlerDecorator"
import { ProcessMgr } from "../../Process/ProcessMgr"
import { SceneTypeCore } from "../../Scene/SceneTypeCore"
import { ObjectSerializeMgr } from "../../Serialize/ObjectSerializeMgr"
import { DBCacheComponentMgr } from "../DBCacheComponentMgr"

@ActorMessageHandlerDecorator(DBCacheRequest, SceneTypeCore.DBCache, DBCacheResponse)
export class DBCacheRequestHandler extends AMActorRpcHandler<DBCacheRequest, DBCacheResponse>{
    protected async run(scene: Scene, request: DBCacheRequest, response: DBCacheResponse) {
        let cacheComponentMgr = scene.getComponent(DBCacheComponentMgr);
        let isSameMachine = ProcessMgr.getInst().processIdIsInMachine(this._fromProcess);
        let obj = isSameMachine ? ObjectSerializeMgr.getInst().deserializeSameMachine(request.data) :
            ObjectSerializeMgr.getInst().deserialize(request.data);

        if (!obj.constructor) {
            coreError(`obj.constructor is null`);
            response.error = ErrorCore.ERR_Exception;
            return
        }

        // coreLog(`db缓存解析出类型=${obj.constructor.name}`);
        // MsgPrinter.getInst().print(obj, 'db缓存解析出内容');
        let cacheCom = cacheComponentMgr.getCacheCom(obj.constructor);

        if (DEVELOP) {
            if (cacheCom == null) {
                // coreError(`cacheCom is null, type=${obj.constructor.name}`);
                response.error = ErrorCore.ERR_Exception;
                return
            }
        }

        cacheCom.save(obj);
    }
}