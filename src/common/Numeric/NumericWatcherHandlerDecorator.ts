import { DecoratorCollector } from "../Core/Decorator/DecoratorCollector"
import { DecoratorTypeCore } from "../Decorator/DecoratorTypeCore"
import { type Entity } from "../Entity/Entity"
import { Type } from "../Core/Type/Type"

/**
 * 监听数值变化
 * @param entityType 实体类型
 * @param type 数值类型
 * @returns 
 */
export function NumericWatcherHandlerDecorator(entityType: Type<Entity>, type: number) {
    return function (target: Function) {
        DecoratorCollector.inst.add(DecoratorTypeCore.NumericWatcher, target, entityType, type)
    }
}