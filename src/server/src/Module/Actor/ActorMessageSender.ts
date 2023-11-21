import { coreError, coreLog } from "../../../../common/Core/Logger/CoreLogHelper"
import { IRequest, IResponse } from "../../../../common/Message/IMessage"
import { MsgPrinter } from "../../../../common/Message/MsgPrinter"
import { ErrorCore } from "../../../../common/Network/ErrorCore"
import { Task } from "../../../../common/Core/Task/Task"
import { TimeHelper } from "../../../../common/Core/Time/TimeHelper"

// 知道对方的instanceId，使用这个类发actor消息
export class ActorMessageSender {
    public ActorId: number

    // 最近接收或者发送消息的时间
    public CreateTime: number

    public Request: IRequest

    public Tcs: Task<IResponse>

    constructor(actorId: number, iActorRequest: IRequest, tcs: Task<IResponse>) {
        this.ActorId = actorId;
        this.Request = iActorRequest;
        this.CreateTime = TimeHelper.serverNow();
        this.Tcs = tcs;
    }

    public run(response: IResponse): void {
        if (response.error == ErrorCore.ERR_ActorTimeout) {
            coreLog(`${this.Request.constructor.name}超时了, 请检查`);
        }


        // if (this.NeedException && ErrorCore.IsRpcNeedThrowException(response.error)) {
        //     coreError(`Rpc error: actorId: ${this.ActorId} request: `, this.Request, "response:", response);
        // }

        this.Tcs.setResult(response);
        this.Tcs = null;
    }
}