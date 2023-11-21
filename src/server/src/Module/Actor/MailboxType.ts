/**
 * 邮箱类型
 */
export enum MailboxType
{
    /**
     * 有序
     * 也就是处理消息的时候会队列处理
     * 上一个处理完才会处理下一个
     */
    MessageDispatcher,
    /**
     * 无序
     */
    UnOrderMessageDispatcher,

    /**
     * 邮箱类型如果是这个的话 收到消息会直接发给客户端
     */
    GateSession,
}