import pb from 'protobufjs'
import Long from 'long';

const r = new pb.Reader(new Uint8Array())

export class MessageHelper{
    public static getActorId(bytes: Uint8Array): number {
        r.pos = 0
        r.buf = bytes
        r.len = bytes.length

        r.skip()
        r.skip()

        const tag = r.uint32();

        if (tag >>> 3 == 2) {
            let xx = r.uint64()
            return (xx as Long).toNumber()
        }

        return 0
    }

    public static getOpcode(bytes: Uint8Array): number {
        r.pos = 0
        r.buf = bytes
        r.len = bytes.length

        const tag = r.uint32();

        if (tag >>> 3 == 1) {
            return r.uint32()
        }

        return 0
    }
}