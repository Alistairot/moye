import { Singleton } from "../Core/Core";
import { moyeErrorF } from "../Core/Logger/CoreLogHelper";
import { DEVELOP } from "../Macro";
import { AService, AServiceDataType } from "./AService";
import { IPEndPoint } from "./IPEndPoint";
import { NetworkTag } from "./NetworkTag";

type AcceptCallback = (channelId: bigint, ipEndPoint: IPEndPoint) => void
type ReadCallback = (channelId: bigint, data: AServiceDataType) => void
type ErrorCallback = (channelId: bigint, error: number) => void

export class NetServices extends Singleton {
    private _acceptIdGenerator = Number.MAX_SAFE_INTEGER - 1;
    private _services: Map<number, AService> = new Map;
    private _serviceIdGenerator: number = 0;
    private _acceptCallback: Map<number, AcceptCallback> = new Map;
    private _readCallback: Map<number, ReadCallback> = new Map;
    private _errorCallback: Map<number, ErrorCallback> = new Map;

    sendMessage(serviceId: number, channelId: bigint, message: AServiceDataType): void {
        const service = this.get(serviceId);

        if (service != null) {
            service.send(channelId, message);
        }
    }

    addService(aService: AService): number {
        aService.id = ++this._serviceIdGenerator;

        this.add(aService);

        return aService.id;
    }

    removeService(serviceId: number): void {
        this.remove(serviceId);
    }

    createChannel(serviceId: number, channelId: bigint, address: IPEndPoint): void {
        const service = this.get(serviceId);

        if (service != null) {
            service.create(channelId, address);
        }
    }

    removeChannel(serviceId: number, channelId: bigint, error: number) {
        const service = this.get(serviceId);

        if (service != null) {
            service.remove(channelId, error);
        }
    }


    registerAcceptCallback(serviceId: number, action: AcceptCallback) {
        this._acceptCallback.set(serviceId, action);
    }

    registerReadCallback(serviceId: number, action: ReadCallback) {
        this._readCallback.set(serviceId, action);
    }

    /**
     * 一个serviceId只能注册一个
     * @param serviceId 
     * @param action 
     */
    registerErrorCallback(serviceId: number, action: ErrorCallback) {
        if (DEVELOP) {
            if (this._errorCallback.has(serviceId)) {
                moyeErrorF(NetworkTag, '重复注册servece的errorCallback, serviceId={0}', serviceId);
            }
        }

        this._errorCallback.set(serviceId, action);
    }

    onAccept(serviceId: number, channelId: bigint, ipEndPoint: IPEndPoint) {
        const cb = this._acceptCallback.get(serviceId);

        if (!cb) {
            return;
        }

        cb(channelId, ipEndPoint);
    }

    onRead(serviceId: number, channelId: bigint, message: AServiceDataType) {
        const cb = this._readCallback.get(serviceId);

        if (!cb) {
            return;
        }

        cb(channelId, message);
    }

    onError(serviceId: number, channelId: bigint, error: number) {
        const cb = this._errorCallback.get(serviceId);

        if (!cb) {
            return;
        }

        cb(channelId, error);
    }

    get(id: number): AService {
        return this._services.get(id);
    }

    createAcceptChannelId(): number {
        return --this._acceptIdGenerator;
    }

    private add(aService: AService): void {
        this._services.set(aService.id, aService);
    }

    private remove(id: number) {
        const service = this._services.get(id);
        if (service) {
            service.dispose();
        }
    }
}