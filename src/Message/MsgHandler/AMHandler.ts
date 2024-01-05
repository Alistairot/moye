import { safeCall } from "../../Core/Core";
import { coreWarn } from "../../Core/Logger/CoreLogHelper";
import { DEVELOP } from "../../Macro";
import { Session } from "../Session";

/**
 * 消息处理器基类
 */
export abstract class AMHandler<A>{
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
            const ret: any = this.run(session, msg);

            if (ret instanceof Promise) {
                coreWarn('AMHandler', '{0}.run 请不要使用异步, 因为异步没办法保证消息接收后的处理顺序', this.constructor.name);
                safeCall(ret);
            }
        } else {
            this.run(session, msg);
        }
    }
}