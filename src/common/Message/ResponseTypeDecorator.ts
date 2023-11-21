import { DecoratorCollector } from "../Core/Decorator/DecoratorCollector"
import { DecoratorTypeCore } from "../Decorator/DecoratorTypeCore"
import { Type } from "../Core/Type/Type"
import { IMessage } from "./IMessage"

export function ResponseTypeDecorator(responseType: Type<IMessage>) {
    return function (target: Function) {
        DecoratorCollector.inst.add(DecoratorTypeCore.MessageResponse, target, responseType)
    }
}