import { Singleton } from "../Singleton/Singleton";
import { Type } from "../Type/Type";

export class ObjectPool extends Singleton {
    private _pool: Map<Type, object[]> = new Map;

    public fetch<T>(type: Type<T>): T {
        const queue = this._pool.get(type);

        if (!queue) {
            return new type();
        }

        if (queue.length === 0) {
            return new type();
        }

        return queue.shift() as T;
    }

    public recycle(obj: object): void {
        const type: Type = obj.constructor as Type;
        let queue = this._pool.get(type);

        if (!queue) {
            queue = [];
            this._pool.set(type, queue);
        }

        if (queue.length > 1000) {
            // 报个警告 不进行缓存了
            console.warn(`pool ${type.name} is too large`);
            return;
        }

        queue.push(obj);
    }
}