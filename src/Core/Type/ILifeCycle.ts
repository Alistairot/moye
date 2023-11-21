export interface ILifeCycle{
    get isDisposed(): boolean;
    instanceId?: number
    awake?(): void
    update?(): void
    lateUpdate?(): void
    destroy?(): void
    _onPreDestroy(): void
}