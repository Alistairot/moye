import { _decorator, Component, EventTouch, Node } from 'cc';
import { ActionAnyArgs } from '../../Core/Core';
const { ccclass, property, menu } = _decorator;

/**
 * 富文本点击事件监听
 */
@ccclass('RichTextListener')
@menu('moye/RichTextListener')
export class RichTextListener extends Component {
    private _cbs: ActionAnyArgs[] = [];

    protected onDestroy(): void {
        this._cbs = [];
    }

    protected onClicked(eventTouch: EventTouch, param: string) {
        // console.log("onClicked", param);
        for (const cb of this._cbs) {
            cb(param);
        }
    }

    addListener(cb: ActionAnyArgs) {
        this._cbs.push(cb);
    }
}