import { Asset, SpriteFrame, Texture2D } from "cc";
import { Type } from "../Core/Type/Type";

export class AssetInfo {
    bundleName: string;
    assetPath: string;
    assetType: Type<Asset>;
    uuid: string;

    init<T extends Asset>(assetType: Type<T>, location: string) {
        location = this.parseLocation(assetType, location);

        const strs = location.split("/");

        let assetPath = '';

        for (let i = 1; i < strs.length; i++) {
            assetPath += strs[i];

            if (i != strs.length - 1) {
                assetPath += "/";
            }
        }


        this.bundleName = strs[0];
        this.assetPath = assetPath;
        this.assetType = assetType;

        this.uuid = `${location}.${assetType.name}`;
    }

    private parseLocation<T extends Asset>(assetType: Type<T>, location: string) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        if (assetType == SpriteFrame) {
            if (!location.endsWith("spriteFrame")) {
                location += '/spriteFrame';
            }

        } 
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-expect-error
        else if (assetType == Texture2D) {
            if (!location.endsWith("texture")) {
                location += '/texture';
            }
        }

        return location;
    }
}


