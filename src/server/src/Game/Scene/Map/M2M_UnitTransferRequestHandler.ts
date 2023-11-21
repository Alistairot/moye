import { Scene } from "../../../../../common/Entity/Scene";
import { EventSystem } from "../../../../../common/EventSystem/EventSystem";
import { coreLog, coreWarn } from "../../../../../common/Core/Logger/CoreLogHelper";
import { DEVELOP } from "../../../../../common/Macro";
import { AMActorRpcHandler } from "../../../Module/Actor/AMActorRpcHandler";
import { ActorMessageHandlerDecorator } from "../../../Module/Actor/ActorMessageHandlerDecorator";
import { MailBoxComponent } from "../../../Module/Actor/MailBoxComponent";
import { LocationProxyComponent } from "../../../Module/ActorLocation/LocationProxyComponent";
import { ProcessMgr } from "../../../Module/Process/ProcessMgr";
import { SceneTypeCore } from "../../../Module/Scene/SceneTypeCore";
import { ObjectSerializeMgr } from "../../../Module/Serialize/ObjectSerializeMgr";
import { Unit } from "../../../Module/Unit/Unit";
import { UnitComponent } from "../../../Module/Unit/UnitComponent";
import { AfterUnitTransfer } from "../../Event/EventTypeCore";
import { M2M_UnitTransferRequest, M2M_UnitTransferResponse } from "../../Message/InnerMessageCore/InnerMessageCore";

@ActorMessageHandlerDecorator(M2M_UnitTransferRequest, SceneTypeCore.Map, M2M_UnitTransferResponse)
export class M2M_UnitTransferRequestHandler extends AMActorRpcHandler<M2M_UnitTransferRequest, M2M_UnitTransferResponse>{
    protected async run(scene: Scene, request: M2M_UnitTransferRequest, response: M2M_UnitTransferResponse) {
        let unitComponent = scene.getComponent(UnitComponent);
        let time1: number;
        if (DEVELOP) {
            time1 = Date.now();
        }
        let serializeMgr = ObjectSerializeMgr.getInst();
        let unit: Unit;
        let isSameMachine = ProcessMgr.getInst().processIdIsInMachine(this._fromProcess);

        if (isSameMachine) {
            unit = serializeMgr.deserializeSameMachine(request.unit);
            unitComponent.addChild(unit);
            for (let bytes of request.entitys) {
                unit.addComponent(serializeMgr.deserializeSameMachine(bytes));
            }
        } else {
            unit = serializeMgr.deserialize(request.unit);
            unitComponent.addChild(unit);
            for (let bytes of request.entitys) {
                unit.addComponent(serializeMgr.deserialize(bytes));
            }
        }

        if (DEVELOP) {
            let cost = Date.now() - time1;

            if (cost > 1) {
                coreWarn(`transfer deserialize cost time=${cost}ms, 请考虑优化!`)
            }
        }

        unit.addComponent(MailBoxComponent);

        // 解锁location，可以接收发给Unit的消息
        await LocationProxyComponent.inst.unLock(unit.id, request.oldInstanceId, unit.instanceId);

        coreLog(`unit传送完成, unitId=${unit.id}`);

        EventSystem.getInst().publish(scene, AfterUnitTransfer.create({ unit: unit }));
    }
}