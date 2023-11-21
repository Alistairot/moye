import { DecoratorCollector } from "../Core/Decorator/DecoratorCollector"
import { DecoratorTypeCore } from "../Decorator/DecoratorTypeCore"
import { DEVELOP } from "../Macro"

/**
 * 回调装饰器
 * @param invokeType 
 * @returns 
 */
export function InvokeDecorator(invokeType: string) {
    return function (target: Function) {
        DecoratorCollector.inst.add(DecoratorTypeCore.Invoke, target, invokeType)
    }
}