import { AMessage } from "../AMessage";
import { MoyeMsgType } from "../MoyeMsgType";
import { MsgDecorator } from "../MsgDecorator";
import { MsgResponseDecorator } from "../MsgResponseDecorator";
import { MessageOpcode } from "./MessageOpcode";

export class RpcResponse extends AMessage<RpcResponse> {
    rpcId: number;
    error: number;
    data: Uint8Array;
}

@MsgResponseDecorator(RpcResponse)
@MsgDecorator(MessageOpcode.RpcRequest, MoyeMsgType.Request)
export class RpcRequest extends AMessage<RpcRequest> {
    rpcId: number;
    data: Uint8Array;
}