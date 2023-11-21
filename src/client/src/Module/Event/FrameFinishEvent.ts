import { DecoratorCollector } from "../../../../common/Core/Decorator/DecoratorCollector";
import { DecoratorTypeCore } from "../../../../common/Decorator/DecoratorTypeCore";

/**
 * 帧结束事件装饰器
 * 用于标记一个事件在帧结束的时候发送
 * 可以避免一个帧内多次发送事件
 * 注意 用这个装饰器装饰的事件,将不能再等待,也就是不能await
 * @param constructor 
 */
export function FrameFinishEvent(constructor: Function) {
    DecoratorCollector.inst.add(DecoratorTypeCore.FrameFinishEvent, constructor)
}