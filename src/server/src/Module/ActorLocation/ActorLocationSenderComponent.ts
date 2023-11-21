import { CoroutineLock } from "../../../../common/CoroutineLock/CoroutineLock";
import { Entity } from "../../../../common/Entity/Entity";
import { coreError, coreLog } from "../../../../common/Core/Logger/CoreLogHelper";
import { IRequest, IResponse } from "../../../../common/Message/IMessage";
import { ErrorCore } from "../../../../common/Network/ErrorCore";
import { TimeHelper } from "../../../../common/Core/Time/TimeHelper";
import { TimerMgr } from "../../../../common/Timer/TimerMgr";
import { ActorHelper } from "../Actor/ActorHelper";
import { ActorMessageSenderMgr } from "../Actor/ActorMessageSenderMgr";
import { LockTypeCore } from "../../Game/CoroutineLock/LockTypeCore";
import { ActorLocationSender } from "./ActorLocationSender";
import { LocationProxyComponent } from "./LocationProxyComponent";
import { Task } from "../../../../common/Core/Task/Task";
import { findKey } from "lodash";

/**
 * 通过unitId向unit发送消息
 * 发送的时候通过id向location查询instanceId
 * 然后向instanceId所在进程发送消息
 * todo 改成单例 用对象池缓存item
 */
export class ActorLocationSenderComponent extends Entity {
    public static inst: ActorLocationSenderComponent
    public TIMEOUT_TIME = 60 * 1000;
    public CheckTimer: number;

    awake() {
        ActorLocationSenderComponent.inst = this

        this.CheckTimer = TimerMgr.getInst().newRepeatedTimer(10 * 1000, this.check.bind(this));
    }

    destroy(): void {
        ActorLocationSenderComponent.inst = null
        TimerMgr.getInst().remove(this.CheckTimer);
    }

    public check() {
        let list: number[] = []

        let timeNow = TimeHelper.serverNow();

        for (let [key, value] of this.children) {
            let actorLocationMessageSender = value as ActorLocationSender;

            if (timeNow > actorLocationMessageSender.LastSendOrRecvTime + this.TIMEOUT_TIME) {
                list.push(key);
            }
        }

        for (let id of list) {
            this.remove(id);
        }
    }

    private getOrCreate(id: number): ActorLocationSender {
        let actorLocationSender = this.children.get(id)
        if (actorLocationSender) {
            return actorLocationSender as ActorLocationSender;
        }

        actorLocationSender = this.addChildWithId(ActorLocationSender, id);
        return actorLocationSender as ActorLocationSender;
    }

    remove(id: number) {
        let actorMessageSender = this.children.get(id)
        if (!actorMessageSender) {
            return;
        }

        actorMessageSender.dispose();
    }

    public send(entityId: number, message: IRequest) {
        if(entityId == 0){
            coreError('ActorLocationSenderComponent.send, entityId is 0');
            return;
        }

        let actorLocationSender = this.getOrCreate(entityId);
        let rpcId = ActorMessageSenderMgr.getInst().getRpcId();
        message.rpcId = rpcId;

        actorLocationSender.addReq(message);
        this.innerSend(entityId);
    }

    private async innerSend(entityId: number): Promise<void> {
        let actorLocationSender = this.getOrCreate(entityId);

        if (actorLocationSender.isSending) {
            return;
        }

        try {
            let actorLocationSenderInstanceId = actorLocationSender.instanceId;

            actorLocationSender.isSending = true;

            let request = actorLocationSender.getReq();

            while (request) {
                if (actorLocationSender.instanceId != actorLocationSenderInstanceId) {
                    coreLog('ActorLocationSenderComponent.innerSend timeout, entityId={0}', entityId);
                    return;
                }
                // 队列中没处理的消息返回跟上个消息一样的报错
                if (actorLocationSender.Error == ErrorCore.ERR_NotFoundActor) {
                    coreLog('ActorLocationSenderComponent.sendCall ERR_NotFoundActor, entityId={0}, msg={1}', entityId, request.constructor.name);
                    return;
                }

                await this.callInner(actorLocationSender, request.rpcId, request);

                request = actorLocationSender.getReq();
            }
        }
        catch (e) {
            coreError('ActorLocationSenderComponent.innerSend error, entityId={0}, {2}', entityId, e.stack);
        }finally{
            actorLocationSender.isSending = false;
        }
    }

