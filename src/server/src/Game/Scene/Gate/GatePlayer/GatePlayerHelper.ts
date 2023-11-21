import { coreLog } from "../../../../../../common/Core/Logger/CoreLogHelper";
import { DEVELOP } from "../../../../../../common/Macro";
import { Session } from "../../../../../../common/Message/Session";
import { TimerMgr } from "../../../../../../common/Timer/TimerMgr";
import { DBHelper } from "../../../../Module/DB/DBHelper";
import { SessionPlayerComponent } from "../../../../Module/Session/SessionPlayerComponent";
import { GatePlayer } from "./GatePlayer";
import { GatePlayerComponent } from "./GatePlayerComponent";
import { GatePlayerUnitComponent } from "./GatePlayerUnitComponent";

export class GatePlayerHelper {
    /**
     * 通过session获取GatePlayer
     * @param session 
     * @returns 
     */
    static getGatePlayerFromSession(session: Session): GatePlayer {
        let playerComponent = session.domainScene().getComponent(GatePlayerComponent);
        let gatePlayerId = session.getComponent(SessionPlayerComponent).playerId;
        let gatePlayer = playerComponent.getChild(GatePlayer, gatePlayerId);

        return gatePlayer;
    }

    /**
     * 只有在连接unit成功后才会有unitId
     * @param session 
     * @returns 
     */
    static getUnitIdFromSession(session: Session): number {
        let gatePlayer = this.getGatePlayerFromSession(session);

        return gatePlayer.getComponent(GatePlayerUnitComponent).unitId;
    }

    /**
     * 给GatePlayer添加引用
     * @param gatePlayer 
     */
    static addRef(gatePlayer: GatePlayer) {
        gatePlayer.ref++;

        coreLog('GatePlayerHelper addRef: ref={0}', gatePlayer.ref);
    }

    /**
     * 给GatePlayer减少引用
     * @param gatePlayer
     * @returns
     */
    static subRef(gatePlayer: GatePlayer) {
        gatePlayer.ref--;

        coreLog('GatePlayerHelper subRef: ref={0}', gatePlayer.ref);

        this.tryRemoveGatePlayer(gatePlayer);
    }


    private static async tryRemoveGatePlayer(gatePlayer: GatePlayer) {
        if(gatePlayer.isDisposed){
            return;
        }

        if (gatePlayer.ref > 0) {
            return;
        }

        let ret = await DBHelper.save(gatePlayer);

        if(!ret){
            await TimerMgr.getInst().waitAsync(10 * 1000);
            this.tryRemoveGatePlayer(gatePlayer);
            return;
        }

        if(gatePlayer.isDisposed){
            return;
        }

        // 存数据库途中 又有新的session引用了
        if (gatePlayer.ref > 0) {
            return;
        }

        if(DEVELOP){
            coreLog(`GatePlayer ${gatePlayer.account} 被销毁`);
        }

        gatePlayer.getParent(GatePlayerComponent).removePlayer(gatePlayer.account);
        gatePlayer.dispose();
    }
}