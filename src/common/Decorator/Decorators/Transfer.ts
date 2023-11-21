import { DecoratorCollector } from "../../Core/Decorator/DecoratorCollector";
import { DecoratorTypeCore } from "../DecoratorTypeCore";

/**
 * 需要传送的组件添加这个装饰器
 * 注意 child是不会跟着传送的 只能用于组件上
 * 但是使用DB标志的child和组件都可以跟随传送
 * 不要同时使用Transfer和DB标志
 * 因为包含db的必然会跟着传送
 * @returns 
 */
export function Transfer(constructor: Function) {
    DecoratorCollector.inst.add(DecoratorTypeCore.Transfer, constructor)
}