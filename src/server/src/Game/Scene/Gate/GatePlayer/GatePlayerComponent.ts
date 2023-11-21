import { CoroutineLock } from "../../../../../../common/CoroutineLock/CoroutineLock";
import { Entity } from "../../../../../../common/Entity/Entity";
import { EventSystem } from "../../../../../../common/EventSystem/EventSystem";
import { LockTypeCore } from "../../../CoroutineLock/LockTypeCore";
import { DBHelper } from "../../../../Module/DB/DBHelper";
import { AfterCreateGatePlayer } from "../../../Event/EventTypeCore";
import { GatePlayer } from "./GatePlayer";
import { PlayerSessionComponent } from "./PlayerSessionComponent";
import { GatePlayerUnitComponent } from "./GatePlayerUnitComponent";
import { ErrorCore } from "../../../../../../common/Network/ErrorCore";

/**
 * GatePlayer的父节点
 */
export class GatePlayerComponent extends Entity {
    private _accountPlayers: Map<string, GatePlayer> = new Map();

    async getPlayer(account: string): Promise<GatePlayer> {
        let lock = await CoroutineLock.getInst().wait(LockTypeCore.GetGatePlayer, account)
        try {
            let player = this._accountPlayers.get(account);

            // 不在线 得从数据库拿
            if (!player) {
                let [err, result] = await DBHelper.query(GatePlayer, account);
                
                if (err != ErrorCore.ERR_Success) {
                    return null;
                }

                player = result;
            } else { // 在线 且拿到了 直接返回
                return player;
            }

            // 数据库也没有 则创建一个
            if (!player) {
                player = this.addChild(GatePlayer).init(account);
                await EventSystem.getInst().publishAsync(this.domainScene(), AfterCreateGatePlayer.create({ player: player }));
            } else { // 有的话 给他添加父节点
                this.addChild(player);
            }

            player.addComponent(PlayerSessionComponent);
            player.addComponent(GatePlayerUnitComponent);

            this._accountPlayers.set(account, player);
            return player;
        } finally {
            lock.dispose();
        }
    }

    removePlayer(account: string) {
        this._accountPlayers.delete(account);
    }
}