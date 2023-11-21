import { IMessage } from "../../../../../common/Message/IMessage";

export interface IInnerMessageHandler {
    /**
     * 要确保不会抛出错误
     * 哪怕出错了 也会在内处理好
     * @param actorId 
     * @param msg 
     */
    run(actorId: number, msg: IMessage): void;
}