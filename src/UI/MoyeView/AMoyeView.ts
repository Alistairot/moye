import { Node } from "cc";
import { ViewLayer } from "./ViewLayer";
import { IMoyeViewMgr } from "./IMoyeViewMgr";
import { Entity } from "../../Core/Core";

export abstract class AMoyeView extends Entity {
    viewName: string;
    layer: ViewLayer;
    node: Node;

    private _viewMgr: IMoyeViewMgr;

    /**
     * on node load, this method will be called
     */
    protected onLoad?(): void
    /**
     * on view visible, this method will be called
     */
    protected onShow?(): void

    /**
     * on view invisible, this method will be called
     */
    protected onHide?(): void
    /**
     * on node destroy, this method will be called
     */
    protected destroy?(): void

    /**
     * the mothod can't get this.node, if you want get node on node load, use onLoad
     */
    protected awake?(): void

    private _realDispose(){
        super.dispose();
    }
    dispose(){
        this._viewMgr.hide(this.viewName);
    }

    bringToFront(){
        this.node.setSiblingIndex(-1);
    }
}