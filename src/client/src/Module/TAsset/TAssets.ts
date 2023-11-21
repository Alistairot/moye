import { Asset, assetManager, AssetManager, native } from "cc";
import { AssetInfo } from "./AssetInfo";
import { AssetOperationHandle } from "./AssetOperationHandle";
import { AssetSystem } from "./AssetSystem";
import { BundleAsset } from "./BundleAsset";
import { Singleton } from "../../../../common/Core/Singleton/Singleton";
import { CoroutineLock } from "../../../../common/CoroutineLock/CoroutineLock";
import { LockTypeCore } from "../CoroutineLock/LockTypeCore";
import { Task } from "../../../../common/Core/Task/Task";
import { NATIVE } from "cc/env";
import { coreError, coreLog } from "../../../../common/Core/Logger/CoreLogHelper";

export class TAssets extends Singleton {
    public static assetSystem: AssetSystem
    private static readonly bundleMap: Map<string, BundleAsset> = new Map();
    private static readonly bundlePathMap: Map<string, string> = new Map();

    awake() {
        TAssets.assetSystem = new AssetSystem
    }

    update(): void {
        TAssets.assetSystem.update()
    }

    public static async loadAssetAsync<T extends Asset>(assetType: new () => T, location: string): Promise<AssetOperationHandle> {
        let assetInfo = new AssetInfo()
        assetInfo.init(assetType, location)

        let bundleName = assetInfo.bundleName
        let bundleAsset = TAssets.bundleMap.get(bundleName)

        if (!bundleAsset) {
            bundleAsset = await this.loadBundleAsync(bundleName)
        }

        let assetOperationHandle = await bundleAsset.loadAssetAsync(assetInfo)

        return assetOperationHandle as unknown as AssetOperationHandle
    }

    public static async loadBundleAsync(bundleName: string): Promise<BundleAsset> {
        let lock = await CoroutineLock.getInst().wait(LockTypeCore.BUNDLE_LOAD, bundleName);

        try {
            let bundleAsset = TAssets.bundleMap.get(bundleName);

            if (bundleAsset) {
                return bundleAsset;
            }

            let task = Task.create<AssetManager.Bundle>();

            if (!this.bundlePathMap.has(bundleName)) {
                this.bundlePathMap.set(bundleName, bundleName);

                if (NATIVE) {
                    let writePath = native.fileUtils.getWritablePath()
                    let bundlePath = `${writePath}hot/${bundleName}`

                    if (native.fileUtils.isDirectoryExist(bundlePath)) {
                        this.bundlePathMap.set(bundleName, bundlePath)
                    }
                }
            }

            let bundlePath = this.bundlePathMap.get(bundleName)

            coreLog(`加载bundle: ${bundlePath}`)

            assetManager.loadBundle(bundlePath, (err, bundle) => {
                if (err) {
                    coreLog(`加载Bundle错误, bundle=${bundleName}, error=${err}`)
                } else {
                    coreLog(`加载Bundle完成, bundle=${bundleName}`)
                }

                task.setResult(bundle)
            });

            let bundle = await task
            bundleAsset = new BundleAsset
            bundleAsset.bundle = bundle
            bundleAsset.bundleName = bundleName
            bundleAsset.assetSystem = TAssets.assetSystem

            TAssets.bundleMap.set(bundleName, bundleAsset);
            return bundleAsset
        } finally {
            lock.dispose();
        }
    }

    public static releaseBundle(bundleAsset: BundleAsset) {
        if (bundleAsset.refCount != 0) {
            coreError(`释放的bundle:${bundleAsset.bundleName}引用计数不为0`)

            return
        }

        this.bundleMap.delete(bundleAsset.bundleName)
        assetManager.removeBundle(bundleAsset.bundle)

        coreLog(`卸载bundle:${bundleAsset.bundleName}`)
    }

    public static unloadUnusedAssets() {
        for (const [name, bundleAsset] of this.bundleMap) {
            bundleAsset.unloadUnusedAssets()

            if (bundleAsset.refCount != 0) {
                continue
            }

            if (!bundleAsset.isAutoRelease) {
                continue
            }

            TAssets.releaseBundle(bundleAsset)
        }
    }
}
