import { Session } from "../../../../common/Message/Session";
import { ErrorCore } from "../../../../common/Network/ErrorCore";
import { MailBoxComponent } from "../Actor/MailBoxComponent";
import { ActorLocationMsgHelper } from "../ActorLocation/ActorLocationMsgHelper";
import { LocationProxyComponent } from "../ActorLocation/LocationProxyComponent";
import { DBHelper } from "../DB/DBHelper";
import { SessionDisconnectUnitCom } from "../Session/SessionDisconnectUnitCom";
import { Unit } from "./Unit";
import { UnitGateComponent } from "./UnitGateComponent";
import { UnitRefComponent } from "./UnitRefComponent";
import { G2M_ConnectUnit, G2M_DisconnectUnit, M2G_ConnectUnit, M2G_DisconnectUnit } from "../../Game/Message/InnerMessageCore/InnerMessageCore";
import { GateMapComponent } from "../../Game/Scene/Gate/GateMapComponent";
import { GatePlayerHelper } from "../../Game/Scene/Gate/GatePlayer/GatePlayerHelper";
import { GatePlayerUnitComponent } from "../../Game/Scene/Gate/GatePlayer/GatePlayerUnitComponent";
import { EventSystem } from "../../../../common/EventSystem/EventSystem";
import { AfterConnectUnit } from "../../Game/Event/EventTypeCore";
import { DEVELOP } from "../../../../common/Macro";
import { coreLog } from "../../../../common/Core/Logger/CoreLogHelper";
import { LockTypeCore } from "../../Game/CoroutineLock/LockTypeCore";
import { CoroutineLock } from "../../../../common/CoroutineLock/CoroutineLock";
import { UnitDisconnectHelper } from "./UnitDisconnectHelper";
import { ActorLocationSenderComponent } from "../ActorLocation/ActorLocationSenderComponent";

export class UnitConnectHelper {
    /**
     * 连接unit
     * 如果unit在gatemap返回unit
     * @param session 
     * @param unitId 
     * @returns
     */
    static async connect(session: Session, unitId: number): Promise<[number, Unit]> {
        let lock = await CoroutineLock.getInst().wait(LockTypeCore.UnitConnect, unitId.toString());
        try {
            coreLog(`[连接unit][getUnitInstanceId start] unitId=${unitId}`)
            let unitInstanceId = await this.getUnitInstanceId(unitId);
            coreLog(`[连接unit][getUnitInstanceId end] unitId=${unitId} unitInstanceId=${unitInstanceId}`)
            let unit: Unit;

            // unit不在线 从数据库加载
            if (unitInstanceId == 0) {
                let [err, result] = await this.loadFromDB(session, unitId);

                if (err != ErrorCore.ERR_Success) {
                    return [err, null];
                }

                unit = result;

                if (session.isDisposed) {
                    unit.addComponent(UnitRefComponent).subRef();
                    return [ErrorCore.ERR_SessionDisposed, null];
                }
            } else {
                // unit在线 通知unit连接
                let sessionInstanceId = session.instanceId;
                coreLog(`[连接unit][发送G2M_ConnectUnit start] unitId=${unitId}`);
                let response = await ActorLocationMsgHelper.call(unitId, new G2M_ConnectUnit({
                    sessionInstanceId: sessionInstanceId
                }), M2G_ConnectUnit);

                // 连接不成功 上层可以再次尝试连接
                if (response.error != ErrorCore.ERR_Success) {
                    return [response.error, null];
                }

                coreLog(`[连接unit][发送G2M_ConnectUnit end] unitId=${unitId}, error=${response.error}`);

                // session销毁了 重新通知unit断开连接
                if (session.isDisposed) {
                    // unit应该做长时间不通信自动下线的机制
                    await UnitDisconnectHelper.sendDisconnectMsg(unitId, sessionInstanceId);
                    return [ErrorCore.ERR_SessionDisposed, null];
                }

                // // 连接不成功, 可能unit下线了, 再次从数据库加载
                // if (response.error != ErrorCore.ERR_Success) {
                //     let [err, ] = await this.loadFromDB(session, unitId);
                //     unit = await this.loadFromDB(session, unitId);
                //     if (session.isDisposed) {
                //         unit.addComponent(UnitRefComponent).subRef();
                //         return;
                //     }
                // } else {
                //     coreLog(`unit in map, dont need load from db unitId=${unitId}`);
                // }
            }

            /**
             * 连接完成后, 如果session断开, 通知unit断开连接
             */
            session.addComponent(SessionDisconnectUnitCom).init(session.instanceId, unitId);

            // 设置gatePlayer连接的unitId
            let gatePlayer = GatePlayerHelper.getGatePlayerFromSession(session);
            gatePlayer.getComponent(GatePlayerUnitComponent).unitId = unitId;

            EventSystem.getInst().publish(session.domainScene(), AfterConnectUnit.create({ unitId: unitId, session: session }));

            return [ErrorCore.ERR_Success, unit];
        } finally {
            lock.dispose();
        }
    }

    /**
     * 返回所在scene的instanceId
     * @param session 
     * @param unitId 
     * @returns 
     */
    private static async loadFromDB(session: Session, unitId: number): Promise<[number, Unit | null]> {
        let [err, result] = await DBHelper.query(Unit, unitId);

        if (err != ErrorCore.ERR_Success) {
            return [err, null];
        }

        if (result == null) {
            [ErrorCore.Login_UnitNotExist, null]
        }

        let unit = result;

        // 加载途中session断开了 直接抛弃这个unit
        if (session.isDisposed) {
            return [ErrorCore.ERR_SessionDisposed, null];
        }

        let gateMapCom = session.domainScene().getComponent(GateMapComponent);
        gateMapCom.addUnit(unit);
        // 注册位置服务
        await LocationProxyComponent.inst.add(unit.id, unit.instanceId);

        // 移除掉以前的actorLocationSender
        ActorLocationSenderComponent.inst.remove(unit.id);

        // 加载途中session断开了 移除掉这个unit
        if (session.isDisposed) {
            await LocationProxyComponent.inst.remove(unit.id);
            unit.dispose();
            return [ErrorCore.ERR_SessionDisposed, null];
        }

        unit.addComponent(UnitGateComponent).setSessionActorId(session.instanceId);
        unit.addComponent(MailBoxComponent);
        unit.addComponent(UnitRefComponent).addRef();

        return [ErrorCore.ERR_Success, unit];
    }


    private static async getUnitInstanceId(unitId: number) {
        let instanceId = await LocationProxyComponent.inst.get(unitId);

        return instanceId;
    }
}