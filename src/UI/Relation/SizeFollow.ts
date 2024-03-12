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
        if (this._target != null) {
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

    @property({
        type: CCFloat,
        displayName: "最小高度",
        min: 0,
        visible() { return this.heightFollow == true; }
    })
        minH: number = 0;
    @property({
        type: CCFloat,
        displayName: "最大高度",
        tooltip: "最大高度, 小于0表示不限制",
        visible() { return this.heightFollow == true; }
    })
        maxH: number = -1;

    @property({
        type: CCFloat,
        displayName: "最小宽度",
        min: 0,
        visible() { return this.widthFollow == true; }
    })
        minW: number = 0;
    @property({
        type: CCFloat,
        displayName: "最大宽度",
        tooltip: "最大宽度, 小于0表示不限制",
        visible() { return this.widthFollow == true; }
    })
        maxW: number = -1;

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
        if (this._target == null) {
            return;
        }

        this.updateSizeOffset();
    }

    private updateSelfSize() {
        const selfTrans = this.node.getComponent(UITransform);
        const targetTrans = this._target;

        this._changeSize.set(selfTrans.contentSize);

        if (this._widthFollow) {
            let toValue = Math.max(this.minW, targetTrans.width + this._widthOffset);

            if (this.maxW >= 0) {
                toValue = Math.min(this.maxW, toValue);
            }

            this._changeSize.width = toValue;
        }

        if (this._heightFollow) {
            let toValue = Math.max(this.minH, targetTrans.height + this._heightOffset);

            if (this.maxH >= 0) {
                toValue = Math.min(this.maxH, toValue);
            }

            this._changeSize.height = toValue;
        }

        selfTrans.setContentSize(this._changeSize);
    }

    private updateSizeOffset() {
        if (!EDITOR) {
            return;
        }

        const selfTrans = this.node.getComponent(UITransform);
        const targetTrans = this._target;
        const targetWidth = targetTrans.width;
        const selfWidth = selfTrans.width;
        const selfHeight = selfTrans.height;
        const targetHeight = targetTrans.height;
        
        let isRecordW = true;
        let isRecordH = true;

        // 小于最小值, 不记录本次的偏移数据
        if (selfWidth <= this.minW) {
            console.log("当前节点宽度达到最小宽度, 不记录本次的偏移数据");
            isRecordW = false;
        }
        if (this.maxW >= 0 && selfWidth >= this.maxW) {
            console.log("当前节点宽度达到最大宽度, 不记录本次的偏移数据");
            isRecordW = false;
        }

        if (isRecordW) {
            this._widthOffset = selfWidth - targetWidth;
        }

        if (selfHeight <= this.minH) {
            console.log("当前节点高度达到最小高度, 不记录本次的偏移数据");
            isRecordH = false;
        }

        if (this.maxH >= 0 && selfHeight >= this.maxH) {
            console.log("当前节点高度达到最大高度, 不记录本次的偏移数据");
            isRecordH = false;
        }

        if (isRecordH) {
            this._heightOffset = selfHeight - targetHeight;
        }

    }
}