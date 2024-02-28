import { _decorator, BitMask, Component, Enum, Node, Size, Vec2, Vec3 } from 'cc';
import { UIController, UIControllerIndex } from './UIController';
const { ccclass, property, } = _decorator;

export enum UIControllerIndexMask {
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

export enum UIControlType {
    None,
    Visible,
    Position,
    Size,
    Scale,
    Angle,
    Anchor,
    UIController,
}

@ccclass('UIControllerAttr')
export class UIControllerAttr {
    @property({ type: Enum(UIControlType) })
    public controlType: UIControlType = UIControlType.None;

    @property({
        type: BitMask(UIControllerIndexMask),
        visible() { return this.controlType == UIControlType.Visible; }
    })
    public indexMask: UIControllerIndexMask = UIControllerIndexMask.Index_0;


    @property
    private _positionMap = {};

    @property
    private _sizeMap = {};

    @property
    private _scaleMap = {};

    @property
    private _angleMap = {};

    @property
    private _anchorMap = {};

    @property
    private _uiControllerMap = {};

    hasIndex(index: number) {
        return (this.indexMask & index) != 0;
    }

    setPosition(index: number, pos: Vec3) {
        this._positionMap[index] = pos.clone();
    }

    getPosition(index: number) {
        return this._positionMap[index];
    }

    setSize(index: number, size: Size) {
        this._sizeMap[index] = size.clone();
    }

    getSize(index: number) {
        return this._sizeMap[index];
    }

    setScale(index: number, scale: Vec3) {
        this._scaleMap[index] = scale.clone();
    }

    getScale(index: number) {
        return this._scaleMap[index];
    }

    setAngle(index: number, angle: number) {
        this._angleMap[index] = angle;
    }

    getAngle(index: number) {
        return this._angleMap[index];
    }

    setAnchor(index: number, anchor: Vec2) {
        this._anchorMap[index] = anchor.clone();
    }

    getAnchor(index: number) {
        return this._anchorMap[index];
    }

    setUIController(index: number, controllerIndex: number) {
        this._uiControllerMap[index] = controllerIndex;
    }

    getUIController(index: number) {
        return this._uiControllerMap[index];
    }

    clearOtherData(){
        switch (this.controlType) {
        case UIControlType.Visible:
            this.clearPositionData();
            this.clearSizeData();
            this.clearScaleData();
            this.clearAngleData();
            this.clearAnchorData();
            this.clearUIControllerData();
            break;
        case UIControlType.Position:
            this.clearSizeData();
            this.clearScaleData();
            this.clearAngleData();
            this.clearAnchorData();
            this.clearUIControllerData();
            break;

        case UIControlType.Size:
            this.clearPositionData();
            this.clearScaleData();
            this.clearAngleData();
            this.clearAnchorData();
            this.clearUIControllerData();
            break;
        case UIControlType.Scale:
            this.clearPositionData();
            this.clearSizeData();
            this.clearAngleData();
            this.clearAnchorData();
            this.clearUIControllerData();
            break;
        case UIControlType.Angle:
            this.clearPositionData();
            this.clearSizeData();
            this.clearScaleData();
            this.clearAnchorData();
            this.clearUIControllerData();
            break;
        case UIControlType.Anchor:
            this.clearPositionData();
            this.clearSizeData();
            this.clearScaleData();
            this.clearAngleData();
            this.clearUIControllerData();
            break;
        case UIControlType.UIController:
            this.clearPositionData();
            this.clearSizeData();
            this.clearScaleData();
            this.clearAngleData();
            this.clearAnchorData();
            break;
        }
    }

    private clearPositionData(){
        this._positionMap = {};
    }

    private clearSizeData(){
        this._sizeMap = {};
    }

    private clearScaleData(){
        this._scaleMap = {};
    }

    private clearAngleData(){
        this._angleMap = {};
    }

    private clearAnchorData(){
        this._anchorMap = {};
    }

    private clearUIControllerData(){
        this._uiControllerMap = {};
    }
}