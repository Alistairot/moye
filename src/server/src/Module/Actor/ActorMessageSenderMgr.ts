import { coreError, coreLog, coreWarn } from "../../../../common/Core/Logger/CoreLogHelper";
import { SAME_PROCESS_OPTIMIZATION } from "../../../../common/Macro";
import { ActorResponse } from "../../../../common/Message/ActorResponse";
import { IMessage, IRequest, IResponse } from "../../../../common/Message/IMessage";
import { ErrorCore } from "../../../../common/Network/ErrorCore";
import { ObjectPool } from "../../../../common/Core/ObjectPool/ObjectPool";
import { Options } from "../../../../common/Core/Options/Options";
import { Singleton } from "../../../../common/Core/Singleton/Singleton";
import { Task } from "../../../../common/Core/Task/Task";
import { TimeHelper } from "../../../../common/Core/Time/TimeHelper";
import { TimerMgr } from "../../../../common/Timer/TimerMgr";
import { NetInnerComponent } from "../Message/InnerMessage/NetInnerComponent";
import { ProcessActorId } from "../Message/ProcessActorId";
import { ActorHelper } from "./ActorHelper";
import { ActorMessageSender } from "./ActorMessageSender";

/**
 * 发送actor消息
 */
export class ActorMessageSenderMgr extends Singleton {
    public readonly TIMEOUT_TIME = 10 * 1000;

    public RpcId: number = 1;

    public readonly requestCallback: Map<number, ActorMessageSender> = new Map

    public TimeoutCheckTimer: number;

    public TimeoutActorMessageSenders: Array<number> = new Array;

    awake(): void {
        this.TimeoutCheckTimer = TimerMgr.getInst().newRepeatedTimer(1000, this.check.bind(this));
    }

    destroy(): void {
        TimerMgr.getInst().remove(this.TimeoutCheckTimer);
        this.TimeoutCheckTimer = 0;
        this.TimeoutActorMessageSenders = [];
    }

    private check() {
        let timeNow = TimeHelper.serverNow();

        for (let [key, value] of this.requestCallback) {
            // 因为是顺序发送的，所以，检测到第一个不超时的就退出
            if (timeNow < value.CreateTime + this.TIMEOUT_TIME) {
                break;
            }

            this.TimeoutActorMessageSenders.push(key);
        }

        for (let i = 0; i < this.TimeoutActorMessageSenders.length; i++) {
            const rpcId = this.TimeoutActorMessageSenders[i];

            let actorMessageSender = this.requestCallback.get(rpcId);
            this.requestCallback.delete(rpcId);

            try {
                let response = ActorHelper.createResponse(actorMessageSender.Request, ErrorCore.ERR_ActorTimeout);

                actorMessageSender.run(response);
            }
            catch (e) {
                coreError(e);
            }
        }

        this.TimeoutActorMessageSenders = []
    }

    /**
     * 建议使用ActorMsgHelper去调用
     * @param actorId 
     * @param message 
     * @returns 
     * @发送顺序 可以保证
     */
    public send(actorId: number, message: IMessage) {
        if (actorId == 0) {
            coreError(`actor id is 0: ${message}`);
            return;
        }

        let objectPool = ObjectPool.getInst();
        let processActorId = objectPool.fetch(ProcessActorId);

        processActorId.init(actorId)

        if (SAME_PROCESS_OPTIMIZATION) {
            // 这里做了优化，如果发向同一个进程，则直接处理，不需要通过网络层
            if (processActorId.Process == Options.getInst().process) {
                NetInnerComponent.inst.handleMessage(actorId, message);
                return;
            }
        }

        try{
            let session = NetInnerComponent.inst.get(processActorId.Process);
            session.SendWithId(processActorId.ActorId, message);
        }catch(e){
            coreError('ActorMessageSenderMgr.send error, actorid={0}, msg={1}, {2}', actorId, message.constructor.name, e.stack);
        }

        objectPool.recycle(processActorId)
    }

    public getRpcId() {
        let rpcId = ++this.RpcId;

        if (this.RpcId > 1000000) {
            this.RpcId = 1;
        }

        return rpcId;
    }

    /**
     * 这个方法的调用要注意catch error
     * 此方法内部是没有进行错误捕获的
     * @param actorId 
     * @param rpcId 
     * @param iActorRequest 
     * @returns 
     * @发送顺序 无法保证
     */
    public async callWithRpcId(actorId: number, rpcId: number, iActorRequest: IRequest): Promise<IResponse> {
        if (actorId == 0) {
            let response = ActorHelper.createResponse(iActorRequest, ErrorCore.ERR_ActorIdIsZero);
            return response;
        }

        let tcs: Task<IResponse> = Task.create();

        // todo ActorMessageSender改用对象池
        this.requestCallback.set(rpcId, new ActorMessageSender(actorId, iActorRequest, tcs));

        this.send(actorId, iActorRequest);

        let beginTime = TimeHelper.serverFrameTime();
        let response = await tcs;
        let endTime = TimeHelper.serverFrameTime();

        let costTime = endTime - beginTime;

        // todo 做消息筛选 有些内部消息需要等待回应,同时处理的时候,有协程锁,会导致消息处理时间变长
        // 比如ObjectRemoveRequest, 它大于200也很正常
        if (costTime > 200) {
            coreLog(`actor rpc time > 200: ${costTime} ${iActorRequest.constructor.name}`);
        }

        return response;
    }

    /**
     * 建议使用ActorMsgHelper去调用
     * 这里内部进行错误捕获，不会抛出异常
     * @param actorId 
     * @param request 
     * @param needException 
     * @returns 
     * @发送顺序 无法保证
     */
    public async call(actorId: number, request: IRequest): Promise<IResponse> {
        try {
            request.rpcId = this.getRpcId();

            if (actorId == 0) {
                let response = ActorHelper.createResponse(request, ErrorCore.ERR_ActorIdIsZero);
                return response;
            }

            let result = await this.callWithRpcId(actorId, request.rpcId, request);

            return result;
        } catch (e) {
            coreError('ActorMessageSenderMgr.call error, actorid={0}, msg={1}, {2}', actorId, request.constructor.name, e.stack);
            let response = ActorHelper.createResponse(request, ErrorCore.ERR_ActorTimeout);
            return response;
        }
    }

    public handleActorResponse(response: IResponse) {
        let actorMessageSender = this.requestCallback.get(response.rpcId)

        if (!actorMessageSender) {
            return;
        }

        this.requestCallback.delete(response.rpcId);

        actorMessageSender.run(response)
    }
}