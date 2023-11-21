import { DEVELOP } from "../../Macro"
import { DecoratorCollector } from "../Decorator/DecoratorCollector";
import { Type } from "../Type/Type"
import { AEvent } from "./AEvent"

export const EventDecoratorType = "EventDecoratorType";

/**
 * 事件装饰器
 * @param eventCls 
 * @param sceneType 
 * @returns 
 */
export function EventDecorator(eventCls: Type<AEvent>, sceneType: string) {
    return function (target: Function) {
        if (DEVELOP) {
            if (sceneType == null) {
                console.error(`EventDecorator必须要传 sceneType`)
            }
        }

        DecoratorCollector.inst.add(EventDecoratorType, eventCls, target, sceneType)
    }
}