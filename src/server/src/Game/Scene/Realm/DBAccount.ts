import { DBWithKey } from "../../../../../common/Decorator/Decorators/DBWithKey"

/**
 * 玩家账号
 */
@DBWithKey('account', false, 1000)
export class DBAccount {
    public account: string
    public password: string
}