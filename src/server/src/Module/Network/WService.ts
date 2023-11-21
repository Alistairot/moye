import { App, TemplatedApp, WebSocket, us_listen_socket, us_listen_socket_close } from 'uWebSockets.js'
import { AService } from '../../../../common/Network/AService';
import { WChannel } from './WChannel';
import { IPEndPoint } from '../../../../common/Network/IPEndPoint';
import { ServiceType } from '../../../../common/Network/ServiceType';
import { addExitCallback } from 'catch-exit';
import { coreError, coreLog, coreWarn } from '../../../../common/Core/Logger/CoreLogHelper';
import { NetServices } from '../../../../common/Network/NetServices';
import { ErrorCore } from '../../../../common/Network/ErrorCore';
import { SocketCloseCode } from '../../../../common/Network/SocketCloseCode';

export class WService extends AService {
    acceptor: TemplatedApp
    private readonly _idChannels: Map<number, WChannel> = new Map;
    private readonly _wsChannels: Map<WebSocket<void>, WChannel> = new Map;
    private address: IPEndPoint

    initSender(serviceType: ServiceType) {
        this.ServiceType = serviceType
    }

    initAcceptor(address: IPEndPoint, serviceType: ServiceType) {
        this.address = address
        this.ServiceType = serviceType

        this.restartAcceptor()

        addExitCallback((signal) => {
            coreLog(`WService exit signal=${signal}`)
            this.closeAcceptor();
        });
    }

    restartAcceptor() {
        this.acceptor = App();
        this.acceptor.ws('/*', {
            open: this.onConnection.bind(this),
            drain: this.onDrain.bind(this),
            close: this.onClose.bind(this),
            message: this.onMessage.bind(this),
            // 单个消息最大长度
            maxPayloadLength: 16 * 1024,
        });

        this.acceptor.listen(this.address.host, this.address.port, (listenSocket: us_listen_socket | false) => {
            if (listenSocket) {
                coreLog(`WService listen ${this.address.host}:${this.address.port}`)
            } else {
                coreError(`WService listen failed ${this.address.host}:${this.address.port}`)
            }
        });
    }

    /**
     * 关闭监听
     * @returns 
     */
    closeAcceptor() {
        if (this.acceptor == null) {
            return
        }

        coreLog('WService closeAcceptor, address = {0}', this.address.toString());

        this.acceptor = null

        us_listen_socket_close(this.acceptor);

        for (let [id, channel] of this._idChannels) {
            this.Remove(id)
        }

    }

    public Send(channelId: number, actorId: number, message: any): void {
        try {
            let aChannel = this._idChannels.get(channelId)
            if (aChannel == null) {
                NetServices.getInst().OnError(this.Id, channelId, ErrorCore.ERR_SendMessageNotFoundWChannel);
                return;
            }

            aChannel.Send(actorId, message);
        }
        catch (e) {
            coreError(e.stack);
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

    /**
     * 这里的只能是主动关闭
     * @param id 
     * @param error 
     */
    public Remove(id: number, error: number = 0): void {
        let channel: WChannel = this._idChannels.get(id);

        if (!channel) {
            return;
        }

        channel.closeSocket(error)

        this._wsChannels.delete(channel.uSocket)
        this._idChannels.delete(id);

        channel.Dispose();
    }

    /**
     * channel 被动关闭 调用这个
     * @param channel 
     * @param code 
     */
    channelClose(channel: WChannel, code: number) {
        this._idChannels.delete(channel.Id);

        if (channel.uSocket != null) {
            this._wsChannels.delete(channel.uSocket)
        }

        NetServices.getInst().OnError(this.Id, channel.Id, code);

        channel.Dispose();
    }

    private onMessage(ws: WebSocket<void>, message: ArrayBuffer, isBinary: boolean) {
        let channel = this._wsChannels.get(ws)

        if (channel == null) {
            coreLog(`onMessage: channel == null`)
            return
        }

        // 这里先屏蔽 后面再开启
        if (!isBinary) {
            this.Remove(channel.Id, SocketCloseCode.WChannelReadError)
            coreError('onMessage: isBinary == false')
            return
        }

        channel.onMessage(new Uint8Array(message), isBinary)
    }

    private onConnection(ws: WebSocket<void>) {
        // 暂时单个服务最多300个连接 如有需要自行修改
        if (this._wsChannels.size > 3000) {
            coreWarn('WService: 连接数过多');
            ws.end(SocketCloseCode.ServerMaxLimit);
            return
        }

        let id = NetServices.getInst().CreateAcceptChannelId();
        let channel = new WChannel();

        this._wsChannels.set(ws, channel)
        this._idChannels.set(id, channel);

        channel.initBySocket(ws, id, this)

        NetServices.getInst().OnAccept(this.Id, id, channel.remoteAddress);
    }

    private onClose(ws: WebSocket<void>, code: number) {
        let channel = this._wsChannels.get(ws)

        if (channel == null) {
            coreLog(`onClose: channel == null`)
            return
        }

        channel.onSocketClose(code);
    }

    /**
     * 没搞懂这个是干什么的
     * @param ws 
     */
    private onDrain(ws: WebSocket<void>) {
        coreLog(`onDrain: 压力过大`)
    }
}