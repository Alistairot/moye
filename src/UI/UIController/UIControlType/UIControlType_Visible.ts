import { _decorator, BitMask, CCFloat, Component, Enum, Node, Size, Vec2, Vec3 } from 'cc';
import { UIControllerIndexMask } from '../UIControllerIndexMask';
import { UIControlType } from './UIControlType';
const { ccclass, property, } = _decorator;

@ccclass('UIControlType_Visible')
export class UIControlType_Visible {
    @property({
        type: BitMask(UIControllerIndexMask),
    })
        indexMask: UIControllerIndexMask = UIControllerIndexMask.Index_0;

    isVisible(index: number): boolean {
        return (this.indexMask & index) != 0;
    }
}