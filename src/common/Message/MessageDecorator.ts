import { DecoratorCollector } from "../Core/Decorator/DecoratorCollector"
import { DecoratorTypeCore } from "../Decorator/DecoratorTypeCore"

/**
 * 装饰消息
 * @param opcode 
 * @param messageType 
 * @returns 
 */
export function MessageDecorator(opcode: number, messageType: string) {
    return function (target: Function) {
        DecoratorCollector.inst.add(DecoratorTypeCore.Message, target, messageType, opcode)
    }
}