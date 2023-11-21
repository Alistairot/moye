export class ErrorCore {
    static readonly ERR_Success = 0;
    // static readonly ERR_WChannelReadError = 1;
    static readonly ERR_SendMessageNotFoundWChannel = 2;
    static readonly ERR_RpcFail = 3;
    static readonly ERR_SessionSendOrRecvTimeout = 5;
    static readonly ERR_NotFoundActor = 6;
    static readonly ERR_ActorTimeout = 7;
    static readonly ERR_SessionDisposed = 8;
    static readonly ERR_ActorIdIsZero = 9;
    static readonly ERR_ActorLocationSenderDispose = 10;
    static readonly ERR_ActorLocationError = 11;
    static readonly ERR_SessionNotExist = 12;
    static readonly ERR_DBErr = 13;

    // 小于这个Rpc会抛异常，大于这个异常的error需要自己判断处理，也就是说需要处理的错误应该要大于该值
    static ERR_Exception = 1000;
    
    static IsRpcNeedThrowException(error: number): boolean {
        if(error == null){
            return false;
        }
        
        if (error == 0) {
            return false;
        }

        if (error >= ErrorCore.ERR_Exception) {
            return false;
        }
        
        return true;
    }

    // 下面是框架业务层用到的错误码 1100-2000

    /**
     * 账号密码错误
     */
    static readonly Login_PasswordError = 1101;

    /**
     * 连接gate的key错误
     */
    static readonly ERR_ConnectGateKeyError = 1102;

    /**
     * 重复发送登录请求
     */
    static readonly Login_RepeatRequestGate = 1103;

    /**
     * 连接realm失败
     */
    static readonly Login_ConnectRealmFailed = 1104;

    static readonly Login_ConnectGateFailed = 1105;

    /**
     * 账号不存在
     */
    static readonly Login_AccountNotExist = 1106;

    static readonly Login_UnitNotExist = 1107;

}