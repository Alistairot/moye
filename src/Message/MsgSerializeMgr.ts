import { Singleton } from "../Core/Core";
import { Encoder, addExtension, decode, encode, isNativeAccelerationEnabled } from 'cbor-x';
import { MsgMgr } from "./MsgMgr";
import { AMessage } from "./AMessage";

/**
 * 消息序列化
 */
export class MsgSerializeMgr extends Singleton {
    private _encoder: Encoder;

    awake(): void {
        const opcodeTypeMap = MsgMgr.get().opcodeToTypeMap;
        const startTag = 41000;

        for (const [opcode, type] of opcodeTypeMap) {
            addExtension({
                Class: type,
                tag: startTag + opcode,
                encode(instance: any, encode) {
                    return encode(Object.assign({}, instance));
                },
                decode(data: any) {
                    Object.setPrototypeOf(data, type.prototype);
                    return data;
                }
            });
        }

        this._encoder = new Encoder({ structuredClone: true });
    }

    serialize(obj: AMessage<any>): Uint8Array {
        const serialized = this._encoder.encode(obj);
        const bytes = new Uint8Array(serialized);

        return bytes;
    }

    deserialize(bytes: Uint8Array): any {
        const obj = this._encoder.decode(bytes);
        return obj;
    }
}