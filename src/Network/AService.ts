import { IPEndPoint } from "./IPEndPoint";
import { ServiceType } from "./ServiceType";

export type AServiceDataType = Uint8Array | string;

export abstract class AService {
    serviceType: ServiceType;
    id: number;

    abstract send(channelId: bigint, data: AServiceDataType): void
    abstract create(id: bigint, address: IPEndPoint): void
    abstract remove(id: bigint, error: number): void
    abstract dispose(): void
}