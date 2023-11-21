import { Entity } from "../../../../../../common/Entity/Entity";

/**
 * 挂在GatePlayer上保存sessionId
 * 这样如果有新的session连接gate，就可以销毁上一个session了
 * 这样就不会出现一个账号多个session的情况
 */
export class PlayerSessionComponent extends Entity{
    public sessionInstanceId: number
}