import { Entity } from "../../../../../common/Entity/Entity";
import { GatePlayer } from "./GatePlayer/GatePlayer";
import { GatePlayerComponent } from "./GatePlayer/GatePlayerComponent";
import { GatePlayerHelper } from "./GatePlayer/GatePlayerHelper";

/**
 * 每当有一个session连接gate，就添加这个组件给session，用于引用GatePlayer
 * 当session断开时，就销毁这个组件，用于解除引用
 * 这样GatePlayer在有引用的时候就不会被销毁
 */
export class SessionGatePlayerRefCom extends Entity {
    private _gatePlayerId: number

    init(gatePlayer: GatePlayer) {
        this._gatePlayerId = gatePlayer.id;

        GatePlayerHelper.addRef(gatePlayer);
    }

    destroy() {
        let gatePlayer = this.domainScene().getComponent(GatePlayerComponent).getChild(GatePlayer, this._gatePlayerId);

        GatePlayerHelper.subRef(gatePlayer);
    }
}