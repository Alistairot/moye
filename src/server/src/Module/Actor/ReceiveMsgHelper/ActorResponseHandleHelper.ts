
import { IMessage, IRequest, IResponse } from "../../../../../common/Message/IMessage";
import { ErrorCore } from "../../../../../common/Network/ErrorCore";
import { ActorMessageSenderMgr } from "../ActorMessageSenderMgr";



export class ActorResponseHandleHelper {
    static handleActorResponse(response: IResponse) {
        // 没有发送error，就是成功了
        if (response.error == null) {
            response.error = ErrorCore.ERR_Success;
        }

        ActorMessageSenderMgr.getInst().handleActorResponse(response);
    }
}