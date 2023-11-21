import { Root } from "../../../../../common/Entity/Root";
import { Session } from "../../../../../common/Message/Session";
import { SocketCloseCode } from "../../../../../common/Network/SocketCloseCode";
import { DBHelper } from "../../../Module/DB/DBHelper";
import { Unit } from "../../../Module/Unit/Unit";
import { GatePlayer } from "./GatePlayer/GatePlayer";
import { PlayerSessionComponent } from "./GatePlayer/PlayerSessionComponent";

export class LoginHelper {
    /**
     * 踢掉上一个session 用新的session
     * 既是踢掉上一个session，又是设置新的session
     * @param player 
     */
    static kickSession(player: GatePlayer, newSession: Session) {
        let playerSessionCom = player.getComponent(PlayerSessionComponent);
        let oldSessionInstanceId = playerSessionCom.sessionInstanceId;

        playerSessionCom.sessionInstanceId = newSession.instanceId;

        if (oldSessionInstanceId == null) {
            return;
        }

        let oldSession = Root.getInst().get(oldSessionInstanceId) as Session;

        if(oldSession == null){
            return;
        }

        if(oldSession.isDisposed){
            return;
        }
        
        oldSession.Error = SocketCloseCode.OtherLogin;
        oldSession.dispose();
    }
}