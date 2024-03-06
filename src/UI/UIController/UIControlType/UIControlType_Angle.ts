import { _decorator, BitMask, CCFloat, Component, Enum, Node, Size, Vec2, Vec3 } from 'cc';
import { UIController_Transition } from '../UIController_Transition';
const { ccclass, property, } = _decorator;

@ccclass('UIControlType_Angle')
export class UIControlType_Angle {
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

    
    @property
    private _recordMap = {};

    getRecord(index: number): number {
        return this._recordMap[index];
    }

    setRecord(index: number, value: number) {
        this._recordMap[index] = value;
    }
}