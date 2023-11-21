import { BSON } from "mongodb";
import { Singleton } from "../../../../common/Core/Singleton/Singleton";
import { DecoratorCollector } from "../../../../common/Core/Decorator/DecoratorCollector";
import { DecoratorTypeCore } from "../../../../common/Decorator/DecoratorTypeCore";
import { coreError } from "../../../../common/Core/Logger/CoreLogHelper";
import { Type } from "../../../../common/Core/Type/Type";

/**
 * 主要用于将对象转化成bson,以便于MongoDB存储
 */
export class DBSerializeMgr extends Singleton {
    // 注意避免同名类
    private _name2CtorMap: Map<string, Type> = new Map;
    /**
     * 忽略的key 比如_id 这个是bson存储的时候用的
     */
    private _ignoreKeys: Set<string> = new Set(['_id']);

    awake(): void {
        let list1 = DecoratorCollector.inst.get(DecoratorTypeCore.Transfer)

        for (const args of list1) {
            let ctor = args[0]

            this._name2CtorMap.set(ctor.name, ctor)
        }

        let list2 = DecoratorCollector.inst.get(DecoratorTypeCore.DB)

        for (const args of list2) {
            let ctor = args[0]

            this._name2CtorMap.set(ctor.name, ctor)
        }
    }

    /**
     * 注册需要序列化的类型 没有注册是不支持序列化的
     * 且一定要注意 序列化的Type构造函数不能有参数
     * @param type 
     */
    registerType(type: Type) {
        this._name2CtorMap.set(type.name, type)
    }

    /**
     * 弃用这个方法 效率太低了
     * @param obj 
     * @returns 
     */
    serializeToUint8Array(obj: any): Uint8Array {
        let serialized = this.serializeToObject(obj)
        let bson = BSON.serialize(serialized)

        return bson
    }

    /**
     * 转化成bson可以序列化的对象
     * @param obj
     * @returns 
     */
    public serializeToObject(obj: any): any {
        if (obj == null) {
            return
        }

        if (typeof obj != "object") {
            return obj
        }

        if (obj instanceof Array) {
            let newObj = new Array(obj.length)

            for (let i = 0; i < obj.length; i++) {
                newObj[i] = this.serializeToObject(obj[i])
            }

            return newObj
        }

        if (obj instanceof Map) {
            let newObj = {
                ctorName: 'Map',
                keyList: new Array(obj.size),
                valueList: new Array(obj.size),
            }

            let count = 0;

            for (let [key, value] of obj) {
                newObj.keyList[count] = this.serializeToObject(key)
                newObj.valueList[count++] = this.serializeToObject(value)
            }

            return newObj
        }

        if (obj instanceof Set) {
            let newObj = {
                ctorName: 'Set',
                valueList: new Array(obj.size),
            }

            let count = 0;

            for (let value of obj) {
                newObj.valueList[count++] = this.serializeToObject(value)
            }

            return newObj
        }

        if (obj.constructor != null) {
            let keys = Object.keys(obj)
            let ctor = obj.constructor
            let newObj = { ctorName: ctor.name }

            for (const key of keys) {
                if (this._ignoreKeys.has(key)) {
                    continue
                }

                newObj[key] = this.serializeToObject(obj[key])
            }

            return newObj
        }

        return obj
    }

    public deserialize(from: any): any {
        if (from == null) {
            return
        }

        let obj = from

        if (from instanceof Uint8Array) {
            obj = BSON.deserialize(from);
        }

        if (obj.ctorName != null) {
            if (obj.ctorName == 'Set') {
                let newObj = new Set()

                for (let i = 0; i < obj.valueList.length; i++) {
                    let value = obj.valueList[i];
                    newObj.add(this.deserialize(value))
                }

                return newObj
            } else if (obj.ctorName == 'Map') {
                let newObj = new Map()

                for (let i = 0; i < obj.valueList.length; i++) {
                    let key = obj.keyList[i];
                    let value = obj.valueList[i];

                    newObj.set(key, this.deserialize(value))
                }

                return newObj
            }

            let objCtor = this._name2CtorMap.get(obj.ctorName)

            if (!objCtor) {
                coreError(`${obj.ctorName}不能识别的反序列化对象`)
                return
            }

            let objNew = new objCtor()

            for (let key in obj) {
                if (key == 'ctorName') {
                    continue
                }

                if (this._ignoreKeys.has(key)) {
                    continue
                }

                objNew[key] = this.deserialize(obj[key])
            }

            return objNew
        }

        if (obj instanceof Array) {
            let newObj = new Array(obj.length)

            for (let i = 0; i < obj.length; i++) {
                let value = obj[i];

                newObj[i] = this.deserialize(value)
            }

            return newObj
        }

        return obj
    }
}