
import { Entity, EventSystem, TimeHelper } from "../Core/Core";
import { coreError } from "../Core/Logger/CoreLogHelper";
import { DEVELOP } from "../Macro";
import { AServiceDataType } from "../Network/AService";
import { IPEndPoint } from "../Network/IPEndPoint";
import { NetServices } from "../Network/Index";
import { ServiceType } from "../Network/ServiceType";
import { WService } from "../NetworkWebsocket/Index";
import { NetComReadEvent } from "./NetComReadEvent";
import { Session } from "./Session";

/**
 * 用于处理网络消息的组件
 * 这个组件只接受二进制数据
 */
export class NetCom extends Entity {
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

        // if(DEVELOP){
        //     // 屏蔽非Uint8Array类型的数据
        //     if(!(data instanceof Uint8Array)){
        //         coreError('NetCom', '非Uint8Array类型的数据');
        //         return;
        //     }
        // }

        session.lastRecvTime = TimeHelper.clientNow();

        const event = NetComReadEvent.create({ data: data, session: session });
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