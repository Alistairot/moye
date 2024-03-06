import { _decorator, BitMask, CCFloat, Component, Enum, Node, Size, Vec2, Vec3 } from 'cc';
import { UIControllerIndexMask } from '../UIControllerIndexMask';
const { ccclass, property, } = _decorator;

@ccclass('UIControlType_Anchor')
export class UIControlType_Anchor {
    @property([Vec2])
    private _records: Vec2[] = [];

    getRecord(indexMask: UIControllerIndexMask): Vec2 {
        const index = Math.log2(indexMask);

        return this._records[index];
    }

    setRecord(indexMask: UIControllerIndexMask, value: Vec2) {
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