import { DecoratorCollector } from "../Decorator/DecoratorCollector";
import { Type } from "../Type/Type";
import { AEvent } from "./AEvent";
import { type AEventHandler } from "./AEventHandler";
import { EventDecoratorType } from "./EventDecorator";
import { EventInfo } from "./EventInfo";

/**
 * cache all event
 */
export class MoyeEventCenter{
    private static _inst: MoyeEventCenter;
    static get inst(){
        if(this._inst == null){
            this._inst = new MoyeEventCenter();
            this._inst.reloadEvent();
        }

        return this._inst;
    }

    allEvents: Map<Type<AEvent>, Array<EventInfo>> = new Map;

    reloadEvent() {
        const argsList = DecoratorCollector.inst.get(EventDecoratorType);

        this.allEvents.clear();

        for (const args of argsList) {
            const eventType = args[0];
            const handlerType = args[1];
            const sceneType = args[2];

            let list = this.allEvents.get(eventType);

            if (!list) {
                list = [];
                this.allEvents.set(eventType, list);
            }

            list.push(new EventInfo(new handlerType(), sceneType));
        }
    }

    publish<T extends AEvent>(event: T) {
        const list = this.allEvents.get(event.constructor as Type<AEvent>);

        if (!list) {
            return;
        }


        for (let i = 0; i < list.length; i++) {
            const eventInfo = list[i];
            const handler = eventInfo.eventHandler as AEventHandler<any, T>;

            handler.handle(null, event);
        }

        event.dispose();
    }
}