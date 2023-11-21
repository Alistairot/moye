import { AEvent } from "../../../../common/Event/AEvent";
import { IMessage } from "../../../../common/Message/IMessage";

/**
 * 服务端不同actor之间的消息
 */
export class NetInnerComponentOnRead extends AEvent {
    public ActorId: number;
    public Message: IMessage;
}