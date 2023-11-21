import { DB } from "../../../../../../common/Decorator/Decorators/DB"
import { IgnoreSerialize } from "../../../../../../common/Decorator/Decorators/IgnoreSerialize"
import { Entity } from "../../../../../../common/Entity/Entity"
import { EventSystem } from "../../../../../../common/EventSystem/EventSystem"
import { DBHelper } from "../../../../Module/DB/DBHelper"
import { AfterCreateUnit } from "../../../Event/EventTypeCore"
import { Unit } from "../../../../Module/Unit/Unit"
import { DBWithKey } from "../../../../../../common/Decorator/Decorators/DBWithKey"
import { ISerialize } from "../../../../Module/Serialize/ISerialize"

/**
 * 玩家数据
 * 每个账号都有一个GatePlayer
 * 用来保存账号的一些信息 比如角色列表等
 */
@DBWithKey('_account', false, 1000)
export class GatePlayer extends Entity implements ISerialize {
    private _account: string

    get account() {
        return this._account
    }

    @IgnoreSerialize
    ref: number = 0

    init(account: string) {
        this._account = account
        return this;
    }

    onDeserialize(): void {
        this.ref = 0;
    }

    /**
     * 注意 这里创建是有可能失败的
     * @param args
     * @returns 创建是否成功
     */
    async createUnit(args?: any): Promise<boolean> {
        let unit = this.addChild(Unit);

        await EventSystem.getInst().publishAsync(this.domainScene(), AfterCreateUnit.create({ unit: unit, args: args }));
        
        let ret = await DBHelper.save(unit);

        if (!ret) {
            return false;
        }

        unit.dispose();

        return true;
    }
}