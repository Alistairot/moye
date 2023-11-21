import { Entity } from "../../../../common/Entity/Entity";
import { IRequest } from "../../../../common/Message/IMessage";
import { RecycleObj } from "../../../../common/Core/ObjectPool/RecycleObj";
import { MailboxType } from "./MailboxType";

export class MailBoxQueueItem extends RecycleObj {
    fromProcess: number;
    req: IRequest;
}

/**
 * 邮箱组件 挂了这个组件才能接收actor消息
 */
export class MailBoxComponent extends Entity {
    MailboxType: MailboxType
    reqQueue: MailBoxQueueItem[] = [];
    isHandling: boolean = false;

    awake(): void {
        this.MailboxType = MailboxType.MessageDispatcher;
    }

    init(mailboxType: MailboxType) {
        this.MailboxType = mailboxType;
    }

    addReq(request: IRequest, fromProcess: number) {
        let item = MailBoxQueueItem.create({ fromProcess, req: request });
        this.reqQueue.push(item);
    }

    getReq() {
        return this.reqQueue.shift();
    }

    destroy(): void {
        this.clearItem();
        this.isHandling = false;
    }

    clearItem() {
        if(this.reqQueue.length == 0){
            return;
        }
        
        for (let item of this.reqQueue) {
            item.dispose();
        }

        this.reqQueue = [];
    }
}