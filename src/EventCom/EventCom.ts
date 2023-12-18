import { Entity } from "../Core/Core";
import { EventAutoReleaseCom } from "./EventAutoReleaseCom";
import { EventItem } from "./EventItem";

/**
 * 事件组件 可以发送事件给监听的对象
 * 不允许取消订阅
 */
export class EventCom extends Entity {
    private _eventMap: Map<string, Set<EventItem>> = new Map;
    protected destroy(): void {
        const eventMap = this._eventMap;

        for (const eventSet of eventMap.values()) {
            for (const item of eventSet) {
                item.entity = null;
                item.handler = null;
                item.eventType = null;
                item.dispose();
            }

            eventSet.clear();
        }

        eventMap.clear();
    }
    /**
     * evtCom.subscribe(123, this.onEvent, this)
     * handler不需要绑定entity 也就是不需要bind
     * @param eventType 
     * @param handler 
     * @param entity 
     */
    subscribe(eventType: string, handler: Function, entity: Entity) {
        const item = EventItem.create({
            entity: entity,
            handler: handler,
            eventType: eventType
        });

        let eventSet = this._eventMap.get(eventType);

        if (!eventSet) {
            eventSet = new Set();
            this._eventMap.set(eventType, eventSet);
        }

        eventSet.add(item);

        let autoReleaseCom = entity.getCom(EventAutoReleaseCom);

        if (!autoReleaseCom) {
            autoReleaseCom = entity.addCom(EventAutoReleaseCom);
            autoReleaseCom.eventCom = this;
        }

        autoReleaseCom.addItem(item);
    }

    publish(eventType: string, ...args: any[]) {
        const eventSet = this._eventMap.get(eventType);

        if (eventSet) {
            for (const item of eventSet) {
                item.handler.apply(item.entity, args);
            }
        }
    }
}