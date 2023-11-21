// 此文件为自动生成，请勿手工修改！

import { MessageParserDecorator } from "../../../../../common/Message/MessageParserDecorator";
import * as Message from "./InnerMessageCore";
import { InnerMessageCoreOpcode } from "./InnerMessageCoreOpcode";
import { Reader, Writer } from "protobufjs";
import * as CustomParser from "./CustomParser";
import * as CustomType from "./CustomType";
import Long from 'long';


@MessageParserDecorator(InnerMessageCoreOpcode._ActorResponse)
export class _ActorResponse_Parser {
    static encode(w: Writer, msg: Message._ActorResponse): void {
        w.uint32(24).uint32(msg.rpcId)
        w.uint32(32).uint32(msg.error)
        if(msg.message != null){
            w.uint32(42).string(msg.message)
        }
    }
    static decode(r: Reader, msg: Message._ActorResponse, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.rpcId = r.uint32()
                    break;
                }
                case 4:{
                    msg.error = r.uint32()
                    break;
                }
                case 5:{
                    msg.message = r.string()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.DBCacheResponse)
export class DBCacheResponse_Parser {
    static encode(w: Writer, msg: Message.DBCacheResponse): void {
        w.uint32(24).uint32(msg.rpcId)
        w.uint32(32).uint32(msg.error)
        if(msg.message != null){
            w.uint32(42).string(msg.message)
        }
    }
    static decode(r: Reader, msg: Message.DBCacheResponse, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.rpcId = r.uint32()
                    break;
                }
                case 4:{
                    msg.error = r.uint32()
                    break;
                }
                case 5:{
                    msg.message = r.string()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.DBQueryResponse)
export class DBQueryResponse_Parser {
    static encode(w: Writer, msg: Message.DBQueryResponse): void {
        if(msg.data != null){
            w.uint32(26).bytes(msg.data)
        }
        w.uint32(32).uint32(msg.rpcId)
        w.uint32(40).uint32(msg.error)
        if(msg.message != null){
            w.uint32(50).string(msg.message)
        }
    }
    static decode(r: Reader, msg: Message.DBQueryResponse, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.data = r.bytes()
                    break;
                }
                case 4:{
                    msg.rpcId = r.uint32()
                    break;
                }
                case 5:{
                    msg.error = r.uint32()
                    break;
                }
                case 6:{
                    msg.message = r.string()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.DBDeleteResponse)
export class DBDeleteResponse_Parser {
    static encode(w: Writer, msg: Message.DBDeleteResponse): void {
        w.uint32(24).uint32(msg.rpcId)
        w.uint32(32).uint32(msg.error)
        if(msg.message != null){
            w.uint32(42).string(msg.message)
        }
    }
    static decode(r: Reader, msg: Message.DBDeleteResponse, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.rpcId = r.uint32()
                    break;
                }
                case 4:{
                    msg.error = r.uint32()
                    break;
                }
                case 5:{
                    msg.message = r.string()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.ObjectAddResponse)
export class ObjectAddResponse_Parser {
    static encode(w: Writer, msg: Message.ObjectAddResponse): void {
        w.uint32(24).uint32(msg.rpcId)
        w.uint32(32).uint32(msg.error)
        if(msg.message != null){
            w.uint32(42).string(msg.message)
        }
    }
    static decode(r: Reader, msg: Message.ObjectAddResponse, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.rpcId = r.uint32()
                    break;
                }
                case 4:{
                    msg.error = r.uint32()
                    break;
                }
                case 5:{
                    msg.message = r.string()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.ObjectGetResponse)
export class ObjectGetResponse_Parser {
    static encode(w: Writer, msg: Message.ObjectGetResponse): void {
        w.uint32(24).int64(msg.instanceId)
        w.uint32(32).uint32(msg.rpcId)
        w.uint32(40).uint32(msg.error)
        if(msg.message != null){
            w.uint32(50).string(msg.message)
        }
    }
    static decode(r: Reader, msg: Message.ObjectGetResponse, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.instanceId = (r.int64() as Long).toNumber()
                    break;
                }
                case 4:{
                    msg.rpcId = r.uint32()
                    break;
                }
                case 5:{
                    msg.error = r.uint32()
                    break;
                }
                case 6:{
                    msg.message = r.string()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.ObjectLockResponse)
export class ObjectLockResponse_Parser {
    static encode(w: Writer, msg: Message.ObjectLockResponse): void {
        w.uint32(24).uint32(msg.rpcId)
        w.uint32(32).uint32(msg.error)
        if(msg.message != null){
            w.uint32(42).string(msg.message)
        }
    }
    static decode(r: Reader, msg: Message.ObjectLockResponse, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.rpcId = r.uint32()
                    break;
                }
                case 4:{
                    msg.error = r.uint32()
                    break;
                }
                case 5:{
                    msg.message = r.string()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.ObjectRemoveResponse)
export class ObjectRemoveResponse_Parser {
    static encode(w: Writer, msg: Message.ObjectRemoveResponse): void {
        w.uint32(24).uint32(msg.rpcId)
        w.uint32(32).uint32(msg.error)
        if(msg.message != null){
            w.uint32(42).string(msg.message)
        }
    }
    static decode(r: Reader, msg: Message.ObjectRemoveResponse, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.rpcId = r.uint32()
                    break;
                }
                case 4:{
                    msg.error = r.uint32()
                    break;
                }
                case 5:{
                    msg.message = r.string()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.ObjectUnLockResponse)
export class ObjectUnLockResponse_Parser {
    static encode(w: Writer, msg: Message.ObjectUnLockResponse): void {
        w.uint32(24).uint32(msg.rpcId)
        w.uint32(32).uint32(msg.error)
        if(msg.message != null){
            w.uint32(42).string(msg.message)
        }
    }
    static decode(r: Reader, msg: Message.ObjectUnLockResponse, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.rpcId = r.uint32()
                    break;
                }
                case 4:{
                    msg.error = r.uint32()
                    break;
                }
                case 5:{
                    msg.message = r.string()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.G2R_GetLoginKey)
export class G2R_GetLoginKey_Parser {
    static encode(w: Writer, msg: Message.G2R_GetLoginKey): void {
        w.uint32(24).int64(msg.key)
        w.uint32(32).uint32(msg.rpcId)
        w.uint32(40).uint32(msg.error)
        if(msg.message != null){
            w.uint32(50).string(msg.message)
        }
    }
    static decode(r: Reader, msg: Message.G2R_GetLoginKey, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.key = (r.int64() as Long).toNumber()
                    break;
                }
                case 4:{
                    msg.rpcId = r.uint32()
                    break;
                }
                case 5:{
                    msg.error = r.uint32()
                    break;
                }
                case 6:{
                    msg.message = r.string()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.M2G_ConnectUnit)
export class M2G_ConnectUnit_Parser {
    static encode(w: Writer, msg: Message.M2G_ConnectUnit): void {
        w.uint32(24).int64(msg.sceneInstanceId)
        w.uint32(32).uint32(msg.rpcId)
        w.uint32(40).uint32(msg.error)
        if(msg.message != null){
            w.uint32(50).string(msg.message)
        }
    }
    static decode(r: Reader, msg: Message.M2G_ConnectUnit, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.sceneInstanceId = (r.int64() as Long).toNumber()
                    break;
                }
                case 4:{
                    msg.rpcId = r.uint32()
                    break;
                }
                case 5:{
                    msg.error = r.uint32()
                    break;
                }
                case 6:{
                    msg.message = r.string()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.M2G_DisconnectUnit)
export class M2G_DisconnectUnit_Parser {
    static encode(w: Writer, msg: Message.M2G_DisconnectUnit): void {
        w.uint32(24).uint32(msg.rpcId)
        w.uint32(32).uint32(msg.error)
        if(msg.message != null){
            w.uint32(42).string(msg.message)
        }
    }
    static decode(r: Reader, msg: Message.M2G_DisconnectUnit, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.rpcId = r.uint32()
                    break;
                }
                case 4:{
                    msg.error = r.uint32()
                    break;
                }
                case 5:{
                    msg.message = r.string()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.M2M_UnitTransferResponse)
export class M2M_UnitTransferResponse_Parser {
    static encode(w: Writer, msg: Message.M2M_UnitTransferResponse): void {
        w.uint32(24).uint32(msg.rpcId)
        w.uint32(32).uint32(msg.error)
        if(msg.message != null){
            w.uint32(42).string(msg.message)
        }
    }
    static decode(r: Reader, msg: Message.M2M_UnitTransferResponse, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.rpcId = r.uint32()
                    break;
                }
                case 4:{
                    msg.error = r.uint32()
                    break;
                }
                case 5:{
                    msg.message = r.string()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.DBCacheRequest)
export class DBCacheRequest_Parser {
    static encode(w: Writer, msg: Message.DBCacheRequest): void {
        w.uint32(26).bytes(msg.data)
        w.uint32(32).uint32(msg.rpcId)
    }
    static decode(r: Reader, msg: Message.DBCacheRequest, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.data = r.bytes()
                    break;
                }
                case 4:{
                    msg.rpcId = r.uint32()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.DBQueryRequest)
export class DBQueryRequest_Parser {
    static encode(w: Writer, msg: Message.DBQueryRequest): void {
        if(msg.numberKey != null){
            w.uint32(24).int64(msg.numberKey)
        }
        if(msg.stringKey != null){
            w.uint32(34).string(msg.stringKey)
        }
        w.uint32(40).int32(msg.typeCode)
        w.uint32(48).uint32(msg.rpcId)
    }
    static decode(r: Reader, msg: Message.DBQueryRequest, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.numberKey = (r.int64() as Long).toNumber()
                    break;
                }
                case 4:{
                    msg.stringKey = r.string()
                    break;
                }
                case 5:{
                    msg.typeCode = r.int32()
                    break;
                }
                case 6:{
                    msg.rpcId = r.uint32()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.DBDeleteRequest)
export class DBDeleteRequest_Parser {
    static encode(w: Writer, msg: Message.DBDeleteRequest): void {
        if(msg.numberKey != null){
            w.uint32(24).int64(msg.numberKey)
        }
        if(msg.stringKey != null){
            w.uint32(34).string(msg.stringKey)
        }
        w.uint32(40).int32(msg.typeCode)
        w.uint32(48).uint32(msg.rpcId)
    }
    static decode(r: Reader, msg: Message.DBDeleteRequest, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.numberKey = (r.int64() as Long).toNumber()
                    break;
                }
                case 4:{
                    msg.stringKey = r.string()
                    break;
                }
                case 5:{
                    msg.typeCode = r.int32()
                    break;
                }
                case 6:{
                    msg.rpcId = r.uint32()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.ObjectAddRequest)
export class ObjectAddRequest_Parser {
    static encode(w: Writer, msg: Message.ObjectAddRequest): void {
        w.uint32(24).int64(msg.key)
        w.uint32(32).int64(msg.instanceId)
        w.uint32(40).uint32(msg.rpcId)
    }
    static decode(r: Reader, msg: Message.ObjectAddRequest, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.key = (r.int64() as Long).toNumber()
                    break;
                }
                case 4:{
                    msg.instanceId = (r.int64() as Long).toNumber()
                    break;
                }
                case 5:{
                    msg.rpcId = r.uint32()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.ObjectGetRequest)
export class ObjectGetRequest_Parser {
    static encode(w: Writer, msg: Message.ObjectGetRequest): void {
        w.uint32(24).int64(msg.key)
        w.uint32(32).uint32(msg.rpcId)
    }
    static decode(r: Reader, msg: Message.ObjectGetRequest, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.key = (r.int64() as Long).toNumber()
                    break;
                }
                case 4:{
                    msg.rpcId = r.uint32()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.ObjectLockRequest)
export class ObjectLockRequest_Parser {
    static encode(w: Writer, msg: Message.ObjectLockRequest): void {
        w.uint32(24).int64(msg.key)
        w.uint32(32).int64(msg.instanceId)
        w.uint32(40).int32(msg.time)
        w.uint32(48).uint32(msg.rpcId)
    }
    static decode(r: Reader, msg: Message.ObjectLockRequest, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.key = (r.int64() as Long).toNumber()
                    break;
                }
                case 4:{
                    msg.instanceId = (r.int64() as Long).toNumber()
                    break;
                }
                case 5:{
                    msg.time = r.int32()
                    break;
                }
                case 6:{
                    msg.rpcId = r.uint32()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.ObjectRemoveRequest)
export class ObjectRemoveRequest_Parser {
    static encode(w: Writer, msg: Message.ObjectRemoveRequest): void {
        w.uint32(24).int64(msg.key)
        w.uint32(32).uint32(msg.rpcId)
    }
    static decode(r: Reader, msg: Message.ObjectRemoveRequest, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.key = (r.int64() as Long).toNumber()
                    break;
                }
                case 4:{
                    msg.rpcId = r.uint32()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.ObjectUnLockRequest)
export class ObjectUnLockRequest_Parser {
    static encode(w: Writer, msg: Message.ObjectUnLockRequest): void {
        if(msg.key != null){
            w.uint32(24).int64(msg.key)
        }
        if(msg.oldInstanceId != null){
            w.uint32(32).int64(msg.oldInstanceId)
        }
        if(msg.instanceId != null){
            w.uint32(40).int64(msg.instanceId)
        }
        w.uint32(48).uint32(msg.rpcId)
    }
    static decode(r: Reader, msg: Message.ObjectUnLockRequest, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.key = (r.int64() as Long).toNumber()
                    break;
                }
                case 4:{
                    msg.oldInstanceId = (r.int64() as Long).toNumber()
                    break;
                }
                case 5:{
                    msg.instanceId = (r.int64() as Long).toNumber()
                    break;
                }
                case 6:{
                    msg.rpcId = r.uint32()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.R2G_GetLoginKey)
export class R2G_GetLoginKey_Parser {
    static encode(w: Writer, msg: Message.R2G_GetLoginKey): void {
        w.uint32(26).string(msg.account)
        w.uint32(32).uint32(msg.rpcId)
    }
    static decode(r: Reader, msg: Message.R2G_GetLoginKey, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.account = r.string()
                    break;
                }
                case 4:{
                    msg.rpcId = r.uint32()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.G2M_ConnectUnit)
export class G2M_ConnectUnit_Parser {
    static encode(w: Writer, msg: Message.G2M_ConnectUnit): void {
        w.uint32(24).int64(msg.sessionInstanceId)
        w.uint32(32).uint32(msg.rpcId)
    }
    static decode(r: Reader, msg: Message.G2M_ConnectUnit, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.sessionInstanceId = (r.int64() as Long).toNumber()
                    break;
                }
                case 4:{
                    msg.rpcId = r.uint32()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.G2M_DisconnectUnit)
export class G2M_DisconnectUnit_Parser {
    static encode(w: Writer, msg: Message.G2M_DisconnectUnit): void {
        w.uint32(24).int64(msg.sessionInstanceId)
        w.uint32(32).uint32(msg.rpcId)
    }
    static decode(r: Reader, msg: Message.G2M_DisconnectUnit, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.sessionInstanceId = (r.int64() as Long).toNumber()
                    break;
                }
                case 4:{
                    msg.rpcId = r.uint32()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(InnerMessageCoreOpcode.M2M_UnitTransferRequest)
export class M2M_UnitTransferRequest_Parser {
    static encode(w: Writer, msg: Message.M2M_UnitTransferRequest): void {
        if(msg.oldInstanceId != null){
            w.uint32(24).int64(msg.oldInstanceId)
        }
        if(msg.unit != null){
            w.uint32(34).bytes(msg.unit)
        }
        for (const v of msg.entitys) {
            w.uint32(42).bytes(v)

        }
        w.uint32(48).uint32(msg.rpcId)
    }
    static decode(r: Reader, msg: Message.M2M_UnitTransferRequest, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.oldInstanceId = (r.int64() as Long).toNumber()
                    break;
                }
                case 4:{
                    msg.unit = r.bytes()
                    break;
                }
                case 5:{
                    let v = r.bytes()
                    msg.entitys.push(v)
                    break;
                }
                case 6:{
                    msg.rpcId = r.uint32()
                    break;
                }

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}



