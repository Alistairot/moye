import { _decorator, CCString, Component, isValid, Node, UITransform, v3 } from 'cc';
import { UIControllerAttr, UIControlType } from './UIControllerAttr';
import { UIController, UIControllerIndex } from './UIController';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode, menu } = _decorator;

@ccclass('UIControllerListener')
@menu('moye/UIControllerListener')
@executeInEditMode
export class UIControllerListener extends Component {
    @property
    private _controller: UIController = null;

    @property(UIController)
    set controller(v: UIController) {
        if (this._controller == v) {
            return;
        }

        if (this._controller) {
            this._controller.removeListener(this);
        }

        this._controller = v;

        this.listenController();
    }

    get controller() {
        return this._controller;
    }

    @property({
        type: [CCString],
        visible() { return this._controller != null; }
    })
    get curIndex() {
        if (!this._controller) {
            return '';
        }
        const str = `${UIControllerIndex[this._controller.index]}`;
        return str;
    }

    @property
    private _attrs: UIControllerAttr[] = [];

    @property({
        type: [UIControllerAttr],
        visible() { return this._controller != null; }
    })
    set attrs(v: UIControllerAttr[]) {
        this._attrs = v;

        this.updateAttr();
    }
    get attrs() {
        return this._attrs;
    }

    protected onLoad(): void {
        this.listenController();
    }

    protected onDestroy(): void {
        if (EDITOR) {
            this.unRegisterEditorEvent();
        } else {
            if (!this._controller) {
                return;
            }

            this._controller.removeListener(this);
        }

    }

    protected onDisable(): void {
        // if(EDITOR){
        //     setTimeout(() => {
        //         if(!this.node.isValid){
        //             if (!this._controller) {
        //                 return;
        //             }

        //             console.log('移除监听22');
        //             this._controller.removeListener(this);
        //         }
        //     });
        // }
    }

    onFocusInEditor(): void {
        this.registerEditorEvent();
    }

    onLostFocusInEditor(): void {
        this.unRegisterEditorEvent();

        // if(!this.node.isValid){
        //     if (!this._controller) {
        //         return;
        //     }

        //     console.log('移除监听22');
        //     this._controller.removeListener(this);
        // }
    }

    private registerEditorEvent() {
        this.unRegisterEditorEvent();

        this.node.on(Node.EventType.ACTIVE_IN_HIERARCHY_CHANGED, this.onChangeActive, this);
        this.node.on(Node.EventType.TRANSFORM_CHANGED, this.onTransformChange, this);
        this.node.on(Node.EventType.SIZE_CHANGED, this.onSizeChange, this);
        this.node.on(Node.EventType.ANCHOR_CHANGED, this.onAnchorChange, this);
    }

    private unRegisterEditorEvent() {
        this.node.off(Node.EventType.ACTIVE_IN_HIERARCHY_CHANGED, this.onChangeActive, this);
        this.node.off(Node.EventType.TRANSFORM_CHANGED, this.onTransformChange, this);
        this.node.off(Node.EventType.SIZE_CHANGED, this.onSizeChange, this);
        this.node.off(Node.EventType.ANCHOR_CHANGED, this.onAnchorChange, this);
    }

    private listenController() {
        if (!this._controller) {
            return;
        }

        // this._controller.removeListener(this);
        this._controller.addListener(this);
    }

    private onChangeActive() {
        // this.registerVisible();
    }

    private onTransformChange() {
        this.registerTransform();
    }

    private onSizeChange() {
        this.registerSize();
    }

    private onAnchorChange() {
        this.registerAnchor();
    }

    // private registerVisible() {
    //     if (!this._controller) {
    //         return;
    //     }

    //     let index = this._controller.index;

    //     for (let i = 0; i < this._attrs.length; i++) {
    //         let attr = this._attrs[i];
    //         if (attr.controlType == UIControlType.Visible) {
    //             // attr.visibleSet.add(index);
    //         }
    //     }
    // }

