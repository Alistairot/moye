import { Enum, Layout, UITransform, Vec3, _decorator } from "cc";

const { ccclass, inspector, property, disallowMultiple, menu } = _decorator;

enum CenterHorizontalDirection {
    LEFT_TO_RIGHT = 0,
    RIGHT_TO_LEFT = 1,
    CENTER_TO_SIDE = 2,
}

/**
 * 扩展cocos的layout
 * 使其支持居中
 */
@ccclass
@disallowMultiple()
@menu('moye/CenterLayout')
@inspector("packages://custom_inspector/centerlayout.js")
export default class CenterLayout extends Layout {
    @property({
        type: Enum(CenterHorizontalDirection)
    })
        centerHorizontalDirection: CenterHorizontalDirection = CenterHorizontalDirection.CENTER_TO_SIDE;



    protected _doLayoutHorizontally(baseWidth: number, rowBreak: boolean, fnPositionY: (...args: any[]) => number, applyChildren: boolean): number {
        const trans = this.node._uiProps.uiTransformComp!;
        const layoutAnchor = trans.anchorPoint;
        const limit = this._getFixedBreakingNum();

        let sign = 1;
        let paddingX = this._paddingLeft;
        if (this._horizontalDirection === Layout.HorizontalDirection.RIGHT_TO_LEFT) {
            sign = -1;
            paddingX = this._paddingRight;
        }

        const startPos = (this._horizontalDirection - layoutAnchor.x) * baseWidth + sign * paddingX;
        let nextX = startPos - sign * this._spacingX;
        let totalHeight = 0; // total content height (not including spacing)
        let rowMaxHeight = 0; // maximum height of a single line
        let tempMaxHeight = 0; //
        let maxHeight = 0;
        let isBreak = false;
        const activeChildCount = this._usefulLayoutObj.length;
        let newChildWidth = this._cellSize.width;
        const paddingH = this._getPaddingH();
        if (this._layoutType !== Layout.Type.GRID && this._resizeMode === Layout.ResizeMode.CHILDREN) {
            newChildWidth = (baseWidth - paddingH - (activeChildCount - 1) * this._spacingX) / activeChildCount;
        }

        const children = this._usefulLayoutObj;
        for (let i = 0; i < children.length; ++i) {
            const childTrans = children[i];
            const child = childTrans.node;
            const scale = child.scale;
            const childScaleX = this._getUsedScaleValue(scale.x);
            const childScaleY = this._getUsedScaleValue(scale.y);
            // for resizing children
            if (this._resizeMode === Layout.ResizeMode.CHILDREN) {
                childTrans.width = newChildWidth / childScaleX;
                if (this._layoutType === Layout.Type.GRID) {
                    childTrans.height = this._cellSize.height / childScaleY;
                }
            }

            const anchorX = Math.abs(this._horizontalDirection - childTrans.anchorX);
            const childBoundingBoxWidth = childTrans.width * childScaleX;
            const childBoundingBoxHeight = childTrans.height * childScaleY;

            if (childBoundingBoxHeight > tempMaxHeight) {
                maxHeight = Math.max(tempMaxHeight, maxHeight);
                rowMaxHeight = tempMaxHeight || childBoundingBoxHeight;
                tempMaxHeight = childBoundingBoxHeight;
            }

            nextX += sign * (anchorX * childBoundingBoxWidth + this._spacingX);
            const rightBoundaryOfChild = sign * (1 - anchorX) * childBoundingBoxWidth;

            if (rowBreak) {
                if (limit > 0) {
                    isBreak = (i / limit) > 0 && (i % limit === 0);
                    if (isBreak) {
                        rowMaxHeight = tempMaxHeight > childBoundingBoxHeight ? tempMaxHeight : rowMaxHeight;
                    }
                } else if (childBoundingBoxWidth > baseWidth - paddingH) {
                    if (nextX > startPos + sign * (anchorX * childBoundingBoxWidth)) {
                        isBreak = true;
                    }
                } else {
                    const boundary = (1 - this._horizontalDirection - layoutAnchor.x) * baseWidth;
                    const rowBreakBoundary = nextX + rightBoundaryOfChild + sign * (sign > 0 ? this._paddingRight : this._paddingLeft);
                    isBreak = Math.abs(rowBreakBoundary) > Math.abs(boundary);
                }

                if (isBreak) {
                    nextX = startPos + sign * (anchorX * childBoundingBoxWidth);
                    if (childBoundingBoxHeight !== tempMaxHeight) {
                        rowMaxHeight = tempMaxHeight;
                    }
                    // In unconstrained mode, the second height size is always what we need when a line feed condition is required to trigger
                    totalHeight += rowMaxHeight + this._spacingY;
                    rowMaxHeight = tempMaxHeight = childBoundingBoxHeight;
                }
            }

            const finalPositionY = fnPositionY(child, childTrans, totalHeight);
            if (applyChildren) {
                child.setPosition(nextX, finalPositionY);
            }

            nextX += rightBoundaryOfChild;
        }

        rowMaxHeight = Math.max(rowMaxHeight, tempMaxHeight);
        const containerResizeBoundary = Math.max(maxHeight, totalHeight + rowMaxHeight) + this._getPaddingV();

        // --start--
        if (children.length > 0 && this.centerHorizontalDirection == CenterHorizontalDirection.CENTER_TO_SIDE) {
            const centerX = (0.5 - layoutAnchor.x) * baseWidth;
            let rowWidth = 0;
            let nextRowX = -1;
            let lastRowY = Number.MIN_SAFE_INTEGER;
            sign = -1;

            for (let i = children.length - 1; i >= 0; i--) {
                const child = children[i];
                const childScaleX = this._getUsedScaleValue(child.node.scale.x);
                const anchorX = child.getComponent(UITransform)!.anchorX;
                const childBoundingBoxWidth = child.getComponent(UITransform)!.width * childScaleX;
                if (Math.abs(child.node.position.y - lastRowY) > 1) {
                    lastRowY = child.node.position.y;
                    rowWidth = child.node.position.x + (1 - anchorX) * childBoundingBoxWidth + this.paddingRight;
                    rowWidth = baseWidth * layoutAnchor.x + rowWidth;
                    const lastRowEndX = centerX + rowWidth * 0.5;
                    nextRowX = lastRowEndX + sign * paddingX - sign * this.spacingX;
                }
                if (!child.node.activeInHierarchy) {
                    continue;
                }
                nextRowX = nextRowX + sign * anchorX * childBoundingBoxWidth + sign * this.spacingX;
                child.node.setPosition(new Vec3(nextRowX, child.node.position.y, 0));
                const rightBoundaryOfChild = sign * (1 - anchorX) * childBoundingBoxWidth;
                nextRowX += rightBoundaryOfChild;
            }
        }
        // --end--
        
        return containerResizeBoundary;

    }

    _getUsedScaleValue(value: number) {
        return this.affectedByScale ? Math.abs(value) : 1;
    }
}