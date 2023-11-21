import { coreError } from "../../../../common/Core/Logger/CoreLogHelper";
import { IMessage } from "../../../../common/Message/IMessage";
import { AService } from "../../../../common/Network/AService";
import { ErrorCore } from "../../../../common/Network/ErrorCore";
import { IPEndPoint } from "../../../../common/Network/IPEndPoint";
import { NetServices } from "../../../../common/Network/NetServices";
import { ServiceType } from "../../../../common/Network/ServiceType";
import { WChannel } from "./WChannel";

export class WService extends AService {
    private readonly _idChannels: Map<number, WChannel> = new Map;

    initSender(serviceType: ServiceType) {
        this.ServiceType = serviceType
    }

    /**
     * client don't need acceptor
     * @param address 
     * @param serviceType 
     */
    initAcceptor(address: IPEndPoint, serviceType: ServiceType) {
        this.ServiceType = serviceType
    }

    public Send(channelId: number, actorId: number, message: IMessage): void {
        try {
            let aChannel = this._idChannels.get(channelId)
            if (aChannel == null) {
                NetServices.getInst().OnError(this.Id, channelId, ErrorCore.ERR_SendMessageNotFoundWChannel);
                return;
            }

            aChannel.Send(actorId, message);
        }
        catch (e) {
            coreError('WService.Send error, msg={0}, {1}', message.constructor.name, e.stack);
        }
    }

    private innerCreate(id: number, address: IPEndPoint) {
        let channel = new WChannel();

        channel.initByAddress(address, id, this)

        this._idChannels.set(channel.Id, channel);
    }

    public Create(id: number, address: IPEndPoint): void {
        if (this._idChannels.has(id)) {
            return
        }

        this.innerCreate(id, address)
    }

    public Dispose(): void {

    }

    public Remove(id: number, error: number = 0): void {
        let channel: WChannel = this._idChannels.get(id);

        if (!channel) {
            return;
        }

        this._idChannels.delete(id);

        channel.closeSocket(error);
        channel.Dispose();
    }

    /**
     * channel 被动关闭 调用这个
     * @param channel 
     * @param code 
     */
    channelClose(channel: WChannel, code: number) {
        this._idChannels.delete(channel.Id);

        NetServices.getInst().OnError(this.Id, channel.Id, code);

        channel.Dispose();
    }
}