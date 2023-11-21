import { DecoratorCollector } from "../../Core/Decorator/DecoratorCollector";
import { DecoratorTypeCore } from "../DecoratorTypeCore";

/**
 * 需要存数据库的类 不需要查询的
 */
export function DB(constructor: Function) {
    DecoratorCollector.inst.add(DecoratorTypeCore.DB, constructor)
}