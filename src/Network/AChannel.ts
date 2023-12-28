import { IPEndPoint } from "./IPEndPoint";

export abstract class AChannel {
    id: bigint = 0n;
    error: number;

    /**
     * 通过socket初始化的是客户端地址
     * 通过地址初始化的是服务器地址
     */
    remoteAddress: IPEndPoint;

    get isDisposed(): boolean {
        return this.id == 0n;

    }

    abstract dispose(): void;
}