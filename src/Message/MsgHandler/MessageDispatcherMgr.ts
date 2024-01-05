import { DecoratorCollector } from "../../Core/Decorator/DecoratorCollector";
import { Session } from "../Session";
import { Singleton } from "../../Core/Singleton/Singleton";
import { Type } from "../../Core/Type/Type";
import { AMHandler } from "./AMHandler";
import { MsgHandlerDecoratorType } from "./MsgHandlerDecorator";

/**
 * 消息分发
 */
export class MessageDispatcherMgr extends Singleton {
    private _handlers: Map<Type, AMHandler<any>[]> = new Map;

    awake(): void {
        const list = DecoratorCollector.inst.get(MsgHandlerDecoratorType);

        for (const args of list) {
            const msgHandlerType = args[0];
            const msgType = args[1];
            const handler = new msgHandlerType();

            if (!this._handlers.has(msgType)) {
                this._handlers.set(msgType, []);
            }

            this._handlers.get(msgType).push(handler);
        }
    }

    destroy(): void {
        this._handlers.clear();
    }

    handle(session: Session, msg: object): void {
        const type = msg.constructor as Type;
        const actions = this._handlers.get(type);

        if (!actions) {
            console.error(`[MessageDispatcherMgr] msg not found handler`, msg);
            return;
        }

        for (const handler of actions) {
            handler.handle(session, msg);
        }
    }
}