import { Entity } from "../../Core/Core";
import { IMoyeViewMgr } from "./IMoyeViewMgr";

export class ViewCleanCom extends Entity {
    private _viewMgr: IMoyeViewMgr;
    private _views: Set<string> = new Set;

    init(viewMgr: IMoyeViewMgr) {
        this._viewMgr = viewMgr;
        return this;
    }

    add(viewName: string) {
        this._views.add(viewName);
    }

    remove(viewName: string) {
        this._views.delete(viewName);
    }

    destroy(): void {
        for (const viewName of this._views) {
            this._viewMgr.hide(viewName);
        }
    }
}