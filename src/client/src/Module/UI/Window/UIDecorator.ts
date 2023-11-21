import { DecoratorCollector } from "../../../../../common/Core/Decorator/DecoratorCollector"
import { DecoratorTypeCore } from "../../../../../common/Decorator/DecoratorTypeCore"

export function UIDecorator(uiType: string) {
    return function (constructor: Function) {
        DecoratorCollector.inst.add(DecoratorTypeCore.UI, constructor, uiType)
    }
}