import { Entity } from "../../../../../common/Entity/Entity";
import { Session } from "../../../../../common/Message/Session";
import { IPEndPoint } from "../../../../../common/Network/IPEndPoint";
import { NetServices } from "../../../../../common/Network/NetServices";
import { ServiceType } from "../../../../../common/Network/ServiceType";
import { WService } from "../../Network/WService";
import { SessionAcceptTimeoutComponent } from "../SessionAcceptTimeoutComponent";
import { SessionIdleCheckerComponent } from "../../../../../common/Message/SessionIdleCheckerComponent";
import { TimeHelper } from "../../../../../common/Core/Time/TimeHelper";
import { MsgPrinter } from "../../../../../common/Message/MsgPrinter";
import { IMessage } from "../../../../../common/Message/IMessage";
import { EventSystem } from "../../../../../common/EventSystem/EventSystem";
import { Root } from "../../../../../common/Entity/Root";
import { OuterMessageMsgDispatcher } from "./OuterMessageMsgDispatcher";
import { TimerMgr } from "../../../../../common/Timer/TimerMgr";
import { coreLog } from "../../../../../common/Core/Logger/CoreLogHelper";

/**
 * 挂上这个组件 就可以监听外网消息
 */
export class NetServerComponent extends Entity {
    ServiceId: number

    init(address: IPEndPoint) {
        this.delayInit(address);
    }

    /**
     * 延迟初始化 防止在程序启动时候客户端就发了消息
     */
    private async delayInit(address: IPEndPoint) {
        await TimerMgr.getInst().waitAsync(5 * 1000);
        coreLog('[scene {0}], 外网开启监听: {1}', this.domainScene().name, address.toString());

        let service = new WService()
        let netServices = NetServices.getInst();

        service.initAcceptor(address, ServiceType.Outer)

        this.ServiceId = netServices.AddService(service);

        netServices.RegisterAcceptCallback(this.ServiceId, this.OnAccept.bind(this));
        netServices.RegisterReadCallback(this.ServiceId, this.OnRead.bind(this));
        netServices.RegisterErrorCallback(this.ServiceId, this.OnError.bind(this));
    }

    destroy(): void {
        let netServices = NetServices.getInst();
        netServices.RemoveService(this.ServiceId);
    }

    private OnError(channelId: number, error: number) {
        let session = this.getChild(Session, channelId);
        if (session == null) {
            return;
        }

        session.Error = error;
        session.dispose();
    }

    // 这个channelId是由CreateAcceptChannelId生成的
    private OnAccept(channelId: number, ipEndPoint: IPEndPoint) {
        let session = this.addChildWithId(Session, channelId);

        session.init(this.ServiceId)
        session.RemoteAddress = ipEndPoint;

        // session超时未验证，就会被删除
        session.addComponent(SessionAcceptTimeoutComponent);
        // session长时间没有发消息，就会被删除
        session.addComponent(SessionIdleCheckerComponent);
    }

    private OnRead(channelId: number, actorId: number, message: IMessage) {
        let session = this.getChild(Session, channelId);
        if (session == null) {
            return;
        }
        session.LastRecvTime = TimeHelper.clientNow();

        OuterMessageMsgDispatcher.getInst().handle(session, message);
    }
}