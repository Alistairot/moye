import { coreWarn } from "../Core/Logger/CoreLogHelper";
import { DEVELOP } from "../Macro";
import { safeCall } from "../Core/JavaScript/safeCall";
import { IMHandler } from "./IMHandler";
import { IMessage } from "./IMessage";
import { Session } from "./Session";

/**
 * 客户端只需要用这一个消息处理器
 * 直接接收到的消息 且不需要回复
 */
export abstract class AMHandler<A extends IMessage> implements IMHandler {
    /**
     * 请不要用异步 因为异步的话可能没办法保证消息的顺序
     * @param session 
     * @param message 
     */
    protected abstract run(session: Session, message: A): void;

    handle(session: Session, msg: A) {
        // session可能已经断开了，所以这里需要判断
        if (session.isDisposed) {
            return;
        }

        if (DEVELOP) {
            // 开发阶段检测
            let ret: any = this.run(session, msg);

            if (ret instanceof Promise) {
                coreWarn('{0}.run 请不要使用异步, 因为异步没办法保证消息接收后的处理顺序', this.constructor.name);
                safeCall(ret);
            }
        } else {
            this.run(session, msg);
        }
    }
}