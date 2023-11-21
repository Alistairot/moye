import { Asset } from "cc"
import { coreError } from "../../../../common/Core/Logger/CoreLogHelper"

export class AssetInfo {
    public bundleName: string
    public assetPath: string
    public assetType: new () => Asset
    public uuid: string

    public init<T extends Asset>(assetType: new () => T, location: string) {
        let strs = location.split("/")

        if (strs.length == 1) {
            coreError("location必须包含bundle名字")
        }

        let assetPath = ''

        for (let i = 1; i < strs.length; i++) {
            assetPath += strs[i]

            if (i != strs.length - 1) {
                assetPath += "/"
            }
        }


        this.bundleName = strs[0]
        this.assetPath = assetPath
        this.assetType = assetType

        this.uuid = `${location}.${assetType.name}`
    }
}


