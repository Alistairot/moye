export interface IRpcResquest {
    rpcId: number;
}

export interface IRpcResponse {
    rpcId: number;
    error: number;
}

export class RpcResponse implements IRpcResponse{
    rpcId: number;
    error: number;

    constructor(values: Partial<RpcResponse>){
        Object.assign(this, values);
    }
}