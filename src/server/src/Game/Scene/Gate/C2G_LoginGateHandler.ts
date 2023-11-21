import { CoroutineLock } from "../../../../../common/CoroutineLock/CoroutineLock";
import { coreLog, coreWarn } from "../../../../../common/Core/Logger/CoreLogHelper";
import { Session } from "../../../../../common/Message/Session";
import { ErrorCore } from "../../../../../common/Network/ErrorCore";
import { MailBoxComponent } from "../../../Module/Actor/MailBoxComponent";
import { MailboxType } from "../../../Module/Actor/MailboxType";
import { AMRpcHandler } from "../../../Module/Message/AMRpcHandler";
import { MessageHandlerDecorator } from "../../../Module/Message/MessageHandlerDecorator";
import { SessionAcceptTimeoutComponent } from "../../../Module/Message/SessionAcceptTimeoutComponent";
import { SceneTypeCore } from "../../../Module/Scene/SceneTypeCore";
import { SessionPlayerComponent } from "../../../Module/Session/SessionPlayerComponent";
import { LockTypeCore } from "../../CoroutineLock/LockTypeCore";
import { C2G_LoginGate, G2C_LoginGate } from "../../Message/OuterMessageCore/OuterMessageCore";
import { GatePlayerComponent } from "./GatePlayer/GatePlayerComponent";
import { GatePlayerHelper } from "./GatePlayer/GatePlayerHelper";
import { GateSessionKeyComponent } from "./GateSessionKeyComponent";
import { LoginHelper } from "./LoginHelper";
import { SessionGatePlayerRefCom } from "./SessionGatePlayerRefCom";
import { SessionLoginLockComponent } from "./SessionLoginLockComponent";

@MessageHandlerDecorator(C2G_LoginGate, SceneTypeCore.Gate, G2C_LoginGate)
export class C2G_LoginGateHandler extends AMRpcHandler<C2G_LoginGate, G2C_LoginGate>
{
    protected async run(session: Session, request: C2G_LoginGate, response: G2C_LoginGate) {
        let scene = session.domainScene();
        let account = scene.getComponent(GateSessionKeyComponent).getAccount(request.key);

        if (account == null) {
            response.error = ErrorCore.ERR_ConnectGateKeyError;
            response.message = "Gate key验证失败!";
            return;
        }

        session.removeComponent(SessionAcceptTimeoutComponent);

        if (session.getComponent(SessionLoginLockComponent)) {
            response.error = ErrorCore.Login_RepeatRequestGate
            coreWarn(`玩家重复发送登录请求 account= ${account}`)
            return
        }

        // 走到这里就已经代表玩家登陆成功了
        session.addComponent(SessionLoginLockComponent);

        let lock = await CoroutineLock.getInst().wait(LockTypeCore.C2G_LoginGate, account);
        try {
            let playerComponent = scene.getComponent(GatePlayerComponent);
            let player = await playerComponent.getPlayer(account);

            if(player == null){
                response.error = ErrorCore.ERR_DBErr;
                return;
            }

            // 回来以后再次判断一下session是否已经被销毁了
            if (session.isDisposed) {
                // 这里先加后减是为了调用gateplayer离线
                GatePlayerHelper.addRef(player);
                GatePlayerHelper.subRef(player);
                return;
            }

            // 先给player添加引用 避免被销毁
            session.addComponent(SessionGatePlayerRefCom).init(player);

            // 踢掉之前的session
            LoginHelper.kickSession(player, session);

            session.addComponent(SessionPlayerComponent).init(player.id);
            // 给session添加一个mailbox 这样就可以接收来自其他scene的消息了
            session.addComponent(MailBoxComponent).init(MailboxType.GateSession);
        } finally {
            lock.dispose();
        }
    }
}