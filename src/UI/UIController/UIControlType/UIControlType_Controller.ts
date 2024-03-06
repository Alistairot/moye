import { _decorator, BitMask, CCFloat, Component, Enum, Node, Size, Vec2, Vec3 } from 'cc';
const { ccclass, property, } = _decorator;

@ccclass('UIControlType_Controller')
export class UIControlType_Controller {
    @property
    private _recordMap = {};

    getRecord(index: number): number {
        return this._recordMap[index];
    }

    setRecord(index: number, value: number) {
        this._recordMap[index] = value;
    }
}