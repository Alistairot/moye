import { Singleton } from "../Core/Core";
import { AServiceDataType } from "../Network/AService";

export interface IMsgSerializeExecutor {
    encode(opcode: number, obj: object): AServiceDataType;
    decode(bytes: AServiceDataType): [number, object];
}

/**
 * 消息序列化
 */
export class MsgSerializeMgr extends Singleton {
    private _serialize: IMsgSerializeExecutor;

    register(serialize: IMsgSerializeExecutor) {
        this._serialize = serialize;
    }

    serialize(opcode: number, obj: object): AServiceDataType {
        return this._serialize.encode(opcode, obj);
    }

    deserialize(bytes: AServiceDataType): [number, object] {
        return this._serialize.decode(bytes);
    }
}