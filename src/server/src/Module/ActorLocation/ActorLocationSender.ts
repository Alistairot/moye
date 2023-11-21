import { Entity } from "../../../../common/Entity/Entity";
import { IRequest } from "../../../../common/Message/IMessage";
import { TimeHelper } from "../../../../common/Core/Time/TimeHelper";

export class ActorLocationSender extends Entity {
    public ActorId: number = 0;

    // 最近接收或者发送消息的时间
    public LastSendOrRecvTime: number = 0;

    public Error: number = 0;

    private _reqQueue: IRequest[] = [];
    isSending: boolean = false;

    awake() {
        this.LastSendOrRecvTime = TimeHelper.serverNow()
        this.ActorId = 0;
        this.Error = 0;
    }

    destroy(): void {
        this.LastSendOrRecvTime = 0;
        this.ActorId = 0;
        this.Error = 0;
    }

    addReq(request: IRequest){
        this._reqQueue.push(request);
    }

    getReq(){
        return this._reqQueue.shift();
    }
}