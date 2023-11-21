import { coreError } from "../Core/Logger/CoreLogHelper";
import { Action } from "../Core/Type/Action";

/**
 * 用来取消某些异步的东西
 */
export class CancellationToken {
    private _actions: Set<Action<void>> = new Set();

    /**
     * 
     * @param callback 添加取消动作
     * @returns 
     */
    add(callback: Action<void>) {
        if (callback == null) {
            coreError(`CancellationToken add error, callback is null`)
            return
        }
        // 如果action是null，绝对不能添加,要抛异常，说明有协程泄漏
        this._actions.add(callback);
    }

    remove(callback: Action<void>) {
        this._actions.delete(callback);
    }

    /**
     * 执行取消动作
     * @returns 
     */
    cancel() {
        if (this._actions == null) {
            coreError(`CancellationToken cancel error, repeat cancel`)
            return;
        }

        this.invoke();
    }

    isCancel(): boolean {
        return this._actions == null;
    }

    private invoke() {
        let runActions = this._actions;
        this._actions = null;

        try {
            for (let action of runActions) {
                action();
            }

            runActions.clear()
        }
        catch (e) {
            coreError(e)
        }
    }
}