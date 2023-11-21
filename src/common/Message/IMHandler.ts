import { Type } from "../Core/Type/Type";
import { IMessage } from "./IMessage";
import { Session } from "./Session";

/**
 * 消息处理器的接口 所有的消息处理器都要实现这个接口
 */
export interface IMHandler {
    handle(session: Session, message: IMessage, responseType: Type<IMessage>): void;
}