    private registerTransform() {
        if (!this._controller) {
            return;
        }

        const index = this._controller.index;

        for (let i = 0; i < this._attrs.length; i++) {
            const attr = this._attrs[i];
            if (attr.controlType == UIControlType.Position) {
                attr.setPosition(index, this.node.position);
            } else if (attr.controlType == UIControlType.Scale) {
                attr.setScale(index, this.node.scale);
            } else if (attr.controlType == UIControlType.Angle) {
                attr.setAngle(index, this.node.angle);
            }
        }

    }

    private registerSize() {
        if (!this._controller) {
            return;
        }

        const index = this._controller.index;

        for (let i = 0; i < this._attrs.length; i++) {
            const attr = this._attrs[i];

            if (attr.controlType == UIControlType.Size) {
                const uiTransform = this.node.getComponent(UITransform);
                attr.setSize(index, uiTransform.contentSize);
            }
        }
    }

    private registerAnchor() {
        if (!this._controller) {
            return;
        }

        const index = this._controller.index;

        for (let i = 0; i < this._attrs.length; i++) {
            const attr = this._attrs[i];

            if (attr.controlType == UIControlType.Anchor) {
                const uiTransform = this.node.getComponent(UITransform);
                attr.setAnchor(index, uiTransform.anchorPoint);
            }
        }
    }

    private registerUIController() {
        if (!this._controller) {
            return;
        }

        const index = this._controller.index;

        for (let i = 0; i < this._attrs.length; i++) {
            const attr = this._attrs[i];

            if (attr.controlType == UIControlType.UIController) {
                attr.setUIController(index, this.node.getComponent(UIController).index);
            }
        }
    }

    private updateAttr() {
        if (!this._controller) {
            return;
        }

        const index = this._controller.index;


        for (let i = 0; i < this._attrs.length; i++) {
            const attr = this._attrs[i];

            attr.clearOtherData();
        }

        this.onChangeIndex(index);
    }

    onChangeIndex(index: number): void {
        for (let i = 0; i < this._attrs.length; i++) {
            const attr = this._attrs[i];

            switch (attr.controlType) {
            case UIControlType.Visible: {
                this.node.active = attr.hasIndex(index);
                break;
            }
            case UIControlType.Position: {

                const pos = attr.getPosition(index);

                if (pos) {
                    this.node.position = pos;
                } else {
                    attr.setPosition(index, this.node.position);
                }

                break;
            }

            case UIControlType.Size: {
                const size = attr.getSize(index);

                const uiTransform = this.node.getComponent(UITransform);
                if (size) {
                    uiTransform.setContentSize(size);
                } else {
                    attr.setSize(index, uiTransform.contentSize);
                }
                break;
            }
            case UIControlType.Scale:
            {
                const scale = attr.getScale(index);

                if (scale) {
                    this.node.scale = scale;
                } else {
                    attr.setScale(index, this.node.scale);
                }
                break;
            }
            case UIControlType.Angle: {
                const angle = attr.getAngle(index);

                if (angle == null || angle == undefined) {
                    attr.setAngle(index, this.node.angle);
                } else {
                    this.node.angle = angle;
                }

                break;
            }
            case UIControlType.Anchor: {
                const anchor = attr.getAnchor(index);

                if (anchor) {
                    const uiTransform = this.node.getComponent(UITransform);
                    uiTransform.setAnchorPoint(anchor);
                } else {
                    attr.setAnchor(index, this.node.getComponent(UITransform).anchorPoint);
                }
                break;
            }
            case UIControlType.UIController: {
                const controllerIndex = attr.getUIController(index);

                if (controllerIndex != null && controllerIndex != undefined) {
                    this.node.getComponent(UIController).index = controllerIndex;
                } else {
                    attr.setUIController(index, this.node.getComponent(UIController).index);
                }
                break;
            }
            }
        }
    }
}