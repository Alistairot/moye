import { IRequest, IResponse } from "../../../../common/Message/IMessage";
import { Type } from "../../../../common/Core/Type/Type";
import { ResponseTypeMgr } from "./ResponseTypeMgr";

export class ActorHelper {
    /**
     * 创建消息的回应实例
     * @param iActorRequest 
     * @param error 
     * @returns 
     */
    public static createResponse(iActorRequest: IRequest, error: number): IResponse {
        let responseType = ResponseTypeMgr.getInst().getResponseType(iActorRequest.constructor as Type);
        let response = new responseType();

        response.error = error;
        response.rpcId = iActorRequest.rpcId;
        return response;
    }
}