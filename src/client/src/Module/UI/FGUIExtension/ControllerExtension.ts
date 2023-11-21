import { Controller } from "fairygui-cc";
import { AsyncButtonListener } from "../AsyncButtonListener";
import { FUIEvent } from "fairygui-cc";

declare module 'fairygui-cc' {
    interface Controller {
        onStateChangeAsync(listener: Function): void
    }
}

/**
 * 为Controller添加异步状态监听
 * 简单来说就是用 AsyncButtonListener 包装回调
 */
Controller.prototype.onStateChangeAsync = function (listener: Function) {
    let self: Controller = this

    let asyncListener = new AsyncButtonListener(listener)

    self.on(FUIEvent.STATUS_CHANGED, asyncListener.invoke, asyncListener)
}