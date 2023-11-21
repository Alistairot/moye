import { DecoratorCollector } from "../../../../../common/Core/Decorator/DecoratorCollector"
import { DecoratorTypeCore } from "../../../../../common/Decorator/DecoratorTypeCore"

/**
 * 用于加载UI资源的装饰器
 * @param uiType 
 * @returns 
 */
export function UILoaderDecorator(uiType: string) {
    return function (constructor: Function) {
        DecoratorCollector.inst.add(DecoratorTypeCore.UILoader, constructor, uiType)
    }
}