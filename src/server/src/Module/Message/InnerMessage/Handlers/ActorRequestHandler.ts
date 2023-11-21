import { IMessage, IRequest } from "../../../../../../common/Message/IMessage";
import { MessageTypeCore } from "../../../../../../common/Message/MessageType";
import { ActorRequestHandleHelper } from "../../../Actor/ReceiveMsgHelper/ActorRequestHandleHelper";
import { IInnerMessageHandler } from "../IInnerMessageHandler";
import { InnerMsgDecorator } from "../InnerMsgDecorator";

@InnerMsgDecorator(MessageTypeCore.ActorRequest)
@InnerMsgDecorator(MessageTypeCore.ActorLocationRequest)
export class ActorRequestHandler implements IInnerMessageHandler {
    run(actorId: number, msg: IMessage) {
        ActorRequestHandleHelper.handleActorRequest(actorId, msg as IRequest);
    }
}

@InnerMsgDecorator(MessageTypeCore.ActorLocationMessage)
export class ActorLocationMessageHandler implements IInnerMessageHandler {
    run(actorId: number, msg: IMessage) {
        ActorRequestHandleHelper.handleActorLocationMessage(actorId, msg as IRequest);
    }
}