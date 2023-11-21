import { IMessage, IRequest } from "../../../../common/Message/IMessage";
import { Type } from "../../../../common/Core/Type/Type";
import { ActorMessageSenderMgr } from "./ActorMessageSenderMgr";

export class ActorMsgHelper {
    /**
     * 发送actor消息 可以有返回消息
     * @param actorId 其实就是instanceId
     * @param request 
     * @param responseType 
     * @returns 
     */
    static async call<T>(actorId: number, request: IRequest, responseType?: Type<T>): Promise<T> {
        let response = await ActorMessageSenderMgr.getInst().call(actorId, request)

        return response as T
    }

    /**
     * 发送actor消息 不带返回消息
     * @param actorId 
     * @param request 
     */
    static send(actorId: number, request: IMessage) {
        ActorMessageSenderMgr.getInst().send(actorId, request)
    }
}