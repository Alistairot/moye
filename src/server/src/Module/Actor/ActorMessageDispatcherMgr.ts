import { DecoratorCollector } from "../../../../common/Core/Decorator/DecoratorCollector";
import { Entity } from "../../../../common/Entity/Entity";
import { coreError } from "../../../../common/Core/Logger/CoreLogHelper";
import { IMessage, IResponse } from "../../../../common/Message/IMessage";
import { Singleton } from "../../../../common/Core/Singleton/Singleton";
import { Type } from "../../../../common/Core/Type/Type";
import { DecoratorType } from "../../Game/DecoratorType/DecoratorType";
import { IMActorHandler } from "./IMActorHandler";


export class ActorMessageDispatcherInfo {
    public sceneType: string
    public actorHandler: IMActorHandler
    public responseType: Type<IResponse>

    constructor(sceneType: string, imActorHandler: IMActorHandler, responseType: Type<IResponse>) {
        this.sceneType = sceneType;
        this.actorHandler = imActorHandler;
        this.responseType = responseType
    }
}

/**
 * 不是直接发送到目的地的消息都是通过这个类分发
 * 比如客户端发送给map场景的消息 就需要这个
 * 如果是客户端发给gate的就不需要这个 因为gate直接与客户端通信 不需要转发
 * 有多个处理器也是挺合理的
 */
export class ActorMessageDispatcherMgr extends Singleton {
    public handlers: Map<Type<IMessage>, ActorMessageDispatcherInfo[]> = new Map

    awake(): void {
        this.load()
    }

    destroy(): void {
        this.handlers.clear()
    }

    private registerHandler(msgCtor: any, handler: ActorMessageDispatcherInfo) {
        if (!this.handlers.has(msgCtor)) {
            this.handlers.set(msgCtor, new Array());
        }

        this.handlers.get(msgCtor).push(handler);
    }

    private load() {
        let list = DecoratorCollector.inst.get(DecoratorType.ActorMessageHandler)

        for (const args of list) {
            let msgHandlerType = args[0]
            let msgType: Type<IMessage> = args[1]
            let sceneType: string = args[2]
            let responseType: Type<IResponse> = args[3]
            let handler: IMActorHandler = new msgHandlerType()
            let messageDispatcherInfo = new ActorMessageDispatcherInfo(sceneType, handler, responseType)

            this.registerHandler(msgType, messageDispatcherInfo)
        }
    }

    async handleAsync(entity: Entity, fromProcess: number, message: IMessage) {
        try {
            let actions = this.handlers.get(message.constructor as Type);
            if (!actions) {
                throw new Error(`not found message handler: ${message.constructor}`);
            }

            let sceneType = entity.domainScene().sceneType;

            for (const messageDispatcherInfo of actions) {
                if (messageDispatcherInfo.sceneType != sceneType) {
                    continue
                }

                await messageDispatcherInfo.actorHandler.handleAsync(entity, fromProcess, message, messageDispatcherInfo.responseType)
            }
        } catch (e) {
            coreError('ActorMessageDispatcherMgr.handle error, msg= {0}, {1}', message.constructor.name, e.stack);
        }
    }

    handleSync(entity: Entity, fromProcess: number, message: IMessage) {
        let actions = this.handlers.get(message.constructor as Type);
        if (!actions) {
            throw new Error(`not found message handler: ${message.constructor}`);
        }

        let sceneType = entity.domainScene().sceneType;

        for (const messageDispatcherInfo of actions) {
            if (messageDispatcherInfo.sceneType != sceneType) {
                continue
            }

            messageDispatcherInfo.actorHandler.handleSync(entity, fromProcess, message, messageDispatcherInfo.responseType);
        }

    }
}