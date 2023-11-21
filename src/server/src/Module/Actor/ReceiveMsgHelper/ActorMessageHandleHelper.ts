import { Root } from "../../../../../common/Entity/Root";
import { InstanceIdStruct } from "../../../../../common/Core/IdGenerator/InstanceIdStruct";
import { coreError } from "../../../../../common/Core/Logger/CoreLogHelper";
import { IMessage } from "../../../../../common/Message/IMessage";
import { Session } from "../../../../../common/Message/Session";
import { ObjectPool } from "../../../../../common/Core/ObjectPool/ObjectPool";
import { Options } from "../../../../../common/Core/Options/Options";
import { ActorMessageDispatcherMgr } from "../ActorMessageDispatcherMgr";
import { MailBoxComponent } from "../MailBoxComponent";
import { MailboxType } from "../MailboxType";
/**
 * 收到非rpc消息的处理
 */
export class ActorMessageHandleHelper {
    static handleActorMessage(actorId: number, iActorMessage: IMessage) {
        let objectPool = ObjectPool.getInst();
        let instanceIdStruct = objectPool.fetch(InstanceIdStruct);

        instanceIdStruct.initArgs1(actorId)
        let fromProcess = instanceIdStruct.Process;
        instanceIdStruct.Process = Options.getInst().process;
        instanceIdStruct.updateResult()
        let realActorId = instanceIdStruct.ToLong();

        objectPool.recycle(instanceIdStruct)

        let entity = Root.getInst().get(realActorId);
        if (entity == null) {
            // 找不到是正常的 可能entity已经销毁了
            // 消息不处理就行了
            return;
        }

        let mailBoxComponent = entity.getComponent(MailBoxComponent);

        if (mailBoxComponent == null) {
            coreError('actor not found mailbox, entityType: {0}, msg= {1}', entity.constructor.name, iActorMessage.constructor.name);
            return;
        }

        switch (mailBoxComponent.MailboxType) {
            case MailboxType.MessageDispatcher: {
                ActorMessageDispatcherMgr.getInst().handleSync(entity, fromProcess, iActorMessage);
                break;
            }
            case MailboxType.UnOrderMessageDispatcher: {
                ActorMessageDispatcherMgr.getInst().handleSync(entity, fromProcess, iActorMessage);
                break;
            }
            case MailboxType.GateSession: {
                if (entity instanceof Session) {
                    // 发送给客户端
                    entity.Send(iActorMessage);
                }
                break;
            }
            default:
                throw new Error(`no mailboxtype: ${mailBoxComponent.MailboxType} ${iActorMessage.constructor.name}`);
        }
    }
}