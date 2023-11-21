import { Entity } from "../../../../../common/Entity/Entity"
import { coreError, coreLog } from "../../../../../common/Core/Logger/CoreLogHelper"
import { DEVELOP, SAME_MACHINE_OPTIMIZATION } from "../../../../../common/Macro"
import { IMessage } from "../../../../../common/Message/IMessage"
import { Session } from "../../../../../common/Message/Session"
import { IPEndPoint } from "../../../../../common/Network/IPEndPoint"
import { NetServices } from "../../../../../common/Network/NetServices"
import { NetworkProtocol } from "../../../../../common/Network/NetworkProtocol"
import { ServiceType } from "../../../../../common/Network/ServiceType"
import { Options } from "../../../../../common/Core/Options/Options"
import { TimeHelper } from "../../../../../common/Core/Time/TimeHelper"
import { TimerMgr } from "../../../../../common/Timer/TimerMgr"
import { WService } from "../../Network/WService"
import { ProcessMgr } from "../../Process/ProcessMgr"
import { InnerMessageDispatcher } from "./InnerMessageDispatcher"


/**
 * 服务端不同序号的进程通信
 */
export class NetInnerComponent extends Entity {
    public static inst: NetInnerComponent
    public ServiceId: number
    public InnerProtocol: NetworkProtocol = NetworkProtocol.Websocket

    awake() {
        this.delayInit()

        NetInnerComponent.inst = this
    }

    destroy(): void {
        NetInnerComponent.inst = null

        NetServices.getInst().RemoveService(this.ServiceId);
    }

    private async delayInit() {
        await TimerMgr.getInst().waitAsync(5 * 1000);
        let curProcessInfo = ProcessMgr.getInst().getCurProcessInfo();
        let address = curProcessInfo.innerAddress;
        let netServices = NetServices.getInst();

        coreLog('[进程{0}]内网开启监听: {1}', curProcessInfo.id, address.toString());

        switch (this.InnerProtocol) {
            case NetworkProtocol.TCP:
                {
                    // 等待实现
                    break;
                }
            case NetworkProtocol.Websocket:
                {
                    let service = new WService()

                    service.initAcceptor(address, ServiceType.Inner)

                    this.ServiceId = netServices.AddService(service);
                    break;
                }
        }

        netServices.RegisterAcceptCallback(this.ServiceId, this.onAccept.bind(this));
        netServices.RegisterReadCallback(this.ServiceId, this.onRead.bind(this));
        netServices.RegisterErrorCallback(this.ServiceId, this.onError.bind(this));
    }

    private onRead(channelId: number, actorId: number, message: any) {
        let session = this.getChild(Session, channelId);
        if (session == null) {
            return;
        }

        session.LastRecvTime = TimeHelper.clientFrameTime();

        this.handleMessage(actorId, message);
    }

    public handleMessage(actorId: number, message: IMessage) {
        // let rootSecene = Root.getInst().scene
        InnerMessageDispatcher.getInst().handle(actorId, message);
        // EventSender.getInst().publish(rootSecene, NetInnerComponentOnRead.create({ ActorId: actorId, Message: message }));
    }

    private onError(channelId: number, error: number) {
        let session = this.getChild(Session, channelId);
        if (session == null) {
            return;
        }

        session.Error = error;
        session.dispose();
    }

    private onAccept(channelId: number, ipEndPoint: IPEndPoint) {
        let session = this.addChildWithId(Session, channelId);
        session.init(this.ServiceId)
        session.RemoteAddress = ipEndPoint;
    }

    private createInner(channelId: number, ipEndPoint: IPEndPoint) {
        let session = this.addChildWithId(Session, channelId);
        session.init(this.ServiceId)
        session.RemoteAddress = ipEndPoint;

        NetServices.getInst().CreateChannel(this.ServiceId, channelId, ipEndPoint);

        return session;
    }

    // 内网actor session，channelId是进程号
    get(channelId: number): Session {
        let session = this.getChild(Session, channelId);
        if (session != null) {
            return session;
        }

        let currentProcessId = Options.getInst().process;
        let currentProcessInfo = ProcessMgr.getInst().getProcessInfo(currentProcessId);
        let targetProcessInfo = ProcessMgr.getInst().getProcessInfo(channelId);
        let ipEndPoint: IPEndPoint;

        if(targetProcessInfo == null){
            coreError('目标进程不存在, channelId={0}', channelId);
            return;
        }

        if(currentProcessInfo == null){
            coreError('当前进程不存在, processId={0}', currentProcessId);
            return;
        }

        if (SAME_MACHINE_OPTIMIZATION) {
            // 同一台机器 走内网地址
            if (targetProcessInfo.machineId == currentProcessInfo.machineId) {
                coreLog('同一台机器，走内网地址, 当前进程={0}, 目标进程={1}', currentProcessInfo.id, targetProcessInfo.id)
                ipEndPoint = targetProcessInfo.innerAddress;
            } else {
                ipEndPoint = targetProcessInfo.outerAddress;
            }
        } else {
            ipEndPoint = targetProcessInfo.outerAddress;
        }

        session = this.createInner(channelId, ipEndPoint);
        return session;
    }
}