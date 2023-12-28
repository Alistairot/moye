import { Type } from "../Type/Type";
import { ObjectPool } from "./ObjectPool";

/**
 * 可回收对象
 */
export abstract class RecycleObj {
    private _isRecycle: boolean;

    /**
     * 通过对象池创建
     * @param this 
     * @param values 
     * @returns 
     */
    static create<T extends RecycleObj>(this: Type<T>, values?: Partial<T>): T {
        const obj = ObjectPool.get().fetch(this);

        if (values) {
            Object.assign(obj, values);
        }

        obj._isRecycle = true;

        return obj;
    }

    /**
     * 如果是通过create方法创建的
     * 那么dispose会回收到对象池
     */
    dispose() {
        if (this._isRecycle) {
            ObjectPool.get().recycle(this);
        }
    }
}