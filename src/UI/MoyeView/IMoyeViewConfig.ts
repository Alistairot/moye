import { Node } from "cc";
import { Task } from "../../Core/Core";
import { AMoyeView } from "./AMoyeView";

export interface IMoyeViewConfig {
    /**
     * after view hide, destroy view after expire(ms),
     */
    expire: number

    /**
     * on view load, this method will be called, should return a node,
     * @param viewName 
     */
    load(viewName: string): Promise<Node>

    /**
     * on view destroy, you can do some clean in this method,
     */
    destroy(): void

    /**
     * before show do animation
     * if animation done, you should call task.setResult()
     * @param task 
     */
    doShowAnimation?(view: AMoyeView, task: Task): void

    /**
     * before hide do animation
     * if animation done, you should call task.setResult()
     * @param task 
     */
    doHideAnimation?(view: AMoyeView, task: Task): void
}