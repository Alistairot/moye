// 此文件为自动生成，请勿手工修改！

import { MessageDecorator } from '../../../../../common/Message/MessageDecorator';
import { IRequest, IResponse, IMessage } from '../../../../../common/Message/IMessage';
import { ResponseTypeDecorator } from '../../../../../common/Message/ResponseTypeDecorator';
import { InnerMessageCoreOpcode } from './InnerMessageCoreOpcode';
import * as CustomType from './CustomType';

/**
 * ActorLocationMessage需要这个来回应
 */
@MessageDecorator(InnerMessageCoreOpcode._ActorResponse, 'ActorResponse')
export class _ActorResponse implements IResponse {
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

    constructor(args?: Partial<_ActorResponse>) {
        Object.assign(this, args);
    }
}

/**
 * 缓存数据库 加回应是为了确保能等待缓存结束
 */
@MessageDecorator(InnerMessageCoreOpcode.DBCacheResponse, 'ActorResponse')
export class DBCacheResponse implements IResponse {
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

    constructor(args?: Partial<DBCacheResponse>) {
        Object.assign(this, args);
    }
}

/**
 * 数据库查询
 */
@MessageDecorator(InnerMessageCoreOpcode.DBQueryResponse, 'ActorResponse')
export class DBQueryResponse implements IResponse {

    data?: Uint8Array

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

    constructor(args?: Partial<DBQueryResponse>) {
        Object.assign(this, args);
    }
}

/**
 * 数据库删除
 */
@MessageDecorator(InnerMessageCoreOpcode.DBDeleteResponse, 'ActorResponse')
export class DBDeleteResponse implements IResponse {
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

    constructor(args?: Partial<DBDeleteResponse>) {
        Object.assign(this, args);
    }
}

@MessageDecorator(InnerMessageCoreOpcode.ObjectAddResponse, 'ActorResponse')
export class ObjectAddResponse implements IResponse {
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

    constructor(args?: Partial<ObjectAddResponse>) {
        Object.assign(this, args);
    }
}

@MessageDecorator(InnerMessageCoreOpcode.ObjectGetResponse, 'ActorResponse')
export class ObjectGetResponse implements IResponse {

    instanceId: number

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

    constructor(args?: Partial<ObjectGetResponse>) {
        Object.assign(this, args);
    }
}

@MessageDecorator(InnerMessageCoreOpcode.ObjectLockResponse, 'ActorResponse')
export class ObjectLockResponse implements IResponse {
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

    constructor(args?: Partial<ObjectLockResponse>) {
        Object.assign(this, args);
    }
}

@MessageDecorator(InnerMessageCoreOpcode.ObjectRemoveResponse, 'ActorResponse')
export class ObjectRemoveResponse implements IResponse {
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

    constructor(args?: Partial<ObjectRemoveResponse>) {
        Object.assign(this, args);
    }
}

@MessageDecorator(InnerMessageCoreOpcode.ObjectUnLockResponse, 'ActorResponse')
export class ObjectUnLockResponse implements IResponse {
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

    constructor(args?: Partial<ObjectUnLockResponse>) {
        Object.assign(this, args);
    }
}

@MessageDecorator(InnerMessageCoreOpcode.G2R_GetLoginKey, 'ActorResponse')
export class G2R_GetLoginKey implements IResponse {

    key: number

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

    constructor(args?: Partial<G2R_GetLoginKey>) {
        Object.assign(this, args);
    }
}

@MessageDecorator(InnerMessageCoreOpcode.M2G_ConnectUnit, 'ActorLocationResponse')
export class M2G_ConnectUnit implements IResponse {
    /**
     * unit所在scene的instanceId
     */
    sceneInstanceId: number

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

    constructor(args?: Partial<M2G_ConnectUnit>) {
        Object.assign(this, args);
    }
}

@MessageDecorator(InnerMessageCoreOpcode.M2G_DisconnectUnit, 'ActorLocationResponse')
export class M2G_DisconnectUnit implements IResponse {
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

    constructor(args?: Partial<M2G_DisconnectUnit>) {
        Object.assign(this, args);
    }
}

@MessageDecorator(InnerMessageCoreOpcode.M2M_UnitTransferResponse, 'ActorResponse')
export class M2M_UnitTransferResponse implements IResponse {
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

    constructor(args?: Partial<M2M_UnitTransferResponse>) {
        Object.assign(this, args);
    }
}

/**
 * 缓存数据库
 */
@ResponseTypeDecorator(DBCacheResponse)
@MessageDecorator(InnerMessageCoreOpcode.DBCacheRequest, 'ActorRequest')
export class DBCacheRequest implements IRequest {

