import { coreError } from "../../../../common/Core/Logger/CoreLogHelper";
import { DEVELOP } from "../../../../common/Macro";
import { IMessage, IRequest, IResponse } from "../../../../common/Message/IMessage";
import { ErrorCore } from "../../../../common/Network/ErrorCore";
import { Type } from "../../../../common/Core/Type/Type";
import { IMActorHandler } from "../Actor/IMActorHandler";
import { ActorRequestHandleHelper } from "../Actor/ReceiveMsgHelper/ActorRequestHandleHelper";
import { Unit } from "../Unit/Unit";

/**
 * 客户端发送给unit的rpc消息用这个处理器
 * 注意 这个会堵塞消息 尽量不要run里面用await
 * 甚至会阻塞发送端
 */
export abstract class AMActorLocationRpcHandler<TRequest extends IRequest, TResponse extends IResponse> implements IMActorHandler {
    protected abstract run(unit: Unit, request: TRequest, response: TResponse): Promise<void>;

    async handleAsync(unit: Unit, fromProcess: number, message: TRequest, responseType: Type<TResponse>) {
        let request = message;
        let rpcId = request.rpcId;
        let response: TResponse = new responseType();

        try {
            await this.run(unit, request, response);
        }
        catch (error) {
            coreError('{0}.run error, {1}', this.constructor.name, error.stack);
            response.error = ErrorCore.ERR_RpcFail;
            response.message = error.message;
        }

        response.rpcId = rpcId; // 在这里设置rpcId是为了防止在Run中不小心修改rpcId字段
        ActorRequestHandleHelper.reply(fromProcess, response);
    }
}