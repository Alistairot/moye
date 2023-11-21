import pb from 'protobufjs'
import Long from 'long';
pb.util.Long = Long;
pb.configure();
const r = new pb.Reader(new Uint8Array())
const w = new pb.Writer()

import { coreError, coreLog, coreWarn } from "../../../../common/Core/Logger/CoreLogHelper";
import { MessageHelper } from "../../../../common/Message/MessageHelper";
import { AChannel } from "../../../../common/Network/AChannel";
import { ErrorCore } from "../../../../common/Network/ErrorCore";
import { IPEndPoint } from "../../../../common/Network/IPEndPoint";
import { NetServices } from "../../../../common/Network/NetServices";
import { ServiceType } from "../../../../common/Network/ServiceType";
import { type WService } from "./WService";
import { IMessage } from '../../../../common/Message/IMessage';
import { Type } from '../../../../common/Core/Type/Type';
import { MessageParserMgr } from '../../../../common/Message/MessageParserMgr';
import { SocketCloseCode } from '../../../../common/Network/SocketCloseCode';
import { DEVELOP } from '../../../../common/Macro';
import { MsgPrinter } from '../../../../common/Message/MsgPrinter';

export class WChannel extends AChannel {
    public sender: WebSocket
    private Service: WService;
    private isConnected: boolean = false;
    private msgQueue: any[] = []

    constructor() {
        super()
    }

    initByAddress(address: IPEndPoint, id: number, service: WService) {
        let remoteAddr = `ws://${address}`
        coreLog(remoteAddr)
        let socket = new WebSocket(remoteAddr);
        socket.binaryType = "arraybuffer";
        this.sender = socket
        this.Id = id
        this.Service = service
        this.remoteAddress = address

        this.sender.onopen = this.onConnectComplete.bind(this)
        this.sender.onclose = this.onSocketClose.bind(this)
        this.sender.onerror = this.onSocketError.bind(this, false)
        this.sender.onmessage = this.onMessage.bind(this)
    }

    private onConnectComplete() {
        this.isConnected = true

        for (const msg of this.msgQueue) {
            this.sender.send(msg)
        }

        this.msgQueue = []
    }

    private onMessage(event: MessageEvent<any>) {
        try {
            let data: Uint8Array = new Uint8Array(event.data)
            let channelId = this.Id;
            let actorId: number = 0;

            let opcode = MessageHelper.getOpcode(data)
            let type = NetServices.getInst().GetType(opcode)
            let parser = MessageParserMgr.getInst().getParser(opcode)

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
                    break;
                }
                case ServiceType.Inner: {
                    actorId = MessageHelper.getActorId(data);
                    break;
                }
            }

            MsgPrinter.getInst().log(message, 'on message:');

            NetServices.getInst().OnRead(this.Service.Id, channelId, actorId, message);
        } catch (error) {
            coreError(`${this.remoteAddress} ${event} ${error}`);
            // 出现任何消息解析异常都要断开Session，防止客户端伪造消息
            this.OnError(SocketCloseCode.WChannelReadError);
        }

    }

    public Dispose() {
        if (this.IsDisposed) {
            return;
        }

        this.Id = 0;
        this.remoteAddress = null;
        this.Service = null;
        this.sender = null;
        this.isConnected = false;
        this.msgQueue = null;
    }

    /**
     * 这里的只能是主动关闭
     */
    closeSocket(code: number) {
        if (code < 4000) {
            this.sender.close();
        } else {
            this.sender.close(code);
        }
    }

    /**
     * socket被动关闭
     * @param evt 
     */
    private onSocketClose(evt: CloseEvent) {
        let code = evt.code;

        this.Service?.channelClose(this, code);
    }

    private onSocketError(evt: Event) {
        let code = 0;

        this.Service?.channelClose(this, code);
    }

    private OnError(error: number) {
        this.Service.Remove(this.Id, error);
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
            coreWarn(`消息长度超过10000字节, 可能是有问题的消息, opcode=${opcode}, name=${message.constructor.name}`)
        }

        if (this.isConnected) {
            this.sender.send(result)
        } else {
            this.msgQueue.push(result)
        }
    }
}
