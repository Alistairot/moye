import { _decorator, CCBoolean, ccenum, CCFloat, Component, Enum, Label, Node, NodeEventType, Size, UITransform, v3, Vec3 } from 'cc';
import { EDITOR, PREVIEW } from 'cc/env';
const { ccclass, property, executeInEditMode, menu } = _decorator;

enum WidgetBase {
    LEFT = 1,
    RIGHT,
    TOP,
    BOTTOM,
}

enum WidgetDirection {
    LEFT = 1,
    RIGHT,
    TOP,
    BOTTOM,
    LEFT_EXTEND,
    RIGHT_EXTEND,
    TOP_EXTEND,
    BOTTOM_EXTEND,
}

/**
 * 关联组件
 * 不允许直系亲属互相关联
 * 同父支持size跟pos关联
 * 异父仅支持pos关联 size关联未做测试
 */
@ccclass('CTWidget')
@menu('moye/CTWidget')
@executeInEditMode
export class CTWidget extends Component {
    get target(): UITransform {
        return this._target;
    }
    @property({ type: UITransform })
    set target(value: UITransform) {
        this._target = value;

        this.unregisterEvt();
        this.registerEvt();
        this.updateData();
    }
    @property({ type: UITransform })
    private _target: UITransform;

    // 目标方向
    @property({ type: Enum(WidgetBase) })
    set targetDir(val: WidgetDirection) {
        if (!EDITOR) {
            return;
        }

        if (val == WidgetDirection.LEFT ||
            val == WidgetDirection.RIGHT) {
            switch (this._dir) {
            case WidgetDirection.TOP:
            case WidgetDirection.TOP_EXTEND:
            case WidgetDirection.BOTTOM:
            case WidgetDirection.BOTTOM_EXTEND:
                this._dir = WidgetDirection.LEFT;
            }

            this._isVertical = false;
        } else {
            switch (this._dir) {
            case WidgetDirection.LEFT:
            case WidgetDirection.LEFT_EXTEND:
            case WidgetDirection.RIGHT:
            case WidgetDirection.RIGHT_EXTEND:
                this._dir = WidgetDirection.TOP;
            }

            this._isVertical = true;
        }

        this._targetDir = val;
        this.updateData();
    }
    get targetDir(): WidgetDirection {
        return this._targetDir;
    }
    @property
    private _targetDir: WidgetDirection = WidgetDirection.TOP;

    // 自身方向
    @property({ type: Enum(WidgetDirection) })
    set dir(val: WidgetDirection) {
        if (!EDITOR) {
            return;
        }

        switch (val) {
        case WidgetDirection.LEFT:
        case WidgetDirection.LEFT_EXTEND:
        case WidgetDirection.RIGHT:
        case WidgetDirection.RIGHT_EXTEND: {
            switch (this._targetDir) {
            case WidgetDirection.TOP:
            case WidgetDirection.BOTTOM: {
                this._targetDir = WidgetDirection.LEFT;
            }
                break;
            }

            this._isVertical = false;
            break;
        }
        case WidgetDirection.TOP:
        case WidgetDirection.TOP_EXTEND:
        case WidgetDirection.BOTTOM:
        case WidgetDirection.BOTTOM_EXTEND: {
            switch (this._targetDir) {
            case WidgetDirection.LEFT:
            case WidgetDirection.RIGHT: {
                this._targetDir = WidgetDirection.TOP;
            }
                break;
            }

            this._isVertical = true;
            break;
        }
        }

        this._dir = val;
        this.updateData();
    }
    get dir(): WidgetDirection {
        return this._dir;
    }
    @property
    private _dir: WidgetDirection = WidgetDirection.TOP;

    @property({ type: CCFloat })
        visibleOffset: number = 0;

    @property
    private _isVertical: boolean = true;

    @property
    private _distance: number = 0;

    @property
    private _changePos: Vec3 = new Vec3(0, 0, 0);

    @property
    private _targetOldPos: Vec3 = new Vec3(0, 0, 0);

    @property
    private _targetOldSize: number = 0;

    @property
    private _selfOldPos: Vec3 = new Vec3(0, 0, 0);

    @property
    private _selfOldSize: number = 0;

    private _trans: UITransform;

    protected onEnable(): void {
        if (!EDITOR) {
            return;
        }

        this.registerEvt();
        this.updateData();
    }

    protected onDisable(): void {
        if (!EDITOR) {
            return;
        }

        this.unregisterEvt();
    }

    protected onLoad(): void {
        this._trans = this.node.getComponent(UITransform);

        if (EDITOR) {
            return;
        }


        this.registerEvt();
    }

    protected onDestroy(): void {
        if (EDITOR) {
            return;
        }

        this.unregisterEvt();

        this._trans = null;
        this._target = null;
        this._changePos = null;
    }

    private registerEvt() {
        if (!this._target) {
            return;
        }

        if (EDITOR) {
            this._target.node.on(NodeEventType.ANCHOR_CHANGED, this.updateData, this);
            this.node.on(NodeEventType.TRANSFORM_CHANGED, this.updateData, this);
            this.node.on(NodeEventType.SIZE_CHANGED, this.updateData, this);
        }

        this._target.node.on(NodeEventType.SIZE_CHANGED, this.onTargetChange, this);
        this._target.node.on(NodeEventType.TRANSFORM_CHANGED, this.onTargetChange, this);
        this._target.node.on(NodeEventType.ACTIVE_IN_HIERARCHY_CHANGED, this.onTargetChange, this);
    }

