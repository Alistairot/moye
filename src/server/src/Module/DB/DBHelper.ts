import { JsHelper } from "../../../../common/Core/JavaScript/JsHelper";
import { coreError, coreLog } from "../../../../common/Core/Logger/CoreLogHelper";
import { MsgPrinter } from "../../../../common/Message/MsgPrinter";
import { ErrorCore } from "../../../../common/Network/ErrorCore";
import { Type } from "../../../../common/Core/Type/Type";
import { DBCacheRequest, DBCacheResponse, DBDeleteRequest, DBDeleteResponse, DBQueryRequest, DBQueryResponse } from "../../Game/Message/InnerMessageCore/InnerMessageCore";
import { ActorMsgHelper } from "../Actor/ActorMsgHelper";
import { ProcessMgr } from "../Process/ProcessMgr";
import { SceneMgr } from "../Scene/SceneMgr";
import { SceneTypeCore } from "../Scene/SceneTypeCore";
import { ObjectSerializeMgr } from "../Serialize/ObjectSerializeMgr";

export class DBHelper {
    /**
     * 就一个缓存服 需要的话可以改成多个
     * @param key 
     * @returns 
     */
    private static getDB(): number {
        let dbSceneInfos = SceneMgr.getInst().getSceneByType(SceneTypeCore.DBCache)

        return dbSceneInfos[0].instanceId
    }

    /**
     * 返回两个参数 一个是错误码 一个是查询结果
     * @param type 
     * @param key 
     * @returns 
     */
    static async query<T>(type: Type<T>, key: string | number): Promise<[number, T]> {
        let instanceId = this.getDB();
        let serializeMgr = ObjectSerializeMgr.getInst();
        let typeCode = serializeMgr.getTypeCode(type);
        let msg = new DBQueryRequest();

        if (typeof key == "number") {
            msg.numberKey = key
        } else {
            msg.stringKey = key as string;
        }

        msg.typeCode = typeCode;

        let response = await ActorMsgHelper.call(instanceId, msg, DBQueryResponse);

        if (response.error != ErrorCore.ERR_Success) {
            coreError('DBHelper.query查询失败,error= {0}', response.error);
            return [response.error, null];
        }

        if (response.data == null) {
            return [response.error, null]
        }

        let isSameMachine = ProcessMgr.getInst().actorIdIsInMachine(instanceId);

        // coreLog('向db缓存查询类型: {0}', type.name);
        let obj = isSameMachine ? serializeMgr.deserializeSameMachine(response.data) : serializeMgr.deserialize(response.data) as T;

        // MsgPrinter.getInst().print(obj, '向db缓存查询类型返回结果');

        return [response.error, obj];
    }

    static async save(obj: object): Promise<boolean> {
        if (obj == null) {
            coreLog(`dbhelper保存对象为null`);
            return false;
        }

        if (obj.constructor == null) {
            coreLog(`dbhelper保存对象的构造函数为null`);
            return false;
        }

        let serializeMgr = ObjectSerializeMgr.getInst();
        let instanceId = this.getDB();
        let isSameMachine = ProcessMgr.getInst().actorIdIsInMachine(instanceId);
        let data = isSameMachine ? serializeMgr.serializeSameMachine(obj) : serializeMgr.serialize(obj);

        // coreLog(`请求db缓存类型: ${obj.constructor.name}`)

        let response = await ActorMsgHelper.call(instanceId, new DBCacheRequest({ data: data }), DBCacheResponse);

        if (response.error != ErrorCore.ERR_Success) {
            coreError('DBHelper.save保存失败,error= {0}, type={1}', response.error, obj.constructor.name);
            return false;
        }

        return true;
    }

    static async delete<T>(type: Type<T>, key: string | number): Promise<void> {
        let instanceId = this.getDB();
        let serializeMgr = ObjectSerializeMgr.getInst();
        let typeCode = serializeMgr.getTypeCode(type)
        let msg = new DBDeleteRequest()

        msg.typeCode = typeCode

        if (typeof key == "number") {
            msg.numberKey = key
        } else {
            msg.stringKey = key as string;
        }

        let response = await ActorMsgHelper.call(instanceId, msg, DBDeleteResponse);

        if (response.error != ErrorCore.ERR_Success) {
            coreError(`DBHelper.delete删除失败,error=${response.error}`);
        }
    }
}