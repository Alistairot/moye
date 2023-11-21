import { DecoratorCollector } from "../../../../../common/Core/Decorator/DecoratorCollector"
import { DecoratorType } from "../../../Game/DecoratorType/DecoratorType"

/**
 * 外网消息处理器
 * 同一个messageType只能有一个处理器
 * 并不是处理具体的消息 而是处理某一类消息
 * 通过这个处理器再分发到具体的消息处理器
 * @param messageType 
 * @returns 
 */
export function OuterMsgDecorator(messageType: string) {
    return function (target: Function) {
        DecoratorCollector.inst.add(DecoratorType.OuterMsgHandler, target, messageType)
    }
}