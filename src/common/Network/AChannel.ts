import { IPEndPoint} from "./IPEndPoint";

export abstract class AChannel {
    public Id: number
    public Error: number

    /**
     * 通过socket初始化的是客户端地址
     * 通过地址初始化的是服务器地址
     */
    public remoteAddress: IPEndPoint


    public get IsDisposed(): boolean {
        return this.Id == 0;

    }

    public abstract Dispose();
}