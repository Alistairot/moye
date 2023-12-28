
import { Entity, EventSystem, TimeHelper } from "../Core/Core";
import { AServiceDataType } from "../Network/AService";
import { IPEndPoint } from "../Network/IPEndPoint";
import { NetServices } from "../Network/Index";
import { ServiceType } from "../Network/ServiceType";
import { WService } from "../NetworkWebsocket/Index";
import { NetClientComponentOnRead } from "./NetClientComponentOnRead";
import { Session } from "./Session";

export class NetClientComponent extends Entity {
    serviceId: number;

    protected awake() {
        const service = new WService();
        service.initSender(ServiceType.Outer);

        const netServices = NetServices.get();
        this.serviceId = netServices.addService(service);

        netServices.registerReadCallback(this.serviceId, this.onRead.bind(this));
        netServices.registerErrorCallback(this.serviceId, this.onError.bind(this));
    }

    protected destroy(): void {
        const netServices = NetServices.get();

        netServices.removeService(this.serviceId);
    }

    private onRead(channelId: bigint, data: AServiceDataType) {
        const session = this.getChild(Session, channelId);
        if (session == null) {
            return;
        }

        session.lastRecvTime = TimeHelper.clientNow();

        const event = NetClientComponentOnRead.create({ data: data, session: session });
        EventSystem.get().publish(this.domainScene(), event);
    }

    private onError(channelId: bigint, error: number) {
        const session = this.getChild(Session, channelId);
        if (session == null) {
            return;
        }

        session.error = error;
        session.dispose();

        // EventSendHelper.publish(this.domainScene(), NetErrorEvent.create({channelId: channelId, error: error}));
    }

    create(address: IPEndPoint): Session {
        const session = this.addChild(Session);

        session.init(this.serviceId);

        session.remoteAddress = address;

        NetServices.get().createChannel(this.serviceId, session.id, address);

        return session;
    }
}