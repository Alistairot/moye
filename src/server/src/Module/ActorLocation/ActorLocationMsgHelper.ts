import { IMessage, IRequest, IResponse } from "../../../../common/Message/IMessage";
import { Type } from "../../../../common/Core/Type/Type";
import { ActorLocationSenderComponent } from "./ActorLocationSenderComponent";

export class ActorLocationMsgHelper {
    static async call<T extends IResponse>(entityId: number, request: IRequest, responseType: Type<T>) {
        let response = await ActorLocationSenderComponent.inst.call(entityId, request);

        return response as T;
    }

    static send(entityId: number, message: IRequest) {
        ActorLocationSenderComponent.inst.send(entityId, message);
    }
}