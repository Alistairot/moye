import { IResponse } from "./IMessage";

/**
 * rpc消息清理的时候用, 用以传递错误码
 */
export class ActorResponse implements IResponse {
    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    /**
     * 错误码 0表示成功
     */
    error: number

    /**
     * 错误信息 一般在error不为0时才有
     */
    message?: string

    constructor(error: number) {
        this.error = error;
    }
}
