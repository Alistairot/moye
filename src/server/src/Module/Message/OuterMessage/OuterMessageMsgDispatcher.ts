import { DecoratorCollector } from "../../../../../common/Core/Decorator/DecoratorCollector";
import { coreError, coreWarn } from "../../../../../common/Core/Logger/CoreLogHelper";
import { IMessage, IResponse } from "../../../../../common/Message/IMessage";
import { MessageTypeCore } from "../../../../../common/Message/MessageType";
import { MessageTypeMgr } from "../../../../../common/Message/MessageTypeMgr";
import { Session } from "../../../../../common/Message/Session";
import { Singleton } from "../../../../../common/Core/Singleton/Singleton";
import { Type } from "../../../../../common/Core/Type/Type";
import { DecoratorType } from "../../../Game/DecoratorType/DecoratorType";
import { IOuterMessageHandler } from "./IOuterMessageHandler";

/**
 * 收到外网来的消息后 根据messageType分发到不同的消息处理器
 */
export class OuterMessageMsgDispatcher extends Singleton {
    private _handlers: Map<string, IOuterMessageHandler> = new Map()

    awake(): void {
        let list = DecoratorCollector.inst.get(DecoratorType.OuterMsgHandler)

        for (const args of list) {
            let handlerType = args[0]
            let msgType: string = args[1]
            let handler: IOuterMessageHandler = new handlerType()

            this._handlers.set(msgType, handler)
        }
    }

    handle(session: Session, msg: IMessage) {
        try {
            let messageType = MessageTypeMgr.getInst().getMessageType(msg.constructor as Type)

            // 如果是回应 直接调用session的onResponse
            // 这里可以忽略 因为不会对客户端发起rpc请求
            if (messageType == MessageTypeCore.Response
                || messageType == MessageTypeCore.ActorResponse
                || messageType == MessageTypeCore.ActorLocationResponse) {
                coreWarn('OuterMessageMsgDispatcher.handle ignore response msg, bug got response msg from outer, please check! msg={0}', msg.constructor.name);
                session.OnResponse(msg as IResponse)
                return;
            }

            let handler = this._handlers.get(messageType)

            if (!handler) {
                throw new Error(`OuterMessageMsgDispatcher handle not found handler ${messageType}`);
            }

            handler.run(session, msg);
        } catch (e) {
            coreError('OuterMessageMsgDispatcher.handle error, msg={0}, {1}', msg.constructor.name, e.stack);
        }
    }
}