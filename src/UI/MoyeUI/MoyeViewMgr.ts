import { Node, UITransform, Widget } from "cc";
import { CoroutineLock, DecoratorCollector, Entity, JsHelper, Task, TimeInfo, TimerMgr, Type } from "../../Core/Core";
import { AMoyeView } from "./AMoyeView";
import { IViewConfig } from "./IViewConfig";
import { ViewDecoratorType } from "./ViewDecorator";
import { ViewLayer } from "./ViewLayer";
import { ViewCleanCom } from "./ViewCleanCom";
import { IMoyeViewConfig } from "./IMoyeViewConfig";
import { coreError, coreLog } from "../../Core/Logger/CoreLogHelper";
import { MoyeViewTag } from "./LogTag";

const viewLoadLock = "MoyeViewLoadLock";

export class MoyeViewMgr extends Entity {
    static inst: MoyeViewMgr;

    /**
     * all views
     */
    private _views: Map<string, AMoyeView> = new Map();
    private _type2Names: Map<Type<AMoyeView>, string> = new Map();
    private _showingViews: Set<string> = new Set();
    private _hideViews: Set<string> = new Set();
    private _viewCfgs: Map<string, IViewConfig> = new Map();
    private _layers: Map<ViewLayer, Node> = new Map();
    private _globalViewCfgType: Type<IViewConfig>;
    private _uiRoot: Node;
    private _checkTimerId: number;
    private _checkInterval: number = 5 * 1000;

    protected awake(): void {
        MoyeViewMgr.inst = this;
    }

    protected destroy(): void {
        if (this._checkTimerId != null) {
            TimerMgr.get().remove(this._checkTimerId);
            this._checkTimerId = null;
        }

        MoyeViewMgr.inst = null;
    }

    /**
     * init view manager
     * @param uiRoot 
     * @param globalViewCfg all field need to set
     * @returns 
     */
    init(uiRoot: Node, globalViewCfg: Type<IMoyeViewConfig>) {
        if (this._uiRoot != null) {
            return coreError(MoyeViewTag, 'MoyeViewMgr is already inited');
        }

        this._uiRoot = uiRoot;
        this._globalViewCfgType = globalViewCfg;

        this.reload();

        this._checkTimerId = TimerMgr.get().newRepeatedTimer(this._checkInterval, this.check.bind(this));

        return this;
    }

    async show<T extends AMoyeView>(type: Type<T>, bindEntity?: Entity): Promise<T>;
    async show(name: string, bindEntity?: Entity): Promise<AMoyeView>;
    async show<T extends AMoyeView>(nameOrType: string | Type<T>, bindEntity?: Entity): Promise<AMoyeView> {
        let name: string;

        if (typeof nameOrType == 'string') {
            name = nameOrType;
        } else {
            name = this._type2Names.get(nameOrType);
        }

        if (JsHelper.isNullOrEmpty(name)) {
            coreError(MoyeViewTag, 'MoyeView name is null or empty, name={0}', name);
            return;
        }

        const lock = await CoroutineLock.get().wait(viewLoadLock, name);
        coreLog(MoyeViewTag, 'show view, name={0}', name);
        try {
            if (this._uiRoot == null) {
                throw new Error('MoyeViewMgr is not inited');
            }

            if (this._showingViews.has(name)) {
                const view = this._views.get(name);
                return view;
            }

            if (this._views.has(name)) {
                const view = this._views.get(name);
                await this.enterViewShow(view, bindEntity);
                return view;
            }

            const viewCfg = this._viewCfgs.get(name);
            const node = await viewCfg.load(name);
            const layerNode = this.getLayerNode(viewCfg.layer);

            node.parent = layerNode;

            const view = this.addCom(viewCfg.viewType);
            view.node = node;
            view.layer = viewCfg.layer;
            view.viewName = name;
            view['onLoad']?.();
            view['_viewMgr'] = this;

            this._views.set(name, view);
            await this.enterViewShow(view, bindEntity);

            return view;
        } catch (e) {
            coreError(MoyeViewTag, 'show view errr, {0}', e.stack);
        } finally {
            lock.dispose();
        }
    }

    async hide(name: string): Promise<void> {
        const lock = await CoroutineLock.get().wait(viewLoadLock, name);
        coreLog(MoyeViewTag, 'hide view, name={0}', name);
        try {
            if (!this._showingViews.has(name)) {
                return;
            }

            const view = this._views.get(name);

            await this.enterViewHide(view);
        } catch (e) {
            coreError(MoyeViewTag, 'hide view errr, {0}', e.stack);
        } finally {
            lock.dispose();
        }
    }

