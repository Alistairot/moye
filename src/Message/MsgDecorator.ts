import { DecoratorCollector } from "../Core/Decorator/DecoratorCollector";

export const MsgDecoratorType = 'MsgDecorator';
/**
 * 装饰消息
 * @param opcode 
 * @param messageType 
 * @returns 
 */
export function MsgDecorator(opcode: number, messageType: string) {
    return function (target: Function) {
        DecoratorCollector.inst.add(MsgDecoratorType, target, messageType, opcode);
    };
}