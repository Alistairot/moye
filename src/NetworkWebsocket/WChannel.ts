import { type WService } from "./WService";
import { AChannel } from '../Network/AChannel';
import { IPEndPoint } from '../Network/IPEndPoint';
import { AServiceDataType } from '../Network/AService';
import { NetServices, NetworkErrorCode } from '../Network/Index';
import { coreError } from '../Core/Logger/CoreLogHelper';
import { NetworkWebsocketTag } from './NetworkWebsocketTag';


export class WChannel extends AChannel {
    wSocket: WebSocket;
    private _service: WService;
    private _isConnected: boolean = false;
    private _msgQueue: AServiceDataType[] = [];

    /**
     * 通过地址建立连接
     * 也就是客户端
     * @param address 
     * @param id 
     * @param service 
     */
    initByAddress(address: IPEndPoint, id: bigint, service: WService) {
        this.wSocket = new WebSocket(`ws://${address}`);

        this.wSocket.binaryType = "arraybuffer";
        this.id = id;
        this._service = service;
        this.remoteAddress = address;

        this.wSocket.onopen = this.onConnectComplete.bind(this);
        this.wSocket.onclose = this.onSocketClose.bind(this);
        this.wSocket.onerror = this.onWsSocketError.bind(this);
        this.wSocket.onmessage = this.onMessage.bind(this);
    }

    private onConnectComplete() {
        this._isConnected = true;

        for (const msg of this._msgQueue) {
            this.innerSend(msg);
        }

        this._msgQueue = [];
    }

    onMessage(evt: MessageEvent) {
        try {
            const channelId = this.id;

            NetServices.get().onRead(this._service.id, channelId, evt.data);
        } catch (error) {
            coreError(NetworkWebsocketTag, 'Channel onMessage, remoteAddress={1} error={0}', error.stack, this.remoteAddress.toString());
            // 出现任何消息解析异常都要断开Session，防止客户端伪造消息
            this.onError(NetworkErrorCode.ERR_ChannelReadError);
        }
    }

    dispose() {
        if (this.isDisposed) {
            return;
        }

        this.id = 0n;
        this.wSocket = null;
        this._msgQueue = null;
        this._service = null;
        this._isConnected = false;
        this.remoteAddress = null;

    }

    private onWsSocketError(e: Error) {
        this.onSocketClose(NetworkErrorCode.ERR_WebSocketError);
    }

    /**
     * socket被动关闭
     * @param code 
     */
    onSocketClose(code: number) {
        if (this._service) {
            this._service.channelClose(this, code);
        }
    }

    /**
     * 这里的只能是主动关闭
     */
    closeSocket(code: number) {
        if (code < 4000) {
            if (this.wSocket != null) {
                this.wSocket.close();
            }
        } else {
            if (this.wSocket != null) {
                this.wSocket.close(code);
            }
        }

    }

    private onError(error: number) {
        this._service.remove(this.id, error);
    }

    private innerSend(data: AServiceDataType) {
        this.wSocket.send(data);
    }

    send(data: AServiceDataType) {
        if (this.isDisposed) {
            return;
        }

        if (this._isConnected) {
            this.innerSend(data);
        } else {
            this._msgQueue.push(data);
        }
    }
}
