import { CoroutineLock } from "../../../../../common/CoroutineLock/CoroutineLock";
import { coreLog } from "../../../../../common/Core/Logger/CoreLogHelper";
import { Session } from "../../../../../common/Message/Session";
import { ErrorCore } from "../../../../../common/Network/ErrorCore";
import { ActorMsgHelper } from "../../../Module/Actor/ActorMsgHelper";
import { DBHelper } from "../../../Module/DB/DBHelper";
import { AMRpcHandler } from "../../../Module/Message/AMRpcHandler";
import { MessageHandlerDecorator } from "../../../Module/Message/MessageHandlerDecorator";
import { SceneTypeCore } from "../../../Module/Scene/SceneTypeCore";
import { LockTypeCore } from "../../CoroutineLock/LockTypeCore";
import { R2G_GetLoginKey, G2R_GetLoginKey } from "../../Message/InnerMessageCore/InnerMessageCore";
import { C2R_Login, R2C_Login } from "../../Message/OuterMessageCore/OuterMessageCore";
import { DBAccount } from "./DBAccount";
import { LoginMgr } from "./LoginMgr";
import { RealmGateAddressHelper } from "./RealmGateAddressHelper";

@MessageHandlerDecorator(C2R_Login, SceneTypeCore.Realm, R2C_Login)
export class C2R_LoginHandler extends AMRpcHandler<C2R_Login, R2C_Login>{
    protected async run(session: Session, request: C2R_Login, response: R2C_Login) {
        // 检查账号密码
        let lock = await CoroutineLock.getInst().wait(LockTypeCore.CheckAccount, request.account);
        try {
            let ret = await this.checkAccount(session, request, response);

            if (ret != ErrorCore.ERR_Success) {
                response.error = ret;
                return;
            }

            let config = RealmGateAddressHelper.getGate(request.account);

            // 向gate请求一个key,客户端可以拿着这个key连接gate
            let g2rGetLoginKey = await ActorMsgHelper.call(config.instanceId, new R2G_GetLoginKey({
                account: request.account,
            }), G2R_GetLoginKey);

            if(g2rGetLoginKey.error != ErrorCore.ERR_Success){
                response.error = g2rGetLoginKey.error;
                return;
            }

            response.key = g2rGetLoginKey.key;
            response.address = config.outerAddress.toString();
        } finally {
            lock.dispose();
        }
    }

    private async checkAccount(session: Session, request: C2R_Login, response: R2C_Login): Promise<number> {
        let loginMgr = LoginMgr.getInst();
        let errorCode = loginMgr.checkAccount(request.account, request.password);

        if (errorCode != ErrorCore.ERR_Success) {
            return errorCode
        }

        let [err, result] = await DBHelper.query(DBAccount, request.account)

        if(err != ErrorCore.ERR_Success){
            return err;
        }

        let dbAccount = result;

        // 账号不存在,则创建账号
        if (loginMgr.getCreateNotExistAccount()) {
            if (dbAccount == null) {
                dbAccount = new DBAccount()
                dbAccount.account = request.account
                dbAccount.password = request.password

                let ret = await DBHelper.save(dbAccount);

                if(!ret){
                    return ErrorCore.ERR_ActorTimeout;
                }

                return ErrorCore.ERR_Success;
            }
        }

        if (!dbAccount) {
            return ErrorCore.Login_AccountNotExist
        }

        if (dbAccount.password != request.password) {
            return ErrorCore.Login_PasswordError
        }

        return ErrorCore.ERR_Success;
    }
}