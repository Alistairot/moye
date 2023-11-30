import { Action, ActionAnyArgs } from "../../Core/Core";

/**
 * button async listener  
 * wait for the callback to complete
 */
export class AsyncButtonListener {
    private _callback: ActionAnyArgs;
    private _isClick: boolean;

    constructor(func: ActionAnyArgs) {
        this._callback = func;
    }

    async invoke(...args: any[]) {
        if (this._isClick) {
            return;
        }

        this._isClick = true;

        await this._callback(...args);

        this._isClick = false;
    }

    static create(func: ActionAnyArgs): Action<void> {
        const listener = new AsyncButtonListener(func);
        return listener.invoke.bind(listener);
    }
}