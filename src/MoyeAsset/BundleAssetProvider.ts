import { Asset } from "cc";
import { AssetInfo } from "./AssetInfo";
import { AssetOperationHandle } from "./AssetOperationHandle";
import { AssetSystem } from "./AssetSystem";
import { IBundleAsset } from "./IBundleAsset";
import { Task } from "../Core/Task/Task";
import { coreError, coreWarn } from "../Core/Logger/CoreLogHelper";
import { MoyeAssetTag } from "./LogTag";

export class BundleAssetProvider {
    asset: Asset;
    path: string;
    refCount: number = 0;
    bundleAsset: IBundleAsset;
    assetInfo: AssetInfo;
    assetSystem: AssetSystem;
    private _task: Task<void>;
    private _handleSet: Set<AssetOperationHandle> = new Set;

    async internalLoad() {
        const assetPath = this.assetInfo.assetPath;
        const assetType = this.assetInfo.assetType;

        this.bundleAsset.bundle.load(assetPath, assetType, (err, asset) => {
            if (err) {
                coreError(MoyeAssetTag, '加载资源错误:{0},{1}', this.assetInfo.uuid, err);
            } else {
                this.asset = asset;
            }

            this._task.setResult();
            this.assetSystem.removeProvider(this);
        });
    }

    async load() {
        this._task = Task.create();

        this.assetSystem.addProvider(this);

        await this._task;
    }

    createHandle(): AssetOperationHandle {
        // 引用计数增加
        this.refCount++;

        const handle = new AssetOperationHandle;

        handle.provider = this;

        this._handleSet.add(handle);

        return handle;
    }

    releaseHandle(handle: AssetOperationHandle) {
        if (this.refCount <= 0) {
            coreWarn(MoyeAssetTag, "Asset provider reference count is already zero. There may be resource leaks !");
        }

        if (this._handleSet.delete(handle) == false) {
            coreError(MoyeAssetTag, "Should never get here !");
        }

        // 引用计数减少
        this.refCount--;
    }
}