import { Scene } from "../../../../common/Entity/Scene";
import { coreError } from "../../../../common/Core/Logger/CoreLogHelper";
import { DEVELOP } from "../../../../common/Macro";
import { ActorResponse } from "../../../../common/Message/ActorResponse";
import { IMessage, IRequest, IResponse } from "../../../../common/Message/IMessage";
import { Session } from "../../../../common/Message/Session";
import { ErrorCore } from "../../../../common/Network/ErrorCore";
import { Type } from "../../../../common/Core/Type/Type";
import { SessionComponent } from "../Network/SessionComponent";

export class MsgHelper {
    static send(clientScene: Scene, msg: IMessage): void {
        let session = clientScene.getComponent(SessionComponent).session;

        if(!session) {
            coreError('MsgHelper send session is null');
            return;
        }

        session.Send(msg)
    }

    static async call<T extends IResponse>(clientScene: Scene, msg: IRequest, responseType: Type<T>): Promise<T> {
        let session = clientScene.getComponent(SessionComponent).session;

        if(!session) {
            coreError('MsgHelper call session is null');
            let response = new responseType();
            response.error = ErrorCore.ERR_SessionNotExist;
            return response;
        }

        let result = await session.Call(msg);

        return result as T;
    }
}
