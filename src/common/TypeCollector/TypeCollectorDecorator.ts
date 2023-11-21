import { Type } from "../Core/Type/Type"
import { TypeCollector } from "./TypeCollector"

/**
 * 收集class的构造函数 避免耦合
 * @param name 
 * @returns 
 */
export function TypeCollectorDecorator(name: string) {
    return function (constructor: Function) {
        TypeCollector.inst.add(name, constructor as Type)
    }
}