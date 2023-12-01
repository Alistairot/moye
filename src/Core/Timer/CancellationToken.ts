import { coreError } from "../Logger/CoreLogHelper";
import { Action } from "../Type/Action";

export const CancellationTokenTag = "CancellationToken";

/**
 * cancel token
 */
export class CancellationToken {
    private _actions: Set<Action> = new Set();

    /**
     * add one cancel action
     * @param callback 添加取消动作
     * @returns 
     */
    add(callback: Action) {
        if (callback == null) {
            coreError(CancellationTokenTag, 'CancellationToken add error, callback is null');
            return;
        }

        this._actions.add(callback);
    }

    remove(callback: Action) {
        this._actions?.delete(callback);
    }

    /**
     * 执行取消动作
     * @returns 
     */
    cancel() {
        if (this._actions == null) {
            coreError(CancellationTokenTag, 'CancellationToken cancel error, repeat cancel');
            return;
        }

        this.invoke();
    }

    isCancel(): boolean {
        return this._actions == null;
    }

    private invoke() {
        const runActions = this._actions;
        this._actions = null;

        try {
            for (const action of runActions) {
                action();
            }

            runActions.clear();
        }
        catch (e) {
            coreError(CancellationTokenTag, e);
        }
    }
}