import { _decorator, BitMask, CCFloat, Color, Component, Enum, Node, Size, Vec2, Vec3 } from 'cc';
import { UIControllerIndexMask } from '../UIControllerIndexMask';
const { ccclass, property, } = _decorator;

@ccclass('UIControlType_SpriteColor')
export class UIControlType_SpriteColor {
    @property([Color])
    private _records: Color[] = [];

    getRecord(indexMask: UIControllerIndexMask): Color {
        const index = Math.log2(indexMask);

        return this._records[index];
    }

    setRecord(indexMask: UIControllerIndexMask, value: Color) {
        const index = Math.log2(indexMask);
        const len = this._records.length;

        if (len <= index) {
            const start = len;
            const end = index + 1;

            this._records.length = end;

            for (let i = start; i < end; i++) {
                this._records[i] = value.clone();
            }
        } else {
            this._records[index] = value.clone();
        }
    }
}