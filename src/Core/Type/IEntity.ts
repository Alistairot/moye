export interface IEntity{
    instanceId: bigint;
    isDisposed: boolean;
    awake(): void;
    update(): void;
    lateUpdate(): void;
    destroy(): void;
}