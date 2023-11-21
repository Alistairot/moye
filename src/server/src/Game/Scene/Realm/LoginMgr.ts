import { ErrorCore } from "../../../../../common/Network/ErrorCore";
import { Singleton } from "../../../../../common/Core/Singleton/Singleton";
import { IAccountInspector } from "./IAccountInspector";

export class LoginMgr extends Singleton{
    private _accountInspector: IAccountInspector
    /**
     * 创建不存在的账号
     */
    private _createNotExistAccount: boolean

    setAccountInspector(inspector: IAccountInspector){
        this._accountInspector = inspector
    }

    checkAccount(account: string, password: string): number {
        if(this._accountInspector == null){
            return ErrorCore.ERR_Success
        }

        return this._accountInspector.run(account, password)
    }

    setCreateNotExistAccount(create: boolean){
        this._createNotExistAccount = create
    }

    getCreateNotExistAccount(){
        return this._createNotExistAccount
    }
}