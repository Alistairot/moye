import { AssetManager } from "cc";
import { AssetInfo } from "./AssetInfo";
import { AssetSystem } from "./AssetSystem";
import { BundleAssetProvider } from "./BundleAssetProvider";
import { IAssetOperationHandle } from "./IAssetOperationHandle";
import { AssetLockType } from "./AssetLockType";
import { CoroutineLock } from "../Core/CoroutineLock/CoroutineLock";

export class BundleAsset {
    bundleName: string;
    bundle: AssetManager.Bundle;
    refCount: number = 0;
    isAutoRelease = true;
    assetSystem: AssetSystem;

    private _providerMap: Map<string, BundleAssetProvider> = new Map;

    async loadAssetAsync(assetInfo: AssetInfo): Promise<IAssetOperationHandle> {
        let provider = this._providerMap.get(assetInfo.uuid);

        if (!provider) {
            provider = await this.createProvider(assetInfo);
        }

        const handle = provider.createHandle();

        return handle;
    }

    private async createProvider(assetInfo: AssetInfo): Promise<BundleAssetProvider> {
        const lock = await CoroutineLock.getInst().wait(AssetLockType.BUNDLE_ASSET_LOAD, assetInfo.uuid);
        try {
            let provider = this._providerMap.get(assetInfo.uuid);

            if (provider) {
                return provider;
            }

            provider = new BundleAssetProvider;

            provider.assetInfo = assetInfo;
            provider.assetSystem = this.assetSystem;
            provider.bundleAsset = this;

            this.refCount++;

            await provider.load();

            this._providerMap.set(assetInfo.uuid, provider);

            return provider;
        } finally {
            lock.dispose();
        }
    }

    unloadUnusedAssets() {
        for (const [key, provider] of this._providerMap) {
            if (provider.refCount != 0) {
                continue;
            }

            this.bundle.release(provider.assetInfo.assetPath, provider.assetInfo.assetType);
            this._providerMap.delete(key);
            this.refCount--;
        }
    }
}


