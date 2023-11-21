/**
 * 实现这个接口 可以自定义序列化之前和之后的操作
 */
export interface ISerialize {
    /**
     * 序列化时调用
     */
    onSerialize?(): void;

    /**
     * 反序列化时调用
     */
    onDeserialize?(): void;
}