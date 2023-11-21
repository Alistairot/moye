import { coreLog, coreWarn } from "../../../../../common/Core/Logger/CoreLogHelper"
import { ActorMessageHandlerDecorator } from "../../../Module/Actor/ActorMessageHandlerDecorator"
import { AMActorLocationRpcHandler } from "../../../Module/ActorLocation/AMActorLocationRpcHandler"
import { SceneTypeCore } from "../../../Module/Scene/SceneTypeCore"
import { Unit } from "../../../Module/Unit/Unit"
import { UnitGateComponent } from "../../../Module/Unit/UnitGateComponent"
import { UnitRefComponent } from "../../../Module/Unit/UnitRefComponent"
import { G2M_DisconnectUnit, M2G_DisconnectUnit } from "../../Message/InnerMessageCore/InnerMessageCore"

/**
 * session被销毁就会发送消息与unit断开连接
 */
@ActorMessageHandlerDecorator(G2M_DisconnectUnit, SceneTypeCore.Map, M2G_DisconnectUnit)
export class G2M_DisconnectUnitHandler extends AMActorLocationRpcHandler<G2M_DisconnectUnit, M2G_DisconnectUnit>
{
    protected async run(unit: Unit, request: G2M_DisconnectUnit, response: M2G_DisconnectUnit) {
        coreLog(`收到G2M_DisconnectUnit, unitId=${unit.id}`);
        let unitGateCom = unit.getComponent(UnitGateComponent);

        unit.getComponent(UnitRefComponent).subRef();

        if(unitGateCom.gateSessionActorId != request.sessionInstanceId) {
            coreWarn(`sessionInstanceId不匹配, unitId=${unit.id}, sessionInstanceId=${request.sessionInstanceId}, unitGateCom.gateSessionActorId=${unitGateCom.gateSessionActorId}`)
            return;
        }

        unitGateCom.setSessionActorId(0);
    }
}