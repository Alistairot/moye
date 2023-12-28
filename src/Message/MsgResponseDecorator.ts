import { Type } from "../Core/Core";
import { DecoratorCollector } from "../Core/Decorator/DecoratorCollector";
import { AMessage } from "./AMessage";

export const MsgResponseDecoratorType = 'MsgResponseDecorator';
/**
 * 装饰消息
 * @param opcode 
 * @param messageType 
 * @returns 
 */
export function MsgResponseDecorator(responseType: Type<AMessage<any>>) {
    return function (target: Function) {
        DecoratorCollector.inst.add(MsgResponseDecoratorType, target, responseType);
    };
}