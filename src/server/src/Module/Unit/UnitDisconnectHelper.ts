import { Scene } from "../../../../common/Entity/Scene";
import { EventSystem } from "../../../../common/EventSystem/EventSystem";
import { coreLog } from "../../../../common/Core/Logger/CoreLogHelper";
import { AfterDisconnectUnit } from "../../Game/Event/EventTypeCore";
import { G2M_DisconnectUnit, M2G_DisconnectUnit } from "../../Game/Message/InnerMessageCore/InnerMessageCore";
import { ActorLocationMsgHelper } from "../ActorLocation/ActorLocationMsgHelper";

/**
 * 断开与unit的连接
 */
export class UnitDisconnectHelper {
    static async disconnect(unitId: number, sessionInstanceId: number, gateScene: Scene) {
        let response = await this.sendDisconnectMsg(unitId, sessionInstanceId);

        EventSystem.getInst().publish(gateScene, AfterDisconnectUnit.create({ unitId: unitId }));
    }

    static async sendDisconnectMsg(unitId: number, sessionInstanceId: number): Promise<M2G_DisconnectUnit> {
        coreLog(`[断开unit连接][G2M_DisconnectUnit start],unitid=${unitId}`)

        let response = await ActorLocationMsgHelper.call(unitId, new G2M_DisconnectUnit({
            sessionInstanceId: sessionInstanceId
        }), M2G_DisconnectUnit);

        coreLog(`[断开unit连接][G2M_DisconnectUnit end],unitid=${unitId}, error=${response.error}`)

        return response;
    }
}