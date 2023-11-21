import { readFileSync, writeFileSync } from "fs";
import { DecoratorCollector } from "../../../../common/Core/Decorator/DecoratorCollector";
import { DecoratorTypeCore } from "../../../../common/Decorator/DecoratorTypeCore";
import { coreLog, coreWarn } from "../../../../common/Core/Logger/CoreLogHelper";
import { DEVELOP, SAME_MACHINE_OPTIMIZATION } from "../../../../common/Macro";
import { Singleton } from "../../../../common/Core/Singleton/Singleton";
import { Type } from "../../../../common/Core/Type/Type";
import { ISerializeCfg } from "./ISerializeCfg";
import { Encoder, addExtension, decode, encode, isNativeAccelerationEnabled } from 'cbor-x';
import { ISerialize } from "./ISerialize";

/**
 * 对象序列化
 * 需要用装饰器先注册一下
 * 比如 DB Transfer DBWithKey
 */
export class ObjectSerializeMgr extends Singleton {
    typeMap: Map<Type, ISerializeCfg> = new Map;
    typeCodeMap: Map<number, ISerializeCfg> = new Map;
    private _encoder: Encoder
    /**
     * 同机序列化 也就是你序列化的时候如果数据是发送给本机其它进程的话就会用这个
     * 可以减少序列化后的大小
     */
    private _sameMachineEncoder: Encoder

    awake(): void {
        let typeList: Type[] = [];

        let list1 = DecoratorCollector.inst.get(DecoratorTypeCore.Transfer);
        for (const args of list1) {
            let type: Type = args[0]

            typeList.push(type);
        }

        let list2 = DecoratorCollector.inst.get(DecoratorTypeCore.DB)
        for (const args of list2) {
            let type: Type = args[0]

            typeList.push(type);
        }

        for (let i = 0; i < typeList.length; i++) {
            let type = typeList[i];

            let cfg: ISerializeCfg = {
                type: type,
                typeCode: 40500 + i + 1,
            }

            this.typeMap.set(type, cfg);
            this.typeCodeMap.set(cfg.typeCode, cfg);

            coreLog('ObjectSerializeMgr 注册类型 = {0}, typeCode = {1}', cfg.type.name, cfg.typeCode);

            addExtension({
                Class: cfg.type,
                tag: cfg.typeCode,
                encode(instance: ISerialize, encode) {
                    if(instance.onSerialize){
                        instance.onSerialize();
                    }
                    return encode(Object.assign({}, instance));
                },
                decode(data: ISerialize) {
                    Object.setPrototypeOf(data, type.prototype);

                    if(data.onDeserialize){
                        data.onDeserialize();
                    }

                    return data;
                }
            });
        }

        this._encoder = new Encoder({ structuredClone: true });
        this._sameMachineEncoder = new Encoder({
            structuredClone: true,
            structures: [],
            getStructures() {
                return decode(readFileSync('cbor-x-structures.cbor')) || [];
            },
            saveStructures(structures) {
                writeFileSync('cbor-x-structures.cbor', encode(structures));
            },
        });

        coreLog('ObjectSerializeMgr nodejs环境加速是否开启: {0}', isNativeAccelerationEnabled);

        if (!isNativeAccelerationEnabled) {
            coreWarn('ObjectSerializeMgr nodejs环境加速没开启, 请检查cbor-x的依赖是否正常');
        }

    }

    serialize(obj: object): Uint8Array {
        let serialized = this._encoder.encode(obj);
        let bytes = new Uint8Array(serialized);

        // coreLog(`不同机器序列化`);

        return bytes;
    }

    serializeSameMachine(obj: object): Uint8Array {
        let serialized: Buffer;

        if(SAME_MACHINE_OPTIMIZATION){
            serialized = this._sameMachineEncoder.encode(obj);
        }else{
            serialized = this._encoder.encode(obj);
        }

        let bytes = new Uint8Array(serialized);

        return bytes;
    }

    deserialize(bytes: Uint8Array): any {
        let obj = this._encoder.decode(bytes);
        // coreLog(`不同机器反序列化`)
        return obj;
    }

    deserializeSameMachine(bytes: Uint8Array): any {
        let obj:any;
        if(SAME_MACHINE_OPTIMIZATION){
            obj = this._sameMachineEncoder.decode(bytes);
        }else{
            obj = this._encoder.decode(bytes);
        }

        return obj;
    }

    getTypeCode(type: Type): number {
        let cfg = this.typeMap.get(type);

        if (DEVELOP) {
            if (cfg == null) {
                throw new Error(`不存在typecode的类型, type=${type}`)
            }
        }

        return cfg.typeCode;
    }

    getType(typeCode: number): Type {
        let cfg = this.typeCodeMap.get(typeCode);

        if (DEVELOP) {
            if (cfg == null) {
                throw new Error(`不存在typecode的类型, typeCode=${typeCode}`)
            }
        }

        return cfg.type;
    }
}