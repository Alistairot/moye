export interface ILifecycle {
    isDisposed: boolean
    /**
     * 添加后立即调用
     */
    awake?(): void
    /**
     * 每帧调用
     */
    update?(): void
    lateUpdate?(): void

    _onPreDestroy(): void
}