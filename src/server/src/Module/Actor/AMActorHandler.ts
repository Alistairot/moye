import { Entity } from "../../../../common/Entity/Entity";
import { Scene } from "../../../../common/Entity/Scene";
import { coreWarn } from "../../../../common/Core/Logger/CoreLogHelper";
import { DEVELOP } from "../../../../common/Macro";
import { IMessage, IResponse } from "../../../../common/Message/IMessage";
import { safeCall } from "../../../../common/Core/JavaScript/safeCall";
import { Type } from "../../../../common/Core/Type/Type";
import { IMActorHandler } from "./IMActorHandler";

/**
 * 服务端不同进程之间的actor消息处理器
 * 不需要回应的消息用这个处理器
 */
export abstract class AMActorHandler<A extends IMessage> implements IMActorHandler {
    protected abstract run(scene: Scene, args: A): void;

    handleSync(entity: Entity, fromProcess: number, message: A, responseType: Type<IResponse>): void {
        if (DEVELOP) {
            // let ret = ((): any => this.run(entity as Scene, message))();
            let ret: any = this.run(entity as Scene, message);

            if (ret instanceof Promise) {
                coreWarn('{0}.run 请不要使用异步, 因为异步没办法保证消息接收后的处理顺序, 如果需要可以另开一个协程处理', this.constructor.name);
                safeCall(ret);
            }
        }else{
            this.run(entity as Scene, message);
        }
    }
}