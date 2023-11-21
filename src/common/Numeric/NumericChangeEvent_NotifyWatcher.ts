import { Scene } from "../Entity/Scene";
import { SceneTypeCore } from "../Entity/SceneTypeCore";
import { AEventHandler, EventHandlerDecorator } from "../EventSystem/Event";
import { NumericChange } from "../EventSystem/EventCore";
import { NumericWatcherMgr } from "./NumericWatcherMgr";

/**
 * 监听所有数值变化 并通过NumericWatcherMgr传递
 */
@EventHandlerDecorator(NumericChange, SceneTypeCore.None)
export class NumericChangeEvent_NotifyWatcher extends AEventHandler<NumericChange>{
    protected async run(scene: Scene, args: NumericChange) {
        NumericWatcherMgr.getInst().run(args)
    }
}