import { Entity } from "../../../../common/Entity/Entity";
import { IPEndPoint } from "../../../../common/Network/IPEndPoint";
import { C2G_LoginGate, C2R_Login, G2C_LoginGate, R2C_Login } from "../Message/OuterMessageCore/OuterMessageCore";
import { NetClientComponent } from "../../Module/Network/NetClientComponent";
import { ErrorCore } from "../../../../common/Network/ErrorCore";
import { SessionComponent } from "../../Module/Network/SessionComponent";
import { PingComponent } from "../../Module/Network/PingComponent";
import { NetServices } from "../../../../common/Network/NetServices";
import { EventSystem } from "../../../../common/EventSystem/EventSystem";
import { ReLoginEvent } from "../Event/EventTypeCore";
import { ReLoginState } from "./ReLoginState";
import { coreLog } from "../../../../common/Core/Logger/CoreLogHelper";
import { TimerMgr } from "../../../../common/Timer/TimerMgr";
import { SocketCloseCode } from "../../../../common/Network/SocketCloseCode";

export class LoginComponent extends Entity {
    account: string;
    password: string;
    address: string;
    /**
     * 是否登录了gate
     */
    isLogin: boolean = false;

    /**
     * 是否正在重连
     */
    isReconnecting: boolean = false;

    /**
     * 重新登录最大尝试次数
     */
    private _reLoginTryMaxCount: number = 3;

    awake(): void {
    }

    onNetError(channelId: number, error: number) {
        // 连gate都没登录 不触发重连
        if (!this.isLogin) {
            return;
        }

        let sessionComponent = this.domainScene().getComponent(SessionComponent);

        // 不是gate的连接 不用管
        if(channelId != sessionComponent.session.id){
            return;
        }

        if(error == SocketCloseCode.OtherLogin){
            coreLog(`其他地方登录，不重连`);
            return;
        }else if(error == SocketCloseCode.WChannelReadError){
            coreLog(`发送消息有问题，不重连`);
            return;
        }

        this.isLogin = false;

        this.tryReLogin();
    }

    async login(account: string, password: string, address: string): Promise<number> {
        let clientScene = this.domainScene();
        let netClientCom = clientScene.getComponent(NetClientComponent);
        let realmSession = netClientCom.Create(new IPEndPoint(address));
        let r2cLogin = (await realmSession.Call(new C2R_Login({ account: account, password: password }))) as R2C_Login;
        realmSession.dispose();

        if (r2cLogin == null) {
            return ErrorCore.Login_ConnectRealmFailed;
        }

        if(r2cLogin.error != ErrorCore.ERR_Success){
            return r2cLogin.error;
        }

        let gateSession = netClientCom.Create(new IPEndPoint(r2cLogin.address))
        let g2cLoginGate = (await gateSession.Call(new C2G_LoginGate({ key: r2cLogin.key }))) as G2C_LoginGate;

        if (g2cLoginGate == null) {
            return ErrorCore.Login_ConnectGateFailed;
        }

        if(g2cLoginGate.error != ErrorCore.ERR_Success){
            return g2cLoginGate.error;
        }

        let sessionComponent = clientScene.getComponent(SessionComponent);

        gateSession.addComponent(PingComponent);
        sessionComponent.session = gateSession;

        this.isLogin = true;
        this.account = account;
        this.password = password;
        this.address = address;

        return ErrorCore.ERR_Success;
    }

    private async tryReLogin() {
        if (this.isReconnecting) {
            coreLog(`正在重连中，不重复重连`);
            return;
        }

        this.isReconnecting = true;

        coreLog(`开始尝试重新登录`);
        for (let i = 0; i < this._reLoginTryMaxCount; i++) {
            coreLog(`尝试重新登录 ${i + 1}/${this._reLoginTryMaxCount}`);
            let result = await this.reLogin();

            if (result) {
                coreLog(`重新登录成功`);
                this.isReconnecting = false;
                return;
            }else{
                coreLog(`重新登录失败, 等待500ms后重试`)
                await TimerMgr.getInst().waitAsync(500)
            }
        }

        this.isReconnecting = false;
        coreLog(`重新登录失败 不再自动重连`);
    }

    /**
     * 重新登录
     * 一般是网络断开重新连接
     */
    private async reLogin(): Promise<boolean> {
        EventSystem.getInst().publish(this.domainScene(), ReLoginEvent.create({ state: ReLoginState.Start }));

        let error = await this.login(this.account, this.password, this.address);

        if (error == ErrorCore.ERR_Success) {
            EventSystem.getInst().publish(this.domainScene(), ReLoginEvent.create({ state: ReLoginState.Success }));
            return true;
        } else {
            EventSystem.getInst().publish(this.domainScene(), ReLoginEvent.create({ state: ReLoginState.Failed }));
            return false;
        }
    }
}