    data: Uint8Array

    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    constructor(args?: Partial<DBCacheRequest>) {
        Object.assign(this, args);
    }
}

/**
 * 数据库查询
 */
@ResponseTypeDecorator(DBQueryResponse)
@MessageDecorator(InnerMessageCoreOpcode.DBQueryRequest, 'ActorRequest')
export class DBQueryRequest implements IRequest {

    numberKey?: number


    stringKey?: string


    typeCode: number

    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    constructor(args?: Partial<DBQueryRequest>) {
        Object.assign(this, args);
    }
}

/**
 * 数据库删除
 */
@ResponseTypeDecorator(DBDeleteResponse)
@MessageDecorator(InnerMessageCoreOpcode.DBDeleteRequest, 'ActorRequest')
export class DBDeleteRequest implements IRequest {

    numberKey?: number


    stringKey?: string


    typeCode: number

    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    constructor(args?: Partial<DBDeleteRequest>) {
        Object.assign(this, args);
    }
}

@ResponseTypeDecorator(ObjectAddResponse)
@MessageDecorator(InnerMessageCoreOpcode.ObjectAddRequest, 'ActorRequest')
export class ObjectAddRequest implements IRequest {

    key: number


    instanceId: number

    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    constructor(args?: Partial<ObjectAddRequest>) {
        Object.assign(this, args);
    }
}

@ResponseTypeDecorator(ObjectGetResponse)
@MessageDecorator(InnerMessageCoreOpcode.ObjectGetRequest, 'ActorRequest')
export class ObjectGetRequest implements IRequest {

    key: number

    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    constructor(args?: Partial<ObjectGetRequest>) {
        Object.assign(this, args);
    }
}

@ResponseTypeDecorator(ObjectLockResponse)
@MessageDecorator(InnerMessageCoreOpcode.ObjectLockRequest, 'ActorRequest')
export class ObjectLockRequest implements IRequest {

    key: number


    instanceId: number


    time: number

    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    constructor(args?: Partial<ObjectLockRequest>) {
        Object.assign(this, args);
    }
}

@ResponseTypeDecorator(ObjectRemoveResponse)
@MessageDecorator(InnerMessageCoreOpcode.ObjectRemoveRequest, 'ActorRequest')
export class ObjectRemoveRequest implements IRequest {

    key: number

    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    constructor(args?: Partial<ObjectRemoveRequest>) {
        Object.assign(this, args);
    }
}

@ResponseTypeDecorator(ObjectUnLockResponse)
@MessageDecorator(InnerMessageCoreOpcode.ObjectUnLockRequest, 'ActorRequest')
export class ObjectUnLockRequest implements IRequest {

    key?: number


    oldInstanceId?: number


    instanceId?: number

    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    constructor(args?: Partial<ObjectUnLockRequest>) {
        Object.assign(this, args);
    }
}

@ResponseTypeDecorator(G2R_GetLoginKey)
@MessageDecorator(InnerMessageCoreOpcode.R2G_GetLoginKey, 'ActorRequest')
export class R2G_GetLoginKey implements IRequest {

    account: string

    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    constructor(args?: Partial<R2G_GetLoginKey>) {
        Object.assign(this, args);
    }
}

/**
 * 连接unit
 */
@ResponseTypeDecorator(M2G_ConnectUnit)
@MessageDecorator(InnerMessageCoreOpcode.G2M_ConnectUnit, 'ActorLocationRequest')
export class G2M_ConnectUnit implements IRequest {

    sessionInstanceId: number

    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    constructor(args?: Partial<G2M_ConnectUnit>) {
        Object.assign(this, args);
    }
}

/**
 * 与unit断开连接
 */
@ResponseTypeDecorator(M2G_DisconnectUnit)
@MessageDecorator(InnerMessageCoreOpcode.G2M_DisconnectUnit, 'ActorLocationRequest')
export class G2M_DisconnectUnit implements IRequest {

    sessionInstanceId: number

    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    constructor(args?: Partial<G2M_DisconnectUnit>) {
        Object.assign(this, args);
    }
}

/**
 * 传送unit
 */
@ResponseTypeDecorator(M2M_UnitTransferResponse)
@MessageDecorator(InnerMessageCoreOpcode.M2M_UnitTransferRequest, 'ActorRequest')
export class M2M_UnitTransferRequest implements IRequest {

    oldInstanceId?: number


    unit?: Uint8Array


    entitys: Uint8Array[] = []

    /**
     * 用于rpc调用的唯一id
     */
    rpcId: number

    constructor(args?: Partial<M2M_UnitTransferRequest>) {
        Object.assign(this, args);
    }
}

