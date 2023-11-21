import pb from 'protobufjs/light'
// import Long from 'long';

// 服务端不需要
// pb.util.Long = Long;
// pb.configure();

const r = new pb.Reader(new Uint8Array())
const w = new pb.Writer()

import { App, TemplatedApp, WebSocket as uWebSocket } from 'uWebSockets.js'
import { WebSocket as WS } from "ws";
import { type WService } from "./WService";
import { AChannel } from '../../../../common/Network/AChannel';
import { IPEndPoint } from '../../../../common/Network/IPEndPoint';
import { coreError, coreLog, coreWarn } from '../../../../common/Core/Logger/CoreLogHelper';
import { NetServices } from '../../../../common/Network/NetServices';
import { ServiceType } from '../../../../common/Network/ServiceType';
import { ErrorCore } from '../../../../common/Network/ErrorCore';
import { MessageHelper } from '../../../../common/Message/MessageHelper';
import { MessageParserMgr } from '../../../../common/Message/MessageParserMgr';
import { IMessage } from '../../../../common/Message/IMessage';
import { Type } from '../../../../common/Core/Type/Type';
import { SocketCloseCode } from '../../../../common/Network/SocketCloseCode';
import { DEVELOP } from '../../../../common/Macro';
import { C2G_TestPressure } from '../../Game/Message/OuterMessageCore/OuterMessageCore';
import { MsgPrinter } from '../../../../common/Message/MsgPrinter';
import { TimerMgr } from '../../../../common/Timer/TimerMgr';

export class WChannel extends AChannel {
    public uSocket: uWebSocket<void>
    public wSocket: WS
    private Service: WService;
    private isConnected: boolean = false;
    private msgQueue: any[] = []
    private _timerId: number

    constructor() {
        super()
    }

    initBySocket(socket: uWebSocket<void>, id: number, service: WService) {
        this.uSocket = socket
        this.Id = id
        this.Service = service
        this.isConnected = true

        let remoteAddr = socket.getRemoteAddressAsText()
        let remoteAddrStr = new TextDecoder('utf-8').decode(remoteAddr)

        this.remoteAddress = new IPEndPoint(remoteAddrStr, 1111)
    }

    /**
     * 通过地址建立连接
     * 也就是客户端
     * @param address 
     * @param id 
     * @param service 
     */
    initByAddress(address: IPEndPoint, id: number, service: WService) {
        this.wSocket = new WS(`ws://${address}`)

        this.Id = id
        this.Service = service
        this.remoteAddress = address

        // this.addTimeoutTimer();

        this.wSocket.on("message", this.onMessage.bind(this))
        this.wSocket.on("open", this.onConnectComplete.bind(this))
        this.wSocket.on("close", this.onSocketClose.bind(this))
        this.wSocket.on("error", this.onWsSocketError.bind(this))
    }

    private connectTimeout() {
        coreLog(`连接超时, address=${this.remoteAddress.toString()}`);
    }

    private addTimeoutTimer(){
        if(!DEVELOP){
            return;
        }

        if(this._timerId != null){
            return;
        }

        this._timerId = TimerMgr.getInst().newOnceTimer(3 * 1000, this.connectTimeout.bind(this));
        coreLog(`wchannel添加定时器`);
    }

    private removeTimer(tips: string){
        if(!DEVELOP){
            return;
        }

        if(this._timerId == null){
            return;
        }

        TimerMgr.getInst().remove(this._timerId);
        this._timerId = null;

        coreLog(`wchannel移除定时器,${tips}, address=${this.remoteAddress.toString()}`);
    }

    private onConnectComplete() {
        this.removeTimer('连接成功');
        this.isConnected = true

        for (const msg of this.msgQueue) {
            this.innerSend(msg)
        }

        this.msgQueue = []
    }

