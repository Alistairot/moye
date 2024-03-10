import { _decorator, CCInteger, Component, Enum, Node } from 'cc';
import { EDITOR, EDITOR_NOT_IN_PREVIEW } from 'cc/env';
const { ccclass, property, executeInEditMode, menu } = _decorator;

export enum UIControllerIndex {
    Index_0 = 1 << 0,
    Index_1 = 1 << 1,
    Index_2 = 1 << 2,
    Index_3 = 1 << 3,
    Index_4 = 1 << 4,
    Index_5 = 1 << 5,
    Index_6 = 1 << 6,
    Index_7 = 1 << 7,
    Index_8 = 1 << 8,
    Index_9 = 1 << 9,
    Index_10 = 1 << 10,
    Index_11 = 1 << 11,
    Index_12 = 1 << 12,
}

interface IUIControllerIndexListener {
    onChangeIndex(index: number): void;
}

@ccclass('UIController')
@menu('moye/UIController')
@executeInEditMode
export class UIController extends Component {
    @property
    private _index: UIControllerIndex = UIControllerIndex.Index_0;

    @property({ type: Enum(UIControllerIndex), displayOrder: 1 })
    set index(v: UIControllerIndex) {
        if (this._index == v) {
            return;
        }

        this._index = v;

        this.notifyListeners();
    }
    get index() {
        return this._index;
    }

    @property
    private _listeners: IUIControllerIndexListener[] = [];

    private _callbacks: ((controller: UIController, index: number) => any)[] = [];

    protected onDestroy(): void {
        this._listeners = [];
        this._callbacks = [];
    }

    /**
     * 不会触发addListener的回调
     * @param index 
     * @returns 
     */
    setIndex(index: UIControllerIndex) {
        if (this._index == index) {
            return;
        }

        this._index = index;

        for (let i = 0; i < this._listeners.length; i++) {

            if (this._listeners[i]) {
                this._listeners[i].onChangeIndex(this._index);
            }
        }
    }

    addListener(listener: (controller: UIController, index: number) => any) {
        this._callbacks.push(listener);
    }

    removeListener(listener: (controller: UIController, index: number) => any) {
        const index = this._callbacks.indexOf(listener);
        if (index != -1) {
            this._callbacks.splice(index, 1);
        }
    }

    private _addListener(listener: IUIControllerIndexListener) {
        if (this._listeners.indexOf(listener) == -1) {
            this._listeners.push(listener);
        }

        if (EDITOR) {
            // 检查是否有null或者undefined 如果有就移除
            for (let i = this._listeners.length - 1; i >= 0; i--) {
                if (this._listeners[i] == null || this._listeners[i] == undefined) {
                    this._listeners.splice(i, 1);
                }
            }
        }
    }

    private _removeListener(listener: IUIControllerIndexListener) {
        const index = this._listeners.indexOf(listener);
        if (index != -1) {
            this._listeners.splice(index, 1);
        }

        if (EDITOR) {
            // 检查是否有null或者undefined 如果有就移除
            for (let i = this._listeners.length - 1; i >= 0; i--) {
                if (this._listeners[i] == null || this._listeners[i] == undefined) {
                    this._listeners.splice(i, 1);
                }
            }
        }
    }

    private notifyListeners() {
        for (let i = 0; i < this._listeners.length; i++) {

            if (this._listeners[i]) {
                this._listeners[i].onChangeIndex(this._index);
            }
        }

        for (let i = 0; i < this._callbacks.length; i++) {
            this._callbacks[i](this, this._index);
        }

        if (EDITOR) {
            // 检查是否有null或者undefined 如果有就移除
            for (let i = this._listeners.length - 1; i >= 0; i--) {
                if (this._listeners[i] == null || this._listeners[i] == undefined) {
                    this._listeners.splice(i, 1);
                }
            }

            const selfListener = this.node.getComponent("UIControllerListener");

            if (selfListener) {
                selfListener['registerUIController']();
            }
        }
    }


}


