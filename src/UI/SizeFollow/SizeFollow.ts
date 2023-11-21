import { _decorator, CCBoolean, CCFloat, Component, Label, Node, NodeEventType, Size, UITransform } from 'cc';
const { ccclass, property, menu } = _decorator;

@menu('moye/SizeFollow')
@ccclass('SizeFollow')
export class SizeFollow extends Component {
    get target(): UITransform {
        return this._target;
    }
    @property({ type: UITransform })
    set target(value: UITransform) {
        this._target = value;
        this.updateSizeOffset();
    }
    @property({ type: UITransform })
    private _target: UITransform

    @property
    set heightFollow(val: boolean) {
        this._heightFollow = val;
        this.updateSizeOffset();
    }
    get heightFollow(): boolean {
        return this._heightFollow;
    }
    @property
    private _heightFollow = true

    @property
    set widthFollow(val: boolean) {
        this._widthFollow = val;
        this.updateSizeOffset();
    }
    get widthFollow(): boolean {
        return this._widthFollow;
    }
    @property
    private _widthFollow = true

    @property({ type: CCFloat })
    private _heightOffset: number = 0
    @property({ type: CCFloat })
    private _widthOffset: number = 0

    private _changeSize: Size = new Size();

    protected onLoad(): void {
        if(this._target == null) {
            return;
        }

        this._target.node.on(NodeEventType.SIZE_CHANGED, this.onTargetSizeChange, this);
    }

    protected onDestroy(): void {
        if(this._target == null) {
            return;
        }

        if(!this._target.isValid){
            this._target = null;
            return;
        }

        this._target.node.off(NodeEventType.SIZE_CHANGED, this.onTargetSizeChange, this);
        this._target = null;
    }

    private onTargetSizeChange() {
        let selfTrans = this.node.getComponent(UITransform);
        let targetTrans = this._target;
        // console.log('onTargetSizeChange targetTrans', targetTrans);
        // console.log('onTargetSizeChange targetTrans.height', targetTrans.height);
        // console.log('onTargetSizeChange this._heightOffset', this._heightOffset);
        // console.log('onTargetSizeChange this._heightFollow', this._heightFollow);
        
        this._changeSize.set(selfTrans.contentSize);

        if(this._widthFollow){
            this._changeSize.width = Math.max(0, targetTrans.width + this._widthOffset);
        }

        if(this._heightFollow){
            this._changeSize.height = Math.max(0, targetTrans.height + this._heightOffset);
        }

        // console.log('onTargetSizeChange this._changeSize', this._changeSize);
        // console.log('onTargetSizeChange this.node', this.node);
        selfTrans.setContentSize(this._changeSize);
        // selfTrans.setContentSize(new Size(this._changeSize));
        // selfTrans.height = 300;
    }

    private updateSizeOffset() {
        if(this._target == null) {
            return;
        }

        let selfTrans = this.node.getComponent(UITransform);
        let targetTrans = this._target;

        if (this._widthFollow) {
            let selfWidth = selfTrans.width;
            let targetWidth = targetTrans.width;

            this._widthOffset = selfWidth - targetWidth;
        }

        if (this._heightFollow) {
            let selfHeight = selfTrans.height;
            let targetHeight = targetTrans.height;

            this._heightOffset = selfHeight - targetHeight;
        }
    }
}