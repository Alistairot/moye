// 此文件为自动生成，请勿手工修改！

import { MessageDecorator } from '../../../../../common/Message/MessageDecorator';
import { IRequest, IResponse, IMessage } from '../../../../../common/Message/IMessage';
import { ResponseTypeDecorator } from '../../../../../common/Message/ResponseTypeDecorator';
import { OuterMessageCoreOpcode } from './OuterMessageCoreOpcode';
import * as CustomType from './CustomType';

@MessageDecorator(OuterMessageCoreOpcode.R2C_Login, 'Response')
export class R2C_Login implements IResponse {

    address?: string


    key?: number

    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    /**
     * 错误码 0表示成功
     */
    error: number

    /**
     * 错误信息 一般在error不为0时才有
     */
    message?: string

    constructor(args?: Partial<R2C_Login>) {
        Object.assign(this, args);
    }
}

@MessageDecorator(OuterMessageCoreOpcode.G2C_LoginGate, 'Response')
export class G2C_LoginGate implements IResponse {
    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    /**
     * 错误码 0表示成功
     */
    error: number

    /**
     * 错误信息 一般在error不为0时才有
     */
    message?: string

    constructor(args?: Partial<G2C_LoginGate>) {
        Object.assign(this, args);
    }
}

@MessageDecorator(OuterMessageCoreOpcode.G2C_Ping, 'Response')
export class G2C_Ping implements IResponse {

    time?: number

    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    /**
     * 错误码 0表示成功
     */
    error: number

    /**
     * 错误信息 一般在error不为0时才有
     */
    message?: string

    constructor(args?: Partial<G2C_Ping>) {
        Object.assign(this, args);
    }
}

/**
 * 压力测试 收到这个协议的时候自定义操作 例如可以发条消息给map服
 */
@MessageDecorator(OuterMessageCoreOpcode.C2G_TestPressure, 'Message')
export class C2G_TestPressure implements IMessage {
    constructor(args?: Partial<C2G_TestPressure>) {
        Object.assign(this, args);
    }
}

/**
 * 客户端发消息给Realm服 请求gate地址
 */
@ResponseTypeDecorator(R2C_Login)
@MessageDecorator(OuterMessageCoreOpcode.C2R_Login, 'Request')
export class C2R_Login implements IRequest {
    /**
     * 帐号
     */
    account: string

    /**
     * 密码
     */
    password: string

    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    constructor(args?: Partial<C2R_Login>) {
        Object.assign(this, args);
    }
}

@ResponseTypeDecorator(G2C_LoginGate)
@MessageDecorator(OuterMessageCoreOpcode.C2G_LoginGate, 'Request')
export class C2G_LoginGate implements IRequest {
    /**
     * 登录key 这个要Realm验证通过才有
     */
    key: number

    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    constructor(args?: Partial<C2G_LoginGate>) {
        Object.assign(this, args);
    }
}

@ResponseTypeDecorator(G2C_Ping)
@MessageDecorator(OuterMessageCoreOpcode.C2G_Ping, 'Request')
export class C2G_Ping implements IRequest {
    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    constructor(args?: Partial<C2G_Ping>) {
        Object.assign(this, args);
    }
}

