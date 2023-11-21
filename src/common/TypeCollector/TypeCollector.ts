import { Type } from "../Core/Type/Type"

/**
 * 用来解耦合的，用于收集构造函数
 */
export class TypeCollector {
    private static _inst: TypeCollector
    public static get inst(): TypeCollector {
        if (TypeCollector._inst == null) {
            TypeCollector._inst = new TypeCollector
        }

        return TypeCollector._inst
    }

    private ctors: Map<string, Type> = new Map

    public add(name: string, type: Type) {
        if(this.ctors.has(name)) {
            console.error(`type ${name} already exists`)
            return
        }

        this.ctors.set(name, type)
    }

    public get(name: string): Type {
        let type = this.ctors.get(name)

        if(type == null){
            console.error(`type ${name} not found`)
        }

        return type
    }
}