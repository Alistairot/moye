import { Entity } from "../Entity/Entity";
import { ObjectPool } from "../Core/ObjectPool/ObjectPool";

class EventItem {
    entity: Entity
    handler: Function
    eventCode: number
}

/**
 * 在entity销毁的时候自动取消订阅
 */
class EventAutoReleaseCom extends Entity {
    eventCom: EventComponent;
    events: EventItem[] = [];

    addItem(item: EventItem){
        this.events.push(item)
    }

    destroy(): void {
        let eventMap = this.eventCom.eventMap;

        for (let item of this.events) {
            let eventSet = eventMap.get(item.eventCode);

            eventSet.delete(item);
            item.entity = null;
            item.handler = null;
            item.eventCode = null;
            ObjectPool.getInst().recycle(item);
        }

        this.events = [];
    }
}

/**
 * 事件组件 可以发送事件给监听的对象
 * 不允许取消订阅
 */
export class EventComponent extends Entity {
    eventMap: Map<number, Set<EventItem>> = new Map;
    /**
     * handler不需要绑定entity 也就是不需要bind
     * @param eventType 
     * @param handler 
     * @param entity 
     */
    subscribe(eventCode: number, handler: Function, entity: Entity) {
        let objectPool = ObjectPool.getInst();
        let item = objectPool.fetch(EventItem);
        item.entity = entity;
        item.handler = handler;
        item.eventCode = eventCode;

        let eventSet = this.eventMap.get(eventCode);

        if (!eventSet) {
            eventSet = new Set();
            this.eventMap.set(eventCode, eventSet);
        }

        eventSet.add(item);

        let autoReleaseCom = entity.getComponent(EventAutoReleaseCom);

        if (!autoReleaseCom) {
            autoReleaseCom = entity.addComponent(EventAutoReleaseCom);
            autoReleaseCom.eventCom = this;
        }

        autoReleaseCom.addItem(item);
    }

    publish(eventCode: number, ...args: any[]) {
        let eventSet = this.eventMap.get(eventCode);

        if (eventSet) {
            for (let item of eventSet) {
                item.handler.apply(item.entity, args);
            }
        }
    }
}