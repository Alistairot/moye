import { Scene } from "../../../../common/Entity/Scene";
import { IMessage } from "../../../../common/Message/IMessage";
import { ActorMsgHelper } from "../Actor/ActorMsgHelper";
import { Unit } from "./Unit";
import { UnitComponent } from "./UnitComponent";
import { UnitGateComponent } from "./UnitGateComponent";

export class UnitMsgHelper {
    /**
     * 发给客户端
     * @param unit 
     * @param message 
     */
    static sendToClient(unit: Unit, message: IMessage) {
        let gateSessionActorId = unit.getComponent(UnitGateComponent).gateSessionActorId;

        // 与session断开了 就不用发了
        if (gateSessionActorId == 0) {
            return
        }

        ActorMsgHelper.send(gateSessionActorId, message);
    }

    /**
     * 广播消息
     * @param mapScene 
     * @param message 
     */
    static broadcast(mapScene: Scene, message: IMessage) {
        let unitComponent = mapScene.getComponent(UnitComponent)

        for (const [_, unit] of unitComponent.children) {
            this.sendToClient(unit, message)
        }
    }

    /**
     * 排除某个unitId的广播
     * @param mapScene 
     * @param message 
     * @param exceptUnitId 
     */
    static broadcastExcept(mapScene: Scene, message: IMessage, exceptUnitId: number) {
        let unitComponent = mapScene.getComponent(UnitComponent)

        for (const [_, unit] of unitComponent.children) {
            if (unit.id == exceptUnitId) {
                continue
            }

            this.sendToClient(unit, message)
        }
    }
}