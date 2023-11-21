import { Entity } from "../../../../common/Entity/Entity";
import { IMessage, IResponse } from "../../../../common/Message/IMessage";
import { Type } from "../../../../common/Core/Type/Type";

/**
 * 所有的actor消息处理器都需要实现这个接口
 */
export interface IMActorHandler {
    /**
     * 这里是异步 可以抛出错误 分发的地方会捕获错误
     * @param entity 
     * @param fromProcess 
     * @param message 
     * @param responseType 
     */
    handleAsync?(entity: Entity, fromProcess: number, message: IMessage, responseType: Type<IResponse>): Promise<void>;
    handleSync?(entity: Entity, fromProcess: number, message: IMessage, responseType: Type<IResponse>): void;
}