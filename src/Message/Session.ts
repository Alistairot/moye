import { moyeErrorF, moyeLogF, moyeWarnF } from "../Core/Logger/CoreLogHelper";
import { IPEndPoint } from "../Network/IPEndPoint";
import { NetServices } from "../Network/NetServices";
import { TimeHelper } from "../Core/Time/TimeHelper";
import { Entity, Task, Type } from "../Core/Core";
import { MessageTag } from "./MessageTag";
import { MsgSerializeMgr } from "./MsgSerializeMgr";
import { MessageErrorCode } from "./MessageErrorCode";
import { IRpcResponse, IRpcResquest, RpcResponse } from "./IRpcMessage";
import { MsgMgr } from "./MsgMgr";

/**
 * session的id跟channel的id是一样的
 */
export class Session extends Entity {
    private static _rpcId: number = 0;

    serviceId: number;
    requestCallbacks: Map<number, Task> = new Map;
    lastRecvTime: number;
    lastSendTime: number;
    error: number = 0;
    remoteAddress: IPEndPoint;

    init(serviceId: number) {
        this.serviceId = serviceId;
        const timeNow = TimeHelper.clientNow();
        this.lastRecvTime = timeNow;
        this.lastSendTime = timeNow;
    }

    onResponse(response: IRpcResponse) {
        const task = this.requestCallbacks.get(response.rpcId);

        if (!task) {
            return;
        }

        this.requestCallbacks.delete(response.rpcId);

        task.setResult(response);
    }

    send(msg: object) {
        if (this.isDisposed) {
            moyeLogF(MessageTag, 'session已经销毁,不能发送消息, message={0}, sessionId={1}', msg.constructor.name, this.id);
            return;
        }

        try {
            const opcode = MsgMgr.get().getOpcode(msg.constructor as Type);
            const data = MsgSerializeMgr.get().serialize(opcode, msg);

            this.lastSendTime = TimeHelper.clientNow();
            NetServices.get().sendMessage(this.serviceId, this.id, data);
        } catch (error) {
            moyeErrorF(MessageTag, 'session send error={0}', error.stack);
        }
    }

    async call(req: IRpcResquest): Promise<IRpcResponse> {
        if (this.isDisposed) {
            moyeLogF(MessageTag, 'session已经销毁,不能发送消息, message={0}, sessionId={1}', req.constructor.name, this.id);
            const response = new RpcResponse({ error: MessageErrorCode.ERR_SessionDisposed });
            return response;
        }

        const rpcId = ++Session._rpcId;
        const task = Task.create();

        this.requestCallbacks.set(rpcId, task);

        req.rpcId = rpcId;

        this.send(req);

        const result = await task;

        return result;
    }

    protected destroy(): void {
        if (this.error > 0) {
            NetServices.get().onError(this.serviceId, this.id, this.error);
        }

        NetServices.get().removeChannel(this.serviceId, this.id, this.error);

        if (this.requestCallbacks.size > 0) {
            const response = new RpcResponse({ error: MessageErrorCode.ERR_SessionDisposed });

            for (const [_, responseCallback] of this.requestCallbacks) {
                responseCallback.setResult(response);
            }

            this.requestCallbacks.clear();
        }
    }
}