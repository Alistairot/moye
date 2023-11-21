import { DecoratorCollector } from "../Core/Decorator/DecoratorCollector";
import { type Entity } from "../Entity/Entity";
import { Root } from "../Entity/Root";
import { Scene } from "../Entity/Scene";
import { Singleton } from "../Core/Singleton/Singleton";
import { InstanceQueueIndex } from "../Core/Singleton/InstanceQueueIndex";
import { AEventHandler } from "./Event";
import { DecoratorTypeCore } from "../Decorator/DecoratorTypeCore";
import { coreError } from "../Core/Logger/CoreLogHelper";
import { SceneTypeCore } from "../Entity/SceneTypeCore";
import { Type } from "../Core/Type/Type";
import { EntityIEventSystemLoader } from "../Entity/EntityIEventSystemLoader";
import { AEvent } from "../Event/AEvent";
import { EntityCenter } from "../Core/Singleton/EntityCenter";

class EventInfo {
    public eventHandler: any

    public sceneType: string

    constructor(handler: any, sceneType: string) {
        this.eventHandler = handler;
        this.sceneType = sceneType;
    }
}

export class EventSystem extends Singleton {
    private allEvents: Map<new () => AEvent, Array<EventInfo>> = new Map
    private readonly queues: Array<Array<number>> = new Array(InstanceQueueIndex.Max);

    awake(): void {
        EntityIEventSystemLoader.run(this)
        
        for (let i = 0; i < this.queues.length; i++) {
            this.queues[i] = new Array;
        }

        this.initEvent()
    }

    private initEvent() {
        let argsList = DecoratorCollector.inst.get(DecoratorTypeCore.Event)

        for (const args of argsList) {
            let eventTypeCtor = args[0]
            let handlerCtor = args[1]
            let sceneType = args[2]

            let list = this.allEvents.get(eventTypeCtor)

            if (!list) {
                list = new Array
                this.allEvents.set(eventTypeCtor, list)
            }

            list.push(new EventInfo(new handlerCtor(), sceneType))
        }
    }

    public registerSystem(component: Entity): void {
        if (component.update) {
            this.queues[InstanceQueueIndex.Update].push(component.instanceId)
        }

        if (component.lateUpdate) {
            this.queues[InstanceQueueIndex.LateUpdate].push(component.instanceId)
        }
    }


    public async publishAsync<T extends AEvent>(scene: Scene, eventType: T) {
        if (!scene) {
            coreError(`发送事件必须传scene`)
        }

        let list = this.allEvents.get(eventType.constructor as Type<AEvent>)

        if (!list) {
            return
        }

        let tasks = []

        for (let i = 0; i < list.length; i++) {
            let eventInfo = list[i]

            if (eventInfo.sceneType != scene.sceneType && eventInfo.sceneType != SceneTypeCore.None) {
                continue
            }

            tasks.push((eventInfo.eventHandler as AEventHandler<T>).handleAsync(scene, eventType))
        }

        await Promise.all(tasks)

        eventType.dispose()
    }

    /**
     * 一定要确保事件处理函数不是异步方法
     * 否则会导致事件处理顺序不一致和错误无法捕获
     * @param scene 
     * @param eventType 
     * @returns 
     */
    publish<T extends AEvent>(scene: Scene, eventType: T) {
        if (!scene) {
            coreError(`发送事件必须传scene`)
        }

        let list = this.allEvents.get(eventType.constructor as Type<AEvent>)

        if (!list) {
            return
        }


        for (let i = 0; i < list.length; i++) {
            let eventInfo = list[i]

            if (eventInfo.sceneType != scene.sceneType && eventInfo.sceneType != SceneTypeCore.None) {
                continue
            }

            (eventInfo.eventHandler as AEventHandler<T>).handle(scene, eventType)
        }

        eventType.dispose()
    }

    public awakeComEvent(component: Entity) {
        component.awake()
    }

    public destroyComEvent(component: Entity) {
        component.destroy()
    }

    update(): void {
        let queue = this.queues[InstanceQueueIndex.Update];

        for (let i = queue.length - 1; i >= 0; i--) {
            let instanceId = queue[i];
            let component = EntityCenter.getInst().get(instanceId);

            if (!component) {
                queue.splice(i, 1);
                continue;
            }

            if (component.isDisposed) {
                queue.splice(i, 1);
                continue;
            }

            component.update()
        }
    }

    lateUpdate(): void {
        let queue = this.queues[InstanceQueueIndex.LateUpdate];

        for (let i = queue.length - 1; i >= 0; i--) {
            let instanceId = queue[i];
            let component = EntityCenter.getInst().get(instanceId);

            if (!component) {
                queue.splice(i, 1);
                continue;
            }

            if (component.isDisposed) {
                queue.splice(i, 1);
                continue;
            }

            component.lateUpdate()
        }
    }
}