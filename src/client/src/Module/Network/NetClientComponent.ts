import { Entity } from "../../../../common/Entity/Entity"
import { Root } from "../../../../common/Entity/Root"
import { NetErrorEvent } from "../../../../common/EventSystem/EventCore"
import { EventSendHelper } from "../Event/EventSendHelper"
import { EventSystem } from "../../../../common/EventSystem/EventSystem"
import { MsgPrinter } from "../../../../common/Message/MsgPrinter"
import { Session } from "../../../../common/Message/Session"
import { SessionIdleCheckerComponent } from "../../../../common/Message/SessionIdleCheckerComponent"
import { IPEndPoint } from "../../../../common/Network/IPEndPoint"
import { NetServices } from "../../../../common/Network/NetServices"
import { ServiceType } from "../../../../common/Network/ServiceType"
import { TimeHelper } from "../../../../common/Core/Time/TimeHelper"
import { NetClientComponentOnRead } from "./NetClientComponentOnRead"
import { WService } from "./WService"
import { coreLog } from "../../../../common/Core/Logger/CoreLogHelper"

export class NetClientComponent extends Entity {
    ServiceId: number

    awake() {
        let service = new WService()
        service.initSender(ServiceType.Outer)

        let netServices = NetServices.getInst()
        this.ServiceId = netServices.AddService(service);

        netServices.RegisterReadCallback(this.ServiceId, this.OnRead.bind(this));
        netServices.RegisterErrorCallback(this.ServiceId, this.OnError.bind(this));
    }

    destroy(): void {
        let netServices = NetServices.getInst()
        
        netServices.RemoveService(this.ServiceId);
    }

    private OnRead(channelId: number, actorId: number, message: any) {
        let session = this.getChild(Session, channelId);
        if (session == null) {
            return;
        }

        session.LastRecvTime = TimeHelper.clientNow();

        let event = NetClientComponentOnRead.create({ message: message, session: session });
        EventSystem.getInst().publish(Root.getInst().scene, event);
    }

    private OnError(channelId: number, error: number) {
        let session = this.getChild(Session, channelId);
        if (session == null) {
            return;
        }

        session.Error = error;
        session.dispose();
        coreLog('session dispose channelId={0} error={1}', channelId, error)

        EventSendHelper.publish(this.domainScene(), NetErrorEvent.create({channelId: channelId, error: error}))
    }

    public Create(address: IPEndPoint): Session {
        let session = this.addChild(Session);

        session.init(this.ServiceId)

        session.RemoteAddress = address;

        session.addComponent(SessionIdleCheckerComponent);

        NetServices.getInst().CreateChannel(this.ServiceId, session.id, address);

        return session;
    }
}