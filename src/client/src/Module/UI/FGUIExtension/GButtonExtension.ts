import { GButton } from "fairygui-cc";
import { AsyncButtonListener } from "../AsyncButtonListener";

declare module 'fairygui-cc' {
    interface GButton {
        /**
         * 设置异步点击
         * 会清除之前的回调
         * 也就是会等待回调执行完毕之后才能再次点击
         * 使用 AsyncButtonListener 包装
         */
        setAsyncClick(listener: Function): void
        /**
         * 设置点击
         * 会清除之前的回调
         */
        setClick(listener: Function): void
    }
}

GButton.prototype.setAsyncClick = function (listener: Function) {
    let self: GButton = this;

    self.clearClick();

    let asyncListener = new AsyncButtonListener(listener);

    self.onClick(asyncListener.invoke, asyncListener);
}

GButton.prototype.setClick = function (listener: Function) {
    let self: GButton = this;
    self.clearClick();
    self.onClick(listener);
}

export { GButton }