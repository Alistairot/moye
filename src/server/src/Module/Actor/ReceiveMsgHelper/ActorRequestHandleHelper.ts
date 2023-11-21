import { Root } from "../../../../../common/Entity/Root";
import { InstanceIdStruct } from "../../../../../common/Core/IdGenerator/InstanceIdStruct";
import { coreError, coreWarn } from "../../../../../common/Core/Logger/CoreLogHelper";
import { DEVELOP, SAME_PROCESS_OPTIMIZATION } from "../../../../../common/Macro";
import { IRequest, IResponse } from "../../../../../common/Message/IMessage";
import { MsgPrinter } from "../../../../../common/Message/MsgPrinter";
import { ErrorCore } from "../../../../../common/Network/ErrorCore";
import { ObjectPool } from "../../../../../common/Core/ObjectPool/ObjectPool";
import { Options } from "../../../../../common/Core/Options/Options";
import { NetInnerComponent } from "../../Message/InnerMessage/NetInnerComponent";
import { ActorHelper } from "../ActorHelper";
import { ActorMessageDispatcherMgr } from "../ActorMessageDispatcherMgr";
import { ActorMessageSenderMgr } from "../ActorMessageSenderMgr";
import { MailBoxComponent, MailBoxQueueItem } from "../MailBoxComponent";
import { MailboxType } from "../MailboxType";

/**
 * 收到rpc消息的处理
 */
export class ActorRequestHandleHelper {
    static handleActorRequest(actorId: number, iActorRequest: IRequest) {
        try {
            let objectPool = ObjectPool.getInst()
            let instanceIdStruct = objectPool.fetch(InstanceIdStruct)

            instanceIdStruct.initArgs1(actorId)

            let fromProcess = instanceIdStruct.Process;
            instanceIdStruct.Process = Options.getInst().process;
            instanceIdStruct.updateResult()
            let realActorId = instanceIdStruct.ToLong();

            objectPool.recycle(instanceIdStruct)

            let entity = Root.getInst().get(realActorId);
            if (entity == null) {
                let response = ActorHelper.createResponse(iActorRequest, ErrorCore.ERR_NotFoundActor);
                this.reply(fromProcess, response);
                return;
            }

            let mailBoxComponent = entity.getComponent(MailBoxComponent);
            if (mailBoxComponent == null) {
                coreWarn('actor not found mailbox: {0} {1} {2}', entity.constructor.name, realActorId, iActorRequest.constructor.name);
                let response = ActorHelper.createResponse(iActorRequest, ErrorCore.ERR_NotFoundActor);
                this.reply(fromProcess, response);
                return;
            }

            switch (mailBoxComponent.MailboxType) {
                case MailboxType.MessageDispatcher: {
                    mailBoxComponent.addReq(iActorRequest, fromProcess);
                    this.handleReqQueue(mailBoxComponent, realActorId);
                    break;
                }
                case MailboxType.UnOrderMessageDispatcher: {
                    ActorMessageDispatcherMgr.getInst().handleAsync(entity, fromProcess, iActorRequest);
                    break;
                }
                case MailboxType.GateSession:
                default:
                    throw new Error(`no mailboxtype: ${mailBoxComponent.MailboxType} ${iActorRequest.constructor.name}`);
            }
        } catch (e) {
            coreError('handleActorRequest error: {0}', e.stack);
        }
    }

    static handleActorLocationMessage(actorId: number, iActorRequest: IRequest) {
        try {
            let objectPool = ObjectPool.getInst()
            let instanceIdStruct = objectPool.fetch(InstanceIdStruct)

            instanceIdStruct.initArgs1(actorId)

            let fromProcess = instanceIdStruct.Process;
            instanceIdStruct.Process = Options.getInst().process;
            instanceIdStruct.updateResult()
            let realActorId = instanceIdStruct.ToLong();

            objectPool.recycle(instanceIdStruct)

            let entity = Root.getInst().get(realActorId);
            if (entity == null) {
                let response = ActorHelper.createResponse(iActorRequest, ErrorCore.ERR_NotFoundActor);
                this.reply(fromProcess, response);
                return;
            }

            let mailBoxComponent = entity.getComponent(MailBoxComponent);
            if (mailBoxComponent == null) {
                coreWarn('actor not found mailbox: {0} {1} {2}', entity.constructor.name, realActorId, iActorRequest.constructor.name);
                let response = ActorHelper.createResponse(iActorRequest, ErrorCore.ERR_NotFoundActor);
                this.reply(fromProcess, response);
                return;
            }

            switch (mailBoxComponent.MailboxType) {
                case MailboxType.MessageDispatcher: {
                    ActorMessageDispatcherMgr.getInst().handleSync(entity, fromProcess, iActorRequest);
                    break;
                }
                case MailboxType.UnOrderMessageDispatcher: {
                    ActorMessageDispatcherMgr.getInst().handleSync(entity, fromProcess, iActorRequest);
                    break;
                }
                case MailboxType.GateSession:
                default:
                    throw new Error(`no mailboxtype: ${mailBoxComponent.MailboxType} ${iActorRequest.constructor.name}`);
            }
        } catch (e) {
            coreError('handleActorLocationMessage error: {0}', e.stack);
        }
    }

    static reply(fromProcess: number, response: IResponse) {
        if (SAME_PROCESS_OPTIMIZATION) {
            // 返回消息是同一个进程
            if (fromProcess == Options.getInst().process) {
                if (response.error == null) {
                    response.error = ErrorCore.ERR_Success;
                }
                ActorMessageSenderMgr.getInst().handleActorResponse(response);
                return;
            }
        }

        try{
            let replySession = NetInnerComponent.inst.get(fromProcess);
            replySession.Send(response);
        }catch(e){
            coreError('ActorRequestHandleHelper.reply error: {0}', e.stack);
        }
    }

    private static async handleReqQueue(mailBoxCom: MailBoxComponent, realActorId: number) {
        try {
            if (mailBoxCom.isDisposed) {
                return;
            }

            if (mailBoxCom.isHandling) {
                return;
            }

            mailBoxCom.isHandling = true;

            let item = mailBoxCom.getReq();
            let entity = mailBoxCom.parent;

            while (item != null) {
                // 这里代表entity已经被销毁了
                if (entity.instanceId != realActorId) {
                    let response = ActorHelper.createResponse(item.req, ErrorCore.ERR_NotFoundActor);
                    this.reply(item.fromProcess, response);
                    item.dispose();
                    break;
                }

                let fromProcess = item.fromProcess;
                let req = item.req;

                item.dispose();

                await ActorMessageDispatcherMgr.getInst().handleAsync(entity, fromProcess, req);

                if (mailBoxCom.isDisposed) {
                    break;
                }

                item = mailBoxCom.getReq();
            }
        } catch (e) {
            coreError('handleReqQueue error: {0}', e.stack);
        } finally {
            mailBoxCom.isHandling = false;
            mailBoxCom.clearItem();
        }

    }
}