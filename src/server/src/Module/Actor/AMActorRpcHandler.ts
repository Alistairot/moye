import { coreError } from "../../../../common/Core/Logger/CoreLogHelper";
import { DEVELOP } from "../../../../common/Macro";
import { ErrorCore } from "../../../../common/Network/ErrorCore";
import { Type } from "../../../../common/Core/Type/Type";
import { Entity, IMessage, IRequest, IResponse, Scene } from "../../cocos-node";
import { IMActorHandler } from "./IMActorHandler";
import { ActorRequestHandleHelper } from "./ReceiveMsgHelper/ActorRequestHandleHelper";

/**
 * 这个一般是服务端不同scene之间的消息处理器
 * 需要回应的actor消息处理器基类
 * 不会阻塞
 */
export abstract class AMActorRpcHandler<TRequest extends IRequest, TResponse extends IResponse> implements IMActorHandler {
    /**
     * 记录rpc消息来自哪个进程
     * 方便在run方法里面使用
     */
    protected _fromProcess: number;

    protected abstract run(scene: Scene, request: TRequest, response: TResponse): Promise<any>;

    async handleAsync(entity: Scene, fromProcess: number, request: TRequest, responseType: Type<TResponse>): Promise<void> {
        let rpcId = request.rpcId;
        this._fromProcess = fromProcess;

        let response: TResponse = new responseType();

        try {
            await this.run(entity, request, response);
        }
        catch (error) {
            coreError('{0} run error: {1}', this.constructor.name, error.stack);
            response.error = ErrorCore.ERR_RpcFail;
            response.message = error.message;
        }

        response.rpcId = rpcId; // 在这里设置rpcId是为了防止在Run中不小心修改rpcId字段

        ActorRequestHandleHelper.reply(fromProcess, response);
        this._fromProcess = 0;
    }
}