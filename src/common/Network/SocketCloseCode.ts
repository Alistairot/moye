/**
 * socket关闭码
 * 4001-4999
 */
export enum SocketCloseCode {
    /**
     * 其他设备登录
     */
    OtherLogin = 4001,

    /**
     * 一般是发送过来的消息解析错误
     */
    WChannelReadError = 4002,

    WebSocketError = 4003,
    ServerMaxLimit = 4004,
}