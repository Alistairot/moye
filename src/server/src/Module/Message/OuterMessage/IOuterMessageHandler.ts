import { IMessage } from "../../../../../common/Message/IMessage";
import { Session } from "../../../../../common/Message/Session";

export interface IOuterMessageHandler {
    /**
     * @param session 
     * @param msg 
     * @错误 允许抛出
     * @异步 不等待
     */
    run(session: Session, msg: IMessage): void;
}