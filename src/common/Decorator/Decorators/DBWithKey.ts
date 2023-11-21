import { DecoratorCollector } from "../../Core/Decorator/DecoratorCollector"
import { DecoratorTypeCore } from "../DecoratorTypeCore"

/**
 * 需要存数据库的类 且需要查询的
 * @param key 查询的字段
 * @param isNumberKey 是否是数字key 如果不是就是字符串key
 * @param maxCache 最大缓存数量,缓存服缓存该对象的最大数量，如果超出了就会从缓存中删除
 * @returns 
 */
export function DBWithKey(key: string, isNumberKey: boolean, maxCache: number) {
    return function (target: Function) {
        DecoratorCollector.inst.add(DecoratorTypeCore.DB, target, key, isNumberKey, maxCache)
    }
}