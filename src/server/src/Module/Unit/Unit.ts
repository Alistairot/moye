import { DBWithKey } from "../../../../common/Decorator/Decorators/DBWithKey";
import { Entity } from "../../../../common/Entity/Entity";

/**
 * 代表着玩家的一个实体
 * 也就是一个Unit代表一个客户端
 * 比如玩家登录 进入gate,那么unit就添加在gate上，进入map那么unit就会传送到map上
 */
@DBWithKey('id', true, 1000)
export class Unit extends Entity {
}