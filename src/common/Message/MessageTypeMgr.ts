import { DecoratorCollector } from "../Core/Decorator/DecoratorCollector";
import { DecoratorTypeCore } from "../Decorator/DecoratorTypeCore";
import { Singleton } from "../Core/Singleton/Singleton";
import { Type } from "../Core/Type/Type";
import { IMessage } from "./IMessage";
import { MessageTypeCore } from "./MessageType";

/**
 * 消息类型管理器
 * 比如通过opcode得到MessageType
 * 或者通过Type得到MessageType
 */
export class MessageTypeMgr extends Singleton {
    private _messageTypeMap: Map<number, string> = new Map
    private _typeToMessageTypeMap: Map<Type<IMessage>, string> = new Map

    awake(): void {
        let list = DecoratorCollector.inst.get(DecoratorTypeCore.Message)

        for (const args of list) {
            let type: Type<IMessage> = args[0]
            let msgType: string = args[1]
            let opcode: number = args[2]

            this._messageTypeMap.set(opcode, msgType)
            this._typeToMessageTypeMap.set(type, msgType)
        }
    }

    destroy(): void {
        this._messageTypeMap.clear()
        this._messageTypeMap = null
    }

    getMessageType(type: Type<IMessage>): string {
        return this._typeToMessageTypeMap.get(type)
    }

    public isResponse(opcode: number): boolean {
        let msgType = this._messageTypeMap.get(opcode)

        if (!msgType) {
            return false
        }

        if (msgType == MessageTypeCore.Response) {
            return true
        }
        if (msgType == MessageTypeCore.ActorResponse) {
            return true
        }
        if (msgType == MessageTypeCore.ActorLocationResponse) {
            return true
        }

        return false
    }
}