import { Singleton } from "../Core/Singleton/Singleton";
import { Type } from "../Core/Type/Type";
import { DecoratorCollector } from "../Core/Decorator/DecoratorCollector";

/**
 * 判断类是否有某个标记
 */
export class FlagMgr extends Singleton {
    private _datas: Map<string, Set<Type>> = new Map

    private add(decoratorType: string): Set<Type> {
        let list = DecoratorCollector.inst.get(decoratorType)
        let set: Set<Type> = new Set

        this._datas.set(decoratorType, set)

        for (const args of list) {
            let type = args[0]
            set.add(type)
        }

        return set
    }

    hasFlag(decoratorType: string, type: Type): boolean {
        let set = this._datas.get(decoratorType)

        if (!set) {
            set = this.add(decoratorType)
        }

        return set.has(type)
    }
}