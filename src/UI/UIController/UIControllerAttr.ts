import { _decorator, BitMask, CCFloat, Component, Enum, Node, Size, Vec2, Vec3 } from 'cc';
import { UIController, UIControllerIndex } from './UIController';
import { UIControlType } from './UIControlType/UIControlType';
import { UIControlType_Position } from './UIControlType/UIControlType_Position';
import { UIController_Transition } from './UIController_Transition';
import { UIControlType_Size } from './UIControlType/UIControlType_Size';
import { UIControlType_Scale } from './UIControlType/UIControlType_Scale';
import { UIControlType_Controller } from './UIControlType/UIControlType_Controller';
import { UIControlType_Angle } from './UIControlType/UIControlType_Angle';
import { UIControlType_Anchor } from './UIControlType/UIControlType_Anchor';
import { UIControllerIndexMask } from './UIControllerIndexMask';
import { UIControlType_Visible } from './UIControlType/UIControlType_Visible';
import { DEBUG } from 'cc/env';
const { ccclass, property, } = _decorator;





@ccclass('UIControllerAttr')
export class UIControllerAttr {
    @property({ type: Enum(UIControlType) })
    set controlType(v: UIControlType) {
        this._controlType = v;

        this.resetData();
    }

    get controlType() {
        return this._controlType;
    }

    @property
    private _controlType: UIControlType = UIControlType.None;

    @property({
        displayName: "位置",
        type: UIControlType_Position,
        visible() { return this.controlType == UIControlType.Position; }
    })
        position: UIControlType_Position;
    @property({
        displayName: "锚点",
        type: UIControlType_Anchor,
        visible() { return this.controlType == UIControlType.Anchor; }
    })
        anchor: UIControlType_Anchor;
    @property({
        displayName: "角度",
        type: UIControlType_Angle,
        visible() { return this.controlType == UIControlType.Angle; }
    })
        angle: UIControlType_Angle;
    @property({
        displayName: "控制器",
        type: UIControlType_Controller,
        visible() { return this.controlType == UIControlType.UIController; }
    })
        controller: UIControlType_Controller;
    @property({
        displayName: "缩放",
        type: UIControlType_Scale,
        visible() { return this.controlType == UIControlType.Scale; }
    })
        scale: UIControlType_Scale;
    @property({
        displayName: "尺寸",
        type: UIControlType_Size,
        visible() { return this.controlType == UIControlType.Size; }
    })
        size: UIControlType_Size;

    @property({
        displayName: "可见",
        type: UIControlType_Visible,
        visible() { return this.controlType == UIControlType.Visible; }
    })
        visible: UIControlType_Visible;

    isVisible(indexMask: number) {
        return this.visible.isVisible(indexMask);
    }

    setPosition(indexMask: number, pos: Vec3) {
        this.position.setRecord(indexMask, pos);
    }

    getPosition(indexMask: number) {
        return this.position.getRecord(indexMask);
    }

    setSize(indexMask: number, size: Size) {
        this.size.setRecord(indexMask, size);
    }

    getSize(indexMask: number) {
        return this.size.getRecord(indexMask);
    }

    setScale(indexMask: number, scale: Vec3) {
        this.scale.setRecord(indexMask, scale);
    }

    getScale(indexMask: number) {
        return this.scale.getRecord(indexMask);
    }

    setAngle(indexMask: number, angle: number) {
        this.angle.setRecord(indexMask, angle);
    }

    getAngle(indexMask: number) {
        return this.angle.getRecord(indexMask);
    }

    setAnchor(indexMask: number, anchor: Vec2) {
        this.anchor.setRecord(indexMask, anchor);
    }

    getAnchor(indexMask: number) {
        return this.anchor.getRecord(indexMask);
    }

    setUIController(indexMask: number, controllerIndex: number) {
        this.controller.setRecord(indexMask, controllerIndex);
    }

    getUIController(indexMask: number) {
        return this.controller.getRecord(indexMask);
    }

    getTransition(): UIController_Transition | null {
        switch (this.controlType) {
        case UIControlType.Position: {
            return this.position.transitionAttr;
        }
        case UIControlType.Size: {
            return this.size.transitionAttr;
        }
        case UIControlType.Scale: {
            return this.scale.transitionAttr;
        }
        case UIControlType.Angle: {
            return this.angle.transitionAttr;
        }
        }
    }

    private resetData() {
        if(!DEBUG)
        {
            return;
        }

        if (this.controlType != UIControlType.Position) {
            this.position = null;
        } else if(!this.position) {
            this.position = new UIControlType_Position();
        }

        if (this.controlType != UIControlType.Size) {
            this.size = null;
        } else if(this.size == null){
            this.size = new UIControlType_Size();
        }

        if (this.controlType != UIControlType.Scale) {
            this.scale = null;
        } else if(this.scale == null){
            this.scale = new UIControlType_Scale();
        }

        if (this.controlType != UIControlType.Angle) {
            this.angle = null;
        } else if(this.angle == null){
            this.angle = new UIControlType_Angle();
        }

        if (this.controlType != UIControlType.Anchor) {
            this.anchor = null;
        } else if(this.anchor == null){
            this.anchor = new UIControlType_Anchor();
        }

        if (this.controlType != UIControlType.UIController) {
            this.controller = null;
        } else if(this.controller == null){
            this.controller = new UIControlType_Controller();
        }

        if (this.controlType != UIControlType.Visible) {
            this.visible = null;
        } else if(!this.visible){
            this.visible = new UIControlType_Visible();
        }


    }
}