import { AEvent } from "./AEvent"
import { DecoratorCollector } from "../Decorator/DecoratorCollector"
import { coreError } from "../Logger/CoreLogHelper"
import { Singleton } from "../Singleton/Singleton"
import { IScene } from "../Type/IScene"
import { Type } from "../Type/Type"
import { AEventHandler } from "./AEventHandler"
import { EventDecoratorType } from "./EventDecorator"
import { EventInfo } from "./EventInfo"

export class EventSystem extends Singleton {
    private _allEvents: Map<Type<AEvent>, Array<EventInfo>> = new Map

    awake(): void {
        this.initEvent()
    }

    private initEvent() {
        let argsList = DecoratorCollector.inst.get(EventDecoratorType);

        for (const args of argsList) {
            let eventTypeCtor = args[0]
            let handlerCtor = args[1]
            let sceneType = args[2]

            let list = this._allEvents.get(eventTypeCtor)

            if (!list) {
                list = [];
                this._allEvents.set(eventTypeCtor, list);
            }

            list.push(new EventInfo(new handlerCtor(), sceneType));
        }
    }

    async publishAsync<T extends AEvent>(scene: IScene, eventType: T) {
        if (!scene) {
            coreError(`发送事件必须传scene`);
        }

        let list = this._allEvents.get(eventType.constructor as Type<AEvent>);

        if (!list) {
            return
        }

        let tasks = [];

        for (let i = 0; i < list.length; i++) {
            let eventInfo = list[i]

            if (eventInfo.sceneType != scene.sceneType && eventInfo.sceneType != "None") {
                continue
            }

            tasks.push((eventInfo.eventHandler as AEventHandler<any, T>).handleAsync(scene, eventType));
        }

        await Promise.all(tasks);

        eventType.dispose();
    }

    /**
     * 一定要确保事件处理函数不是异步方法
     * 否则会导致事件处理顺序不一致和错误无法捕获
     * @param scene 
     * @param eventType 
     * @returns 
     */
    publish<T extends AEvent>(scene: IScene, eventType: T) {
        if (!scene) {
            coreError(`发送事件必须传scene`);
        }

        let list = this._allEvents.get(eventType.constructor as Type<AEvent>);

        if (!list) {
            return
        }


        for (let i = 0; i < list.length; i++) {
            let eventInfo = list[i];

            if (eventInfo.sceneType != scene.sceneType && eventInfo.sceneType != "None") {
                continue
            }

            (eventInfo.eventHandler as AEventHandler<any, T>).handle(scene, eventType);
        }

        eventType.dispose();
    }
}