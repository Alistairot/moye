import { _decorator, BitMask, CCFloat, Component, Enum, Node, Size, Vec2, Vec3 } from 'cc';
import { UIControllerIndexMask } from '../UIControllerIndexMask';
const { ccclass, property, } = _decorator;

@ccclass('UIControlType_Controller')
export class UIControlType_Controller {
    @property([CCFloat])
    private _records: number[] = [];

    getRecord(indexMask: UIControllerIndexMask): number {
        const index = Math.log2(indexMask);

        return this._records[index];
    }

    setRecord(indexMask: UIControllerIndexMask, value: number) {
        const index = Math.log2(indexMask);
        const len = this._records.length;

        if (len <= index) {
            const start = len;
            const end = index + 1;

            this._records.length = end;

            for (let i = start; i < end; i++) {
                this._records[i] = value;
            }
        }else{
            this._records[index] = value;
        }
    }
}