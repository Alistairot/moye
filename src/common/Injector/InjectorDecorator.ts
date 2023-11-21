import { Injector } from "./Injector"

/**
 * 静态字段注入装饰器
 * @param type 
 * @returns 
 */
export function InjectorDecorator(type: string) {
    return function <T, K extends keyof T>(target: T, key: K) {
        Injector.inst.addField(type, target, key)
    }
}