    getView<T extends AMoyeView>(type: Type<T>): T;
    getView(name: string): AMoyeView;
    getView<T extends AMoyeView>(nameOrType: string | Type<T>,): AMoyeView {
        let name: string;

        if (typeof nameOrType == 'string') {
            name = nameOrType;
        } else {
            name = this._type2Names.get(nameOrType);
        }

        if (this._showingViews.has(name)) {
            const view = this._views.get(name);
            return view;
        }
    }

    /**
     * reload confog
     */
    reload() {
        const list = DecoratorCollector.inst.get(ViewDecoratorType);

        for (const args of list) {
            const viewType: Type<AMoyeView> = args[0];
            const name = args[1];
            const layer: ViewLayer = args[2];
            const viewCfgType: Type<IViewConfig> = args[3];

            if (this._viewCfgs.has(name)) {
                continue;
            }

            let viewCfg: IViewConfig;

            if (viewCfgType != null) {
                viewCfg = new viewCfgType();
            } else {
                viewCfg = new this._globalViewCfgType;
            }

            viewCfg.layer = layer;
            viewCfg.name = name;
            viewCfg.viewType = viewType;
            viewCfg.cleanEntitys = new Set();

            this._type2Names.set(viewType, name);
            this._viewCfgs.set(name, viewCfg);
        }
    }

    private check() {
        const nowTime = TimeInfo.get().clientNow();

        for (const name of this._hideViews) {
            const cfg = this._viewCfgs.get(name);

            if (nowTime >= cfg.expireTime) {
                this.enterViewDestroy(this._views.get(name));
            }
        }
    }

    private getLayerNode(layer: ViewLayer): Node {
        let layerNode = this._layers.get(layer);

        if (layerNode == null) {
            layerNode = new Node();
            layerNode.name = ViewLayer[layer];
            layerNode.parent = this._uiRoot;
            layerNode.setSiblingIndex(layer);
            this._layers.set(layer, layerNode);

            const size = this._uiRoot.getComponent(UITransform).contentSize;
            layerNode.addComponent(UITransform).setContentSize(size);

            const layerWidget = layerNode.addComponent(Widget);
            layerWidget.top = 0;
            layerWidget.bottom = 0;
            layerWidget.left = 0;
            layerWidget.right = 0;
            layerWidget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;
            layerWidget.isAlignBottom = true;
            layerWidget.isAlignLeft = true;
            layerWidget.isAlignRight = true;
            layerWidget.isAlignTop = true;
        }

        return layerNode;
    }

    private addToCleanCom(entity: Entity, viewName: string): void {
        if (entity == null) {
            return;
        }

        let cleanCom = entity.getCom(ViewCleanCom);
        const viewCfg = this._viewCfgs.get(viewName);

        if (cleanCom == null) {
            cleanCom = entity.addCom(ViewCleanCom).init(this);
        }

        viewCfg.cleanEntitys.add(cleanCom);

        cleanCom.add(viewName);
    }

    private async enterViewShow(view: AMoyeView, bindEntity?: Entity): Promise<void> {
        view.node.active = true;
        view.bringToFront();

        const cfg = this._viewCfgs.get(view.viewName);

        if (cfg.doShowAnimation != null) {
            const task = Task.create();
            cfg.doShowAnimation(view, task);
            await task;
        }

        this._showingViews.add(view.viewName);
        this._hideViews.delete(view.viewName);

        this.addToCleanCom(bindEntity, view.viewName);

        view['onShow']?.();
    }

    private async enterViewHide(view: AMoyeView): Promise<void> {
        const cfg = this._viewCfgs.get(view.viewName);

        if (cfg.doHideAnimation != null) {
            const task = Task.create();
            cfg.doHideAnimation(view, task);
            await task;
        }

        view['onHide']?.();
        view.node.active = false;
        this._hideViews.add(view.viewName);
        this._showingViews.delete(view.viewName);

        for (const cleanCom of cfg.cleanEntitys) {
            cleanCom.remove(view.viewName);
        }

        cfg.cleanEntitys.clear();

        cfg.expireTime = TimeInfo.get().clientNow() + (cfg.expire);
    }

    private enterViewDestroy(view: AMoyeView): void {
        view['_realDispose']();
        view.node.destroy();
        this._views.delete(view.viewName);
        this._hideViews.delete(view.viewName);

        const cfg = this._viewCfgs.get(view.viewName);
        cfg.destroy();
    }
}