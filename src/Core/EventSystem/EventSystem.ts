import { AEvent } from "./AEvent";
import { Singleton } from "../Singleton/Singleton";
import { IScene } from "../Type/IScene";
import { Type } from "../Type/Type";
import { AEventHandler } from "./AEventHandler";
import { MoyeEventCenter } from "./MoyeEventCenter";

export class EventSystem extends Singleton {
    async publishAsync<T extends AEvent>(scene: IScene, eventType: T) {
        const list = MoyeEventCenter.inst.allEvents.get(eventType.constructor as Type<AEvent>);

        if (!list) {
            return;
        }

        const tasks = [];

        for (let i = 0; i < list.length; i++) {
            const eventInfo = list[i];

            if (eventInfo.sceneType != scene.sceneType && eventInfo.sceneType != "None") {
                continue;
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
        const list = MoyeEventCenter.inst.allEvents.get(eventType.constructor as Type<AEvent>);

        if (!list) {
            return;
        }


        for (let i = 0; i < list.length; i++) {
            const eventInfo = list[i];

            if (eventInfo.sceneType != scene.sceneType && eventInfo.sceneType != "None") {
                continue;
            }

            (eventInfo.eventHandler as AEventHandler<any, T>).handle(scene, eventType);
        }

        eventType.dispose();
    }
}