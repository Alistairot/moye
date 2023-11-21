import { ObjectPool } from "../Core/ObjectPool/ObjectPool";
import { Options } from "../Core/Options/Options";
import { Singleton } from "../Core/Singleton/Singleton";
import { CancellationToken } from "../Task/CancellationToken";
import { Task } from "../Core/Task/Task";
import { TimeHelper } from "../Core/Time/TimeHelper";
import { Action } from "../Core/Type/Action";

enum TimerType {
    Once,
    Repeat,
    Task
}

class Timer {
    type: TimerType
    id: number
    cb: any
    expireTime: number
    interval: number
    tcs: Task

    private static _idGenerator: number = 1000;
    private static GetId(): number {
        return ++this._idGenerator;
    }

    public static create() {
        let timer = ObjectPool.getInst().fetch(Timer)
        timer.reset()
        timer.id = Timer.GetId()

        return timer
    }

    private reset() {
        this.cb = null
        this.tcs = null
        this.id = 0
        this.expireTime = 0
        this.interval = 0
    }

    public dispose() {
        this.reset()
        ObjectPool.getInst().recycle(this)
    }
}

export class TimerMgr extends Singleton {
    private _timerMap: Map<number, Timer> = new Map;
    private _timers: Timer[] = []

    /**
     * 不断重复的定时器
     * @param time ms
     * @param callback 
     * @returns 
     */
    newRepeatedTimer(time: number, callback: Function): number {
        let timer = Timer.create()

        timer.type = TimerType.Repeat
        timer.cb = callback
        timer.interval = time
        timer.expireTime = time + TimeHelper.clientNow()

        this._timerMap.set(timer.id, timer)
        this._timers.push(timer)

        return timer.id
    }

    public newOnceTimer(timeout: number, callback: Function): number {
        let timer = Timer.create()

        timer.type = TimerType.Once
        timer.cb = callback
        timer.expireTime = timeout + TimeHelper.clientNow()

        this._timerMap.set(timer.id, timer)
        this._timers.push(timer)

        return timer.id
    }

    public newFrameTimer(callback: Function): number {
        let timer = Timer.create()

        timer.type = TimerType.Repeat
        timer.cb = callback

        // 服务端的帧时间设置100ms 不需要那么精细
        if (Options.getInst().isServer) {
            timer.interval = 100
        } else {
            timer.interval = 1
        }

        timer.expireTime = timer.interval + TimeHelper.clientNow()

        this._timerMap.set(timer.id, timer)
        this._timers.push(timer)

        return timer.id

    }

    public remove(id: number): boolean {
        let timer = this._timerMap.get(id);

        if (!timer) {
            return false;
        }

        timer.id = 0;
        this._timerMap.delete(id);

        return true
    }

    /**
     * 浏览器上会有一个问题
     * 就是cocos的update后台不执行,但是js脚本依然执行，导致大量的timer没回收
     * 暂时不处理这个问题 应该没什么影响
     */
    update(): void {
        let nowTime = TimeHelper.clientNow()

        for (let i = this._timers.length - 1; i >= 0; i--) {
            let timer = this._timers[i]

            if (timer.id == 0) {
                this._timers.splice(i, 1)
                timer.dispose()
                continue
            }

            if (timer.expireTime > nowTime) {
                continue
            }

            if (timer.cb != null) {
                timer.cb()
            }

            if (timer.tcs != null) {
                timer.tcs.setResult()
            }

            if (timer.type == TimerType.Repeat) {
                timer.expireTime += timer.interval
            } else {
                this.remove(timer.id)
                continue
            }
        }
    }

    /**
     * 
     * @param time ms
     * @param cancellationToken 
     * @returns 
     */
    public async waitAsync(time: number, cancellationToken?: CancellationToken) {
        if (time == 0) {
            return;
        }

        let tcs = Task.create();
        let timer = Timer.create()

        timer.type = TimerType.Once
        timer.tcs = tcs
        timer.expireTime = time + TimeHelper.clientNow()

        this._timerMap.set(timer.id, timer)
        this._timers.push(timer);

        let cancelAction: Action<void>;

        if (cancellationToken) {
            cancelAction = () => {
                if (this.remove(timer.id)) {
                    tcs.setResult();
                }
            }

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