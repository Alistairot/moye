import { AssetManager } from "cc";
import { WindowBase } from "./WindowBase";
import { UIPackage } from "fairygui-cc";
import { IUIManager } from "./IUIManager";
import { IUILoader } from "./IUILoader";
import { DecoratorTypeCore } from "../../../../../common/Decorator/DecoratorTypeCore";
import { LockTypeCore } from "../../CoroutineLock/LockTypeCore";
import { Entity } from "../../../../../common/Entity/Entity";
import { DoubleMap } from "../../../../../common/DataStructure/DoubleMap";
import { BundleAsset } from "../../TAsset/BundleAsset";
import { DecoratorCollector } from "../../../../../common/Core/Decorator/DecoratorCollector";
import { TimerMgr } from "../../../../../common/Timer/TimerMgr";
import { TimeHelper } from "../../../../../common/Core/Time/TimeHelper";
import { coreLog, coreWarn } from "../../../../../common/Core/Logger/CoreLogHelper";
import { CoroutineLock } from "../../../../../common/CoroutineLock/CoroutineLock";
import { Root } from "../../../../../common/Entity/Root";
import { IUI } from "./IUI";
import { TAssets } from "../../TAsset/TAssets";
import { Task } from "../../../../../common/Core/Task/Task";
import { UILifeComponent } from "./UILifeComponent";
import { Injector } from "../../../../../common/Injector/Injector";
import { EntityCenter } from "../../../../../common/Core/Singleton/EntityCenter";

export class UIManager extends Entity implements IUIManager {
    public static inst: UIManager
    private _uiCtorMap: DoubleMap<string, new () => Entity> = new DoubleMap()
    private _windowLoaderMap: Map<string, IUILoader> = new Map()
    private _windowMap: DoubleMap<string, WindowBase> = new DoubleMap()
    private _expireUI: Map<string, number> = new Map
    private _timerId: number
    private _packageMap: Map<string, BundleAsset> = new Map
    private _uiLifeMap: Map<string, number> = new Map

    awake(): void {
        let list = DecoratorCollector.inst.get(DecoratorTypeCore.UI)

        for (const args of list) {
            let ctor = args[0]
            let uiType = args[1]

            this._uiCtorMap.Add(uiType, ctor)
        }

        let list2 = DecoratorCollector.inst.get(DecoratorTypeCore.UILoader)

        for (const args of list2) {
            let ctor = args[0]
            let uiType = args[1]

            this._windowLoaderMap.set(uiType, new ctor)
        }

        UIManager.inst = this

        Injector.inst.staticField("UIManager", this)

        this._timerId = TimerMgr.getInst().newRepeatedTimer(5 * 1000, this.check.bind(this))
    }

    destroy(): void {
        TimerMgr.getInst().remove(this._timerId)
        UIManager.inst = null
    }

    private check() {
        let nowTime = TimeHelper.clientNow()

        for (const [uiType, time] of this._expireUI) {
            if (nowTime > time) {
                this._expireUI.delete(uiType)

                this.remove(uiType)
            }
        }
    }

    private remove(uiType: string) {
        let ctor = this._uiCtorMap.GetValueByKey(uiType)

        if (ctor == null) {
            return
        }

        let win = this._windowMap.GetValueByKey(uiType)

        win?.dispose()

        this._windowMap.RemoveByKey(uiType)

        coreLog(`销毁ui: ${uiType}`)
    }

    isShowing(uiType: string) {
        let win = this._windowMap.GetValueByKey(uiType)

        if (win == null) {
            return false
        }

        return win.isShowing
    }

