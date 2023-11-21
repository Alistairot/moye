import { IBundleAssetProvider } from "./IBundleAssetProvider"

export class AssetSystem {
    /**
     * 同时加载的最大数量
     */
    private static readonly MAX_LOADING_PROVIDER = 1

    /**
     * 每一帧最多添加几个到加载列表
     */
    private static readonly FRAME_MAX_ADD_QUEUE_PROVIDER = 1

    private waitLoads: Array<IBundleAssetProvider> = new Array
    private loadingSet: Set<IBundleAssetProvider> = new Set
    private frameAddCount: number = 0

    update() {
        this.frameAddCount = 0

        this.updateLoadingSet()
    }

    addProvider(provider: IBundleAssetProvider) {
        this.waitLoads.push(provider)
        this.updateLoadingSet()
    }

    updateLoadingSet() {
        // 这一帧添加的到达上限
        if (this.frameAddCount >= AssetSystem.FRAME_MAX_ADD_QUEUE_PROVIDER) {
            return
        }

        // 同时加载的到达上限
        if (this.loadingSet.size >= AssetSystem.MAX_LOADING_PROVIDER) {
            return
        }

        // 没有需要加载的
        if (this.waitLoads.length == 0) {
            return
        }

        let provider = this.waitLoads.pop()

        this.loadingSet.add(provider)

        provider.internalLoad()
    }

    removeProvider(provider: IBundleAssetProvider) {
        this.loadingSet.delete(provider)
        this.updateLoadingSet()
    }
}