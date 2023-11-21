import { CoroutineLock } from "../../../../../common/CoroutineLock/CoroutineLock";
import { DecoratorTypeCore } from "../../../../../common/Decorator/DecoratorTypeCore";
import { FlagMgr } from "../../../../../common/Decorator/FlagMgr";
import { coreError, coreLog, coreWarn } from "../../../../../common/Core/Logger/CoreLogHelper";
import { DEVELOP } from "../../../../../common/Macro";
import { Session } from "../../../../../common/Message/Session";
import { ActorMsgHelper } from "../../../Module/Actor/ActorMsgHelper";
import { LocationProxyComponent } from "../../../Module/ActorLocation/LocationProxyComponent";
import { ProcessMgr } from "../../../Module/Process/ProcessMgr";
import { ObjectSerializeMgr } from "../../../Module/Serialize/ObjectSerializeMgr";
import { Unit } from "../../../Module/Unit/Unit";
import { UnitComponent } from "../../../Module/Unit/UnitComponent";
import { LockTypeCore } from "../../CoroutineLock/LockTypeCore";
import { M2M_UnitTransferRequest } from "../../Message/InnerMessageCore/InnerMessageCore";
import { GateMapComponent } from "../Gate/GateMapComponent";

export class TransferHelper {
    /**
     * 弃用
     * 当unit在gateMap的时候用这个传送
     * 在Map里面的话就不能用这个了
     * @param session 
     * @param unitId 
     * @param sceneInstanceId 
     */
    // static transferBySession(session: Session, unitId: number, sceneInstanceId: number) {
    //     let gateMapCom = session.domainScene().getComponent(GateMapComponent);
    //     let unitCom = gateMapCom.getComponent(UnitComponent);
    //     let unit = unitCom.get(unitId);

    //     if (unit == null) {
    //         coreError("unit is null");
    //         return;
    //     }

    //     this.transfer(unit, sceneInstanceId);
    // }

    // /**
    //  * 不在gate上的时候 如果消息需要回应的话用这个
    //  * 等消息回应完了再传送 不然会找不到unit
    //  * 不要await这个函数
    //  * @param unit 
    //  * @param sceneInstanceId 
    //  */
    // static async transferAtFrameFinish(unit: Unit, sceneInstanceId: number){
    //     await Game.waitFrameFinish();
    //     await this.transfer(unit, sceneInstanceId);
    // }

    static async transfer(unit: Unit, sceneInstanceId: number) {
        if (unit.isDisposed) {
            return
        }

        let lock = await CoroutineLock.getInst().wait(LockTypeCore.Transfer, unit.id.toString());
        try {
            if (unit.isDisposed) {
                return
            }

            let time1: number;

            if (DEVELOP) {
                time1 = Date.now();
            }

            // location加锁
            let unitId = unit.id;
            let unitInstanceId = unit.instanceId;
            let request = new M2M_UnitTransferRequest();

            request.oldInstanceId = unitInstanceId;

            let isSameMachine = ProcessMgr.getInst().actorIdIsInMachine(sceneInstanceId);
            let serializeMgr = ObjectSerializeMgr.getInst();

            // request.unit = SerializeMgr.getInst().serializeToUint8Array(unit);
            if (isSameMachine) {
                request.unit = serializeMgr.serializeSameMachine(unit);
            } else {
                request.unit = serializeMgr.serialize(unit);
            }

            let flagMgr = FlagMgr.getInst();

            if (isSameMachine) {
                // 所有传送组件
                for (let [_, entity] of unit.components) {
                    if (flagMgr.hasFlag(DecoratorTypeCore.Transfer, entity.getType())) {
                        let bytes = serializeMgr.serializeSameMachine(entity);
                        request.entitys.push(bytes);
                    }
                }
            } else {
                for (let [_, entity] of unit.components) {
                    if (flagMgr.hasFlag(DecoratorTypeCore.Transfer, entity.getType())) {
                        let bytes = serializeMgr.serialize(entity);
                        request.entitys.push(bytes);
                    }
                }
            }


            if (DEVELOP) {
                let time2 = Date.now();
                let cost = time2 - time1;

                if (cost > 1) {
                    coreWarn(`transfer serialize cost time=${cost}ms, 请考虑优化!`)
                }
            }

            unit.dispose();

            coreLog(`unit开始传送, unitId=${unitId}`);

            await LocationProxyComponent.inst.lock(unitId, unitInstanceId);
            await ActorMsgHelper.call(sceneInstanceId, request);
        } finally {
            lock.dispose();
        }
    }
}