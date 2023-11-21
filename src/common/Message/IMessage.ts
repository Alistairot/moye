export interface IMessage {
}

export interface IRequest extends IMessage {
    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number
}

export interface IResponse extends IMessage {
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
}