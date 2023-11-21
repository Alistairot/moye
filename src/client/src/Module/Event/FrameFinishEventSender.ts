import { Scene } from "../../../../common/Entity/Scene";
import { AEvent } from "../../../../common/Event/AEvent";
import { EventSystem } from "../../../../common/EventSystem/EventSystem";
import { IFrameFinishAction } from "../../../../common/FrameFinishAction/IFrameFinishAction";
import { coreLog } from "../../../../common/Core/Logger/CoreLogHelper";
import { DEVELOP } from "../../../../common/Macro";
import { Type } from "../../../../common/Core/Type/Type";
import { EventItem } from "./EventItem";

export class FrameFinishEventSender implements IFrameFinishAction {
    private _eventMap: Map<Type<AEvent>, EventItem> = new Map;
    awake(): void {
    }
    destroy(): void {
        this._eventMap.clear();
    }
    run() {
        if(DEVELOP){
            coreLog('发送帧结束事件数量={0}', this._eventMap.size)
        }

        let eventSys = EventSystem.getInst();
        for(let item of this._eventMap.values()) {
            eventSys.publish(item.scene, item.event);

            item.scene = null;
            item.event = null;
            item.dispose();
        }
        this._eventMap.clear();
    }

    addEvent(scene: Scene, evt: AEvent) {
        let item = this._eventMap.get(evt.constructor as Type<AEvent>);
        if(item == null) {
            item = EventItem.create();
            this._eventMap.set(evt.constructor as Type<AEvent>, item);
        }
        item.scene = scene;
        item.event = evt;
    }
}