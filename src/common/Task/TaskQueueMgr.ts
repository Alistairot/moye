
import { coreLog } from "../Core/Logger/CoreLogHelper";
import { Singleton } from "../Core/Singleton/Singleton";
import { TimeHelper } from "../Core/Time/TimeHelper";
import { TimerMgr } from "../Timer/TimerMgr";
import { TaskQueue } from "./TaskQueue";

/**
 * 任务队列
 * 可以让异步任务按顺序执行
 */
export class TaskQueueMgr extends Singleton {
    private _taskQueueMap: Map<string, TaskQueue> = new Map<string, TaskQueue>();

    awake(): void {
        TimerMgr.getInst().newRepeatedTimer(10 * 1000, this.checkExpire.bind(this));
    }

    /**
     * 通过标识符获取任务队列
     * 如果不存在则创建一个
     * @param id 
     * @returns 
     */
    get(id: string): TaskQueue {
        let taskQueue = this._taskQueueMap.get(id);

        if (!taskQueue) {
            taskQueue = TaskQueue.create();
            taskQueue.id = id;
            coreLog('taskQueue {0} has been created', id);

            this._taskQueueMap.set(id, taskQueue);
        }

        return taskQueue;
    }

    private checkExpire() {
        let now = TimeHelper.clientNow();
        let expireList: string[] = [];

        for (let [id, taskQueue] of this._taskQueueMap) {
            if (taskQueue.isRunning) {
                continue;
            }

            // 回收过期的任务队列
            if (taskQueue.expireTime < now) {
                expireList.push(id);
                taskQueue.dispose();
                coreLog('taskQueue {0} has been disposed', id);
            }
        }

        for (let id of expireList) {
            this._taskQueueMap.delete(id);
        }
    }
}