    async show(uiType: string, parent?: Entity) {
        let ctor = this._uiCtorMap.GetValueByKey(uiType)

        if (ctor == null) {
            coreWarn(`不存在的uitype=${uiType}`)
            return
        }

        this._expireUI.delete(uiType)

        let lock = await CoroutineLock.getInst().wait(LockTypeCore.WINDOW_LOAD, uiType)

        try {
            let uiCtor = this._uiCtorMap.GetValueByKey(uiType)
            let ui = this.getComponent(uiCtor)

            if (ui == null) {
                ui = this.addComponent(ctor)

                ui.addComponent(UILifeComponent).add(uiType)
            }

            let win: WindowBase = this._windowMap.GetValueByKey(uiType)

            if (win == null) {
                win = new WindowBase()

                let loader = this._windowLoaderMap.get(uiType)
                win.uiParent = this

                await loader.loadResAsync()

                this.afterLoadRes(win, ui)

                win.contentPane = loader.load()
                //@ts-ignore
                ui.uiNode = win.contentPane

                this._windowMap.Add(uiType, win)
            }

            if (!win.isShowing) {
                win.show()
            }

            let lifeComId = this._uiLifeMap.get(uiType)

            if (lifeComId != null) {
                let lifeCom = EntityCenter.getInst().get(lifeComId) as UILifeComponent

                lifeCom?.remove(uiType)
            }

            if (parent != null) {
                let uiLiftCom = parent.getComponent(UILifeComponent)

                if (uiLiftCom == null) {
                    uiLiftCom = parent.addComponent(UILifeComponent)
                }

                uiLiftCom.add(uiType)
                this._uiLifeMap.set(uiType, uiLiftCom.instanceId)
            }

            return ui
        } finally {
            lock.dispose();
        }
    }

    getIfShow(uiType: string) {
        let win = this._windowMap.GetValueByKey(uiType)

        if (win == null || !win.isShowing) {
            return
        }

        let uiCtor = this._uiCtorMap.GetValueByKey(uiType)
        let ui = this.getComponent(uiCtor)

        return ui
    }

    hide(uiType: string) {
        let win = this._windowMap.GetValueByKey(uiType)

        if (win == null) {
            return
        }

        if (!win.isShowing) {
            return
        }

        this._expireUI.set(uiType, TimeHelper.clientNow() + 10 * 1000)

        win.hide()
    }

    hideAllUI() {
        for (let uiType of this._windowMap.iterator()) {
            this.hide(uiType)
        }
    }

    afterLoadRes(win: WindowBase, ui: Entity) {
        let uiCom = ui as unknown as IUI

        if (uiCom.afterLoadRes != null) {
            uiCom.afterLoadRes(win)
        }
    }

    onLoadAsync(win: WindowBase) {
        let uiType = this._windowMap.GetKeyByValue(win)
        let uiCtor = this._uiCtorMap.GetValueByKey(uiType)
        let ui = this.getComponent(uiCtor) as unknown as IUI

        ui.onLoadAsync()
    }
    onShownAsync(win: WindowBase) {
        let uiType = this._windowMap.GetKeyByValue(win)
        let uiCtor = this._uiCtorMap.GetValueByKey(uiType)
        let ui = this.getComponent(uiCtor) as unknown as IUI

        ui.onShownAsync()
    }
    onHideAsync(win: WindowBase) {
        let uiType = this._windowMap.GetKeyByValue(win)
        let uiCtor = this._uiCtorMap.GetValueByKey(uiType)
        let ui = this.getComponent(uiCtor) as unknown as IUI

        ui.onHideAsync()
    }
    onDisposeAsync(win: WindowBase) {
        let uiType = this._windowMap.GetKeyByValue(win)
        let uiCtor = this._uiCtorMap.GetValueByKey(uiType)
        let ui = this.getComponent(uiCtor) as unknown as IUI

        if (ui != null) {
            ui.onDisposeAsync();
            (ui as unknown as Entity).dispose()
        }
    }

    /**
     * 需要包含bundle name
     * @param path 
     */
    public async loadPackageAsync(packageName: string) {
        let bundleAsset = this._packageMap.get(packageName)

        if (bundleAsset) {
            return
        }

        bundleAsset = await TAssets.loadBundleAsync(packageName)

        await this.internalLoadPackage(bundleAsset.bundle, packageName)

        this._packageMap.set(packageName, bundleAsset)

        bundleAsset.isAutoRelease = false
    }

    private async internalLoadPackage(bundle: AssetManager.Bundle, path: string) {
        let task = Task.create()

        // 加载公共包
        UIPackage.loadPackage(bundle, path, () => {
            task.setResult()
        })

        await task
    }

    public loadWindow
}