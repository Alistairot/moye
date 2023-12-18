import { Action, CancellationToken, Entity, Task, TimerMgr, Type } from "../Core/Core";
import { coreWarn } from "../Core/Logger/CoreLogHelper";
import { AWait } from "./AWait";
import { WaitError } from "./WaitError";


export class ObjectWait extends Entity {
    private _tasks: Map<Type, Task> = new Map;

    protected destroy(): void {
        for (const [type, task] of this._tasks) {
            const obj = this.createWaitInstance(type, WaitError.DESTROY);
            this.notify(obj);
        }
    }

    /**
     * 一直等待 知道notify了 永不超时
     * @param type 
     * @param cancellationToken 
     * @returns 
     */
    async wait<T extends AWait>(type: Type<T>, cancellationToken?: CancellationToken): Promise<T> {
        this.cancelLastWait(type);

        const tcs = Task.create(type);
        this._tasks.set(type, tcs);

        let cancelAction: Action<void>;
        let ret: T;

        if (cancellationToken) {
            cancelAction = () => {
                const obj = this.createWaitInstance(type, WaitError.CANCEL);

                this.notify(obj);
            };

            cancellationToken.add(cancelAction);
        }

        try {
            ret = await tcs;
        }
        finally {
            cancellationToken?.remove(cancelAction);
            cancelAction = null;
        }

        return ret;
    }

    /**
     * 等待且有超时限制 超时将会取消等待
     * @param type 
     * @param timeout ms
     * @param cancellationToken 
     * @returns 
     */
    async waitWithTimeout<T extends AWait>(type: Type<T>, timeout: number, cancellationToken?: CancellationToken): Promise<T> {
        this.cancelLastWait(type);

        const tcs = Task.create(type);
        this._tasks.set(type, tcs);

        this.timeoutRun(type, timeout, cancellationToken);

        let cancelAction: Action<void>;
        let ret: T;

        if (cancellationToken) {
            cancelAction = () => {
                const obj = this.createWaitInstance(type, WaitError.CANCEL);
                this.notify(obj);
            };

            cancellationToken.add(cancelAction);
        }

        try {
            ret = await tcs;
        }
        finally {
            cancellationToken?.remove(cancelAction);
            cancelAction = null;
        }

        return ret;
    }

    /**
     * 取消上一个等待
     * @param type 
     */
    private cancelLastWait(type: Type<AWait>) {
        if (!this._tasks.has(type)) {
            return;
        }

        coreWarn('上一个wait已经取消, {0}', type.name);
        const obj = this.createWaitInstance(type, WaitError.CANCEL);
        this.notify(obj);
    }

    /**
     * 超时取消等待
     * @param type 
     * @param time 
     * @param cancellationToken 
     * @returns 
     */
    private async timeoutRun(type: Type<AWait>, time: number, cancellationToken?: CancellationToken) {
        await TimerMgr.get().waitAsync(time, cancellationToken);

        if (cancellationToken?.isCancel()) {
            return;
        }

        // 已经执行完毕 不需要执行超时的逻辑
        if (!this._tasks.has(type)) {
            return;
        }

        const obj = this.createWaitInstance(type, WaitError.TIMEOUT);
        this.notify(obj);
    }

    private createWaitInstance(type: Type<AWait>, error: WaitError): AWait {
        const obj = (type as typeof AWait).create();
        obj.error = error;
        return obj;
    }

    notify<T extends AWait>(obj: T) {
        const tcs = this._tasks.get(obj.constructor as Type);
        if (!tcs) {
            return;
        }

        this._tasks.delete(obj.constructor as Type);
        tcs.setResult(obj);

        obj.dispose();
    }
}