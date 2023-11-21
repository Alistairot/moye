import { DecoratorCollector } from "../../../../common/Core/Decorator/DecoratorCollector"
import { DecoratorTypeCore } from "../../../../common/Decorator/DecoratorTypeCore"
import { IMessage } from "../../../../common/Message/IMessage"
import { Type } from "../../../../common/Core/Type/Type"

/**
 * 直发消息处理器装饰器
 * @param msgType 
 * @param sceneType 
 * @param responseType 
 * @returns 
 */
export function MessageHandlerDecorator(msgType: Type<IMessage>, sceneType: string, responseType?: Type<IMessage>) {
    return function (msgHandlerType: Function) {
        DecoratorCollector.inst.add(DecoratorTypeCore.MessageHandler, msgHandlerType, msgType, sceneType, responseType)
    }
}