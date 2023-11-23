import { ObjectPool } from "../ObjectPool/ObjectPool";
import { Task } from "../Task/Task";
import { Action } from "../Type/Action";

export enum TimerType {
    ONCE,
    REPEAT,
}

export class Timer {
    type: TimerType;
    id: number;
    cb: Action;
    expireTime: number;
    interval: number;
    tcs: Task;

    static create() {
        const timer = ObjectPool.get().fetch(Timer);
        timer.reset();
        timer.id = Timer.getId();

        return timer;
    }

    private static _idGenerator: number = 1000;
    private static getId(): number {
        return ++this._idGenerator;
    }

    private reset() {
        this.cb = null;
        this.tcs = null;
        this.id = 0;
        this.expireTime = 0;
        this.interval = 0;
    }

    dispose() {
        this.reset();
        ObjectPool.get().recycle(this);
    }
}