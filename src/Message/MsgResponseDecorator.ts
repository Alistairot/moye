import { Type } from "../Core/Core";
import { DecoratorCollector } from "../Core/Decorator/DecoratorCollector";

export const MsgResponseDecoratorType = 'MsgResponseDecorator';
/**
 * 装饰消息
 * @param opcode 
 * @param messageType 
 * @returns 
 */
export function MsgResponseDecorator(responseType: Type<any>) {
    return function (target: Function) {
        DecoratorCollector.inst.add(MsgResponseDecoratorType, target, responseType);
    };
}