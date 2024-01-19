import { Asset, assetManager, AssetManager, native } from "cc";
import { AssetInfo } from "./AssetInfo";
import { AssetOperationHandle } from "./AssetOperationHandle";
import { AssetSystem } from "./AssetSystem";
import { BundleAsset } from "./BundleAsset";
import { NATIVE } from "cc/env";
import { Singleton } from "../Core/Singleton/Singleton";
import { CoroutineLock } from "../Core/CoroutineLock/CoroutineLock";
import { AssetLockType } from "./AssetLockType";
import { Task } from "../Core/Task/Task";
import { coreError, coreLog } from "../Core/Logger/CoreLogHelper";
import { MoyeAssetTag } from "./LogTag";

export class MoyeAssets extends Singleton {
    static assetSystem: AssetSystem;
    private static readonly _bundleMap: Map<string, BundleAsset> = new Map();
    private static readonly _bundlePathMap: Map<string, string> = new Map();

    awake() {
        MoyeAssets.assetSystem = new AssetSystem;
    }

    update(): void {
        MoyeAssets.assetSystem.update();
    }

    static async loadAssetAsync<T extends Asset>(assetType: new () => T, location: string): Promise<AssetOperationHandle> {
        try{
            const assetInfo = new AssetInfo();
            assetInfo.init(assetType, location);
    
            const bundleName = assetInfo.bundleName;
            let bundleAsset = MoyeAssets._bundleMap.get(bundleName);
    
            if (!bundleAsset) {
                bundleAsset = await this.loadBundleAsync(bundleName);
            }
    
            const assetOperationHandle = await bundleAsset.loadAssetAsync(assetInfo);

            return assetOperationHandle as unknown as AssetOperationHandle;
        }catch(e){
            coreError(MoyeAssetTag, e);
        }
    }

    static async loadBundleAsync(bundleName: string): Promise<BundleAsset> {
        const lock = await CoroutineLock.get().wait(AssetLockType.BUNDLE_LOAD, bundleName);

        try {
            let bundleAsset = MoyeAssets._bundleMap.get(bundleName);

            if (bundleAsset) {
                return bundleAsset;
            }

            const task = Task.create<AssetManager.Bundle>();

            if (!this._bundlePathMap.has(bundleName)) {
                this._bundlePathMap.set(bundleName, bundleName);

                if (NATIVE) {
                    // check hot
                    const writePath = native.fileUtils.getWritablePath();
                    const bundlePath = `${writePath}hot/${bundleName}`;

                    if (native.fileUtils.isDirectoryExist(bundlePath)) {
                        this._bundlePathMap.set(bundleName, bundlePath);
                    }
                }
            }

            const bundlePath = this._bundlePathMap.get(bundleName);

            coreLog(MoyeAssetTag, '加载bundle: {0}', bundlePath);

            assetManager.loadBundle(bundlePath, (err, bundle) => {
                if (err) {
                    coreLog(MoyeAssetTag, '加载Bundle错误, bundle={0}, error={1}', bundleName, err);
                } else {
                    coreLog(MoyeAssetTag, '加载Bundle完成, bundle={0}', bundleName);
                }

                task.setResult(bundle);
            });

            const bundle = await task;
            bundleAsset = new BundleAsset;
            bundleAsset.bundle = bundle;
            bundleAsset.bundleName = bundleName;
            bundleAsset.assetSystem = MoyeAssets.assetSystem;

            MoyeAssets._bundleMap.set(bundleName, bundleAsset);
            return bundleAsset;
        } finally {
            lock.dispose();
        }
    }

    static releaseBundle(bundleAsset: BundleAsset) {
        if (bundleAsset.refCount != 0) {
            coreError(MoyeAssetTag, '释放的bundle:{0}, 引用计数不为0', bundleAsset.bundleName);
            return;
        }

        this._bundleMap.delete(bundleAsset.bundleName);
        assetManager.removeBundle(bundleAsset.bundle);

        coreLog(MoyeAssetTag, '卸载bundle:{0}', bundleAsset.bundleName);
    }

    static unloadUnusedAssets() {
        for (const [name, bundleAsset] of this._bundleMap) {
            if (bundleAsset.refCount != 0) {
                continue;
            }

            if (!bundleAsset.isAutoRelease) {
                continue;
            }

            bundleAsset.unloadUnusedAssets();
            MoyeAssets.releaseBundle(bundleAsset);
        }
    }
}
