import { DecoratorCollector } from "../Core/Decorator/DecoratorCollector";
import { DecoratorTypeCore } from "../Decorator/DecoratorTypeCore";
import { coreError } from "../Core/Logger/CoreLogHelper";
import { IMHandler } from "./IMHandler";
import { IMessage, IResponse } from "./IMessage";
import { Session } from "./Session";
import { NetServices } from "../Network/NetServices";
import { Singleton } from "../Core/Singleton/Singleton";
import { Type } from "../Core/Type/Type";
import { MsgPrinter } from "./MsgPrinter";

export class MessageDispatcherInfo {
    public sceneType: string
    public msgHandler: IMHandler
    public responseType: Type<IResponse>

    public constructor(sceneType: string, msgHandler: IMHandler, responseType: Type<IResponse>) {
        this.sceneType = sceneType;
        this.msgHandler = msgHandler;
        this.responseType = responseType
    }
}

/**
 * 普通消息分发
 * 也就是直接到达的消息
 * 客户端跟服务端都有使用
 */
export class MessageDispatcherMgr extends Singleton {
    private _handlers: Map<Type<IMessage>, Array<MessageDispatcherInfo>> = new Map

    awake(): void {
        this.load()
    }

    destroy(): void {
        this._handlers.clear()
    }

    private registerHandler(msgType: Type<IMessage>, handler: MessageDispatcherInfo) {
        if (!this._handlers.has(msgType)) {
            this._handlers.set(msgType, new Array());
        }

        this._handlers.get(msgType).push(handler);
    }

    private load() {
        let list = DecoratorCollector.inst.get(DecoratorTypeCore.MessageHandler)

        for (const args of list) {
            let msgHandlerType = args[0]
            let msgType = args[1]
            let sceneType: string = args[2]
            let responseMsgType: Type<IResponse> = args[3]
            let handler = new msgHandlerType()
            let msgDispatcherInfo: MessageDispatcherInfo = new MessageDispatcherInfo(sceneType, handler, responseMsgType)

            this.registerHandler(msgType, msgDispatcherInfo)
        }
    }

    public handle(session: Session, message: IMessage): void {
        let type = message.constructor as Type
        let actions = this._handlers.get(type)

        if (!actions) {
            let opcode = NetServices.getInst().GetOpcode(type);
            MsgPrinter.getInst().print(message, `消息没有处理: opcode=${opcode}`)
            return;
        }

        let sceneType = session.domainScene().sceneType;

        for (const messageDispatcherInfo of actions) {
            if (messageDispatcherInfo.sceneType != sceneType) {
                continue
            }

            messageDispatcherInfo.msgHandler.handle(session, message, messageDispatcherInfo.responseType)
        }
    }
}