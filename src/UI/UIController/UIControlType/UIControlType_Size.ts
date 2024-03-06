import { _decorator, BitMask, CCFloat, Component, Enum, Node, Size, Vec2, Vec3 } from 'cc';
import { UIController_Transition } from '../UIController_Transition';
import { UIControllerIndexMask } from '../UIControllerIndexMask';
const { ccclass, property, } = _decorator;

@ccclass('UIControlType_Size')
export class UIControlType_Size {
    @property({
        displayName: "过渡动画",
    })
    set transition(value: boolean) {
        this._transition = value;

        if (value) {
            this.transitionAttr = new UIController_Transition();
        } else {
            this.transitionAttr = null;
        }
    }

    get transition() {
        return this._transition;
    }

    @property({
        type: UIController_Transition,
        displayName: "过渡属性",
        visible() { return this.transition == true; }
    })
        transitionAttr: UIController_Transition;

    @property
    private _transition: boolean = false;
    
    @property([Size])
    private _records: Size[] = [];

    getRecord(indexMask: UIControllerIndexMask) {
        const index = Math.log2(indexMask);

        return this._records[index];
    }

    setRecord(indexMask: UIControllerIndexMask, value: Size) {
        const index = Math.log2(indexMask);
        const len = this._records.length;

        if (len <= index) {
            const start = len;
            const end = index + 1;

            this._records.length = end;

            for (let i = start; i < end; i++) {
                this._records[i] = value.clone();
            }
        }else{
            this._records[index] = value.clone();
        }
    }
}