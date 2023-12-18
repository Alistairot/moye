import { Entity } from "../Core/Core";
import { type EventCom } from "./EventCom";
import { EventItem } from "./EventItem";

/**
 * 在entity销毁的时候自动取消订阅
 */
export class EventAutoReleaseCom extends Entity {
    eventCom: EventCom;
    events: EventItem[] = [];

    addItem(item: EventItem) {
        this.events.push(item);
    }

    protected destroy(): void {
        const eventMap = this.eventCom['eventMap'];

        for (const item of this.events) {
            const eventSet = eventMap.get(item.eventType);

            eventSet.delete(item);
            item.entity = null;
            item.handler = null;
            item.eventType = null;
            item.dispose();
        }

        this.events = null;
        this.eventCom = null;
    }
}
