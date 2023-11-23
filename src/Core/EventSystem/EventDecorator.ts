import { DEVELOP } from "../../Macro";
import { DecoratorCollector } from "../Decorator/DecoratorCollector";
import { Type } from "../Type/Type";
import { AEvent } from "./AEvent";

export const EventDecoratorType = "EventDecoratorType";

/**
 * 事件装饰器
 * @param event 
 * @param sceneType 
 * @returns 
 */
export function EventDecorator(event: Type<AEvent>, sceneType: string) {
    return function (target: Type) {
        if (DEVELOP) {
            if (sceneType == null) {
                console.error(`EventDecorator必须要传 sceneType`);
            }
        }

        DecoratorCollector.inst.add(EventDecoratorType, event, target, sceneType);
    };
}