import { DecoratorCollector } from "../Core/Decorator/DecoratorCollector"
import { DecoratorTypeCore } from "../Decorator/DecoratorTypeCore"

/**
 * 消息解析器装饰器
 * @param opcode 
 * @param messageType 
 * @returns 
 */
export function MessageParserDecorator(opcode: number) {
    return function (target: Function) {
        DecoratorCollector.inst.add(DecoratorTypeCore.MessageParser, target, opcode)
    }
}