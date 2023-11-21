import { DecoratorCollector } from "../../../../common/Core/Decorator/DecoratorCollector";
import { DecoratorTypeCore } from "../../../../common/Decorator/DecoratorTypeCore";
import { DEVELOP } from "../../../../common/Macro";
import { IMessage, IRequest, IResponse } from "../../../../common/Message/IMessage";
import { MessageTypeCore } from "../../../../common/Message/MessageType";
import { Singleton } from "../../../../common/Core/Singleton/Singleton";
import { Type } from "../../../../common/Core/Type/Type";
import { _ActorResponse } from "../../Game/Message/InnerMessageCore/InnerMessageCore";

/**
 * 获取一个消息的回应类型
 */
export class ResponseTypeMgr extends Singleton {
    private _requestResponse: Map<Type, Type> = new Map();

    awake(): void {
        let list2 = DecoratorCollector.inst.get(DecoratorTypeCore.Message)

        for (const args of list2) {
            let type: Type<IMessage> = args[0]
            let msgType: string = args[1]

            if (msgType == MessageTypeCore.ActorLocationMessage) {
                this._requestResponse.set(type, _ActorResponse)
            }
        }

        let list = DecoratorCollector.inst.get(DecoratorTypeCore.MessageResponse);

        for (const args of list) {
            let request = args[0];
            let response = args[1];

            this._requestResponse.set(request, response);
        }
    }

    getResponseType(request: Type<IRequest>): Type<IResponse> {
        let response = this._requestResponse.get(request)

        if (DEVELOP) {
            if (!response) {
                throw new Error(`not found response type, request type: ${request.name}`);
            }
        }

        return response;
    }
}