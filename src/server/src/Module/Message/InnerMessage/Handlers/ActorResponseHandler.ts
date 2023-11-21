import { IMessage, IRequest, IResponse } from "../../../../../../common/Message/IMessage";
import { MessageTypeCore } from "../../../../../../common/Message/MessageType";
import { ActorResponseHandleHelper } from "../../../Actor/ReceiveMsgHelper/ActorResponseHandleHelper";
import { IInnerMessageHandler } from "../IInnerMessageHandler";
import { InnerMsgDecorator } from "../InnerMsgDecorator";

@InnerMsgDecorator(MessageTypeCore.ActorResponse)
@InnerMsgDecorator(MessageTypeCore.ActorLocationResponse)
export class ActorResponseHandler implements IInnerMessageHandler {
    run(actorId: number, msg: IMessage) {
        ActorResponseHandleHelper.handleActorResponse(msg as IResponse);
    }
}