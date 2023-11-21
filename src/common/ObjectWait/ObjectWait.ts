import { Entity } from "../Entity/Entity";
import { coreWarn } from "../Core/Logger/CoreLogHelper";
import { CancellationToken } from "../Task/CancellationToken";
import { Task } from "../Core/Task/Task";
import { TimerMgr } from "../Timer/TimerMgr";
import { Action } from "../Core/Type/Action";
import { Type } from "../Core/Type/Type";
import { AWait } from "./AWait";
import { WaitError } from "./WaitError";

export class ObjectWait extends Entity {
    private tcss: Map<Type, Task> = new Map

    /**
     * 一直等待 知道notify了 永不超时
     * @param type 
     * @param cancellationToken 
     * @returns 
     */
    public async wait<T extends AWait>(type: Type<T>, cancellationToken?: CancellationToken): Promise<T> {
        this.cancelLastWait(type);

        let tcs = Task.create(type);
        this.tcss.set(type, tcs);

        let cancelAction: Action<void>;
        let ret: T;

        if(cancellationToken){
            cancelAction = () => {
                let obj = new type()
                obj.error = WaitError.Cancel
                this.notify(obj);
            }

            cancellationToken.add(cancelAction);
        }

        try {
            ret = await tcs;
        }
        finally {
            cancellationToken?.remove(cancelAction);
            cancelAction = null
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

        let tcs = Task.create(type);
        this.tcss.set(type, tcs);

        this.timeoutRun(type, timeout, cancellationToken);

        let cancelAction: Action<void>;
        let ret: T;

        if(cancellationToken){
            cancelAction = () => {
                let obj = new type()
                obj.error = WaitError.Cancel
                this.notify(obj);
            }

            cancellationToken.add(cancelAction);
        }

        try {
            ret = await tcs;
        }
        finally {
            cancellationToken?.remove(cancelAction);
            cancelAction = null
        }

        return ret;
    }

    /**
     * 取消上一个等待
     * @param type 
     */
    private cancelLastWait(type: Type<AWait>) {
        if (!this.tcss.has(type)) {
            return;
        }

        coreWarn(`上一个wait已经取消`, type.name);
        let obj = (type as typeof AWait).create();
        obj.error = WaitError.Cancel;
        this.notify(obj);
    }

    /**
     * 超时取消等待
     * @param type 
     * @param time 
     * @param cancellationToken 
     * @returns 
     */
    private async timeoutRun(type: Type<AWait>, time: number, cancellationToken?: CancellationToken){
        await TimerMgr.getInst().waitAsync(time, cancellationToken);

        if (cancellationToken?.isCancel()) {
            return;
        }

        // 已经执行完毕 不需要执行超时的逻辑
        if (!this.tcss.has(type)) {
            return;
        }
        
        let obj = (type as typeof AWait).create()
        obj.error = WaitError.Timeout
        this.notify(obj);
    }

    notify<T extends AWait>(obj: T) {
        let tcs = this.tcss.get(obj.constructor as Type)
        if (!tcs) {
            return;
        }

        this.tcss.delete(obj.constructor as Type);
        tcs.setResult(obj)

        obj.dispose()
    }
}