    public onMessage(data: Uint8Array, isBinary: boolean) {
        try {
            // // 压力测试用 后面记得注释掉
            // if (!isBinary) {
            //     let str = new TextDecoder('utf-8').decode(data);
    
            //     if (str == "test-pressure") {
            //         let channelId = this.Id;
            //         NetServices.getInst().OnRead(this.Service.Id, channelId, 0, new C2G_TestPressure);
            //     } else {
            //         this.closeSocket(SocketCloseCode.WChannelReadError);
            //     }
    
            //     return;
            // }
    
            if (!isBinary) {
                coreError(`WChannel onMessage: data is not binary`);
                this.closeSocket(SocketCloseCode.WChannelReadError);
                return
            }
            
            let channelId = this.Id;
            let actorId: number = 0;

            let opcode = MessageHelper.getOpcode(data);
            let type = NetServices.getInst().GetType(opcode);
            let parser = MessageParserMgr.getInst().getParser(opcode);

            if (type == null) {
                coreError(`opcode=${opcode}找不到对应的构造函数`)
                return
            }
            let message: IMessage = new type()

            r.pos = 0
            r.buf = data
            r.len = data.length

            parser.decode(r, message)

            switch (this.Service.ServiceType) {
                case ServiceType.Outer: {
                    // 外网消息(客户端发过来的)不需要携带actorId 直接发到了对应的网关
                    break;
                }
                case ServiceType.Inner: {
                    actorId = MessageHelper.getActorId(data)
                    break;
                }
            }

            MsgPrinter.getInst().log(message, 'on message:');

            NetServices.getInst().OnRead(this.Service.Id, channelId, actorId, message);
        } catch (error) {
            coreError('WChannel onMessage, remoteAddress={1} error={0}', error.stack, this.remoteAddress.toString());
            // 出现任何消息解析异常都要断开Session，防止客户端伪造消息
            this.OnError(SocketCloseCode.WChannelReadError);
        }
    }

    public Dispose() {
        if (this.IsDisposed) {
            return;
        }
        
        coreLog(`wchannel dispose, address=${this.remoteAddress.toString()}`)
        this.removeTimer('wchannel dispose');

        this.Id = 0;
        this.uSocket = null;
        this.wSocket = null;
        this.msgQueue = null;
        this.Service = null;
        this.isConnected = false;
        this.remoteAddress = null;

    }

    private onWsSocketError(e: Error){
        coreLog(`onWsSocketError error, ${e.message}`);
        this.onSocketClose(SocketCloseCode.WebSocketError);
    }

    /**
     * socket被动关闭
     * @param code 
     */
    onSocketClose(code: number) {
        if (this.Service) {
            this.Service.channelClose(this, code);
        }
    }

    /**
     * 这里的只能是主动关闭
     */
    closeSocket(code: number) {
        if (code < 4000) {
            if (this.uSocket != null) {
                this.uSocket.end();
            }

            if (this.wSocket != null) {
                this.wSocket.close();
            }
        } else {
            if (this.uSocket != null) {
                this.uSocket.end(code);
            }

            if (this.wSocket != null) {
                this.wSocket.close(code);
            }
        }

    }

    private OnError(error: number) {
        this.Service.Remove(this.Id, error);
    }

    private innerSend(raw: Uint8Array) {
        if (this.uSocket != null) {
            this.uSocket.send(raw, true)
        } else {
            this.wSocket.send(raw)
        }
    }

    public Send(actorId: number, message: IMessage) {
        if (this.IsDisposed) {
            throw new Error("WChannel已经被Dispose, 不能发送消息");
        }

        MsgPrinter.getInst().log(message, 'send message:');

        let opcode = NetServices.getInst().GetOpcode(message.constructor as Type)
        let parser = MessageParserMgr.getInst().getParser(opcode)

        w.reset()
        w.uint32(8).uint32(opcode)

        switch (this.Service.ServiceType) {
            case ServiceType.Inner: {
                w.uint32(16).uint64(actorId)
                break;
            }
            case ServiceType.Outer: {
                break;
            }
        }

        parser.encode(w, message)

        let result: Uint8Array = w.finish();

        if (result.byteLength > 10000) {
            coreWarn(`发送消息长度超过10000字节, 可能是有问题的消息, opcode=${opcode}, name=${message.constructor.name}, length=${result.byteLength}`)
        }

        if (this.isConnected) {
            this.innerSend(result)
        } else {
            this.msgQueue.push(result)
        }
    }
}
