import { _decorator, CCBoolean, Component, Node, UITransform } from 'cc';
const { ccclass, property, menu } = _decorator;

/**
 * 在不变形的情况下，适配背景
 * 完全覆盖目标节点
 */
@ccclass('BgAdapter')
@menu('moye/BgAdapter')
export class BgAdapter extends Component {
    @property(UITransform)
        coverNode: UITransform = null;

    @property(CCBoolean)
        isShowMax: boolean = true;

    private _selfTransform: UITransform = null;

    start() {
        this._selfTransform = this.node.getComponent(UITransform);

        this.updateSize();

        this.coverNode.node.on(Node.EventType.SIZE_CHANGED, this.updateSize, this);
    }

    protected onDestroy(): void {
        this.coverNode.node.off(Node.EventType.SIZE_CHANGED, this.updateSize, this);
        this.coverNode = null;
        this._selfTransform = null;
    }

    private updateSize() {
        let scaleForShowAll = 0;

        if (this.isShowMax) {
            scaleForShowAll = Math.max(
                this.coverNode.width / this._selfTransform.width,
                this.coverNode.height / this._selfTransform.height
            );
        } else {
            scaleForShowAll = Math.min(
                this.coverNode.width / this._selfTransform.width,
                this.coverNode.height / this._selfTransform.height
            );
        }

        const realWidth = this._selfTransform.width * scaleForShowAll;
        const realHeight = this._selfTransform.height * scaleForShowAll;

        //   // 2. 基于第一步的数据，再做缩放适配
        //   this.node.scale = Math.max(
        //     cc.view.getCanvasSize().width / realWidth, 
        //     cc.view.getCanvasSize().height / realHeight
        //    );

        // console.log('缩放数据=', scaleForShowAll)
        // console.log('realWidth', realWidth, 'realHeight', realHeight)

        this._selfTransform.width = realWidth;
        this._selfTransform.height = realHeight;
    }
}


