import { coreError } from "../Core/Logger/CoreLogHelper";
import { RecycleObj } from "../Core/ObjectPool/RecycleObj";
import { TimeHelper } from "../Core/Time/TimeHelper";
import { Action } from "../Core/Type/Action";

export class TaskQueue extends RecycleObj {
    id: string;
    private _queue: Action[] = [];
    private _running: boolean = false;
    private _expireTime: number = 0;

    get expireTime() {
        return this._expireTime;
    }

    get isRunning() {
        return this._running;
    }

    /**
     * 传入一个方法, 会按顺序执行
     * @param func 
     * @example add(()=>console.log('hello'))
     */
    add(func: Action): void {
        this._queue.push(func);

        if (this._queue.length === 1) {
            this.run();
        }
    }

    /**
     * 清空所有的任务
     */
    clear() {
        this._queue = [];
    }

    private async run() {
        if (this._running) {
            coreError('为什么会出现复入的情况呢, 好奇怪');
            return;
        }

        this._running = true;

        while (this._queue.length > 0) {
            let func = this._queue[0];

            try {
                await func();
            } catch (e) {
                coreError('TaskQueue.run error, id={0}, {1}', this.id, e.stack);
            }

            this._queue.shift();
        }

        this._running = false;
        this._expireTime = TimeHelper.clientNow() + 10 * 1000;
    }
}