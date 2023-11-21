import { Scene } from "../../../../common/Entity/Scene";
import { SceneTypeCore } from "../../../../common/Entity/SceneTypeCore";
import { AEventHandler, EventHandlerDecorator } from "../../../../common/EventSystem/Event";
import { IResponse } from "../../../../common/Message/IMessage";
import { MessageTypeMgr } from "../../../../common/Message/MessageTypeMgr";
import { NetServices } from "../../../../common/Network/NetServices";
import { Type } from "../../../../common/Core/Type/Type";
import { MessageDispatcherMgr } from "../../../../common/Message/MessageDispatcherMgr";
import { NetClientComponentOnRead } from "./NetClientComponentOnRead";
import { ErrorCore } from "../../../../common/Network/ErrorCore";

@EventHandlerDecorator(NetClientComponentOnRead, SceneTypeCore.Process)
export class NetClientComponentOnReadEvent extends AEventHandler<NetClientComponentOnRead>{
    protected run(scene: Scene, args: NetClientComponentOnRead) {
        let session = args.session;
        let message = args.message;

        let opcode = NetServices.getInst().GetOpcode(message.constructor as Type);

        if (MessageTypeMgr.getInst().isResponse(opcode)) {
            let response = message as unknown as IResponse;

            if (response.error == null) {
                response.error = ErrorCore.ERR_Success;
            }
            
            session.OnResponse(message as unknown as IResponse);
            return
        }

        MessageDispatcherMgr.getInst().handle(session, message);
    }
}