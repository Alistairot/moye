import { coreLog } from "../../../../../common/Core/Logger/CoreLogHelper"
import { ActorMessageHandlerDecorator } from "../../../Module/Actor/ActorMessageHandlerDecorator"
import { AMActorLocationRpcHandler } from "../../../Module/ActorLocation/AMActorLocationRpcHandler"
import { SceneTypeCore } from "../../../Module/Scene/SceneTypeCore"
import { Unit } from "../../../Module/Unit/Unit"
import { UnitGateComponent } from "../../../Module/Unit/UnitGateComponent"
import { UnitRefComponent } from "../../../Module/Unit/UnitRefComponent"
import { G2M_ConnectUnit, M2G_ConnectUnit } from "../../Message/InnerMessageCore/InnerMessageCore"

@ActorMessageHandlerDecorator(G2M_ConnectUnit, SceneTypeCore.Map, M2G_ConnectUnit)
export class G2M_ConnectUnitHandler extends AMActorLocationRpcHandler<G2M_ConnectUnit, M2G_ConnectUnit>
{
    protected async run(unit: Unit, request: G2M_ConnectUnit, response: M2G_ConnectUnit) {
        coreLog(`请求连接在map的unit, unitId=${unit.id}}`)
        // 这样就更新了对应的session,从而可以在mapscene下发消息给客户端
        unit.getComponent(UnitGateComponent).setSessionActorId(request.sessionInstanceId);
        unit.getComponent(UnitRefComponent).addRef();

        response.sceneInstanceId = unit.domainScene().instanceId;
    }
}