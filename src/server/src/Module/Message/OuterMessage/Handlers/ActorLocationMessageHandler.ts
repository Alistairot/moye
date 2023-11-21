import { coreWarn } from "../../../../../../common/Core/Logger/CoreLogHelper";
import { DEVELOP } from "../../../../../../common/Macro";
import { IMessage, IRequest } from "../../../../../../common/Message/IMessage";
import { MessageDispatcherMgr } from "../../../../../../common/Message/MessageDispatcherMgr";
import { MessageTypeCore } from "../../../../../../common/Message/MessageType";
import { MsgPrinter } from "../../../../../../common/Message/MsgPrinter";
import { Session } from "../../../../../../common/Message/Session";
import { GatePlayerHelper } from "../../../../Game/Scene/Gate/GatePlayer/GatePlayerHelper";
import { ActorLocationSenderComponent } from "../../../ActorLocation/ActorLocationSenderComponent";
import { SessionPlayerComponent } from "../../../Session/SessionPlayerComponent";
import { IOuterMessageHandler } from "../IOuterMessageHandler";
import { OuterMsgDecorator } from "../OuterMsgDecorator";

/**
 * 客户端发给某个unit的消息
 */
@OuterMsgDecorator(MessageTypeCore.ActorLocationMessage)
export class ActorLocationMessageHandler implements IOuterMessageHandler{
    run(session: Session, msg: IMessage){
        let request = msg as IRequest;
        // session还没有连接unit，没法发送消息给unit
        let unitId = GatePlayerHelper.getUnitIdFromSession(session);
        
        if(unitId == 0){
            coreWarn(`unitId is 0, not send to unit`);
            return;
        }

        ActorLocationSenderComponent.inst.send(unitId, request);
    }
}