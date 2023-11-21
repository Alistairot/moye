import { ObjectPool } from "../Core/ObjectPool/ObjectPool";
import { Singleton } from "../Core/Singleton/Singleton";
import { Type } from "../Core/Type/Type";
import { IFrameFinishAction } from "./IFrameFinishAction";

/**
 * 帧结束后的动作管理器
 * 比如在帧结束后，执行某些动作
 */
export class FrameFinishActionMgr extends Singleton {
    private _actionMap: Map<Type<IFrameFinishAction>, IFrameFinishAction> = new Map();

    getAction<T extends IFrameFinishAction>(actionType: Type<T>): T{
        let action = this._actionMap.get(actionType);

        if(!action){
            action = ObjectPool.getInst().fetch(actionType);
            action.awake();
            this._actionMap.set(actionType, action);
        }

        return action as T;
    }

    lateUpdate(): void {
        if (this._actionMap.size == 0) {
            return
        }

        let objectPool = ObjectPool.getInst();

        for (let action of this._actionMap.values()) {
            action.run();
            action.destroy();
            objectPool.recycle(action);
        }

        this._actionMap.clear();
    }
}