import { DecoratorCollector } from "../Core/Decorator/DecoratorCollector";
import { DecoratorTypeCore } from "../Decorator/DecoratorTypeCore";
import { ObjectPool } from "../Core/ObjectPool/ObjectPool";
import { Type } from "../Core/Type/Type";

export abstract class AInvoke {
    public static create<T extends AInvoke>(this: Type<T>, values?: Partial<T>) {
        let event = ObjectPool.getInst().fetch(this);

        if (values) {
            Object.assign(event, values);
        }

        return event;
    }

    public dispose() {
        ObjectPool.getInst().recycle(this);
    }
}