    async call(entityId: number, request: IRequest): Promise<IResponse> {
        if(entityId == 0){
            coreError('ActorLocationSenderComponent.call, entityId is 0');
            return ActorHelper.createResponse(request, ErrorCore.ERR_ActorIdIsZero);
        }

        let actorLocationSender = this.getOrCreate(entityId);
        let rpcId = ActorMessageSenderMgr.getInst().getRpcId();
        request.rpcId = rpcId;

        let actorLocationSenderInstanceId = actorLocationSender.instanceId;

        // 用协程锁保证顺序
        let lock = await CoroutineLock.getInst().wait(LockTypeCore.ActorLocationSender, entityId.toString());

        try {
            if (actorLocationSender.instanceId != actorLocationSenderInstanceId) {
                return ActorHelper.createResponse(request, ErrorCore.ERR_ActorLocationSenderDispose);
            }

            // 队列中没处理的消息返回跟上个消息一样的报错
            if (actorLocationSender.Error == ErrorCore.ERR_NotFoundActor) {
                coreLog(`ActorLocationSenderComponent.call ERR_NotFoundActor`);
                return ActorHelper.createResponse(request, actorLocationSender.Error);
            }

            let callResult = await this.callInner(actorLocationSender, rpcId, request);

            return callResult;
        }
        catch (e) {
            coreError('ActorLocationSenderComponent.call error, entityId={0}, msg={1}, {2}', entityId, request.constructor.name, e.stack);
            return ActorHelper.createResponse(request, ErrorCore.ERR_ActorLocationError);
        }
        finally {
            lock.dispose();
        }
    }

    private async callInner(actorLocationSender: ActorLocationSender, rpcId: number, iActorRequest: IRequest): Promise<IResponse> {
        let failTimes = 0;
        let instanceId = actorLocationSender.instanceId;
        actorLocationSender.LastSendOrRecvTime = TimeHelper.serverNow();

        while (true) {
            if (actorLocationSender.ActorId == 0) {
                actorLocationSender.ActorId = await LocationProxyComponent.inst.get(actorLocationSender.id);

                if (actorLocationSender.instanceId != instanceId) {
                    return ActorHelper.createResponse(iActorRequest, ErrorCore.ERR_ActorLocationSenderDispose);
                }
            }

            // 没有注册location 找不到很正常 不需要报错
            if (actorLocationSender.ActorId == 0) {
                actorLocationSender.Error = ErrorCore.ERR_NotFoundActor;
                return ActorHelper.createResponse(iActorRequest, ErrorCore.ERR_NotFoundActor);
            }

            let response = await ActorMessageSenderMgr.getInst().callWithRpcId(actorLocationSender.ActorId, rpcId, iActorRequest);

            if (actorLocationSender.instanceId != instanceId) {
                return ActorHelper.createResponse(iActorRequest, ErrorCore.ERR_ActorLocationSenderDispose);
            }

            switch (response.error) {
                case ErrorCore.ERR_NotFoundActor: {
                    // 如果没找到Actor,重试
                    ++failTimes;
                    if (failTimes > 5) {
                        coreLog(`actor send message fail, actorid: ${actorLocationSender.id}`);
                        actorLocationSender.Error = ErrorCore.ERR_NotFoundActor;
                        // 这里不能删除actor，要让后面等待发送的消息也返回ERR_NotFoundActor，直到超时删除
                        return response;
                    }

                    // 等待0.5s再发送
                    await TimerMgr.getInst().waitAsync(500);
                    if (actorLocationSender.instanceId != instanceId) {
                        return ActorHelper.createResponse(iActorRequest, ErrorCore.ERR_ActorLocationSenderDispose);
                    }

                    actorLocationSender.ActorId = 0;
                    continue;
                }
            }

            return response;
        }
    }
}