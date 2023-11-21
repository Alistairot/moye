import { DecoratorTypeCore } from "../../../../common/Decorator/DecoratorTypeCore"
import { FlagMgr } from "../../../../common/Decorator/FlagMgr"
import { Scene } from "../../../../common/Entity/Scene"
import { AEvent } from "../../../../common/Event/AEvent"
import { ObjectPool } from "../../../../common/Core/ObjectPool/ObjectPool"
import { Game } from "../../../../common/Core/Singleton/Game"
import { Singleton } from "../../../../common/Core/Singleton/Singleton"
import { Type } from "../../../../common/Core/Type/Type"
import { EventSystem } from "../../../../common/EventSystem/EventSystem"
import { FrameFinishActionMgr } from "../../../../common/FrameFinishAction/FrameFinishActionMgr"
import { FrameFinishEventSender } from "./FrameFinishEventSender"

/**
 * 客户端事件发送器 
 * 客户端不用eventsystem
 */
export class EventSendHelper{
    /**
     * 一定要确保事件处理函数不是异步方法
     * 否则会导致事件处理顺序不一致和错误无法捕获
     * @param scene 
     * @param e 
     */
    static publish<T extends AEvent>(scene: Scene, e: T) {
        if (FlagMgr.getInst().hasFlag(DecoratorTypeCore.FrameFinishEvent, e.constructor as Type)) {
            FrameFinishActionMgr.getInst().getAction(FrameFinishEventSender).addEvent(scene, e);
        } else {
            EventSystem.getInst().publish(scene, e)
        }
    }

    static async publishAsync<T extends AEvent>(scene: Scene, e: T) {
        if (FlagMgr.getInst().hasFlag(DecoratorTypeCore.FrameFinishEvent, e.constructor as Type)) {
            FrameFinishActionMgr.getInst().getAction(FrameFinishEventSender).addEvent(scene, e);
        } else {
            await EventSystem.getInst().publishAsync(scene, e)
        }
    }
}