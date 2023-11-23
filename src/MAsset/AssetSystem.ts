import { IBundleAssetProvider } from "./IBundleAssetProvider";

export class AssetSystem {
    /**
     * 同时加载的最大数量
     */
    private static _maxLoadingProvider = 1;

    /**
     * 每一帧最多添加几个到加载列表
     */
    private static _frameMaxAddQueueProvider = 1;

    private _waitLoads: Array<IBundleAssetProvider> = [];
    private _loadingSet: Set<IBundleAssetProvider> = new Set;
    private _frameAddCount: number = 0;

    update() {
        this._frameAddCount = 0;

        this.updateLoadingSet();
    }

    addProvider(provider: IBundleAssetProvider) {
        this._waitLoads.push(provider);
        this.updateLoadingSet();
    }

    updateLoadingSet() {
        // 这一帧添加的到达上限
        if (this._frameAddCount >= AssetSystem._frameMaxAddQueueProvider) {
            return;
        }

        // 同时加载的到达上限
        if (this._loadingSet.size >= AssetSystem._maxLoadingProvider) {
            return;
        }

        // 没有需要加载的
        if (this._waitLoads.length == 0) {
            return;
        }

        const provider = this._waitLoads.shift();

        this._loadingSet.add(provider);

        provider.internalLoad();
    }

    removeProvider(provider: IBundleAssetProvider) {
        this._loadingSet.delete(provider);
        this.updateLoadingSet();
    }
}