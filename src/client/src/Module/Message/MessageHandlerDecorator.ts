import { DecoratorCollector } from "../../../../common/Core/Decorator/DecoratorCollector"
import { DecoratorTypeCore } from "../../../../common/Decorator/DecoratorTypeCore"
import { SceneTypeCore } from "../../../../common/Entity/SceneTypeCore"
import { IMessage } from "../../../../common/Message/IMessage"
import { Type } from "../../../../common/Core/Type/Type"

/**
 * 客户端消息处理器装饰器
 * 跟服务端的稍微有点不同 精简了一些不必要的参数
 * @param msgType 
 * @param sceneType 
 * @param responseType 
 * @returns 
 */
export function MessageHandlerDecorator(msgType: Type<IMessage>) {
    return function (msgHandlerType: Function) {
        DecoratorCollector.inst.add(DecoratorTypeCore.MessageHandler, msgHandlerType, msgType, SceneTypeCore.Client, null)
    }
}