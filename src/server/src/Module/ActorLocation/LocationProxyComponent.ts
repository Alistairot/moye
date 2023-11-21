import { Entity } from "../../../../common/Entity/Entity";
import { coreLog } from "../../../../common/Core/Logger/CoreLogHelper";
import { TimeHelper } from "../../../../common/Core/Time/TimeHelper";
import { ObjectAddRequest, ObjectGetRequest, ObjectGetResponse, ObjectLockRequest, ObjectRemoveRequest, ObjectUnLockRequest } from "../../Game/Message/InnerMessageCore/InnerMessageCore";
import { ActorMsgHelper } from "../Actor/ActorMsgHelper";
import { SceneMgr } from "../Scene/SceneMgr";

/**
 * location代理组件
 * 用于跨进程的location操作 
 * todo: 改成单例好一点
 */
export class LocationProxyComponent extends Entity {
    public static inst: LocationProxyComponent

    awake(): void {
        LocationProxyComponent.inst = this
    }

    destroy(): void {
        LocationProxyComponent.inst = null
    }

    private getLocationSceneId(): number {
        let sceneInfo = SceneMgr.getInst().getFirstSceneByType("Location")
        return sceneInfo.instanceId
    }

    public async lock(key: number, instanceId: number, time: number = 60000) {
        let actorId = this.getLocationSceneId();
        await ActorMsgHelper.call(actorId, new ObjectLockRequest({ key: key, instanceId: instanceId, time: time }))
    }

    /**
     * 获取key对应的instanceId
     * @param key 
     * @returns 
     */
    public async get(key: number): Promise<number> {
        if (key == 0) {
            throw new Error("get location key 0");
        }

        let actorId = this.getLocationSceneId();
        let response = await ActorMsgHelper.call(actorId, new ObjectGetRequest({ key: key }), ObjectGetResponse)
        return response.instanceId;
    }

    public async unLock(key: number, oldInstanceId: number, instanceId: number) {
        let actorId = this.getLocationSceneId();
        await ActorMsgHelper.call(actorId, new ObjectUnLockRequest({
            key: key,
            oldInstanceId: oldInstanceId,
            instanceId: instanceId
        }))
    }

    public async add(key: number, instanceId: number) {
        let actorId = this.getLocationSceneId();
        await ActorMsgHelper.call(actorId, new ObjectAddRequest({
            key: key,
            instanceId: instanceId
        }))
    }

    public async remove(key: number) {
        let actorId = this.getLocationSceneId();
        await ActorMsgHelper.call(actorId, new ObjectRemoveRequest({
            key: key,
        }))
    }
}