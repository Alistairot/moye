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
 * 这个是客户端直接发送给某个Unit的消息
 */
@OuterMsgDecorator(MessageTypeCore.ActorLocationRequest)
export class ActorLocationReqMsgHandler implements IOuterMessageHandler {
    async run(session: Session, msg: IMessage) {
        let request = msg as IRequest
        // 这里可以优化 直接从session中获取unitId 不用再从gatePlayer中获取
        let unitId = GatePlayerHelper.getUnitIdFromSession(session);

        if (unitId == 0) {
            coreWarn('unitId is 0, not send to unit, msg={0}', msg.constructor.name);
            return;
        }

        let rpcId = request.rpcId; // 这里要保存客户端的rpcId
        let instanceId = session.instanceId;
        let iResponse = await ActorLocationSenderComponent.inst.call(unitId, request);
        iResponse.rpcId = rpcId;
        // session可能已经断开了，所以这里需要判断
        if (session.instanceId == instanceId) {
            session.Send(iResponse);
        }
    }
}