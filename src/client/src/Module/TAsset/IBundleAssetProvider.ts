import { Asset } from "cc";
import { IAssetOperationHandle } from "./IAssetOperationHandle";

export interface IBundleAssetProvider{
    asset: Asset
    releaseHandle(handle: IAssetOperationHandle)
    internalLoad()
}