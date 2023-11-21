import { Type } from "../Type/Type";
import { ObjectPool } from "./ObjectPool";

/**
 * 可回收对象
 */
export abstract class RecycleObj {
    private _isRecycle: boolean = false

    /**
     * 通过对象池创建
     * @param this 
     * @param values 
     * @returns 
     */
    public static create<T extends RecycleObj>(this: Type<T>, values?: Partial<T>): T {
        let event = ObjectPool.getInst().fetch(this);

        if (values) {
            Object.assign(event, values);
        }

        event._isRecycle = true

        return event;
    }

    /**
     * 如果是通过create方法创建的
     * 那么dispose会回收到对象池
     */
    public dispose() {
        if (this._isRecycle) {
            ObjectPool.getInst().recycle(this);
        }
    }
}