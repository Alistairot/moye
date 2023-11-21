import { DecoratorCollector } from "../../../../../common/Core/Decorator/DecoratorCollector";
import { coreError } from "../../../../../common/Core/Logger/CoreLogHelper";
import { IMessage, IResponse } from "../../../../../common/Message/IMessage";
import { MessageTypeCore } from "../../../../../common/Message/MessageType";
import { MessageTypeMgr } from "../../../../../common/Message/MessageTypeMgr";
import { Session } from "../../../../../common/Message/Session";
import { Singleton } from "../../../../../common/Core/Singleton/Singleton";
import { Type } from "../../../../../common/Core/Type/Type";
import { DecoratorType } from "../../../Game/DecoratorType/DecoratorType";
import { IInnerMessageHandler } from "./IInnerMessageHandler";

/**
 * 收到内网来的消息后 根据messageType分发到不同的消息处理器
 */
export class InnerMessageDispatcher extends Singleton {
    private _handlers: Map<string, IInnerMessageHandler> = new Map()

    awake(): void {
        let list = DecoratorCollector.inst.get(DecoratorType.InnerMsgHandler)

        for (const args of list) {
            let handlerType = args[0]
            let msgType: string = args[1]
            let handler: IInnerMessageHandler = new handlerType()

            this._handlers.set(msgType, handler)
        }
    }

    handle(actorId: number, msg: IMessage) {
        let messageType = MessageTypeMgr.getInst().getMessageType(msg.constructor as Type);
        let handler = this._handlers.get(messageType);

        if (!handler) {
            coreError('InnerMessageMsgDispatcher handle not found handler', messageType);
            return;
        }

        handler.run(actorId, msg)
    }
}