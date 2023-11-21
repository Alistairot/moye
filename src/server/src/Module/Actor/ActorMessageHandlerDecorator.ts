import { DecoratorCollector } from "../../../../common/Core/Decorator/DecoratorCollector"
import { IMessage, IResponse } from "../../../../common/Message/IMessage"
import { Type } from "../../../../common/Core/Type/Type"
import { DecoratorType } from "../../Game/DecoratorType/DecoratorType"

/**
 * actor消息处理器装饰器
 * @param msgType 
 * @param sceneType 
 * @param responseType 
 * @returns 
 */
export function ActorMessageHandlerDecorator(msgType: Type<IMessage>, sceneType: string, responseType?: Type<IResponse>) {
    return function (msgHandlerType: Function) {
        DecoratorCollector.inst.add(DecoratorType.ActorMessageHandler, msgHandlerType, msgType, sceneType, responseType)
    }
}