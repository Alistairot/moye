import { _decorator, BitMask, CCFloat, Component, Enum, Node, Size, Vec2, Vec3 } from 'cc';
const { ccclass, property, } = _decorator;

@ccclass('UIController_Transition')
export class UIController_Transition {
    @property({
        type: CCFloat,
        displayName: "持续时间",
    })
        duration: number = 0;

    @property({
        type: CCFloat,
        displayName: "延迟时间",
    })
        delay: number = 0;
}