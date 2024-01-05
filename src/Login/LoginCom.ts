import { Entity } from "../Core/Core";
import { ILoginExecutor } from "./ILoginExecutor";

export class LoginCom extends Entity{
    private _loginExecutor: ILoginExecutor;
    private _loginArgs: any;

    /**
     * 是否登录了gate
     */
    private _isLogin: boolean = false;

    /**
     * 是否正在重连
     */
    private _isReconnecting: boolean = false;
    
    /**
     * 重新登录最大尝试次数
     */
    private _reLoginTryMaxCount: number = 3;

    registerExecutor(loginExecutor: ILoginExecutor) {
        this._loginExecutor = loginExecutor;
    }

    async login(args: any): Promise<number> {
        const err = await this._loginExecutor.login(this.domainScene(), args);

        if(err == 0){
            this._isLogin = true;
            this._loginArgs = args;
        }

        return err;
    }
}