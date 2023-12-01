export interface ILifeCycle{
    get isDisposed(): boolean;
    instanceId?: bigint
    _inst: any
    awake?(): void
    /**
     * 
     * @param dt ms
     */
    update?(dt: number): void
    /**
     * 
     * @param dt ms
     */
    lateUpdate?(dt: number): void
    destroy?(): void
    _onPreDestroy(): void
}