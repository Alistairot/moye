/**
 * action执行完毕会销毁 所以注意不要在action里面保存任何状态
 */
export interface IFrameFinishAction {
    /**
     * 初始化
     */
    awake(): void;
    /**
     * 回收重置
     */
    destroy(): void;
    /**
     * 注意啊 这里千万不能异步的 因为这个是在lateUpdate里面执行的
     */
    run(): any;
}