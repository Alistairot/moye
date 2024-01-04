import { Singleton } from "../Core/Core";

export interface ISerialize {
    encode(obj: object): Uint8Array | string;
    decode(bytes: Uint8Array | string): object;
}

/**
 * 消息序列化
 */
export class MsgSerializeMgr extends Singleton {
    private _serialize: ISerialize;

    register(serialize: ISerialize) {
        this._serialize = serialize;
    }

    serialize(obj: object): Uint8Array | string {
        if (this._serialize) {
            return this._serialize.encode(obj);
        }

        return JSON.stringify(obj);
    }

    deserialize(bytes: Uint8Array | string): any {
        if (this._serialize) {
            return this._serialize.decode(bytes);
        }

        if(typeof bytes == 'string'){
            return JSON.parse(bytes);
        }

        return bytes;
    }
}