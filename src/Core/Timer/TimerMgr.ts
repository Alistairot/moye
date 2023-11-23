import { Singleton } from "../Singleton/Singleton";
import { Task } from "../Task/Task";
import { TimeHelper } from "../Time/TimeHelper";
import { Action } from "../Type/Action";
import { CancellationToken } from "./CancellationToken";
import { Timer, TimerType } from "./Timer";

export class TimerMgr extends Singleton {
    private _timerMap: Map<number, Timer> = new Map;
    private _timers: Timer[] = [];

    /**
     * 不断重复的定时器
     * @param interval ms
     * @param callback 
     * @param immediately 是否立即执行
     * @returns 
     */
    newRepeatedTimer(interval: number, callback: Action, immediately: boolean = false): number {
        const timer = Timer.create();

        timer.type = TimerType.REPEAT;
        timer.cb = callback;
        timer.interval = interval;
        timer.expireTime = interval + TimeHelper.clientNow();

        this._timerMap.set(timer.id, timer);
        this._timers.push(timer);

        return timer.id;
    }

    /**
     * 
     * @param timeout ms
     * @param callback 
     * @returns 
     */
    newOnceTimer(timeout: number, callback: Action): number {
        const timer = Timer.create();

        timer.type = TimerType.ONCE;
        timer.cb = callback;
        timer.expireTime = timeout + TimeHelper.clientNow();

        this._timerMap.set(timer.id, timer);
        this._timers.push(timer);

        return timer.id;
    }

    newFrameTimer(callback: Action): number {
        const timer = Timer.create();

        timer.type = TimerType.REPEAT;
        timer.cb = callback;

        timer.interval = 1;

        timer.expireTime = timer.interval + TimeHelper.clientNow();

        this._timerMap.set(timer.id, timer);
        this._timers.push(timer);

        return timer.id;

    }

    remove(id: number): boolean {
        const timer = this._timerMap.get(id);

        if (!timer) {
            return false;
        }

        timer.id = 0;
        this._timerMap.delete(id);

        return true;
    }

    /**
     * 浏览器上会有一个问题
     * 就是cocos的update后台不执行,但是js脚本依然执行，导致大量的timer没回收
     * 暂时不处理这个问题 应该没什么影响
     */
    protected update(): void {
        const nowTime = TimeHelper.clientNow();

        for (let i = this._timers.length - 1; i >= 0; i--) {
            const timer = this._timers[i];

            if (timer.id == 0) {
                this._timers.splice(i, 1);
                timer.dispose();
                continue;
            }

            if (timer.expireTime > nowTime) {
                continue;
            }

            if (timer.cb != null) {
                timer.cb();
            }

            if (timer.tcs != null) {
                timer.tcs.setResult();
            }

            if (timer.type == TimerType.REPEAT) {
                timer.expireTime += timer.interval;
            } else {
                this.remove(timer.id);
                continue;
            }
        }
    }

    /**
     * 
     * @param time ms
     * @param cancellationToken 
     * @returns 
     */
    async waitAsync(time: number, cancellationToken?: CancellationToken): Promise<void> {
        if (time <= 0) {
            return;
        }

        const tcs = Task.create();
        const timer = Timer.create();

        timer.type = TimerType.ONCE;
        timer.tcs = tcs;
        timer.expireTime = time + TimeHelper.clientNow();

        this._timerMap.set(timer.id, timer);
        this._timers.push(timer);

        let cancelAction: Action;

        if (cancellationToken) {
            cancelAction = () => {
                if (this.remove(timer.id)) {
                    tcs.setResult();
                }
            };

            cancellationToken.add(cancelAction);
        }

        try {
            await tcs;
        } finally {
            cancellationToken?.remove(cancelAction);
            cancelAction = null;
        }

    }
}