export interface ILifeCycle{
    get isDisposed(): boolean;
    instanceId?: number
    _inst: any
    awake?(): void
    update?(): void
    lateUpdate?(): void
    destroy?(): void
    _onPreDestroy(): void
}