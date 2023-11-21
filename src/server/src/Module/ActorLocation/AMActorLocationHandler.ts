import { Entity } from "../../../../common/Entity/Entity";
import { coreWarn } from "../../../../common/Core/Logger/CoreLogHelper";
import { DEVELOP } from "../../../../common/Macro";
import { IMessage, IRequest, IResponse } from "../../../../common/Message/IMessage";
import { safeCall } from "../../../../common/Core/JavaScript/safeCall";
import { Type } from "../../../../common/Core/Type/Type";
import { _ActorResponse } from "../../Game/Message/InnerMessageCore/InnerMessageCore";
import { IMActorHandler } from "../Actor/IMActorHandler";
import { ActorRequestHandleHelper } from "../Actor/ReceiveMsgHelper/ActorRequestHandleHelper";
import { Unit } from "../Unit/Unit";

/**
 * 发送给unit的消息 且不用回复的用这个处理器
 * 这个会阻塞后续消息的处理 尽量不要在run里面await耗时操作
 * 如果有耗时操作 可以另外开一个协程
 */
export abstract class AMActorLocationHandler<A extends IRequest> implements IMActorHandler {
    protected abstract run(unit: Unit, message: A): void;

    handleSync(entity: Entity, fromProcess: number, message: A, responseType: Type<IResponse>) {
        // 这里是为了告诉gate或其他scene这个消息已经收到了, 可以进行下一个消息的发送
        let response = new _ActorResponse({ rpcId: message.rpcId });
        ActorRequestHandleHelper.reply(fromProcess, response);

        if (DEVELOP) {
            let ret: any = this.run(entity as Unit, message);

            if (ret instanceof Promise) {
                coreWarn('{0}.run 请不要使用异步, 因为异步没办法保证消息接收后的处理顺序, 如果需要可以另开一个协程处理', this.constructor.name);
                safeCall(ret);
            }
        }else{
            this.run(entity as Unit, message);
        }
    }
}