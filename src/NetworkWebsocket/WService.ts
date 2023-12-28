import { WChannel } from './WChannel';
import { AService, AServiceDataType } from '../Network/AService';
import { IPEndPoint } from '../Network/IPEndPoint';
import { ServiceType } from '../Network/ServiceType';
import { NetServices, NetworkErrorCode } from '../Network/Index';


export class WService extends AService {
    private readonly _idChannels: Map<bigint, WChannel> = new Map;

    initSender(serviceType: ServiceType) {
        this.serviceType = serviceType;
    }

    send(channelId: bigint, data: AServiceDataType): void {
        const channel = this._idChannels.get(channelId);
        if (channel == null) {
            NetServices.get().onError(this.id, channelId, NetworkErrorCode.ERR_SendMessageNotFoundChannel);
            return;
        }

        channel.send(data);
    }
    create(id: bigint, address: IPEndPoint): void {
        if (this._idChannels.has(id)) {
            return;
        }

        this.innerCreate(id, address);
    }

    remove(id: bigint, error: number): void {
        const channel: WChannel = this._idChannels.get(id);

        if (!channel) {
            return;
        }

        channel.closeSocket(error);

        this._idChannels.delete(id);

        channel.dispose();
    }

    dispose(): void {
    }

    private innerCreate(id: bigint, address: IPEndPoint) {
        const channel = new WChannel();

        channel.initByAddress(address, id, this);

        this._idChannels.set(channel.id, channel);
    }

    /**
     * channel 被动关闭 调用这个
     * @param channel 
     * @param code 
     */
    channelClose(channel: WChannel, code: number) {
        this._idChannels.delete(channel.id);

        NetServices.get().onError(this.id, channel.id, code);

        channel.dispose();
    }
}