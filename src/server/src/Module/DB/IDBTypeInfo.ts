import { Type } from "../../../../common/Core/Type/Type";

export interface IDBTypeInfo{
    type: Type,
    key: string,
    /**
     * 是否是数字key 如果不是就是字符串key
     */
    isNumberKey: boolean,
    /**
     * 最大缓存数量
     */
    maxCache: number,
}