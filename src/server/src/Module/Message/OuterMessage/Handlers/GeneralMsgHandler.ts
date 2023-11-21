import { IMessage } from "../../../../../../common/Message/IMessage";
import { MessageDispatcherMgr } from "../../../../../../common/Message/MessageDispatcherMgr";
import { MessageTypeCore } from "../../../../../../common/Message/MessageType";
import { Session } from "../../../../../../common/Message/Session";
import { IOuterMessageHandler } from "../IOuterMessageHandler";
import { OuterMsgDecorator } from "../OuterMsgDecorator";

@OuterMsgDecorator(MessageTypeCore.Message)
@OuterMsgDecorator(MessageTypeCore.Request)
export class GeneralMsgHandler implements IOuterMessageHandler{
    run(session: Session, msg: IMessage){
        MessageDispatcherMgr.getInst().handle(session, msg);
    }
}