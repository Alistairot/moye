import { Entity } from "../Entity/Entity";
import { coreError, coreLog, coreWarn } from "../Core/Logger/CoreLogHelper";
import { DEVELOP } from "../Macro";
import { ErrorCore } from "../Network/ErrorCore";
import { IPEndPoint } from "../Network/IPEndPoint";
import { NetServices } from "../Network/NetServices";
import { Options } from "../Core/Options/Options";
import { Task } from "../Core/Task/Task";
import { TimeHelper } from "../Core/Time/TimeHelper";
import { TimerMgr } from "../Timer/TimerMgr";
import { ActorResponse } from "./ActorResponse";
import { IMessage, IRequest, IResponse } from "./IMessage";
import { MsgPrinter } from "./MsgPrinter";

export class RpcInfo {
    public readonly Request: IRequest;
    public Tcs: Task<IResponse>;

    constructor(request: IRequest) {
        this.Request = request;
        this.Tcs = Task.create();
    }

    setResult(val: IResponse) {
        this.Tcs.setResult(val)
        this.Tcs = null
    }
}

/**
 * session的id跟channel的id是一样的
 */
export class Session extends Entity {
    static RpcId: number = 0
    ServiceId: number
    requestCallbacks: Map<number, RpcInfo> = new Map
    LastRecvTime: number
    LastSendTime: number
    Error: number = 0
    RemoteAddress: IPEndPoint

    init(serviceId: number) {
        this.ServiceId = serviceId;
        let timeNow = TimeHelper.clientNow();
        this.LastRecvTime = timeNow;
        this.LastSendTime = timeNow;
    }

    OnResponse(response: IResponse) {
        let action = this.requestCallbacks.get(response.rpcId)

        if (action == null) {
            throw new Error(`Session OnResponse 没有找到对应的action=${response.rpcId}`);
        }

        this.requestCallbacks.delete(response.rpcId);

        if (ErrorCore.IsRpcNeedThrowException(response.error)) {
            action.setResult(response);
            throw new Error(`Session OnResponse error, req=${action.Request.constructor.name}, ${response.error}`);
        }

        action.setResult(response);
    }

    public Send(message: IMessage) {
        if(this.isDisposed){
            coreLog('session已经销毁,不能发送消息, message={0}, sessionId={1}', message.constructor.name, this.id);
            return;
        }

        this.SendWithId(0, message);
    }

    SendWithId(actorId: number, message: IMessage) {
        if(this.isDisposed){
            coreLog('session已经销毁,不能发送消息, message={0}, sessionId={1}', message.constructor.name, this.id);
            return;
        }

        this.LastSendTime = TimeHelper.clientNow();
        NetServices.getInst().SendMessage(this.ServiceId, this.id, actorId, message);
    }

    async Call(request: IRequest): Promise<IResponse> {
        if(this.isDisposed){
            coreLog('session已经销毁,不能发送消息, message={0}, sessionId={1}', request.constructor.name, this.id);
            let response = new ActorResponse(ErrorCore.ERR_SessionDisposed)
            return response;
        }

        let rpcId = ++Session.RpcId;
        let rpcInfo = new RpcInfo(request);

        this.requestCallbacks.set(rpcId, rpcInfo)

        request.rpcId = rpcId;

        this.Send(request);

        let result = await rpcInfo.Tcs;

        return result;
    }

    destroy(): void {
        if (this.Error > 0) {
            NetServices.getInst().OnError(this.ServiceId, this.id, this.Error)
        }

        NetServices.getInst().RemoveChannel(this.ServiceId, this.id, this.Error);

        let response = new ActorResponse(ErrorCore.ERR_SessionDisposed)

        for (let [_, responseCallback] of this.requestCallbacks) {
            responseCallback.setResult(response)
        }

        if (DEVELOP) {
            if (!Options.getInst().isServer) {
                coreLog(`session destroy id=${this.id}`);
            }
        }
    }
}