    private unregisterEvt() {
        if (!this._target) {
            return;
        }

        if (!this._target.isValid) {
            return;
        }

        if (EDITOR) {
            this._target.node.off(NodeEventType.ANCHOR_CHANGED, this.updateData, this);
            this.node.off(NodeEventType.TRANSFORM_CHANGED, this.updateData, this);
            this.node.off(NodeEventType.SIZE_CHANGED, this.updateData, this);
        }


        this._target.node.off(NodeEventType.SIZE_CHANGED, this.onTargetChange, this);
        this._target.node.off(NodeEventType.TRANSFORM_CHANGED, this.onTargetChange, this);
        this._target.node.off(NodeEventType.ACTIVE_IN_HIERARCHY_CHANGED, this.onTargetChange, this);
    }

    private updateData() {
        if (this._target == null) {
            return;
        }

        switch (this._dir) {
        case WidgetDirection.TOP:
        case WidgetDirection.BOTTOM:
        case WidgetDirection.LEFT:
        case WidgetDirection.RIGHT:
            this.updateDistance();
            break;
        case WidgetDirection.TOP_EXTEND:
        case WidgetDirection.BOTTOM_EXTEND:
        case WidgetDirection.LEFT_EXTEND:
        case WidgetDirection.RIGHT_EXTEND:
            this.updateTargetPos();
            break;
        }
    }

    private onTargetChange() {
        if (this._target == null) {
            return;
        }

        switch (this._dir) {
        case WidgetDirection.TOP:
        case WidgetDirection.BOTTOM:
        case WidgetDirection.LEFT:
        case WidgetDirection.RIGHT:
            this.updatePos();
            break;
        case WidgetDirection.TOP_EXTEND:
        case WidgetDirection.BOTTOM_EXTEND:
        case WidgetDirection.LEFT_EXTEND:
        case WidgetDirection.RIGHT_EXTEND:
            this.updateSize();
            break;
        }
    }



    private updateSize() {
        if (this._isVertical) {
            const posChange = this._targetOldPos.y - this._target.node.position.y;
            let sizeChange = this._target.height - this._targetOldSize;
            const anchorY = this._trans.anchorY;

            this._changePos.set(this._selfOldPos);

            if (this._target.getComponent(Label) && !this._target.node.active) {
                sizeChange = this._targetOldSize;
            }

            const realChange = posChange + sizeChange;

            this._trans.height = this._selfOldSize + realChange;

            if (this._dir == WidgetDirection.TOP_EXTEND) {
                this.node.setPosition(this._changePos);
            } else if (this._dir == WidgetDirection.BOTTOM_EXTEND) {
                this._changePos.y -= (realChange * (1 - anchorY));

                this.node.setPosition(v3(this._changePos));
            }

        }
    }

    private updatePos() {
        const selfTrans = this._trans;
        const targetTrans = this._target;
        const targetPos = this.getPos(targetTrans, this._targetDir);
        let pos = targetPos - this._distance;

        this._changePos.set(this.node.worldPosition);

        if (this._isVertical) {
            switch (this._dir) {
            case WidgetDirection.TOP: {
                const height = selfTrans.height;
                const anchorY = selfTrans.anchorY;
                pos -= height * (1 - anchorY);
                break;
            }
            case WidgetDirection.BOTTOM: {
                const height = selfTrans.height;
                const anchorY = selfTrans.anchorY;
                pos += height * anchorY;
                break;
            }
            }

            this._changePos.y = pos;
        } else {
            this._changePos.x = pos;
            // todo
        }

        this.node.worldPosition = this._changePos;
    }

    private updateTargetPos() {
        if (EDITOR) {
            if (this._changePos == null) {
                console.error('编辑器数据错乱, 请重新添加本组件');
                this._changePos = v3();
            }
        }

        this.target.node.getPosition(this._targetOldPos);
        this.node.getPosition(this._selfOldPos);

        if (this._isVertical) {
            this._selfOldSize = this._trans.height;
            this._targetOldSize = this._target.height;

        } else {
            this._selfOldSize = this._trans.width;
            this._targetOldSize = this._target.height;
        }
    }

    private updateDistance() {
        if (!EDITOR) {
            return;
        }

        if (this._target == null) {
            return;
        }

        const selfTrans = this.node.getComponent(UITransform);
        const targetTrans = this._target;

        const selfPos = this.getPos(selfTrans, this._dir);
        const targetPos = this.getPos(targetTrans, this._targetDir);

        this._distance = targetPos - selfPos;
    }

    private getPos(trans: UITransform, dir: WidgetDirection): number {
        if (this._isVertical) {
            let y = trans.node.worldPosition.y;
            const height = trans.height;
            const anchorY = trans.anchorY;

            switch (dir) {
            case WidgetDirection.TOP:
            case WidgetDirection.TOP_EXTEND:
                if (!trans.node.active) {
                    y = y - height - this.visibleOffset;
                }

                return y + height * (1 - anchorY);
            case WidgetDirection.BOTTOM:
            case WidgetDirection.BOTTOM_EXTEND:
                if (!trans.node.active) {
                    y = y + height + this.visibleOffset;
                }

                return y - height * anchorY;
            }
        } else {
            const x = trans.node.worldPosition.x;
            const width = trans.width;
            const anchorX = trans.anchorX;

            switch (dir) {
            case WidgetDirection.LEFT:
                return x - width * anchorX;
            case WidgetDirection.RIGHT:
                return x + width * (1 - anchorX);
            }
        }
    }
}