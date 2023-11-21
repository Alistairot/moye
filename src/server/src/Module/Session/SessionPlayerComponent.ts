import { Entity } from "../../../../common/Entity/Entity";

/**
 * 挂在session上保存GatePlayerId
 * 这样就可以找到session对应的GatePlayer
 */
export class SessionPlayerComponent extends Entity {
    private _playerId: number

    get playerId(): number {
        return this._playerId;
    }

    init(playerId: number) {
        this._playerId = playerId;
        return this;
    }
}