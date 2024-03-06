import { _decorator, BitMask, CCFloat, Component, Enum, Node, Size, Vec2, Vec3 } from 'cc';
const { ccclass, property, } = _decorator;

@ccclass('UIControlType_Anchor')
export class UIControlType_Anchor {
    @property
    private _recordMap = {};

    getRecord(index: number): Vec2 {
        return this._recordMap[index];
    }

    setRecord(index: number, value: Vec2) {
        this._recordMap[index] = value.clone();
    }
}