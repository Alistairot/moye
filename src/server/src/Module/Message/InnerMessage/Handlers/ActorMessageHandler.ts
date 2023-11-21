import { IMessage, IRequest } from "../../../../../../common/Message/IMessage";
import { MessageTypeCore } from "../../../../../../common/Message/MessageType";
import { ActorMessageHandleHelper } from "../../../Actor/ReceiveMsgHelper/ActorMessageHandleHelper";
import { IInnerMessageHandler } from "../IInnerMessageHandler";
import { InnerMsgDecorator } from "../InnerMsgDecorator";

@InnerMsgDecorator(MessageTypeCore.ActorMessage)
export class ActorMessageHandler implements IInnerMessageHandler {
    run(actorId: number, msg: IMessage) {
        ActorMessageHandleHelper.handleActorMessage(actorId, msg);
    }

}