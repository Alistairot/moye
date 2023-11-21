// 此文件为自动生成，请勿手工修改！

import { MessageParserDecorator } from "../../../../../common/Message/MessageParserDecorator";
import * as Message from "./OuterMessageCore";
import { OuterMessageCoreOpcode } from "./OuterMessageCoreOpcode";
import { Reader, Writer } from "protobufjs";
import * as CustomParser from "./CustomParser";
import * as CustomType from "./CustomType";
import Long from 'long';


@MessageParserDecorator(OuterMessageCoreOpcode.R2C_Login)
export class R2C_Login_Parser {
    static encode(w: Writer, msg: Message.R2C_Login): void {
        if(msg.address != null){
            w.uint32(26).string(msg.address)
        }
        if(msg.key != null){
            w.uint32(32).int64(msg.key)
        }
        w.uint32(40).uint32(msg.rpcId)
        w.uint32(48).uint32(msg.error)
        if(msg.message != null){
            w.uint32(58).string(msg.message)
        }
    }
    static decode(r: Reader, msg: Message.R2C_Login, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.address = r.string()
                    break;
                }
                case 4:{
                    msg.key = (r.int64() as Long).toNumber()
                    break;
                }
                case 5:{
                    msg.rpcId = r.uint32()
                    break;
                }
                case 6:{
                    msg.error = r.uint32()
                    break;
                }
                case 7:{
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

@MessageParserDecorator(OuterMessageCoreOpcode.G2C_LoginGate)
export class G2C_LoginGate_Parser {
    static encode(w: Writer, msg: Message.G2C_LoginGate): void {
        w.uint32(24).uint32(msg.rpcId)
        w.uint32(32).uint32(msg.error)
        if(msg.message != null){
            w.uint32(42).string(msg.message)
        }
    }
    static decode(r: Reader, msg: Message.G2C_LoginGate, length?: number): void {
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

@MessageParserDecorator(OuterMessageCoreOpcode.G2C_Ping)
export class G2C_Ping_Parser {
    static encode(w: Writer, msg: Message.G2C_Ping): void {
        if(msg.time != null){
            w.uint32(24).int64(msg.time)
        }
        w.uint32(32).uint32(msg.rpcId)
        w.uint32(40).uint32(msg.error)
        if(msg.message != null){
            w.uint32(50).string(msg.message)
        }
    }
    static decode(r: Reader, msg: Message.G2C_Ping, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.time = (r.int64() as Long).toNumber()
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

@MessageParserDecorator(OuterMessageCoreOpcode.C2G_TestPressure)
export class C2G_TestPressure_Parser {
    static encode(w: Writer, msg: Message.C2G_TestPressure): void {
    }
    static decode(r: Reader, msg: Message.C2G_TestPressure, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {

                default:
                    r.skipType(tag & 7)
                    break
            }
        }

    }
}

@MessageParserDecorator(OuterMessageCoreOpcode.C2R_Login)
export class C2R_Login_Parser {
    static encode(w: Writer, msg: Message.C2R_Login): void {
        w.uint32(26).string(msg.account)
        w.uint32(34).string(msg.password)
        w.uint32(40).uint32(msg.rpcId)
    }
    static decode(r: Reader, msg: Message.C2R_Login, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
                    msg.account = r.string()
                    break;
                }
                case 4:{
                    msg.password = r.string()
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

@MessageParserDecorator(OuterMessageCoreOpcode.C2G_LoginGate)
export class C2G_LoginGate_Parser {
    static encode(w: Writer, msg: Message.C2G_LoginGate): void {
        w.uint32(24).int64(msg.key)
        w.uint32(32).uint32(msg.rpcId)
    }
    static decode(r: Reader, msg: Message.C2G_LoginGate, length?: number): void {
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

@MessageParserDecorator(OuterMessageCoreOpcode.C2G_Ping)
export class C2G_Ping_Parser {
    static encode(w: Writer, msg: Message.C2G_Ping): void {
        w.uint32(24).uint32(msg.rpcId)
    }
    static decode(r: Reader, msg: Message.C2G_Ping, length?: number): void {
        let end = length === undefined ? r.len : r.pos + length;
        while (r.pos < end) {
            const tag = r.uint32()
            switch (tag >>> 3) {
                case 3:{
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