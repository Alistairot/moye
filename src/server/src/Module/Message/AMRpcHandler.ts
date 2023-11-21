import { coreError } from "../../../../common/Core/Logger/CoreLogHelper";
import { IMHandler } from "../../../../common/Message/IMHandler";
import { IMessage, IRequest, IResponse } from "../../../../common/Message/IMessage";
import { Session } from "../../../../common/Message/Session";
import { ErrorCore } from "../../../../common/Network/ErrorCore";
import { Type } from "../../../../common/Core/Type/Type";

/**
 * 客户端发给服务端需要回复的消息用这个
 * rpc消息处理器
 * 收到消息后会将回复消息发送回去
 * 优点是不会阻塞 可以在run里面随意await
 */
export abstract class AMRpcHandler<TRequest extends IRequest, TResponse extends IResponse> implements IMHandler {
    /**
     * 必须是异步
     * 这样可以控制回复的时机
     * @param session 
     * @param request 
     * @param response 
     */
    protected abstract run(session: Session, request: TRequest, response: TResponse): Promise<any>;

    handle(session: Session, message: TRequest, responseType: Type<TResponse>): void {
        this.handleAsync(session, message, responseType)
    }

    private async handleAsync(session: Session, request: TRequest, responseType: Type<TResponse>) {
        try {
            let rpcId = request.rpcId;
            let instanceId = session.instanceId;
            let response = new responseType();

            try {
                await this.run(session, request, response);
            }
            catch (error) {
                coreError('{0}.run error, {1}', this.constructor.name, error.stack);
                response.error = ErrorCore.ERR_RpcFail;
                response.message = error.message;
            }

            // 等回调回来,session可以已经断开了,所以需要判断session InstanceId是否一样
            if (session.instanceId != instanceId) {
                return;
            }

            response.rpcId = rpcId; // 在这里设置rpcId是为了防止在Run中不小心修改rpcId字段
            session.Send(response);
        }
        catch (e) {
            coreError('{0}消息处理失败', this.constructor.name);
        }
    }
}