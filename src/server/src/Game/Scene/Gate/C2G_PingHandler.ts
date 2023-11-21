import { Session } from "../../../../../common/Message/Session";
import { TimeHelper } from "../../../../../common/Core/Time/TimeHelper";
import { AMRpcHandler } from "../../../Module/Message/AMRpcHandler";
import { MessageHandlerDecorator } from "../../../Module/Message/MessageHandlerDecorator";
import { SceneTypeCore } from "../../../Module/Scene/SceneTypeCore";
import { C2G_Ping, G2C_Ping } from "../../Message/OuterMessageCore/OuterMessageCore";

@MessageHandlerDecorator(C2G_Ping, SceneTypeCore.Gate, G2C_Ping)
export class C2G_PingHandler extends AMRpcHandler<C2G_Ping, G2C_Ping>
{
    protected async run(session: Session, request: C2G_Ping, response: G2C_Ping) {
        response.time = TimeHelper.serverNow();
    }
}