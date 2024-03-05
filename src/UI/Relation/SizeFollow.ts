import { _decorator, CCBoolean, CCFloat, Component, Label, Node, NodeEventType, Size, UITransform } from 'cc';
import { EDITOR } from 'cc/env';

const { ccclass, property, menu, executeInEditMode, requireComponent } = _decorator;

@ccclass('SizeFollow')
@menu('moye/SizeFollow')
@requireComponent(UITransform)
@executeInEditMode
export class SizeFollow extends Component {
    get target(): UITransform {
        return this._target;
    }
    @property({ type: UITransform })
    set target(value: UITransform) {
        if(this._target != null){
            this._target.node.off(NodeEventType.SIZE_CHANGED, this.onTargetSizeChange, this);
        }

        this._target = value;

        if (this._target == null) {
            return;
        }

        if (EDITOR) {
            if (this._target.getComponent(Label)) {
                console.info("检查到目标节点上有Label组件, 请注意设置string后调用updateRenderData(true)");
            }
        }

        this._target.node.on(NodeEventType.SIZE_CHANGED, this.onTargetSizeChange, this);

        this.updateSizeOffset();
    }
    @property({ type: UITransform })
    private _target: UITransform;

    @property({ displayName: "高度跟随" })
    set heightFollow(val: boolean) {
        this._heightFollow = val;
    }
    get heightFollow(): boolean {
        return this._heightFollow;
    }
    @property
    private _heightFollow = true;

    @property({ displayName: "宽度跟随" })
    set widthFollow(val: boolean) {
        this._widthFollow = val;
    }
    get widthFollow(): boolean {
        return this._widthFollow;
    }
    @property
    private _widthFollow = true;

    @property({ type: CCFloat })
    private _heightOffset: number = 0;
    @property({ type: CCFloat })
    private _widthOffset: number = 0;

    private _changeSize: Size = new Size();

    protected onLoad(): void {
        if (EDITOR) {
            this.node.on(NodeEventType.SIZE_CHANGED, this.onSelfSizeChange, this);
        }

        if (this._target == null) {
            return;
        }

        this._target.node.on(NodeEventType.SIZE_CHANGED, this.onTargetSizeChange, this);
    }

    protected onDestroy(): void {
        if (EDITOR) {
            this.node.off(NodeEventType.SIZE_CHANGED, this.onSelfSizeChange, this);
        }

        if (this._target == null) {
            return;
        }

        if (!this._target.isValid) {
            this._target = null;
            return;
        }

        this._target.node.off(NodeEventType.SIZE_CHANGED, this.onTargetSizeChange, this);
        this._target = null;
    }

    private onTargetSizeChange() {
        this.updateSelfSize();
    }

    private onSelfSizeChange() {
        if(this._target == null){
            return;
        }
        
        this.updateSizeOffset();
    }

    private updateSelfSize() {
        const selfTrans = this.node.getComponent(UITransform);
        const targetTrans = this._target;

        this._changeSize.set(selfTrans.contentSize);

        if (this._widthFollow) {
            this._changeSize.width = Math.max(0, targetTrans.width + this._widthOffset);
        }

        if (this._heightFollow) {
            this._changeSize.height = Math.max(0, targetTrans.height + this._heightOffset);
        }

        selfTrans.setContentSize(this._changeSize);
    }

    private updateSizeOffset() {
        const selfTrans = this.node.getComponent(UITransform);
        const targetTrans = this._target;

        const selfWidth = selfTrans.width;
        const targetWidth = targetTrans.width;
        this._widthOffset = selfWidth - targetWidth;

        const selfHeight = selfTrans.height;
        const targetHeight = targetTrans.height;
        this._heightOffset = selfHeight - targetHeight;
    }
}