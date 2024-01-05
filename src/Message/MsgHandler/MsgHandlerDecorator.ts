import { Type } from "../../Core/Core";
import { DecoratorCollector } from "../../Core/Decorator/DecoratorCollector";

export const MsgHandlerDecoratorType = 'MsgHandlerDecorator';

/**
 * 消息处理器
 * @param opcode 
 * @param messageType 
 * @returns 
 */
export function MsgHandlerDecorator(messageType: Type) {
    return function (target: Function) {
        DecoratorCollector.inst.add(MsgHandlerDecoratorType, target, messageType);
    };
}